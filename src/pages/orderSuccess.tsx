import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Txt from '../ui/Text';
import Button from '../ui/Button';
import { formatPrice } from '../functions';

const { width, height } = Dimensions.get('window');

interface OrderSuccessProps {
    route?: {
        params?: {
            orderAmount?: number;
            orderNumber?: string;
        };
    };
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ route }) => {
    const navigation = useNavigation();
    const orderAmount = route?.params?.orderAmount || 0;
    const orderNumber = route?.params?.orderNumber || '';


    const handleGoHome = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'home' as never }],
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Txt size={80} weight="Bold" color="#fff">✓</Txt>
                </View>

                <Txt size={32} weight="Bold" color="#fff" style={styles.title}>
                    Заказ успешно оформлен!
                </Txt>

                {orderNumber && (
                    <Txt size={20} weight="Bold" color="#fff" style={styles.orderNumber}>
                        Номер заказа: {orderNumber}
                    </Txt>
                )}

                <Txt size={18} color="#fff" style={styles.subtitle}>
                    Ваш заказ будет обработан в ближайшие часы
                </Txt>

                {orderAmount > 0 && (
                    <View style={styles.amountContainer}>
                        <Txt size={16} color="#fff" style={styles.amountLabel}>
                            Сумма заказа:
                        </Txt>
                        <Txt size={36} weight="Bold" color="#fff" style={styles.amountText}>
                            {formatPrice(orderAmount)} руб.
                        </Txt>
                    </View>
                )}

                <Button
                    onClick={handleGoHome}
                    background="#fff"
                    height={56}
                    style={styles.button}
                >
                    <Txt size={18} weight="Bold" color="#4FBD01">
                        На главную
                    </Txt>
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        height: height,
        backgroundColor: '#4FBD01',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: '4%',
        width: '100%',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    orderNumber: {
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
        opacity: 0.95,
    },
    subtitle: {
        textAlign: 'center',
        opacity: 0.9,
        marginBottom: '8%',
        paddingHorizontal: 20,
    },
    amountContainer: {
        alignItems: 'center',
        marginBottom: '8%',
        paddingVertical: 28,
        paddingHorizontal: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        width: '100%',
    },
    amountLabel: {
        marginBottom: 12,
        opacity: 0.9,
        textAlign: 'center',
    },
    amountText: {
        textAlign: 'center',
    },
    button: {
        width: '100%',
        borderRadius: 12,
    },
});

export default OrderSuccess;

