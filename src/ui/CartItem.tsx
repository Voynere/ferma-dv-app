import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { FC, useCallback, useEffect, useState, useMemo, memo } from 'react'
import Txt from '../ui/Text'
import Counter from '../ui/Counter'
import Icons from '../ui/Icons'
import Row from '../components/Row'
import { CartType } from '../types'
import useCartStore from '../store/cart'
import { useNavigation } from '@react-navigation/native'
import { formatPrice } from '../functions'
import OptimizedImage from './OptimizedImage'

interface Props {
    item: CartType
}

const CartItem: FC<Props> = ({ item }) => {
    const navigation = useNavigation()
    const removeItemFromCart = useCartStore(state => state.removeItemFromCart)
    const changeCartItem = useCartStore(state => state.changeCartItem)
    
    const [amount, setAmount] = useState(item.amount)
    const [weight, setWeight] = useState(item.weight || 0.1)
    
    useEffect(() => {
        setAmount(item.amount)
        setWeight(item.weight || 0.1)
    }, [item.amount, item.weight])
    
    const displayAmount = useMemo(() => 
        item.isWeighted ? weight : amount,
        [item.isWeighted, weight, amount]
    )
    
    const step = useMemo(() => item.isWeighted ? 0.1 : 1, [item.isWeighted])
    const price = useMemo(() => 
        item.isWeighted ? item.price * weight : item.price * amount,
        [item.isWeighted, item.price, weight, amount]
    )
    
    const priceDisplay = useMemo(() => 
        `${formatPrice(price)} руб.`,
        [price]
    )
    
    const detailText = useMemo(() => {
        if (item.isWeighted) {
            return `${weight.toFixed(1)}кг x ${formatPrice(item.price)}/кг = ${formatPrice(price)} руб.`
        }
        return `${amount}шт x ${formatPrice(item.price)} = ${formatPrice(price)} руб.`
    }, [item.isWeighted, weight, amount, item.price, price])
    
    const handleProductPress = useCallback(() => {
        navigation.navigate('product' as never, { id: item.id } as never)
    }, [item.id, navigation])
    
    const handleRemove = useCallback(() => {
        removeItemFromCart(item.id)
    }, [item.id, removeItemFromCart])

    const handleCounterChange = useCallback((value: number) => {
        if (item.isWeighted) {
            setWeight(value)
            changeCartItem(item.id, { ...item, weight: value })
        } else {
            setAmount(value)
            changeCartItem(item.id, { ...item, amount: value })
        }
    }, [item, changeCartItem, weight, amount])

    return (
        <View style={styles.CartItem}>
            <Row gap={24}>
                <TouchableOpacity
                    style={styles.TouchArea}
                    onPress={handleProductPress}
                    activeOpacity={0.5}
                >
                    <Row>
                        <OptimizedImage
                            productId={item.id}
                            index={0}
                            style={styles.Image}
                            resizeMode="cover"
                            emptyStyle={styles.Empty}
                        />

                        <View style={styles.Title}>
                            <Txt weight='RobotoCondensed-Bold' size={16} numberOfLines={3}>{item.name}</Txt>
                            {item.isWeighted ? (
                                <>
                                    <Txt>{weight.toFixed(1)} кг</Txt>
                                    <Txt>{detailText}</Txt>
                                </>
                            ) : (
                                <Txt>{detailText}</Txt>
                            )}
                        </View>
                    </Row>
                </TouchableOpacity>

                <Counter
                    amount={displayAmount}
                    onChange={handleCounterChange}
                    step={step}
                    min={item.isWeighted ? 0.1 : 1}
                    max={item.stock}
                    sign={item.isWeighted ? "кг" : ""}
                    isNotFull
                    isSmall
                />
            </Row>

            <Row>
                <Txt size={28} weight='RobotoCondensed-Bold'>{priceDisplay}</Txt>
                <TouchableOpacity activeOpacity={0.5} onPress={handleRemove}>
                    <Icons.Trash />
                </TouchableOpacity>
            </Row>
        </View>
    )
}

CartItem.displayName = 'CartItem'

export default memo(CartItem, (prevProps, nextProps) => {
    return prevProps.item.id === nextProps.item.id &&
           prevProps.item.amount === nextProps.item.amount &&
           prevProps.item.weight === nextProps.item.weight &&
           prevProps.item.price === nextProps.item.price
})

const styles = StyleSheet.create({
    CartItem: {
        gap: 16,
        width: "100%",
        paddingBottom: 24,
        borderBottomColor: "#15151526",
        borderBottomWidth: 1
    },
    TouchArea: {
        flex: 1
    },
    Image: {
        width: 75,
        height: 75,
        borderRadius: 12,
    },
    Empty: {
        width: 75,
        height: 75,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#15151580",
        alignItems: "center",
        justifyContent: "center"
    },
    Title: {
        flex: 1,
        width: "100%",
        gap: 4
    }
})
