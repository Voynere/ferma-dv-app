import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Dimensions, TouchableOpacity, AppState, Platform, PermissionsAndroid, Linking } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import useGlobalStore from '../store'
import useAuthStore from '../store/auth'
import useBonusStore from '../store/bonus'
import FastImage from '@d11/react-native-fast-image'
import Txt from '../ui/Text'

const ALARM_PERMISSION_ASKED_KEY = 'alarmPermissionAsked'

const { width, height } = Dimensions.get('window')

const WelcomeScreen: React.FC = () => {
    const navigation = useNavigation<any>()
    const { isFirstLaunch, isAuth, isDeliverySet } = useGlobalStore()
    const { initializeAuth } = useAuthStore()
    const { getBonuses } = useBonusStore()
    const [showPermission, setShowPermission] = useState(false)
    const navigatePending = useRef(false)
    const appState = useRef(AppState.currentState)

    const navigateNext = () => {
        if (!isAuth) {
            navigation.reset({ index: 0, routes: [{ name: 'auth' }] })
        } else if (!isDeliverySet) {
            navigation.reset({ index: 0, routes: [{ name: 'delivery' }] })
        } else {
            navigation.reset({ index: 0, routes: [{ name: 'home' }] })
        }
    }

    const checkExactAlarmPermission = async (): Promise<boolean> => {
        if (Platform.OS !== 'android' || (Platform.Version as number) < 31) return true
        try {
            return await PermissionsAndroid.check('android.permission.SCHEDULE_EXACT_ALARM' as any)
        } catch {
            return true
        }
    }

    useEffect(() => {
        const sub = AppState.addEventListener('change', (nextState) => {
            if (appState.current.match(/inactive|background/) && nextState === 'active') {
                if (navigatePending.current) {
                    navigatePending.current = false
                    setShowPermission(false)
                    navigateNext()
                }
            }
            appState.current = nextState
        })
        return () => sub.remove()
    }, [isAuth, isDeliverySet])

    useEffect(() => {
        const initializeApp = async () => {
            try {
                await initializeAuth()
                if (isAuth) await getBonuses()
            } catch {}

            setTimeout(async () => {
                const hasPermission = await checkExactAlarmPermission()
                if (!hasPermission) {
                    const alreadyAsked = await AsyncStorage.getItem(ALARM_PERMISSION_ASKED_KEY)
                    if (!alreadyAsked) {
                        setShowPermission(true)
                    } else {
                        navigateNext()
                    }
                } else {
                    navigateNext()
                }
            }, 2000)
        }

        initializeApp()
    }, [])

    const handleAllow = async () => {
        await AsyncStorage.setItem(ALARM_PERMISSION_ASKED_KEY, '1')
        navigatePending.current = true
        try {
            await Linking.sendIntent(
                'android.settings.REQUEST_SCHEDULE_EXACT_ALARM',
                [{ key: 'package', value: 'com.fermancli' }]
            )
        } catch {
            navigatePending.current = false
            navigateNext()
        }
    }

    const handleSkip = async () => {
        await AsyncStorage.setItem(ALARM_PERMISSION_ASKED_KEY, '1')
        setShowPermission(false)
        navigateNext()
    }

    return (
        <View style={styles.Container}>
            <FastImage
                source={require('../assets/images/ezgif-266e19ebdc2d94.gif')}
                style={styles.FullScreenGif}
                resizeMode={FastImage.resizeMode.cover}
            />

            {showPermission && (
                <View style={styles.Overlay}>
                    <View style={styles.Card}>
                        <Txt size={22} weight='Jingleberry' style={styles.Title}>
                            Уведомления
                        </Txt>
                        <Txt size={15} style={styles.Description}>
                            Нам нужно разрешение, чтобы уведомления приходили вовремя — напоминания о заказах и акциях.
                        </Txt>
                        <TouchableOpacity style={styles.AllowButton} onPress={handleAllow}>
                            <Txt size={16} weight='bold' style={{ color: '#fff' }}>Разрешить</Txt>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSkip} style={styles.SkipButton}>
                            <Txt size={14} style={{ color: '#999' }}>Пропустить</Txt>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    )
}

export default WelcomeScreen

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    FullScreenGif: {
        position: 'absolute',
        width,
        height,
        top: 0,
        left: 0,
    },
    Overlay: {
        position: 'absolute',
        width,
        height,
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 48,
    },
    Card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 28,
        width: width - 40,
        alignItems: 'center',
        gap: 12,
    },
    Title: {
        textAlign: 'center',
    },
    Description: {
        textAlign: 'center',
        color: '#555',
        lineHeight: 22,
    },
    AllowButton: {
        backgroundColor: '#4FBD01',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 32,
        width: '100%',
        alignItems: 'center',
        marginTop: 8,
    },
    SkipButton: {
        paddingVertical: 8,
    },
})
