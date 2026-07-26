import React, { FC } from 'react'
import { Modal, View, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native'
import Txt from './Text'
import Button from './Button'
import Icons from './Icons'
import { BannerItem } from '../constants'

interface Props {
    banner: BannerItem | null
    onClose: () => void
    onGoToCategory: () => void
}

const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 40, 420)
// Высота изображения = ширина / 0.67 (портретный баннер), но не больше 70% экрана
const IMAGE_HEIGHT = Math.min(CARD_WIDTH / 0.67, SCREEN_HEIGHT * 0.7)

const BannerInfoModal: FC<Props> = ({ banner, onClose, onGoToCategory }) => {
    const hasButton = !!(banner?.catalogName || banner?.atributeId)

    return (
        <Modal
            visible={!!banner}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <TouchableOpacity
                style={styles.Overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                    <View style={styles.Card}>
                        <TouchableOpacity style={styles.Close} onPress={onClose}>
                            <Icons.Close />
                        </TouchableOpacity>

                        {banner?.image && (
                            <Image
                                source={banner.image}
                                style={[styles.Image, { height: IMAGE_HEIGHT }]}
                                resizeMode="cover"
                            />
                        )}

                        {!!banner?.description && (
                            <View style={styles.Body}>
                                <Txt size={15} color="#4D4D4D" lineHeight={22}>
                                    {banner.description}
                                </Txt>
                            </View>
                        )}

                        {hasButton && (
                            <View style={styles.Footer}>
                                <Button onClick={onGoToCategory} background="#4FBD01">
                                    <Txt color="#fff" weight="RobotoCondensed-Bold" size={16}>
                                        {banner?.buttonText || 'Перейти в категорию'}
                                    </Txt>
                                </Button>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )
}

export default BannerInfoModal

const styles = StyleSheet.create({
    Overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    Card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
    },
    Close: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 2,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    Image: {
        width: '100%',
    },
    Body: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    Footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
})
