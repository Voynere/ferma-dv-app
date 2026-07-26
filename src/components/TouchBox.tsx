import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React, { FC } from 'react'

interface Props {
    onClick?: () => void
    children: React.ReactNode
    isFull?: boolean
    padding?: number
    height?: number
    background?: string
}

const TouchBox: FC<Props> = ({ onClick, children, isFull, padding = 25, height = 48, background = "#EEEEEE" }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.5}
            style={[styles.TouchBox, { width: isFull ? "100%" : "auto", flex: isFull ? 1 : 0, paddingHorizontal: padding, height, backgroundColor: background }]}
            onPress={onClick}>
            {children}
        </TouchableOpacity>
    )
}

export default TouchBox

const styles = StyleSheet.create({
    TouchBox: {
        paddingHorizontal: 25,
        height: 48,
        backgroundColor: "#EEEEEE",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden"
    }
})
