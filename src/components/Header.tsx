import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, FlatList } from 'react-native'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import Banner from './Banner'
import TouchBox from './TouchBox'
import Icons from '../ui/Icons'
import Txt from '../ui/Text'
import Search from '../ui/Search'
import { useNavigation } from '@react-navigation/native'
import useGlobalStore from '../store'
import useDeliveryStore from '../store/delivery'
import { selfPickupList, bannersList, BannerItem } from '../constants'
import BannerInfoModal from '../ui/BannerInfoModal'
import useBonusStore from '../store/bonus'
import useCatalogStore from '../store/catalog'
import icon from "../assets/images/icon.png";
import cow from "../assets/svg/Cow.png";
import { useSafeAreaInsets } from 'react-native-safe-area-context'
interface Props {
    isHideSearch?: boolean
    scrollRef?: React.RefObject<ScrollView>
    showBanners?: boolean
}

const Header: FC<Props> = ({ isHideSearch, scrollRef, showBanners = false }) => {
    const insets = useSafeAreaInsets()
    const { isAuth, changeEnableScroll } = useGlobalStore()
    const navigation = useNavigation<any>()
    const { deliveryData, addresses, getDelivery, getAddressesList } = useDeliveryStore()
    const { bonuses } = useBonusStore()
    const { search, changeSearch, searchProductByName, searchList, catalogList, changePage, changeCategory, getCategories } = useCatalogStore()
    const [localSearch, setLocalSearch] = useState(search)
    const [activeBanner, setActiveBanner] = useState<BannerItem | null>(null)

    const searchWrapperRef = useRef<View>(null)

    const scrollToSearch = () => {
        if (!scrollRef?.current || !searchWrapperRef.current) return
        searchWrapperRef.current.measure((fx, fy, width, height, px, py) => {
            scrollRef.current?.scrollTo({ y: py - 100, animated: true })
        })
    }

    function fillDeliveryAddress() {
        if (deliveryData?.type === 0) {
            return addresses[deliveryData.id]?.value || "Адрес не выбран"
        } else {
            if (deliveryData?.city === undefined) return "Адрес не выбран"
            const cityData = selfPickupList[deliveryData.city]
            return cityData?.list[deliveryData.id]?.address || "Адрес не выбран"
        }
    }

    useEffect(() => {
        getDelivery()
        getAddressesList()
        getCategories()
    }, [getDelivery, getAddressesList])

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

    useEffect(() => {
        const handler = setTimeout(() => {
            changeSearch(localSearch)
            if (localSearch.length > 0) {
                searchProductByName(localSearch)
                changeEnableScroll(false)
                scrollToSearch()
            }
        }, 300)

        if (localSearch.length === 0) {
            changeEnableScroll(true)
        }

        return () => clearTimeout(handler)
    }, [localSearch, changeSearch, searchProductByName])

    return (
        <View style={[styles.Header, { paddingTop: Math.max(insets.top, 16) }]}>
            <View style={styles.TopBar}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('home')}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Image source={icon} style={styles.Logo} />
                </TouchableOpacity>
                <Banner />
            </View>

            <View style={styles.ControllBar}>
                <TouchBox onClick={() => navigation.navigate("notifications")}>
                    <Icons.Bell />
                </TouchBox>

                <TouchBox isFull onClick={() => navigation.navigate("delivery")}>
                    <View style={styles.Box}>
                        {deliveryData ? (
                            <Txt numberOfLines={1} size={14}>{fillDeliveryAddress()}</Txt>
                        ) : (
                            <Txt numberOfLines={1} size={14}>Адрес не выбран</Txt>
                        )}
                        <Txt numberOfLines={1} color="rgba(77,77,77,0.7)" size={12}>
                            {deliveryData?.type !== undefined
                                ? deliveryData.type === 0 ? "Доставка" : "Самовывоз"
                                : "Способ получения"}
                        </Txt>
                    </View>
                </TouchBox>

                <TouchBox padding={36} height={48} onClick={() => navigation.navigate(isAuth ? "profile" : "auth")}>
                    {isAuth ? (
                        <>
                            <Image style={styles.Image} source={cow} />
                            <View style={styles.Bonus}>
                                <Txt color="#EF2D45" size={12} weight="Bold">{bonuses.toFixed(0)} Б</Txt>
                            </View>
                        </>
                    ) : (
                        <Icons.User color="#4FBD01" />
                    )}
                </TouchBox>
            </View>

            <View style={styles.SearchContainer} ref={searchWrapperRef}>
                {!isHideSearch && (
                    <Search
                        value={localSearch}
                        onChange={setLocalSearch}
                        onFocus={scrollToSearch}
                        onSubmit={() => {
                            if (searchList.length > 0) {
                                changeEnableScroll(true)
                                setLocalSearch("")
                                navigation.navigate('product', { id: searchList[0].id })
                            }
                        }}
                    />
                )}

                {localSearch.length > 0 && searchList.length > 0 && (
                    <View style={styles.SearchBox}>
                        <ScrollView 
                            style={styles.SearchBoxScroll}
                            nestedScrollEnabled={true}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={true}
                        >
                            {searchList.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.SearchBoxItem}
                                    activeOpacity={0.5}
                                    onPress={() => {
                                        changeEnableScroll(true)
                                        setLocalSearch("")
                                        navigation.navigate('product', { id: item.id })
                                    }}
                                >
                                    <Txt weight="RobotoCondensed-Bold" size={16} numberOfLines={2}>{item.name}</Txt>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
                {localSearch.length > 0 && searchList.length === 0 && (
                    <View style={[styles.SearchBox, { paddingVertical: 12 }]}> 
                        <Txt>Ничего не найдено</Txt>
                    </View>
                )}
            </View>

            {showBanners && (
                <View style={styles.BannersContainer}>
                    <View style={styles.BannersTitle}>
                        <Txt size={24} weight="Jingleberry">Рекомендуем</Txt>
                    </View>
                    <FlatList
                        data={bannersList}
                        horizontal
                        keyExtractor={(_, index) => index.toString()}
                        showsHorizontalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        contentContainerStyle={styles.BannersList}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.BannerItem}
                                activeOpacity={0.85}
                                onPress={() => setActiveBanner(item)}
                            >
                                <View style={styles.BannerTitle}>
                                    <Txt color="#fff" weight='Bold' lineHeight={20}>{item.title}</Txt>
                                </View>
                                <Image style={styles.BannerImage} source={item.image} />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
            <BannerInfoModal
                banner={activeBanner}
                onClose={() => setActiveBanner(null)}
                onGoToCategory={handleGoToCategory}
            />
        </View>
    )
}

export default Header

const styles = StyleSheet.create({
    Logo: { width: 64, height: 64 },
    Header: { gap: 16, paddingHorizontal: 16, paddingBottom: 16 },
    TopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    ControllBar: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'space-between' },
    Box: { width: "100%", flex: 1, flexShrink: 1 },
    Bonus: { position: "absolute", bottom: 4, left: 4 },
    Image: { position: "absolute", top: 4 },
    SearchBox: {
        position: "absolute",
        backgroundColor: "#fff",
        width: Dimensions.get("screen").width - 30,
        left: 0,
        zIndex: 10000,
        elevation: 10000,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#4FBD01",
        padding: 20,
        top: 55
    },
    SearchBoxScroll: { maxHeight: 300 },
    SearchBoxItem: { paddingBottom: 12 },
    SearchContainer: { 
        position: "relative",
        zIndex: 10000,
        elevation: 10000
    },
    BannersContainer: {
        gap: 16,
        zIndex: 1,
        elevation: 1
    },
    BannersTitle: {
        paddingHorizontal: 0
    },
    BannersList: {
        paddingHorizontal: 0
    },
    BannerItem: {
        position: "relative",
        width: 170,
        aspectRatio: 0.67,
        borderRadius: 16,
        overflow: "hidden",
        marginRight: 16
    },
    BannerImage: {
        position: "absolute",
        width: "100%",
        height: "100%"
    },
    BannerTitle: {
        position: "absolute",
        top: 10,
        left: 10,
        flex: 1,
        zIndex: 1,
        width: 150
    }
})
