import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'

interface Props {
    children: React.ReactNode
    onClick?: () => void
}

const RoundButton: FC<Props> = ({ children, onClick }) => {
    return (
        <TouchableOpacity
            onPress={() => {
                if (onClick) {
                    onClick()
                }
            }}
            activeOpacity={0.5}
            style={styles.Button}
        >
            {children}
        </TouchableOpacity>
    )
}

export default RoundButton

const styles = StyleSheet.create({
    Button: {
        width: 40,
        height: 40,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff"
    }
})
