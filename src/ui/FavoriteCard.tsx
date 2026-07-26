import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { FC, useCallback, useMemo, memo } from 'react'
import Txt from './Text'
import Row from '../components/Row'
import Button from './Button'
import useCartStore from '../store/cart'
import { IFavorite } from '../types'
import useFavoriteStore from '../store/favorite'
import { useNavigation } from '@react-navigation/native'
import { formatPrice } from '../functions'
import OptimizedImage from './OptimizedImage'

interface Props {
    item: IFavorite
}

const FavoriteCard: FC<Props> = ({ item }) => {
    const navigation = useNavigation()
    const cartList = useCartStore(state => state.cartList)
    const setItemInCart = useCartStore(state => state.setItemInCart)
    const removeItemFromCart = useCartStore(state => state.removeItemFromCart)
    const removeItemFromFav = useFavoriteStore(state => state.removeItemFromFav)
    
    const inCart = useMemo(() => 
        cartList.some(i => i.id === item.id), 
        [cartList, item.id]
    )

    const cartStoreId = useMemo(() => {
        const stored = cartList.find(i => i.storeId)
        return stored?.storeId || null
    }, [cartList])

    const isOutOfStock = useMemo(() => 
        item.stock !== undefined && item.stock <= 0, 
        [item.stock]
    )
    
    const price = useMemo(() => 
        formatPrice(item.isWeighted ? item.price * (item.weight || 0.1) : item.price),
        [item.isWeighted, item.price, item.weight]
    )
    
    const priceText = useMemo(() => 
        `${price} руб. / ${item.isWeighted ? `${item.weight || 0.1} кг` : "шт"}`,
        [price, item.isWeighted, item.weight]
    )
    
    const handleProductPress = useCallback(() => {
        navigation.navigate('product' as never, { id: item.id } as never)
    }, [item.id, navigation])
    
    const handleRemove = useCallback(() => {
        removeItemFromFav(item.id)
    }, [item.id, removeItemFromFav])
    
    const handleAddToCart = useCallback(() => {
        const { setMessage } = require('../store/notification').default.getState()
        
        if (inCart) {
            removeItemFromCart(item.id)
            setMessage('Товар удалён из корзины', 'success')
            return
        }

        const targetStoreId = item.storeId
            ? item.storeId
            : item.stockByStore
                ? Object.entries(item.stockByStore).find(([, value]) => value && value > 0)?.[0] || null
                : null
        
        if (isOutOfStock) {
            setMessage('Товар отсутствует в наличии', 'error')
            return
        }

        if (cartStoreId && targetStoreId && cartStoreId !== targetStoreId) {
            setMessage('Этот товар находится на другом складе. Завершите текущий заказ или очистите корзину.', 'error')
            return
        }

        if (cartStoreId && !targetStoreId) {
            setMessage('Не удалось определить склад для товара. Попробуйте обновить список или оформить отдельный заказ.', 'error')
            return
        }
        
        setItemInCart({ 
            amount: item.isWeighted ? 1 : 1,
            id: item.id,
            image: item.image,
            name: item.name,
            price: item.price,
            isWeighted: item.isWeighted,
            weight: item.isWeighted ? (item.weight || 0.1) : undefined,
            stock: item.stock,
            stockByStore: item.stockByStore,
            storeId: targetStoreId || undefined
        })
    }, [item, setItemInCart, removeItemFromCart, isOutOfStock, inCart, cartStoreId])

    const buttonBackground = useMemo(() => {
        if (isOutOfStock) return "#CCCCCC"
        if (inCart) return "#EEEEEE"
        return "#4FBD01"
    }, [isOutOfStock, inCart])

    const buttonText = useMemo(() => {
        if (isOutOfStock) return "Нет в наличии"
        if (inCart) return "В корзине"
        return "В корзину"
    }, [isOutOfStock, inCart])

    const buttonTextColor = useMemo(() => {
        if (isOutOfStock) return "#666666"
        if (inCart) return "#4D4D4D"
        return "#fff"
    }, [isOutOfStock, inCart])

    return (
        <View style={styles.FavoriteCard}>
            <TouchableOpacity
                activeOpacity={0.5}
                onPress={handleProductPress}
            >
                <Row gap={24}>
                    <OptimizedImage
                        productId={item.id}
                        index={0}
                        style={styles.Image}
                        resizeMode="cover"
                        emptyStyle={styles.Empty}
                    />

                    <View style={styles.Title}>
                        <Txt weight='RobotoCondensed-Bold' size={16} numberOfLines={3}>{item.name}</Txt>
                        <Txt>{priceText}</Txt>
                    </View>
                </Row>
            </TouchableOpacity>

            <Row gap={10}>
                <View style={styles.Flex}>
                    <Button background="#EEEEEE" onClick={handleRemove}>
                        <Txt color="#4D4D4D" weight='RobotoCondensed-Bold' size={16}>Удалить</Txt>
                    </Button>
                </View>

                <View style={styles.Flex}>
                    <Button 
                        onClick={handleAddToCart}
                        background={buttonBackground}
                        disabled={isOutOfStock && !inCart}
                    >
                        <Txt 
                            color={buttonTextColor} 
                            weight='RobotoCondensed-Bold' 
                            size={16}
                        >
                            {buttonText}
                        </Txt>
                    </Button>
                </View>
            </Row>
        </View>
    )
}

FavoriteCard.displayName = 'FavoriteCard'

export default memo(FavoriteCard, (prevProps, nextProps) => {
    return prevProps.item.id === nextProps.item.id &&
           prevProps.item.price === nextProps.item.price &&
           prevProps.item.weight === nextProps.item.weight
})

const styles = StyleSheet.create({
    Image: {
        width: 75,
        height: 75,
        borderRadius: 12,
        resizeMode: "cover",
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
    },
    Flex: {
        flex: 1
    },
    FavoriteCard: {
        gap: 12
    }
})
