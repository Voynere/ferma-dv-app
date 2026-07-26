import { ScrollView, StatusBar, StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import Sections from '../components/Sections'
import useCartStore from '../store/cart'
import Txt from '../ui/Text'
import Button from '../ui/Button'

const cart = () => {
    const navigation = useNavigation()
    const { getCartList, cartList } = useCartStore()

    useEffect(() => {
        getCartList()
    }, [getCartList])

    if (cartList.length === 0) {
        return (
            <View style={styles.Container}>
                <View style={styles.EmptyContainer}>
                    <Txt size={80} style={styles.EmptyIcon}>🛒</Txt>
                    <Txt size={26} weight="Bold" style={styles.EmptyTitle}>
                        Корзина пуста
                    </Txt>
                    <Txt size={16} color="#666" style={styles.EmptySubtitle}>
                        У вас пока нет товаров в корзине
                    </Txt>
                    <Button
                        onClick={() => navigation.navigate('catalog' as never)}
                        background="#4FBD01"
                        height={56}
                        style={styles.EmptyButton}
                    >
                        <Txt size={18} weight="Bold" color="#fff">
                            Перейти в каталог
                        </Txt>
                    </Button>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.Container}>
            <ScrollView>
                <View>
                    <Sections.Cart.Header />
                    <Sections.Cart.List />
                    <Sections.Cart.Total />
                </View>
            </ScrollView>
        </View>
    )
}

export default cart

const styles = StyleSheet.create({
    Container: {
        paddingTop: 8,
        flex: 1,
        backgroundColor: "#fff",
        paddingBottom: 150
    },
    EmptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: '4%',
        paddingVertical: 100,
    },
    EmptyIcon: {
        marginBottom: 40,
        opacity: 0.3,
    },
    EmptyTitle: {
        marginTop: 10,
        marginBottom: 24,
        textAlign: 'center',
    },
    EmptySubtitle: {
        marginTop: 10,
        marginBottom: 48,
        textAlign: 'center',
        lineHeight: 24,
    },
    EmptyButton: {
        width: '100%',
        maxWidth: 300,
        borderRadius: 12,
    }
})