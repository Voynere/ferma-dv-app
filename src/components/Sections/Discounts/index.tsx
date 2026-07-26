import { FlatList, Image, StyleSheet, View, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { bannersList, BannerItem } from '../../../constants'
import Txt from '../../../ui/Text'
import BannerInfoModal from '../../../ui/BannerInfoModal'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import useCatalogStore from '../../../store/catalog'
import { RootStackParamList } from '../../../RootLayout'

const Discounts = () => {
    const [activeBanner, setActiveBanner] = useState<BannerItem | null>(null)
    const navigation = useNavigation<NavigationProp<RootStackParamList>>()
    const catalogList = useCatalogStore(state => state.catalogList)
    const changePage = useCatalogStore(state => state.changePage)
    const changeCategory = useCatalogStore(state => state.changeCategory)
    const getCategories = useCatalogStore(state => state.getCategories)

    useEffect(() => { getCategories() }, [])

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
        <View style={styles.Container}>
            <FlatList
                data={bannersList}
                keyExtractor={(_, index) => index.toString()}
                numColumns={2}
                columnWrapperStyle={styles.Row}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.BannerItem}
                        activeOpacity={0.85}
                        onPress={() => setActiveBanner(item)}
                    >
                        <View style={styles.Title}>
                            <Txt color="#fff" weight='Bold' lineHeight={20} size={16}>{item.title}</Txt>
                        </View>
                        <Image style={styles.Image} source={item.image} />
                    </TouchableOpacity>
                )}
            />
            <BannerInfoModal
                banner={activeBanner}
                onClose={() => setActiveBanner(null)}
                onGoToCategory={handleGoToCategory}
            />
        </View>
    )
}

export default Discounts

const styles = StyleSheet.create({
    Container: {
        paddingHorizontal: 16,
        paddingBottom: '5%'
    },
    BannerItem: {
        position: "relative",
        width: "100%",
        flex: 1,
        height: 200,
        borderRadius: 16,
        overflow: "hidden",
    },
    Image: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    Title: {
        position: "absolute",
        top: 16,
        left: 16,
        flex: 1,
        zIndex: 1,
        width: 100,
    },
    Row: {
        gap: 16,
        marginBottom: 16
    },
})
