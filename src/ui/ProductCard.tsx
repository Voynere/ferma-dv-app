import { StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native'
import React, { FC, useCallback, useEffect, useState, useMemo, memo } from 'react'
import Txt from './Text'
import Counter from './Counter'
import Button from './Button'
import { ProductType } from '../types'
import useCartStore from '../store/cart'
import { useNavigation } from '@react-navigation/native'
import { formatPrice } from '../functions'
import { getActivePromoForProduct } from '../constants'
import OptimizedImage from './OptimizedImage'
import { roundAmount } from '../utils/roundAmount'
import useDeliveryStore from '../store/delivery'
import useStockSubscribeStore from '../store/stockSubscribe'
interface Props {
    item: ProductType
    width?: number
}

const ProductCard: FC<Props> = ({ item, width }) => {
    const navigation = useNavigation()
    const setItemInCart = useCartStore(state => state.setItemInCart)
    const removeItemFromCart = useCartStore(state => state.removeItemFromCart)
    const changeCartItem = useCartStore(state => state.changeCartItem)
    const cartList = useCartStore(state => state.cartList)
    const { deliveryData } = useDeliveryStore()
    
    const cartItem = useMemo(() => 
        cartList.find(i => i.id === item.id), 
        [cartList, item.id]
    )

    const cartStoreId = useMemo(() => {
        const stored = cartList.find(i => i.storeId)
        return stored?.storeId || null
    }, [cartList])
    
    const inCart = !!cartItem
    const initialAmount = useMemo(() => {
        if (cartItem) {
            const amt = item.weighed && cartItem.weight !== undefined ? cartItem.weight : cartItem.amount
            return amt
        }
        return item.weighed ? 0.1 : 1
    }, [cartItem, item.weighed, item.id, item.name])
    
    const [amount, setAmount] = useState(initialAmount)

    useEffect(() => {
        if (cartItem) {
            const newAmount = item.weighed && cartItem.weight !== undefined ? cartItem.weight : cartItem.amount
            setAmount(newAmount)
        } else {
            const resetAmount = item.weighed ? 0.1 : 1
            setAmount(resetAmount)
        }
    }, [cartItem, item.weighed, item.id, item.name])

    const isGreenPrice = useMemo(() => item.isGreenPrice === true, [item.isGreenPrice])
    const isSelfPickup = useMemo(() => deliveryData?.type === 1, [deliveryData?.type])
    const isGreenPriceBlockedBySelfPickup = useMemo(() =>
        isGreenPrice && isSelfPickup,
        [isGreenPrice, isSelfPickup]
    )

    const kilbilPromo = item.kilbilPromo
    const dayPromo = useMemo(() => getActivePromoForProduct(item.promoName, item.pathName), [item.promoName, item.pathName])
    const activePromo = kilbilPromo ?? (dayPromo ? {
        id: 0,
        name: dayPromo.name,
        discountPercent: dayPromo.discountPercent,
        stickerText: dayPromo.stickerText,
        stickerColor: dayPromo.stickerColor,
        stickerTextColor: dayPromo.stickerTextColor ?? '#fff',
    } : undefined)
    const hasPromo = !!activePromo

    const discountedPrice = useMemo(() => {
        if (activePromo?.discountPercent) {
            return item.price * (1 - activePromo.discountPercent / 100)
        }
        if (item.actionDiscountPercent) {
            return item.price * (1 - item.actionDiscountPercent / 100)
        }
        if (isGreenPrice) {
            return item.price * 0.93
        }
        return item.price
    }, [activePromo, isGreenPrice, item.actionDiscountPercent, item.price])

    const showOldPrice = hasPromo || isGreenPrice

    const actionTagColor = useMemo(() => {
        switch (item.actionName) {
            case 'Мясное воскресенье': return '#CC0000'
            case 'Колбасный вторник': return '#E8A100'
            default: return '#038002' // Зелёные ценники и прочие
        }
    }, [item.actionName])

    const step = useMemo(() => item.weighed ? 0.1 : 1, [item.weighed])
    const totalPrice = useMemo(() => formatPrice(amount * discountedPrice), [amount, discountedPrice])
    
    const priceText = useMemo(() => {
        if (showOldPrice) {
            return `${formatPrice(discountedPrice)} ₽ / ${item.weighed ? "кг" : "шт"}`;
        }
        return `${formatPrice(item.price)} ₽ / ${item.weighed ? "кг" : "шт"}`;
    }, [showOldPrice, discountedPrice, item.price, item.weighed])
    
    const totalPriceText = useMemo(() => `Итого: ${totalPrice} ₽`, [totalPrice])
    console.log('Product:', item.name, 'stock:', item.stock, 'storeId:', item.storeId, 'stockByStore:', item.stockByStore)

    const isOutOfStock = useMemo(() => 
        item.stock !== undefined && item.stock <= 0, 
        [item.stock]
    )

    const handleAddToCart = useCallback(async () => {
      const { setMessage } = require('../store/notification').default.getState()

      if (cartStoreId && item.storeId && cartStoreId !== item.storeId) {
        setMessage('Этот товар доступен на другом складе. Завершите текущий заказ или очистите корзину.', 'error')
        return
      }

      if (cartStoreId && !item.storeId) {
        setMessage('Не удалось определить склад для товара. Попробуйте обновить список или оформить отдельный заказ.', 'error')
        return
      }

      if (isGreenPriceBlockedBySelfPickup) {
        setMessage('Зелёные ценники доступны только при доставке!', 'error')
        return
      }

      if (inCart) {
        navigation.navigate('cart' as never)
        return
      }

      if (isOutOfStock) {
        try {
          const nowSubscribed = await toggleSubscribe(item)
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

      if (item.stock !== undefined && amount > item.stock) {
        setMessage('На складе недостаточно товара', 'error')
        return
      }

      setItemInCart({
        amount: item.weighed ? 1 : amount,
        id: item.id,
        image: item.image,
        name: item.name,
        price: discountedPrice,
        isWeighted: item.weighed,
        weight: item.weighed ? amount : undefined,
        stock: item.stock,
        stockByStore: item.stockByStore,
        storeId: item.storeId
      })
    }, [
      cartStoreId,
      item,
      amount,
      inCart,
      isOutOfStock,
      isGreenPriceBlockedBySelfPickup,
      discountedPrice,
      navigation,
      setItemInCart,
      toggleSubscribe
    ])

    const handleProductPress = useCallback(() => {
        navigation.navigate('product' as never, { id: item.id } as never)
    }, [item.id, navigation])
    
    const handleAmountChange = useCallback((value: number) => {
        const roundedValue = roundAmount(value, item.weighed)
        setAmount(roundedValue)

        if (inCart && cartItem) {
            if (item.weighed) {
                changeCartItem(item.id, { ...cartItem, weight: roundedValue })
            } else {
                changeCartItem(item.id, { ...cartItem, amount: roundedValue })
            }
        }
    }, [item.weighed, item.id, item.name, amount, inCart, cartItem, changeCartItem])

    const buttonBackground = useMemo(() => {
      if (isGreenPriceBlockedBySelfPickup) return "#CCCCCC"
      if (inCart) return "#EEEEEE"
      if (isOutOfStock) return "#EEEEEE"          // было серое disabled — теперь просто “спокойный” фон
      return "#4FBD01"
    }, [isGreenPriceBlockedBySelfPickup, isOutOfStock, inCart])

    const { isSubscribed, toggleSubscribe } = useStockSubscribeStore()

    const subscribed = useMemo(() => isSubscribed(item.id), [isSubscribed, item.id])

    const buttonText = useMemo(() => {
      if (isGreenPriceBlockedBySelfPickup) return "Только при доставке"
      if (inCart) return "В корзине"
      if (isOutOfStock) return subscribed ? "Вы подписаны" : "Узнать о поступлении"
      return "В корзину"
    }, [isGreenPriceBlockedBySelfPickup, isOutOfStock, inCart, subscribed])

    const buttonTextColor = useMemo(() => {
      if (isGreenPriceBlockedBySelfPickup) return "#666666"
      if (inCart) return "#4D4D4D"
      if (isOutOfStock) return subscribed ? "#4FBD01" : "#4D4D4D"
      return "#fff"
    }, [isGreenPriceBlockedBySelfPickup, isOutOfStock, inCart, subscribed])

    const screenWidth = Dimensions.get('window').width
    const isSmallScreen = screenWidth < 360
    
    const buttonTextSize = useMemo(() => {
      if (isGreenPriceBlockedBySelfPickup) return isSmallScreen ? 13 : 15
      if (isOutOfStock) return 15
      return 18
    }, [isGreenPriceBlockedBySelfPickup, isOutOfStock, isSmallScreen])

    return (
        <TouchableOpacity
            style={styles.Item}
            activeOpacity={0.5}
            onPress={handleProductPress}
        >
            <View style={styles.Content}>
                <View style={styles.ImageWrapper}>
                    <OptimizedImage
                        productId={item.id}
                        index={0}
                        style={styles.Image}
                        resizeMode="cover"
                        emptyStyle={styles.Empty}
                    />
                    {hasPromo && kilbilPromo && !isGreenPrice && (
                        <View style={[styles.DiscountTag, { backgroundColor: kilbilPromo.stickerColor }]}>
                            <Txt
                                color={kilbilPromo.stickerTextColor}
                                weight='RobotoCondensed-Bold'
                                size={11}
                                numberOfLines={2}
                            >
                                {kilbilPromo.stickerText}
                            </Txt>
                        </View>
                    )}
                    {item.actionName && (
                        <View style={[styles.ActionNameTag, { backgroundColor: actionTagColor }]}>
                            <Txt
                                color="#fff"
                                weight='RobotoCondensed-Bold'
                                size={11}
                                numberOfLines={2}
                            >
                                {item.actionName}
                            </Txt>
                        </View>
                    )}
                </View>

                <View style={styles.Info}>
                    <Txt numberOfLines={2}>{item.name}</Txt>
                    {showOldPrice && (
                        <View style={styles.PriceRow}>
                            <Txt weight='RobotoCondensed-Regular' size={14} color="#999" style={styles.OldPrice}>
                                {formatPrice(item.price)} ₽
                            </Txt>
                            {(kilbilPromo?.discountPercent || item.actionDiscountPercent) ? (
                                <View style={[styles.DiscountBadge, { backgroundColor: kilbilPromo?.stickerColor ?? actionTagColor }]}>
                                    <Txt
                                        color={kilbilPromo?.stickerTextColor ?? '#fff'}
                                        weight='RobotoCondensed-Bold'
                                        size={12}
                                    >
                                        {`-${kilbilPromo?.discountPercent ?? item.actionDiscountPercent}%`}
                                    </Txt>
                                </View>
                            ) : null}
                            <Txt
                                weight='RobotoCondensed-Bold'
                                color={kilbilPromo ? kilbilPromo.stickerColor : actionTagColor}
                                size={16}
                            >
                                {priceText}
                            </Txt>
                        </View>
                    )}
                    {!showOldPrice && (
                        <Txt weight='RobotoCondensed-Bold'>
                            {priceText}
                        </Txt>
                    )}
                    <Txt size={14} color="#666">
                        {totalPriceText}
                    </Txt>
                </View>
            </View>

            <View style={styles.Box}>
                <Counter
                    amount={amount}
                    step={step}
                    onChange={handleAmountChange}
                    sign={item.weighed ? "кг" : ""}
                    max={item.stock}
                    isSmall
                    disabled={isOutOfStock}
                />

                <Button
                    onClick={handleAddToCart}
                    background={buttonBackground}
                    disabled={isGreenPriceBlockedBySelfPickup}                >
                    <Txt
                      color={buttonTextColor}
                      weight='RobotoCondensed-Bold'
                      size={buttonTextSize}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {buttonText}
                    </Txt>
                </Button>
            </View>
        </TouchableOpacity>
    )
}

ProductCard.displayName = 'ProductCard'

export default memo(ProductCard, (prevProps, nextProps) => {
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.price === nextProps.item.price &&
        prevProps.item.stock === nextProps.item.stock &&
        prevProps.item.isGreenPrice === nextProps.item.isGreenPrice &&
        prevProps.item.actionDiscountPercent === nextProps.item.actionDiscountPercent &&
        prevProps.item.promoName === nextProps.item.promoName &&
        prevProps.item.pathName === nextProps.item.pathName &&
        prevProps.width === nextProps.width
    )
})

const styles = StyleSheet.create({
    Item: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#4FBD01",
        padding: 16,
        borderRadius: 16,
        maxWidth: "48%",
    },
    Content: {
        flexGrow: 1
    },
    ImageWrapper: {
        position: 'relative',
    },
    Image: {
        width: "100%",
        height: 150,
        borderRadius: 16,
    },
    Empty: {
        height: 150,
        width: "100%",
    },
    DiscountTag: {
        position: 'absolute',
        top: 10,
        right: 0,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        maxWidth: 90,
    },
    ActionNameTag: {
        position: 'absolute',
        top: 10,
        left: 0,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        maxWidth: 120,
    },
    Info: {
        marginTop: 16,
        gap: 4
    },
    Box: {
        marginTop: 20,
        gap: 16,
    },
    PriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap'
    },
    OldPrice: {
        textDecorationLine: 'line-through',
        textDecorationStyle: 'solid'
    },
    DiscountBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    }
})
