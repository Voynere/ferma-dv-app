import { Image, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { bannersList, BannerItem, getActivePromos } from '../../../constants'
import BannerInfoModal from '../../../ui/BannerInfoModal'
import Txt from '../../../ui/Text'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import useCatalogStore from '../../../store/catalog'
import { RootStackParamList } from '../../../RootLayout'

const BANNER_WIDTH = 170
const BANNER_RATIO = 0.67

const Banners = () => {
    const [activeBanner, setActiveBanner] = useState<BannerItem | null>(null)
    const navigation = useNavigation<NavigationProp<RootStackParamList>>()
    const catalogList = useCatalogStore(state => state.catalogList)
    const changePage = useCatalogStore(state => state.changePage)
    const changeCategory = useCatalogStore(state => state.changeCategory)
    const getCategories = useCatalogStore(state => state.getCategories)

    useEffect(() => { getCategories() }, [])

    const activeKilbilActionIds = useCatalogStore(state => state.activeKilbilActionIds)
    const activePromos = getActivePromos()

    const isPromoActive = (banner: BannerItem) => {
        if (banner.kilbilActionId && activeKilbilActionIds.includes(banner.kilbilActionId)) {
            return true
        }
        return !!banner.catalogName &&
            activePromos.some(p => p.catalogName?.trim().toLowerCase() === banner.catalogName!.trim().toLowerCase())
    }

    const handleGoToCategory = useCallback(() => {
        if (activeBanner?.catalogName) {
            const item = catalogList.find(i =>
                i.name.trim().toLowerCase() === activeBanner.catalogName!.trim().toLowerCase()
            )
            if (item) {
                setActiveBanner(null)
                changePage(1)
                changeCategory('')
                navigation.navigate('cartDetails', { id: item.id })
            }
        } else if (activeBanner?.atributeId) {
            setActiveBanner(null)
            navigation.navigate('atributes', { id: activeBanner.atributeId })
        }
    }, [activeBanner, catalogList, changePage, changeCategory, navigation])

    return (
        <>
            <FlatList
                data={bannersList}
                horizontal
                keyExtractor={(_, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.Banners}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                    const active = isPromoActive(item)
                    return (
                        <TouchableOpacity
                            style={[styles.BannerItem, active && styles.BannerItemActive]}
                            activeOpacity={0.85}
                            onPress={() => setActiveBanner(item)}
                        >
                            <Image style={styles.Image} source={item.image} />
                            {active && (
                                <View style={styles.TodayBadge}>
                                    <Txt color="#fff" weight="Bold" size={11}>Сегодня</Txt>
                                </View>
                            )}
                        </TouchableOpacity>
                    )
                }}
            />
            <BannerInfoModal
                banner={activeBanner}
                onClose={() => setActiveBanner(null)}
                onGoToCategory={handleGoToCategory}
            />
        </>
    )
}

export default Banners

const styles = StyleSheet.create({
    Banners: {
        paddingHorizontal: 16
    },
    BannerItem: {
        position: "relative",
        width: BANNER_WIDTH,
        aspectRatio: BANNER_RATIO,
        borderRadius: 16,
        overflow: "hidden",
        marginRight: 16
    },
    BannerItemActive: {
        borderWidth: 2,
        borderColor: '#4FBD01',
    },
    Image: {
        width: "100%",
        height: "100%",
        resizeMode: 'cover',
    },
    TodayBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#4FBD01',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
})
