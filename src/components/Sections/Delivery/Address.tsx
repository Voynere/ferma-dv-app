import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View, Keyboard, StatusBar } from 'react-native'
import React, { FC, useEffect, useRef, useState } from 'react'
import Txt from '../../../ui/Text'
import TouchBox from '../../../components/TouchBox'
import Icons from '../../../ui/Icons'
import Checkbox from '../../../ui/Checkbox'
import useDeliveryStore from '../../../store/delivery'
import Input from '../../../ui/Input'
import Button from '../../../ui/Button'
import useGlobalStore from '../../../store'
import { SuggestionType } from '../../../types'
import { getZoneForLocation } from '../../../functions'
import useNotificationStore from '../../../store/notification'
import Row from '../../../components/Row'
import useAddressModalStore from '../../../store/addressModal'

interface Props {
    scrollRef?: React.RefObject<ScrollView>
}

const Address: FC<Props> = ({ scrollRef }) => {
    const { addresses, getAddressesList, deliveryData, changeDelivery, removeAddressList } = useDeliveryStore()
    const { setHideNavigation } = useGlobalStore()
    const { openModal } = useAddressModalStore()

    useEffect(() => {
        getAddressesList()
    }, [getAddressesList])

    const handleOpenModal = () => {
        openModal()
        setHideNavigation(true)
    }

    return (
        <>
            
            <View style={styles.Address}>
                <Txt size={16} weight='Bold'>Адрес доставки</Txt>

                <TouchBox onClick={handleOpenModal} height={56}>
                <View style={styles.Button}>
                    <Icons.Plus2 width={20} height={20} />
                    <Txt size={16} weight='Bold'>Добавить адрес</Txt>
                    <View style={styles.Empty} />
                </View>
            </TouchBox>

                <View style={styles.List}>
                    {addresses.length !== 0
                        ? addresses.map((item, index) => (
                            <Row gap={10} key={index}>
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity
                                        activeOpacity={0.5}
                                        onPress={() => changeDelivery(index, 0)}
                                        style={styles.ListItem}>
                                        <Checkbox checked={deliveryData?.type === 0 && deliveryData?.id === index} />
                                        <Txt>{item.value}</Txt>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity activeOpacity={0.5} onPress={() => removeAddressList(index)}>
                                    <Icons.Trash color="#EF2D45" width={24} height={24} />
                                </TouchableOpacity>
                            </Row>
                        ))
                        : <Txt>Нет адресов</Txt>
                    }
                </View>
            </View>
        </>
    )
}

export default Address

const styles = StyleSheet.create({
    Address: { gap: 16, paddingBottom: 20 },
    List: { gap: 8 },
    ListItem: { height: 56, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, borderWidth: 1, borderColor: "rgba(77,77,77,0.5)", borderRadius: 8 },
    Button: { flexDirection: "row", width: "100%", justifyContent: "space-between" },
    Empty: { width: 20, height: 20 },
})