import { StyleSheet, View } from 'react-native'
import React from 'react'
import useCartStore from '../../../store/cart'
import CartItem from '../../../ui/CartItem'
import Txt from '../../../ui/Text'

const List = () => {
    const { cartList } = useCartStore()

    return (
        <View style={styles.List}>
            {cartList.length !== 0
                ? <>{cartList.map((item, index) => (
                    <CartItem key={index} item={item} />
                ))}</>
                : <Txt>Нет товаров</Txt>
            }
        </View>
    )
}

export default List

const styles = StyleSheet.create({
    List: {
        gap: 24,
        paddingHorizontal: 16,
        marginTop: 24
    },
})