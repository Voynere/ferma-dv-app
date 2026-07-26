import { Dimensions, StyleSheet, Animated, Easing } from 'react-native'
import React, { useEffect, useRef } from 'react'
import useNotificationStore from '../store/notification'
import Txt from './Text'

const Alert = () => {
    const { message, type } = useNotificationStore()

    const slideAnim = useRef(new Animated.Value(-100)).current

    useEffect(() => {
        if (message !== "") {
            Animated.timing(slideAnim, {
                toValue: 20,
                duration: 300,
                useNativeDriver: false,
                easing: Easing.out(Easing.ease)
            }).start()

            setTimeout(() => {
                Animated.timing(slideAnim, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: false,
                    easing: Easing.in(Easing.ease)
                }).start()
            }, 2000)
        }
    }, [message])

    return (
        <Animated.View
            style={[
                styles.Message,
                {
                    bottom: slideAnim
                },
                type === "success" && styles.Success,
                type === "error" && styles.Error,
            ]}
        >
            <Txt color="#fff" weight="RobotoCondensed-Bold" size={16} style={{ textAlign: 'center' }}>
                {message}
            </Txt>
        </Animated.View>
    )
}

export default Alert

const styles = StyleSheet.create({
    Message: {
        zIndex: 1000,
        position: "absolute",
        width: Dimensions.get("screen").width - 40,
        left: 20,
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    Success: {
        backgroundColor: "#4FBD01",
    },
    Error: {
        backgroundColor: "#F73106",
    }
})