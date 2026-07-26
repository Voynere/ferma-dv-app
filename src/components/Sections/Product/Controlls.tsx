import { StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import Txt from '../../../ui/Text'
import Counter from '../../../ui/Counter'
import Button from '../../../ui/Button'
import Row from '../../../components/Row'
import useCatalogStore from '../../../store/catalog'
import useCartStore from '../../../store/cart'
import useNotificationStore from '../../../store/notification'
import useStockSubscribeStore from '../../../store/stockSubscribe'
import { useNavigation } from '@react-navigation/native'
import { formatPrice } from '../../../functions'
import { getActivePromoForName } from '../../../constants'

const Controlls = () => {
    const { activeProduct, setSelectedAmount, getSelectedAmount, clearSelectedAmount } = useCatalogStore()
    const { setItemInCart, removeItemFromCart, changeCartItem, cartList } = useCartStore()
    const { setMessage } = useNotificationStore()
    const { isSubscribed, toggleSubscribe } = useStockSubscribeStore()
    const navigation = useNavigation()
    const [inCart, setInCart] = useState(false)

    const cartItem = cartList.find(i => i.id === activeProduct?.id)
    const [amount, setAmount] = useState(1)
    const [weightAmount, setWeightAmount] = useState(0.1)

    const checkInCart = useCallback(() => {
        if (cartList.some(i => i.id === activeProduct?.id)) {
            const cartData = cartList.find(i => i.id === activeProduct?.id)
            if (cartData) {
                if (activeProduct?.weighed && cartData.weight !== undefined) {
                    setWeightAmount(cartData.weight)
                } else {
                    setAmount(cartData.amount)
                }
            }
            setInCart(true)
        } else {
            setInCart(false)
            if (activeProduct?.id) {
                const savedAmount = getSelectedAmount(activeProduct.id)
                if (savedAmount !== undefined) {
                    if (activeProduct.weighed) {
                        setWeightAmount(savedAmount)
                    } else {
                        setAmount(savedAmount)
                    }
                } else {
                    setAmount(1)
                    setWeightAmount(0.1)
                }
            }
        }
    }, [cartList, activeProduct, getSelectedAmount])

    useEffect(() => {
        checkInCart()
    }, [checkInCart])

    if (!activeProduct) return null

    const maxStock = activeProduct.stock
    const isOutOfStock = maxStock !== undefined && maxStock <= 0
    const subscribed = isSubscribed(activeProduct.id)

    const activePromo = getActivePromoForName(activeProduct.promoName)
    const hasPromo = !!activePromo
    const isGreenPrice = activeProduct.isGreenPrice === true

    const unitPrice = hasPromo && activePromo?.discountPercent
        ? activeProduct.price * (1 - activePromo.discountPercent / 100)
        : isGreenPrice
            ? activeProduct.price * 0.93
            : activeProduct.price

    const showOldPrice = hasPromo || isGreenPrice
    const totalPrice = formatPrice(unitPrice * (activeProduct.weighed ? weightAmount : 1))
    const totalOldPrice = formatPrice(activeProduct.price * (activeProduct.weighed ? weightAmount : 1))

    const buttonBackground = isOutOfStock
        ? "#EEEEEE"
        : inCart
            ? "#EEEEEE"
            : "#4FBD01"

    const buttonText = isOutOfStock
        ? (subscribed ? "Вы подписаны" : "Узнать о поступлении")
        : inCart
            ? "В корзине"
            : "В корзину"

    const buttonTextColor = isOutOfStock
        ? (subscribed ? "#4FBD01" : "#4D4D4D")
        : inCart
            ? "#4D4D4D"
            : "#fff"

    const handlePress = useCallback(async () => {
        if (!activeProduct) return

        if (inCart) {
            navigation.navigate('cart' as never)
            return
        }

        if (isOutOfStock) {
            try {
                const nowSubscribed = await toggleSubscribe(activeProduct)
                setMessage(
                    nowSubscribed
                        ? 'Подписка оформлена. Сообщим, когда появится.'
                        : 'Подписка отменена.',
                    'success'
                )
            } catch (e) {
                setMessage('Не удалось изменить подписку. Попробуйте позже.', 'error')
            }
            return
        }

        const addingAmount = activeProduct.weighed ? weightAmount : amount

        if (maxStock !== undefined && addingAmount > maxStock) {
            setMessage('На складе недостаточно товара', 'error')
            return
        }

        setItemInCart({
            amount: activeProduct.weighed ? 1 : amount,
            id: activeProduct.id,
            image: activeProduct.image,
            name: activeProduct.name,
            price: unitPrice,
            isWeighted: activeProduct.weighed,
            weight: weightAmount,
            stock: maxStock,
            stockByStore: activeProduct.stockByStore,
            storeId: activeProduct.storeId
        })
        clearSelectedAmount(activeProduct.id)
    }, [activeProduct, inCart, isOutOfStock, amount, weightAmount, maxStock, toggleSubscribe, unitPrice])

    return (
        <View style={styles.Box}>
            <Row gap={12}>
                <View style={styles.FlexBox}>
                    <Txt weight='Jingleberry' size={20} lineHeight={24} numberOfLines={3}>{activeProduct.name}</Txt>
                </View>

                <View style={styles.Price}>
                    {showOldPrice && (
                        <View style={styles.PromoRow}>
                            <Txt weight='RobotoCondensed-Regular' size={14} color="#999" style={styles.OldPrice}>
                                {totalOldPrice} руб.
                            </Txt>
                            {hasPromo && activePromo?.discountPercent ? (
                                <View style={[styles.DiscountBadge, { backgroundColor: activePromo.stickerColor }]}>
                                    <Txt
                                        color={activePromo.stickerTextColor || '#fff'}
                                        weight='RobotoCondensed-Bold'
                                        size={12}
                                    >
                                        -{activePromo.discountPercent}%
                                    </Txt>
                                </View>
                            ) : null}
                        </View>
                    )}
                    <Txt
                        weight='RobotoCondensed-Bold'
                        size={20}
                        color={hasPromo ? (activePromo?.stickerColor || '#E2231A') : '#000'}
                        style={{ minWidth: 80, textAlign: 'right' }}
                    >
                        {totalPrice} руб.
                    </Txt>
                    <Txt size={14} color="#666">{activeProduct.weighed ? `${weightAmount.toFixed(1)} кг` : "за шт"}</Txt>
                </View>
            </Row>

            <Row>
                <Counter
                    amount={activeProduct.weighed ? weightAmount : amount}
                    onChange={(value) => {
                        if (activeProduct.weighed) {
                            setWeightAmount(value)
                        } else {
                            setAmount(value)
                        }

                        if (activeProduct.id) {
                            setSelectedAmount(activeProduct.id, value)

                            if (inCart && cartItem) {
                                if (activeProduct.weighed) {
                                    changeCartItem(activeProduct.id, { ...cartItem, weight: value })
                                } else {
                                    changeCartItem(activeProduct.id, { ...cartItem, amount: value })
                                }
                            }
                        }
                    }}
                    step={activeProduct.weighed ? 0.1 : 1}
                    min={activeProduct.weighed ? 0.1 : 1}
                    sign={activeProduct.weighed ? "кг" : ""}
                    max={maxStock}
                    isNotFull
                    disabled={isOutOfStock}
                />
                <View style={styles.FlexBox}>
                    <Button
                        onClick={handlePress}
                        background={buttonBackground}
                        height={56}
                    >
                        <Txt color={buttonTextColor} weight='RobotoCondensed-Bold' size={18}>
                            {buttonText}
                        </Txt>
                    </Button>
                </View>
            </Row>
        </View>
    )
}

export default Controlls

const styles = StyleSheet.create({
    Box: {
        paddingHorizontal: 16,
        marginVertical: 16,
        gap: 24
    },
    FlexBox: {
        width: "100%",
        flex: 1,
        flexShrink: 1
    },
    Price: {
        gap: 4,
        alignItems: "flex-end",
        flexShrink: 0
    },
    WeightBox: {
        alignItems: "flex-end"
    },
    PromoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'flex-end',
    },
    OldPrice: {
        textDecorationLine: 'line-through',
        textDecorationStyle: 'solid',
    },
    DiscountBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    }
})