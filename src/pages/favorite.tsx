import { ScrollView, StatusBar, StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'
import Sections from '../components/Sections'
import useFavoriteStore from '../store/favorite'

const favorite = () => {
    const { getFavoriteList } = useFavoriteStore()

    useEffect(() => {
        getFavoriteList()
    }, [getFavoriteList])

    return (
        <View style={styles.Container}>
            <ScrollView>
                <View>
                    <Sections.Favorite.Header />
                    <Sections.Favorite.List />
                </View>
            </ScrollView>
        </View>
    )
}

export default favorite

const styles = StyleSheet.create({
    Container: {
        paddingTop: 8,
        flex: 1,
        backgroundColor: "#fff"
    }
})