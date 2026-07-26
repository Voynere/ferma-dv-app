import { StyleSheet, View } from 'react-native'
import React from 'react'
import Txt from '../../../ui/Text'
import Row from '../../../components/Row'
import Button from '../../../ui/Button'
import { useNavigation } from '@react-navigation/native'
import useCartStore from '../../../store/cart'
import { calculateDeliveryPrice, getZoneForLocation, formatPrice } from '../../../functions'
import useDeliveryStore from '../../../store/delivery'
import useGlobalStore from '../../../store'
import useCheckoutStore from '../../../store/checkout'
import { getMinOrderAmount } from '../../../constants/minOrder'

const Total = () => {
    const navigation = useNavigation()
    const { calculateAmount, cartList } = useCartStore()
    const { deliveryData, addresses } = useDeliveryStore()
    const activeAddress = deliveryData?.type === 0 && addresses.find((_, index) => index === deliveryData.id)
    const zoneName = activeAddress && getZoneForLocation(activeAddress.lat, activeAddress.lng)
    
    const DEFAULT_DELIVERY_PRICE = 399
    let deliveryPrice = 0
    if (deliveryData?.type === 0) {
        if (zoneName) {
            try {
                deliveryPrice = calculateDeliveryPrice(calculateAmount(), zoneName.description)
            } catch (error) {
                deliveryPrice = DEFAULT_DELIVERY_PRICE
            }
        } else {
            deliveryPrice = DEFAULT_DELIVERY_PRICE
        }
    }
    
    const { isAuth } = useGlobalStore()
    const { changeAfterAuth } = useCheckoutStore()

    const cartStoreId = cartList.find(i => i.storeId)?.storeId;
    const minOrderAmount = getMinOrderAmount(cartStoreId);
    const currentAmount = calculateAmount();
    const isMinOrderMet = currentAmount >= minOrderAmount;
    const remainingToMin = minOrderAmount - currentAmount;

    function checkout() {
        if (!isMinOrderMet) {
            return;
        }

        if (isAuth) {
            navigation.navigate("checkout")
        } else {
            changeAfterAuth(true)
            navigation.navigate("auth")
        }
    }

    if (cartList.length === 0) return null

    return (
        <View style={styles.Total}>
            {deliveryData?.type === 0
                ? <Txt size={18}>Доставка: {formatPrice(deliveryPrice)} руб.</Txt>
                : <Txt size={18}>Самовывоз: Бесплатно</Txt>
            }

            <View style={styles.Box}>
                <Row>
                    <Txt size={24} weight='Bold'>Итого: {formatPrice(calculateAmount() + deliveryPrice)} руб.</Txt>
                    <Txt size={18}>Товары: {cartList.length}</Txt>
                </Row>

                <Button 
                    height={56} 
                    onClick={checkout}
                    disabled={!isMinOrderMet}
                    style={!isMinOrderMet ? styles.DisabledButton : undefined}
                >
                    <Txt size={16} weight='Bold' color={!isMinOrderMet ? '#999' : '#fff'}>
                        {!isMinOrderMet 
                            ? `Добавьте товаров ещё на ${formatPrice(remainingToMin)} руб.`
                            : 'Оформить заказ'
                        }
                    </Txt>
                </Button>
            </View>
        </View>
    )
}

export default Total

const styles = StyleSheet.create({
    Total: {
        paddingHorizontal: 16,
        marginTop: 24,
        paddingBottom: '5%'
    },
    Box: {
        borderTopColor: "#15151526",
        borderTopWidth: 1,
        marginTop: 24,
        paddingTop: 24,
        gap: 24
    },
    DisabledButton: {
        opacity: 0.5
    }
})
