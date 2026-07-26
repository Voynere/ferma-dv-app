import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import Icons from './Icons'
import Txt from './Text'

interface Props {
    onClick: () => void
}

const Back: FC<Props> = ({ onClick }) => {
    return (
        <TouchableOpacity 
            style={styles.BackButton} 
            onPress={onClick} 
            activeOpacity={0.6}
        >
            <Icons.ArrowRight style={styles.BackIcon} color="#4FBD01" />
            <Txt color='#4FBD01' weight='RobotoCondensed-Bold' size={18}>Назад</Txt>
        </TouchableOpacity>
    )
}

export default Back

const styles = StyleSheet.create({
    BackButton: {
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#4FBD01",
        borderRadius: 12,
        alignSelf: "flex-start",
        minHeight: 48,
    },
    BackIcon: {
        width: 24,
        height: 24,
        transform: [{ rotate: "180deg" }]
    }
})