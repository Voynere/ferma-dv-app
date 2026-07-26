import { StyleSheet, View } from 'react-native'
import React from 'react'
import Txt from '../../../ui/Text'
import FavoriteCard from '../../../ui/FavoriteCard'
import useFavoriteStore from '../../../store/favorite'

const List = () => {
    const { favoriteList } = useFavoriteStore()

    return (
        <View style={styles.List}>
            {favoriteList.length !== 0
                ? <>{favoriteList.map((item, index) => (
                    <FavoriteCard key={index} item={item} />
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