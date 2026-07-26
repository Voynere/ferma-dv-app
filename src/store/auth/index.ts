import { generateCode, generateUUID, normalizePhoneNumber } from '../../functions'
import { DataTypes, State } from './types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import api from '../../api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { UserDataType } from '../../types'
import SmsService from '../../services/SmsService'
import { Platform } from 'react-native'

let navigateCallback: ((route: string, reset?: boolean) => void) | null = null
export const setNavigationCallback = (cb: (route: string, reset?: boolean) => void) => {
    navigateCallback = cb
}

let timerInterval: number | null = null

const useAuthStore = create<State>()(devtools((set, get) => ({
    phone: "",
    code: "",
    smsCode: "",
    isCode: false,
    userData: {
        uuid: "",
        phoneNumber: "",
        kilbilClientId: ""
    },
    timer: 60,

    initializeAuth: async () => {
        try {
            const storedUserData = await AsyncStorage.getItem("userData")
            if (storedUserData) {
                const userData = JSON.parse(storedUserData)
                set({ userData })
            }
        } catch (error) {}
    },

    changeIsCode: (value: boolean) => {
        if (!value) {
            SmsService.stopListening()
        }
        set({ isCode: value })
    },

    startTimer: () => {
        set({ timer: 60 })
        if (timerInterval) clearInterval(timerInterval)

        timerInterval = setInterval(() => {
            const currentTimer = get().timer
            if (currentTimer <= 1) {
                clearInterval(timerInterval!)
                timerInterval = null
            } else {
                set({ timer: currentTimer - 1 })
            }
        }, 1000) as unknown as number
    },

    changeData: (value: string, type: DataTypes) => {
        switch (type) {
            case "phone": set({ phone: value }); break
            case "code": set({ code: value }); break
        }
    },

    autoFillCode: () => {
        const { smsCode } = get()
        if (smsCode) {
            set({ code: smsCode })
        }
    },

    changeUserData: (data: UserDataType) => set({ userData: data }),

    sendCode: async () => {
        try {
            const { default: useNotificationStore } = await import('../notification')
            const { setMessage } = useNotificationStore.getState()

            const { timer, isCode } = get()
            if (isCode && timer > 1) {
                setMessage(`Повторная отправка через ${timer} сек`, "error")
                return
            }

            const code = generateCode()
            const phone = normalizePhoneNumber(get().phone)
            
            set({ smsCode: code, code: "" })
    
            if (Platform.OS === 'android') {
                await SmsService.startListening((extractedCode) => {
                    useAuthStore.setState({ code: extractedCode })
                })
                
                await new Promise(resolve => setTimeout(resolve, 500))
            }

            const message = await SmsService.formatSmsMessage(code)
    
            const TEST_PHONES = [
                "79999999999", "79999999998", "79999999997", "79999999996",
                "79999999995", "79999999994", "79999999993", "79999999992",
                "79999999991", "79999999990",
            ]
            if (TEST_PHONES.includes(phone)) {
                set({ isCode: true, smsCode: "0000" })
                console.log('[sendCode] TEST MODE — код: 0000')
                return
            }

            const response = await api.auth.sendCode(phone, message)
            console.log('[sendCode] sms.ru response:', JSON.stringify(response.data))

            if (response.data.status === "OK") {
                set({ isCode: true })
            } else {
                const code = response.data.status_code
                console.warn('[sendCode] sms.ru error code:', code)
                setMessage(`Ошибка при отправке SMS (${code})`, "error")
            }
        } catch (error: any) {
            const { default: useNotificationStore } = await import('../notification')
            const { setMessage } = useNotificationStore.getState()
            console.error('[sendCode] network error:', error?.message, error?.response?.data)
            setMessage("Ошибка при отправке кода", "error")
        }
    },

    verifyCode: async () => {
        try {
            SmsService.stopListening()

            const { default: useNotificationStore } = await import('../notification')
            const { default: useGlobalStore } = await import('../index')
            const { default: useBonusStore } = await import('../bonus')
            const { default: useCheckoutStore } = await import('../checkout')
            
            const { setMessage } = useNotificationStore.getState()
            const { code, smsCode, authorizeKilBil } = get()
            const { changeIsAuth, setFirstLaunch, isDeliverySet } = useGlobalStore.getState()
            const { getBonuses } = useBonusStore.getState()
            const { afterAuth, changeAfterAuth } = useCheckoutStore.getState()

            if (code === smsCode) {
                await authorizeKilBil()
                await getBonuses()
                changeIsAuth(true)
                setFirstLaunch(false)
                const { default: PushService } = await import('../../services/PushService')
                const { default: NotificationService } = await import('../../services/NotificationService')
                const fcmToken = await AsyncStorage.getItem('fcmToken')

                if (fcmToken) {
                    await PushService.registerTokenOnServer(fcmToken)
                }
                NotificationService.checkAndScheduleNotifications()
                if (afterAuth) {
                    navigateCallback?.("checkout")
                    changeAfterAuth(false)
                } else if (!isDeliverySet) {
                    navigateCallback?.("delivery", true)
                } else {
                    navigateCallback?.("home", true)
                }

                set({ phone: "", code: "", smsCode: "", isCode: false })
            } else {
                setMessage("Неверный код", "error")
            }
        } catch (error) {}
    },

    authorizeKilBil: async () => {
        try {
            const { changeUserData } = get()
            const uuid = generateUUID()
            const phone = normalizePhoneNumber(get().phone)

            console.log('[authorizeKilBil] phone:', phone)

            // Тестовый номер — полный реальный флоу регистрации нового пользователя
            if (phone === "79999999998") {
                const { default: useNotificationStore } = await import('../notification')
                const { setMessage } = useNotificationStore.getState()
                console.log('[TEST] Удаляем клиента из AsyncStorage чтобы симулировать нового...')
                await AsyncStorage.removeItem("userData")
            }

            let existingClientId: string | null = null
            try {
                const response = await api.bonus.getClient(phone)
                console.log('[authorizeKilBil] getClient response:', JSON.stringify(response.data))
                existingClientId = response.data.client_id ?? null
            } catch (e: any) {
                console.log('[authorizeKilBil] getClient error (new user?):', e?.response?.status, e?.message)
            }

            if (!existingClientId) {
                console.log('[authorizeKilBil] new user — registering...')
                const res = await api.bonus.registerUser(phone, uuid)
                console.log('[authorizeKilBil] registerUser response:', JSON.stringify(res.data))
                const newClientId = res.data.client_id
                const payload = {
                    uuid: uuid,
                    phoneNumber: phone,
                    kilbilClientId: newClientId
                }
                await AsyncStorage.setItem("userData", JSON.stringify(payload))
                changeUserData(payload)

                if (newClientId) {
                    try {
                        const { default: NotificationService } = await import('../../services/NotificationService')
                        NotificationService.scheduleNewUserReminder()
                    } catch {}
                    try {
                        const bonusRes = await api.bonus.bonusIn(newClientId, 500)
                        console.log('[authorizeKilBil] bonusIn response:', JSON.stringify(bonusRes.data))
                        const { default: useNotificationStore } = await import('../notification')
                        useNotificationStore.getState().setMessage("Вам начислено 500 приветственных бонусов!", "success")
                    } catch (e: any) {
                        console.log('[authorizeKilBil] bonusIn failed:', e?.response?.status, e?.message, JSON.stringify(e?.response?.data))
                    }
                } else {
                    console.log('[authorizeKilBil] newClientId is empty, bonus skipped')
                }
            } else {
                console.log('[authorizeKilBil] existing user, client_id:', existingClientId)
                const payload = {
                    uuid: uuid,
                    phoneNumber: phone,
                    kilbilClientId: existingClientId
                }
                await AsyncStorage.setItem("userData", JSON.stringify(payload))
                changeUserData(payload)
            }
        } catch (error: any) {
            console.log('[authorizeKilBil] fatal error:', error?.message, JSON.stringify(error?.response?.data))
        }
    },

    logout: async () => {
        const { default: useGlobalStore } = await import('../index')
        const { changeIsAuth } = useGlobalStore.getState()
        
        await AsyncStorage.removeItem("userData")
        navigateCallback?.("home")
        
        set({
            userData: {
                uuid: "",
                phoneNumber: "",
                kilbilClientId: ""
            }
        })
        changeIsAuth(false)
    }
})))

export default useAuthStore
