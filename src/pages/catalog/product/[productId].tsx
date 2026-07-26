import { ScrollView, StatusBar, StyleSheet, View } from 'react-native'
import React, { useEffect, useRef, useCallback } from 'react'
import Sections from '../../../components/Sections'
import useCatalogStore from '../../../store/catalog'
import LoadingSpinner from '../../../ui/LoadingSpinner'
import { useRoute, useFocusEffect } from '@react-navigation/native'
import { performanceMonitor } from '../../../utils/performanceMonitor'

const ProductScreen = () => {
    const route = useRoute<any>()
    const { id } = route.params
    const isMounted = useRef(true)

    const { isLoading, getProduct, activeProduct } = useCatalogStore()

    useFocusEffect(
        useCallback(() => {
            performanceMonitor.startMonitoring()
            return () => {
                performanceMonitor.stopMonitoring()
            }
        }, [])
    )

    useEffect(() => {
        isMounted.current = true

        const loadProduct = async () => {
            if (!isMounted.current) return
            
            performanceMonitor.logInteraction('Open Product', 'ProductScreen')
            await performanceMonitor.measureAsyncOperation(
                () => getProduct(id),
                'Product Load'
            )
        }

        loadProduct()

        return () => {
            isMounted.current = false
        }
    }, [id])

    return (
        <View style={styles.Container}>
            <ScrollView contentContainerStyle={styles.ScrollContent}>
                <Sections.Product.Preview />
                {!isLoading ? (
                    <>
                        <Sections.Product.Controlls />
                        <Sections.Product.Info />
                        <Sections.Product.Reviews />
                    </>
                ) : (
                    <View style={styles.Loader}>
                        <LoadingSpinner message="Загружаем информацию о товаре..." />
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

export default ProductScreen

const styles = StyleSheet.create({
    Container: {
        paddingTop: 8,
        flex: 1,
        backgroundColor: "#fff",
    },
    ScrollContent: {
        paddingBottom: 150
    },
    Loader: {
        padding: 15
    }
})