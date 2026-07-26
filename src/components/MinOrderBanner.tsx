import React from 'react';
import { View, StyleSheet } from 'react-native';
import Txt from '../ui/Text';
import useCartStore from '../store/cart';
import useDeliveryStore from '../store/delivery';
import { getZoneForLocation, formatPrice, calculateDeliveryPrice } from '../functions';
import { deliveryDataObj } from '../constants/delivery';
import { getMinOrderAmount } from '../constants/minOrder';

interface Props {
    currentRoute: string;
}

const MinOrderBanner: React.FC<Props> = ({ currentRoute }) => {
    const { calculateAmount, cartList } = useCartStore();
    const { deliveryData, addresses } = useDeliveryStore();
    const currentAmount = calculateAmount();
    const cartStoreId = cartList.find(i => i.storeId)?.storeId;
    const minOrderAmount = getMinOrderAmount(cartStoreId);

    const activeAddress = deliveryData?.type === 0 && addresses.find((_, index) => index === deliveryData.id);
    const zoneName = activeAddress && getZoneForLocation(activeAddress.lat, activeAddress.lng);
    
    const DEFAULT_DELIVERY_PRICE = 399
    
    const getDeliveryPricing = () => {
        if (deliveryData?.type !== 0) {
            return { threshold349: 1500, thresholdFree: 3000, currentPrice: 0 };
        }
        
        if (!zoneName) {
            return { threshold349: 1500, thresholdFree: 3000, currentPrice: DEFAULT_DELIVERY_PRICE };
        }

        const zone = deliveryDataObj.zones.find(z => z.zone.name === zoneName.description);
        if (!zone) {
            return { threshold349: 1500, thresholdFree: 3000, currentPrice: DEFAULT_DELIVERY_PRICE };
        }

        const slot = zone.slots[0];
        if (!slot || !slot.order) {
            return { threshold349: 1500, thresholdFree: 3000, currentPrice: 399 };
        }

        let threshold349 = 0;
        let thresholdFree = 0;

        for (const priceRange of slot.order) {
            if (priceRange.price === 349 && threshold349 === 0) {
                threshold349 = priceRange.from;
            }
            if (priceRange.price === 0 && thresholdFree === 0) {
                thresholdFree = priceRange.from;
            }
        }

        let currentPrice = 0;
        try {
            currentPrice = calculateDeliveryPrice(currentAmount, zoneName.description);
        } catch (error) {
            currentPrice = 399;
        }

        return { threshold349, thresholdFree, currentPrice };
    };

    const { threshold349, thresholdFree, currentPrice } = getDeliveryPricing();

    const getBannerText = () => {
        if (currentAmount < minOrderAmount) {
            const remaining = minOrderAmount - currentAmount;
            return `Минимальный заказ ${minOrderAmount} руб. Добавьте ещё товаров на ${formatPrice(remaining)} руб.`;
        }

        if (deliveryData?.type === 0 && activeAddress) {
            if (currentPrice === 0) {
                return `🎉 Бесплатная доставка! Сумма товаров: ${formatPrice(currentAmount)} руб.`;
            }

            if (currentPrice === 349 && thresholdFree > 0 && currentAmount < thresholdFree) {
                const remaining = thresholdFree - currentAmount;
                return `Доставка ${formatPrice(currentPrice)} руб., для бесплатной доставки добавьте ещё ${formatPrice(remaining)} руб.`;
            }

            if (currentPrice > 349 && threshold349 > 0 && currentAmount < threshold349) {
                const remaining = threshold349 - currentAmount;
                return `Доставка ${formatPrice(currentPrice)} руб., для снижения до 349 руб. добавьте ещё ${formatPrice(remaining)} руб.`;
            }

            if (currentPrice > 0 && thresholdFree > 0 && currentAmount < thresholdFree) {
                const remaining = thresholdFree - currentAmount;
                return `Доставка ${formatPrice(currentPrice)} руб., для бесплатной доставки добавьте ещё ${formatPrice(remaining)} руб.`;
            }
        }

        return `Сумма товаров: ${formatPrice(currentAmount)} руб.`;
    };

    const bannerText = getBannerText();

    if (cartList.length === 0) {
        return null;
    }

    if (currentRoute === 'checkout' || currentRoute === 'orderSuccess' || currentRoute === 'welcome' || currentRoute === 'cart') {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.banner}>
                <Txt size={14} weight="RobotoCondensed-Bold" color="#fff" style={styles.text}>
                    {bannerText}
                </Txt>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    banner: {
        backgroundColor: '#FF6B6B',
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginBottom: 0,
    },
    text: {
        textAlign: 'left',
        lineHeight: 18,
    },
});

export default MinOrderBanner;
