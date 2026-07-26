import { StyleSheet, Text, View, Linking } from 'react-native'
import React from 'react'
import Button from '../../../ui/Button'
import Txt from '../../../ui/Text'
import useBonusStore from '../../../store/bonus'

const Bonuses = () => {
    const { bonuses } = useBonusStore()

    return (
        <View style={styles.Bonuses}>
            <View style={styles.Box}>
                <View style={styles.Column}>
                    <Txt weight='Bold' size={16}>Баланс бонусного счёта:</Txt>
                    <Txt>1 бонус = 1 рубль</Txt>
                </View>

                <Txt size={16}>{bonuses} бонусов</Txt>
            </View>

            <Button
                onClick={() => Linking.openURL("https://ferma-dv.ru/bonusnaya-programma/")}
                outline height={48}><Txt color='#4FBD01' weight='Bold'>Узнать подробнее</Txt></Button>
        </View>
    )
}

export default Bonuses

const styles = StyleSheet.create({
    Bonuses: {
        gap: 12,
        paddingHorizontal: 16
    },
    Box: {
        width: "100%",
        backgroundColor: "#EEEEEE",
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8
    },
    Column: {
        gap: 2
    }
})