import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Txt from '../../../ui/Text'
import { selfPickupList } from '../../../constants'
import Icons from '../../../ui/Icons'

const Contacts = () => {
    const handlePhonePress = (phone: string) => {
        Linking.openURL(`tel:${phone}`).catch(() => {
            const { setMessage } = require('../../../store/notification').default.getState()
            setMessage('Не удалось открыть телефонный набор', 'error')
        })
    }

    const handleEmailPress = (email: string) => {
        Linking.openURL(`mailto:${email}`).catch(() => {
            const { setMessage } = require('../../../store/notification').default.getState()
            setMessage('Не удалось открыть почтовый клиент', 'error')
        })
    }

    return (
        <View style={styles.Container}>
            <View style={styles.Contacts}>
                <Txt size={24} weight='Bold'>Контакты</Txt>

                <TouchableOpacity style={styles.Contact} onPress={() => handlePhonePress('+79084411110')}>
                    <Icons.Phone color="#4FBD01" />
                    <Txt size={16}>+7-908-441-1110</Txt>
                </TouchableOpacity>

                <TouchableOpacity style={styles.Contact} onPress={() => handleEmailPress('zakaz@ferma-dv.ru')}>
                    <Icons.Email color="#4FBD01" />
                    <Txt size={16}>zakaz@ferma-dv.ru</Txt>
                </TouchableOpacity>

            </View>

            <View style={styles.Address}>
                <Txt size={24} weight='Bold'>Адреса</Txt>

                {selfPickupList.map((item, index) => (
                    <View key={index}>
                        <Txt size={16} weight='Bold'>{`г. ${item.city}`}</Txt>

                        <View>
                            {item.list.map((i, id) => (
                                <Txt size={16} key={id}>{i.address}</Txt>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    )
}

export default Contacts

const styles = StyleSheet.create({
    Container: {
        paddingHorizontal: 16,
        gap: 24
    },
    Contacts: {
        gap: 16
    },
    Contact: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    Address: {
        gap: 16
    }
})