import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import FullLogo from '../assets/FullLogo'
import Button from '../ui/Button'
import Txt from '../ui/Text'
import PhoneInput from '../ui/PhoneInput'
import useAuthStore from '../store/auth'
import Icons from '../ui/Icons'
import Back from '../ui/Back'
import CodeInput from '../ui/CodeInput'
import useGlobalStore from '../store'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const auth = () => {
    const { phone, changeData, isCode, code, sendCode, verifyCode, timer, startTimer, changeIsCode } = useAuthStore()
    const [isSending, setIsSending] = React.useState(false)
    const { isFirstLaunch, setFirstLaunch, isDeliverySet, isAuth } = useGlobalStore()
    const navigation = useNavigation<any>()
    const insets = useSafeAreaInsets()

    const handleSkip = async () => {
        setFirstLaunch(false)
        setTimeout(() => {
            if (!isDeliverySet) {
                navigation.replace('delivery')
            } else {
                navigation.replace('home')
            }
        }, 100)
    }

    const showSkipButton = false

    // Автоматическое заполнение кода теперь обрабатывается через SMS Retriever в store

    return (
        <View style={[styles.Container, { paddingTop: Math.max(insets.top, 16) }]}>
            {showSkipButton && (
                <TouchableOpacity 
                    style={[styles.SkipButton, { top: Math.max(insets.top, 16) }]} 
                    onPress={handleSkip}
                    activeOpacity={0.7}
                >
                    <Icons.Close width={24} height={24} color="#4D4D4D" />
                </TouchableOpacity>
            )}

            <FullLogo />

            <View style={styles.InfoBox}>
                <Txt size={18} weight="Bold" style={styles.InfoTitle}>
                    Добро пожаловать!
                </Txt>
                <Txt size={14} color="#666" style={styles.InfoText}>
                    Войдите, чтобы получить доступ к полному функционалу приложения, копить и списывать бонусные баллы
                </Txt>
            </View>

            {!isCode
                ? <View style={styles.Form}>
                    <PhoneInput
                        onChange={value => changeData(value, "phone")}
                        label="Телефон"
                        placeholder="+7 (ХХХ) ХХХ ХХ-ХХ"
                        value={phone}
                    />
                    <Button height={56} disabled={isSending} onClick={async () => {
                        setIsSending(true)
                        await sendCode()
                        startTimer()
                        setIsSending(false)
                    }}>
                        <Txt color="#fff" weight='Bold' size={18}>
                            {isSending ? 'Отправка...' : 'Отправить код'}
                        </Txt>
                    </Button>
                </View>
                : <View style={styles.Form}>
                    <Back onClick={() => changeIsCode(false)} />

                    <CodeInput
                        onChange={value => changeData(value, "code")}
                        value={code}
                    />

                    <Button height={56} onClick={() => verifyCode()}>
                        <Txt color="#fff" weight='Bold' size={18}>Войти</Txt>
                    </Button>

                    {timer <= 1
                        ? <Button height={56} outline onClick={() => {
                            sendCode()
                            startTimer()
                        }}>
                            <Txt color="#4FBD01" weight='Bold' size={18}>Отправить новый код</Txt>
                        </Button>
                        : <Txt size={16}>Отправить новый код через {timer} сек</Txt>
                    }
                </View>
            }
        </View>
    )
}

export default auth

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    Form: {
        paddingHorizontal: 16,
        marginTop: 20,
        gap: 12
    },
    SkipButton: {
        position: 'absolute',
        right: 16,
        zIndex: 1000,
        padding: 8,
    },
    InfoBox: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    InfoTitle: {
        marginBottom: 8,
    },
    InfoText: {
        opacity: 0.7,
    }
})