import { Platform, PermissionsAndroid, Alert } from 'react-native'
import {
    startOtpListener,
    removeListener,
    getHash,
} from 'react-native-otp-verify'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SMS_CONSENT_KEY = 'sms_autofill_consent'

let globalCodeCallback: ((code: string) => void) | null = null

class SmsService {
    private appHash: string | null = null
    private isListening: boolean = false
    private timeoutId: ReturnType<typeof setTimeout> | null = null
    private codeAlreadyReceived: boolean = false

    checkAndRequestConsent = async (): Promise<boolean> => {
        if (Platform.OS !== 'android') return false

        const stored = await AsyncStorage.getItem(SMS_CONSENT_KEY)
        if (stored === 'granted') return true
        if (stored === 'denied') return false

        return new Promise((resolve) => {
            Alert.alert(
                'Автозаполнение кода',
                'Разрешить приложению автоматически считывать SMS с кодом подтверждения?\n\nЭто позволит не вводить код вручную.',
                [
                    {
                        text: 'Не разрешать',
                        style: 'cancel',
                        onPress: async () => {
                            await AsyncStorage.setItem(SMS_CONSENT_KEY, 'denied')
                            resolve(false)
                        },
                    },
                    {
                        text: 'Разрешить',
                        onPress: async () => {
                            await AsyncStorage.setItem(SMS_CONSENT_KEY, 'granted')
                            resolve(true)
                        },
                    },
                ],
                { cancelable: false }
            )
        })
    }

    private requestSmsPermission = async (): Promise<boolean> => {
        if (Platform.OS !== 'android') {
            return false
        }

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
                {
                    title: 'Разрешение на SMS',
                    message: 'Для автоматической подстановки кода подтверждения приложению нужен доступ к SMS',
                    buttonPositive: 'Разрешить',
                    buttonNegative: 'Отмена',
                }
            )

            return granted === PermissionsAndroid.RESULTS.GRANTED
        } catch (error) {
            return false
        }
    }

    getAppHash = async (): Promise<string> => {
        if (this.appHash) {
            return this.appHash
        }

        if (Platform.OS !== 'android') {
            return ''
        }

        try {
            const hashArray = await getHash()
            const hash = Array.isArray(hashArray) ? hashArray[0] : hashArray
            this.appHash = hash || ''
            return this.appHash
        } catch (error) {
            return ''
        }
    }

    formatSmsMessage = async (code: string): Promise<string> => {
        const hash = await this.getAppHash()
        
        if (hash) {
            return `<#> Ваш код подтверждения: ${code}\n${hash}`
        }
        
        return `Ваш код подтверждения: ${code}`
    }

    startListening = async (onCodeReceived: (code: string) => void): Promise<boolean> => {
        if (Platform.OS !== 'android') {
            return false
        }

        const hasConsent = await this.checkAndRequestConsent()
        if (!hasConsent) return false

        const hasPermission = await this.requestSmsPermission()
        if (!hasPermission) return false

        this.codeAlreadyReceived = false
        globalCodeCallback = onCodeReceived
        
        try {
            removeListener()
        } catch (e) {}

        try {
            startOtpListener((message: string) => {
                if (this.codeAlreadyReceived) {
                    return
                }
                
                if (message && message !== 'Timeout Error') {
                    const code = this.extractCode(message)
                    if (code && globalCodeCallback) {
                        this.codeAlreadyReceived = true
                        globalCodeCallback(code)
                    }
                }
            })
            
            this.isListening = true

            if (this.timeoutId) {
                clearTimeout(this.timeoutId)
            }
            
            this.timeoutId = setTimeout(() => {
                this.stopListening()
            }, 5 * 60 * 1000)

            return true
        } catch (error) {
            return false
        }
    }

    stopListening = () => {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId)
            this.timeoutId = null
        }

        try {
            removeListener()
        } catch (error) {}

        this.isListening = false
        this.codeAlreadyReceived = false
    }

    private extractCode = (message: string): string | null => {
        const patterns = [
            /код подтверждения:\s*(\d{4})/i,
            /код:\s*(\d{4})/i,
            /code:\s*(\d{4})/i,
            /[\s:](\d{4})[\s\n]/,
            /(\d{4})/
        ]

        for (const pattern of patterns) {
            const match = message.match(pattern)
            if (match && match[1]) {
                return match[1]
            }
        }
        return null
    }
}

export default new SmsService()
