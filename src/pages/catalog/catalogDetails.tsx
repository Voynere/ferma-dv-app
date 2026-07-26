import { Animated, StyleSheet, View, FlatList, ListRenderItem } from 'react-native'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import Header from '../../components/Header'
import Sections from '../../components/Sections'
import Back from '../../ui/Back'
import useGlobalStore from '../../store'
import useCatalogStore from '../../store/catalog'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type RootStackParamList = {
    catalogDetails: { id: string }
}

type ListItem = {
    key: string
    type: 'header' | 'back' | 'categories' | 'list'
}

const CatalogDetails = () => {
    const [showFixed, setShowFixed] = useState<boolean>(false)
    const flatListRef = useRef<FlatList>(null)
    const fadeAnim = useRef(new Animated.Value(0)).current
    const hasRestored = useRef(false)
    const targetOffset = useRef<number>(0)
    const showFixedRef = useRef(false)
    const chipsOffsetY = useRef<number>(0)
    const itemHeights = useRef({ header: 0, back: 0 })

    const insets = useSafeAreaInsets()
    const { enableScroll } = useGlobalStore()
    const { changePage, setScrollOffset, resetScrollOffset } = useCatalogStore()
    const category = useCatalogStore(state => state.category)
    const prevCategory = useRef(category)

    const route = useRoute<RouteProp<RootStackParamList, 'catalogDetails'>>()
    const { id } = route.params
    const navigation = useNavigation()
    const prevId = useRef(id)

    useEffect(() => {
        targetOffset.current = useCatalogStore.getState().scrollOffset
    }, [])

    useEffect(() => {
        if (prevId.current !== id) {
            changePage(1)
            resetScrollOffset()
            targetOffset.current = 0
            hasRestored.current = false
            prevId.current = id
            setShowFixed(false)
            showFixedRef.current = false
        }
    }, [id])

    // При смене категории держим фиксированную панель
    useEffect(() => {
        if (prevCategory.current !== category) {
            prevCategory.current = category
        }
    }, [category])

    const handleScroll = useCallback((event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y

        if (hasRestored.current || targetOffset.current === 0) {
            setScrollOffset(offsetY)
        }

        if (chipsOffsetY.current === 0) return

        const shouldShow = offsetY >= chipsOffsetY.current
        setShowFixed(prev => {
            if (prev !== shouldShow) {
                showFixedRef.current = shouldShow
                return shouldShow
            }
            return prev
        })
    }, [])

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: showFixed ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start()
    }, [showFixed])

    const data: ListItem[] = [
        { key: 'header', type: 'header' },
        { key: 'back', type: 'back' },
        { key: 'categories', type: 'categories' },
        { key: 'list', type: 'list' },
    ]

    const renderItem: ListRenderItem<ListItem> = ({ item }) => {
        switch (item.type) {
            case 'header':
                return (
                    <View onLayout={(e) => {
                        itemHeights.current.header = e.nativeEvent.layout.height
                        chipsOffsetY.current = itemHeights.current.header + itemHeights.current.back
                    }}>
                        <Header showBanners />
                    </View>
                )
            case 'back':
                return (
                    <View
                        style={styles.BackBox}
                        onLayout={(e) => {
                            itemHeights.current.back = e.nativeEvent.layout.height
                            chipsOffsetY.current = itemHeights.current.header + itemHeights.current.back
                        }}
                    >
                        <Back onClick={() => {
                            if (navigation.canGoBack()) {
                                navigation.goBack()
                            } else {
                                navigation.navigate('catalog' as never)
                            }
                        }} />
                    </View>
                )
            case 'categories':
                return (
                    <View
                        style={showFixed ? { opacity: 0 } : { opacity: 1 }}
                        pointerEvents={showFixed ? 'none' : 'auto'}
                    >
                        <Sections.Catalog.Categories />
                    </View>
                )
            case 'list':
                return <Sections.Catalog.List />
            default:
                return null
        }
    }

    const handleContentSizeChange = useCallback(() => {
        if (targetOffset.current > 0 && !hasRestored.current) {
            hasRestored.current = true
            flatListRef.current?.scrollToOffset({
                offset: targetOffset.current,
                animated: false,
            })
        }
    }, [])

    return (
        <View style={styles.Container}>
            <Animated.View
                pointerEvents={showFixed ? 'auto' : 'none'}
                style={[
                    styles.FixedCategories,
                    {
                        top: insets.top,
                        opacity: fadeAnim,
                        transform: [{
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-8, 0],
                            }),
                        }],
                    },
                ]}
            >
                <Sections.Catalog.FixedCategories />
            </Animated.View>

            <FlatList
                ref={flatListRef}
                data={data}
                keyExtractor={(item) => item.key}
                renderItem={renderItem}
                extraData={showFixed}
                scrollEnabled={enableScroll}
                onScroll={handleScroll}
                onContentSizeChange={handleContentSizeChange}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.FlatListContent}
            />
        </View>
    )
}

export default CatalogDetails

const styles = StyleSheet.create({
    Container: {
        paddingTop: 8,
        flex: 1,
        backgroundColor: '#fff',
    },
    BackBox: {
        paddingTop: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        zIndex: 10,
        elevation: 10,
    },
    FixedCategories: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        zIndex: 1000,
    },
    FlatListContent: {
        paddingBottom: 100,
    },
})
