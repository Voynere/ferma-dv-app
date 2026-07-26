import { StyleSheet, Text, View } from 'react-native'
import React, { FC } from 'react'

interface Props {
    children: React.ReactNode
    gap?: number
}

const Row: FC<Props> = ({ children, gap = 16 }) => {
    return (
        <View style={[styles.Row, { gap }]}>{children}</View>
    )
}

export default Row

const styles = StyleSheet.create({
    Row: {
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        width: "100%"
    }
})