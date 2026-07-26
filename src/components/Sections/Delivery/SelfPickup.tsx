import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { selfPickupList } from '../../../constants'
import Txt from '../../../ui/Text'
import Checkbox from '../../../ui/Checkbox'
import Rating from '../../../ui/Rating'
import useDeliveryStore from '../../../store/delivery'

const SelfPickup = () => {
    const { deliveryData, changeDelivery } = useDeliveryStore()

    return (
        <View style={styles.SeldPickup}>
            {selfPickupList.map((item, index) => (
                <View key={index} style={styles.City}>
                    <Txt size={18} weight='Bold'>{`г. ${item.city}`}</Txt>

                    <View style={styles.List}>
                        {item.list.map((i, id) => (
                            <TouchableOpacity
                                activeOpacity={0.5}
                                style={styles.Address}
                                key={id}
                                onPress={() => {
                                    changeDelivery(id, 1, index)
                                }}
                            >
                                <Checkbox checked={deliveryData?.type === 1 && index === deliveryData.city && deliveryData.id === id} />
                                <View style={styles.Box}>
                                    <Txt>{i.address}</Txt>
                                    <Rating rating={i.rating} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    )
}

export default SelfPickup

const styles = StyleSheet.create({
    SeldPickup: {
        gap: 30,
        paddingBottom: '5%'
    },
    City: {
        paddingBottom: '3%',
        borderBottomWidth: 1,
        borderBottomColor: "rgba(77, 77, 77, 0.5)",
        gap: 24
    },
    List: {
        gap: 16
    },
    Address: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16
    },
    Box: {
        gap: 4,
        flex: 1
    }
})