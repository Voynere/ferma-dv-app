import { Dimensions, StyleSheet, View, Share } from 'react-native'
import React, { useCallback, useEffect, useRef, useMemo } from 'react'
import RoundButton from '../../../ui/RoundButton'
import Icons from '../../../ui/Icons'
import useCatalogStore from '../../../store/catalog'
import useFavoriteStore from '../../../store/favorite'
import { IFavorite } from '../../../types'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import OptimizedImage from '../../../ui/OptimizedImage'
import useNotificationStore from '../../../store/notification'
import { generateShareMessage, generateShareUrl } from '../../../utils/shareProduct'
import Txt from '../../../ui/Text'
import { getActivePromoForName } from '../../../constants'

const Preview = () => {
    const { activeProduct } = useCatalogStore()
    const { addItemToFav, removeItemFromFav, getFavoriteList, favoriteList } = useFavoriteStore()
    const { setMessage } = useNotificationStore()

    const navigation = useNavigation()
    const route = useRoute<any>()
    const productId = route.params?.id
    const isMounted = useRef(true)
    
    const isExist = useMemo(() => {
        return favoriteList.some(item => item.id === productId)
    }, [favoriteList, productId])

    const handleShare = useCallback(async () => {
        if (!activeProduct) {
            setMessage('Товар не загружен', 'error')
            return
        }

        try {
            const shareMessage = generateShareMessage(activeProduct)
            const shareUrl = generateShareUrl(activeProduct)
            
            const result = await Share.share({
                message: shareMessage,
                url: shareUrl,
                title: activeProduct.name
            })

            if (result.action === Share.sharedAction) {
                setMessage('Спасибо за то, что делитесь!', 'success')
            }
        } catch (error: any) {
            setMessage('Не удалось поделиться товаром', 'error')
        }
    }, [activeProduct, setMessage])

    const handleLike = useCallback(() => {
        if (!activeProduct) return

        const payload: IFavorite = {
            id: activeProduct.id,
            image: activeProduct.image,
            name: activeProduct.name,
            price: activeProduct.price,
            isWeighted: activeProduct.weighed,
            weight: 0.1,
            stock: activeProduct.stock,
            stockByStore: activeProduct.stockByStore,
            storeId: activeProduct.storeId
        }

        if (isExist) {
            removeItemFromFav(activeProduct.id)
        } else {
            addItemToFav(payload)
        }
    }, [activeProduct, isExist, removeItemFromFav, addItemToFav])

    useFocusEffect(
        useCallback(() => {
            getFavoriteList()
        }, [getFavoriteList])
    )

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [productId, handleShare])

    const activePromo = useMemo(
        () => getActivePromoForName(activeProduct?.promoName),
        [activeProduct?.promoName]
    )

    return (
        <View style={styles.Preview}>
            {activeProduct ? (
                <OptimizedImage
                    productId={activeProduct.id}
                    index={0}
                    style={styles.Image}
                    resizeMode="cover"
                    emptyStyle={styles.Empty}
                />
            ) : (
                <View style={styles.Empty} />
            )}

            {activePromo && (
                <View
                    style={[
                        styles.PromoSticker,
                        { backgroundColor: activePromo.stickerColor },
                    ]}
                >
                    <Txt
                        color={activePromo.stickerTextColor || '#fff'}
                        weight='RobotoCondensed-Bold'
                        size={14}
                        lineHeight={16}
                    >
                        {activePromo.stickerText}
                    </Txt>
                </View>
            )}

            <View style={styles.Top} pointerEvents="box-none">
                <RoundButton onClick={() => navigation.goBack()}>
                    <Icons.Back />
                </RoundButton>

                <View style={styles.Share}>
                    <RoundButton onClick={handleShare}>
                        <Icons.Share />
                    </RoundButton>
                    <RoundButton onClick={handleLike}>
                        <Icons.Heard isBold={isExist} color={isExist ? "#EF2D45" : "#4D4D4D"} />
                    </RoundButton>
                </View>
            </View>
        </View>
    )
}

export default Preview

const styles = StyleSheet.create({
    Preview: {
        width: "100%",
        height: Dimensions.get("screen").width - 32,
        paddingHorizontal: 16,
        marginTop: 8,
        position: "relative"
    },
    Image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: 16
    },
    Top: {
        position: "absolute",
        top: 24,
        left: 32,
        justifyContent: "space-between",
        flexDirection: "row",
        width: Dimensions.get("screen").width - 64,
    },
    Share: {
        gap: 16
    },
    Bottom: {
        position: "absolute",
        bottom: 24,
        left: 32,
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "flex-end",
        width: Dimensions.get("screen").width - 64,
    },
    Empty: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EEEEEE",
        borderRadius: 16
    },
    PromoSticker: {
        position: 'absolute',
        bottom: 24,
        left: 32,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        maxWidth: '60%',
    }
})
