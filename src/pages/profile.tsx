import { ScrollView, StatusBar, StyleSheet, TouchableOpacity, View, Alert } from 'react-native'
import React, { useRef } from 'react'
import FullLogo from '../assets/FullLogo'
import Txt from '../ui/Text'
import Tabs from '../components/Tabs'
import Sections from '../components/Sections'
import { Bonuses } from '../components/Sections/Profile'
import Back from '../ui/Back'
import { useNavigation } from "@react-navigation/native";
import NotificationService from '../services/NotificationService';

const profile = () => {
    const navigation = useNavigation();
    const tapCount = useRef(0);
    const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleTitleTap = () => {
        tapCount.current += 1;
        if (tapTimer.current) clearTimeout(tapTimer.current);
        tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 1500);

        if (tapCount.current >= 3) {
            tapCount.current = 0;
            Alert.alert(
                'Тест уведомлений',
                'Уведомления запланируются на 15 / 20 / 25 / 30 секунд.\n\nПосле нажатия "Запустить" — закройте приложение полностью и ждите.',
                [
                    { text: 'Отмена', style: 'cancel' },
                    {
                        text: 'Запустить',
                        onPress: async () => {
                            await NotificationService.runAllTestNotifications();
                            Alert.alert(
                                '✅ Запланировано',
                                'Закройте приложение. Уведомления придут через 15 / 20 / 25 / 30 сек.'
                            );
                        },
                    },
                ]
            );
        }
    };

    return (
        <View style={styles.Container}>
     <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
                <View>
                    <FullLogo />

                    <View style={styles.Box}>
                        <View style={styles.TextBox}>
                            <Back onClick={() => navigation.goBack()} />
                            <TouchableOpacity onPress={handleTitleTap} activeOpacity={1}>
                                <Txt size={36} weight='Jingleberry' style={{ marginTop: 16 }}>ЛИЧНЫЙ КАБИНЕТ</Txt>
                            </TouchableOpacity>
                        </View>

                        <Bonuses />

                        <Tabs
                            labels={["Мой профиль", "История"]}
                            tabs={[<Sections.Profile.PersonalData />, <Sections.Profile.History />]}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default profile

const styles = StyleSheet.create({
    Container: {
        paddingTop: 8,
        flex: 1,
        backgroundColor: "#fff",
        paddingBottom: 70
    },
    Box: {
        gap: 30
    },
    TextBox: {
        paddingHorizontal: 16,
        gap: 8
    }
})
