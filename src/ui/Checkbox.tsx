import { StyleSheet, Text, View } from 'react-native'
import React, { FC } from 'react'

interface Props {
    checked: boolean
    onChange?: () => void
}

const Checkbox: FC<Props> = ({ checked }) => {
    return (
        <View style={styles.Checkbox}>
            {checked && <View style={styles.Active} />}
        </View>
    )
}

export default Checkbox

const styles = StyleSheet.create({
    Checkbox: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#4D4D4D',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    Active: {
        width: 16,
        height: 16,
        backgroundColor: '#4D4D4D',
        borderRadius: 100,
    }
})