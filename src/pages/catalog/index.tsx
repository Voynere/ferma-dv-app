import { ScrollView, StyleSheet, View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import Sections from '../../components/Sections'
import useCatalogStore from '../../store/catalog'
import useGlobalStore from '../../store'
import Header from '../../components/Header'

const catalog = () => {
    const { getCategories } = useCatalogStore()
    const { enableScroll } = useGlobalStore()
    const scrollRef = useRef<ScrollView>(null); // реф на ScrollView

    useEffect(() => {
        getCategories()
    }, [getCategories])

    return (
        <View style={styles.Container}>
            {/* Фиксированный Header вне прокрутки */}
            <View style={styles.HeaderWrapper}>
                <Header />
            </View>

            {/* Прокручиваемый контент ниже шапки */}
            <ScrollView ref={scrollRef} scrollEnabled={enableScroll} contentContainerStyle={styles.ContentContainer}>
                <View>
                    <Sections.Home.Catalog showHeader={false} />
                </View>
            </ScrollView>
        </View>
    )
}

export default catalog

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    HeaderWrapper: {
        backgroundColor: '#fff',
        zIndex: 10,
        elevation: 4,
    },
    ContentContainer: {
        paddingBottom: 24,
    },
})