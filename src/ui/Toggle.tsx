import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'

interface Props {
    checked: boolean
    onChange?: (value: boolean) => void
}

const Toggle: FC<Props> = ({ checked, onChange }) => {
    return (
        <TouchableOpacity style={[styles.Toggle, checked && styles.Checked]} onPress={() => onChange && onChange(!checked)} activeOpacity={0.7}>
            <View style={[styles.ToggleItem, checked && styles.Active]} />
        </TouchableOpacity >
    )
}

export default Toggle

const styles = StyleSheet.create({
    Toggle: {
        width: 56,
        height: 32,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#C2C2C2',
    },
    ToggleItem: {
        width: 32,
        height: 32,
        backgroundColor: "#C2C2C2",
        borderRadius: 100,
        marginTop: -1,
        marginLeft: -1
    },
    Checked: {
        borderColor: '#4FBD01',
        alignItems: "flex-end"
    },
    Active: {
        backgroundColor: "#4FBD01",
        marginRight: -1
    }
})