import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FullLogo from '../assets/FullLogo';
import Tabs from '../components/Tabs';
import Sections from '../components/Sections';
import useDeliveryStore from '../store/delivery';
import Back from '../ui/Back';
import { useNavigation } from '@react-navigation/native';
import useGlobalStore from '../store';
import Txt from '../ui/Text';
import ContinueButton from '../ui/ContinueButton';

const Delivery = () => {
    const navigation = useNavigation();
    const { getDelivery, deliveryData } = useDeliveryStore();
    const { setDeliverySet, isAuth, isDeliverySet } = useGlobalStore();
    const scrollRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();
    const topPadding = useMemo(() => Math.max(insets.top, 16), [insets.top]);
    const bottomPadding = useMemo(() => Math.max(insets.bottom + 32, 48), [insets.bottom]);

    useEffect(() => {
        getDelivery();
    }, [getDelivery]);

    const handleContinue = () => {
        if (deliveryData) {
            setDeliverySet(true);
            navigation.navigate('home' as never);
        }
    };

    const handleBack = () => {
        if (isAuth) {
            navigation.goBack();
        } else {
            navigation.navigate('home' as never);
        }
    };

    const isDeliveryRequired = isAuth && !isDeliverySet;

    return (
        <SafeAreaView style={styles.SafeArea}>
        <KeyboardAvoidingView
                style={styles.Keyboard}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <ScrollView 
                ref={scrollRef} 
                    style={styles.Scroll}
                    contentContainerStyle={[styles.ScrollContent, { paddingBottom: bottomPadding }]}
                keyboardShouldPersistTaps="handled"
            >
                    <View style={[styles.Content, { paddingTop: topPadding }]}>
                    {!isDeliveryRequired && (
                            <View style={styles.BackBox}>
                            <Back onClick={handleBack} />
                        </View>
                    )}
                        <FullLogo compact />
                    <View style={styles.InfoBox}>
                        <Txt size={18} weight="Bold" style={styles.InfoTitle}>
                            Выберите способ получения заказа
                        </Txt>
                        <Txt size={14} color="#666" style={styles.InfoText}>
                            Укажите адрес доставки или самовывоза, чтобы видеть актуальный ассортимент, цены и остатки
                        </Txt>
                    </View>
                    <Tabs
                        activeTab={deliveryData?.type}
                        labels={['Доставка', 'Самовывоз']}
                        tabs={[<Sections.Delivery.Address scrollRef={scrollRef} />, <Sections.Delivery.SelfPickup />]}
                    />
                        <View style={styles.ButtonContainer}>
                        <ContinueButton 
                            buttonHeight={56} 
                            onPress={handleContinue}
                            isDisabled={!deliveryData}
                        >
                            <Txt color="#fff" weight="Bold" size={18}>
                                Продолжить
                            </Txt>
                        </ContinueButton>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Delivery;

const styles = StyleSheet.create({
    SafeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    Keyboard: {
        flex: 1,
    },
    Scroll: {
        flex: 1,
    },
    ScrollContent: {
        flexGrow: 1,
    },
    Content: {
        flexGrow: 1,
        gap: 20,
        paddingHorizontal: 16,
        paddingBottom: '30%',
    },
    BackBox: {
        marginBottom: 12,
    },
    InfoBox: {
        gap: 8,
    },
    InfoTitle: {
    },
    InfoText: {
        opacity: 0.7,
    },
    ButtonContainer: {
        marginTop: 16,
    },
});