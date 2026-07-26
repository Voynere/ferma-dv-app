import { StyleSheet, View, Share } from 'react-native'
import React, { useCallback, useMemo } from 'react'
import TouchBox from '../../../components/TouchBox'
import Icons from '../../../ui/Icons'
import Txt from '../../../ui/Text'
import Row from '../../../components/Row'
import useCatalogStore from '../../../store/catalog'
import useFavoriteStore from '../../../store/favorite'
import useNotificationStore from '../../../store/notification'
import { generateShareMessage, generateShareUrl } from '../../../utils/shareProduct'

const Reviews = () => {
    const { activeProduct } = useCatalogStore()
    const { favoriteList, addItemToFav, removeItemFromFav } = useFavoriteStore()
    const { setMessage } = useNotificationStore()

    const isFavorite = useMemo(() => {
        return favoriteList.some(item => item.id === activeProduct?.id)
    }, [favoriteList, activeProduct?.id])

    const handleFavorite = useCallback(() => {
        if (!activeProduct) return

        if (isFavorite) {
            removeItemFromFav(activeProduct.id)
            setMessage('Удалено из избранного', 'success')
        } else {
            addItemToFav({
                id: activeProduct.id,
                name: activeProduct.name,
                price: activeProduct.price,
                image: activeProduct.image,
                isWeighted: activeProduct.weighed,
                weight: activeProduct.weight,
                stock: activeProduct.stock,
                stockByStore: activeProduct.stockByStore,
                storeId: activeProduct.storeId
            })
            setMessage('Добавлено в избранное', 'success')
        }
    }, [activeProduct, isFavorite, addItemToFav, removeItemFromFav, setMessage])

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
        } catch (error) {
            setMessage('Не удалось поделиться товаром', 'error')
        }
    }, [activeProduct, setMessage])

    return (
        <View style={styles.Box}>
            <Row gap={16}>
                <TouchBox 
                    isFull 
                    background={isFavorite ? "#EF2D4520" : "#4FBD0120"} 
                    height={56}
                    onClick={handleFavorite}
                >
                    <View style={styles.Group}>
                        <Icons.Heard color={isFavorite ? "#EF2D45" : "#4FBD01"} />
                        <View style={styles.TextWrapper}>
                            <Txt weight='RobotoCondensed-Bold' size={16} color={isFavorite ? "#EF2D45" : "#4D4D4D"}>
                                {isFavorite ? 'В избранном' : 'В избранное'}
                            </Txt>
                        </View>
                    </View>
                </TouchBox>

                <TouchBox height={56} onClick={handleShare}>
                    <Icons.Share width={24} height={24} />
                </TouchBox>
            </Row>

            <TouchBox height={56}>
                <Row>
                    <Txt size={16}>Читать отзывы</Txt>

                    <View style={styles.Reviews}>
                        <Icons.Star color="#FF7A00" />
                        <Txt size={16}>{`4.5 (129)`}</Txt>
                    </View>
                </Row>
            </TouchBox>
        </View>
    )
}

export default Reviews

const styles = StyleSheet.create({
    Box: {
        paddingHorizontal: 16,
        gap: 16,
        paddingBottom: '5%',
        marginTop: 32
    },
    Reviews: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    },
    Group: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: 16
    },
    TextWrapper: {
        flex: 1,
        flexShrink: 1
    }
})
