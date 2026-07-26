import { State, Types } from './types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage';
import useDeliveryStore from '../delivery';
import useNotificationStore from '../notification';
import useAuthStore from '../auth';
import axios from 'axios';
import api from '../../api';

const API_BASE = 'https://ferma-dv.ru';

async function getServerBirthdayBonusYear(phone: string): Promise<number | null> {
    try {
        const res = await axios.get(`${API_BASE}/wp-json/ferma/v1/profile/get`, {
            params: { phone },
            timeout: 5000,
        })
        const year = res.data?.birthday_bonus_year
        return typeof year === 'number' ? year : null
    } catch {
        return null
    }
}

async function setServerBirthdayBonusYear(phone: string, year: number): Promise<void> {
    try {
        await axios.post(`${API_BASE}/wp-json/ferma/v1/profile/update`, {
            phone,
            birthday_bonus_year: year,
        })
    } catch {
        // сервер недоступен — флаг в AsyncStorage останется
    }
}

async function checkAndCreditBirthdayBonus(
    dateBirth: string,
    clientId: string,
    phone: string,
): Promise<boolean> {
    try {
        const [day, month] = dateBirth.split('.').map(Number)
        if (!day || !month) return false

        const now = new Date()
        const isToday = now.getDate() === day && (now.getMonth() + 1) === month
        if (!isToday) return false

        const key = `birthdayBonus_${now.getFullYear()}_${clientId}`
        const localFlag = await AsyncStorage.getItem(key)

        if (localFlag) {
            console.log('[BirthdayBonus] already credited this year (local)')
            return false
        }

        // После переустановки AsyncStorage пуст — проверяем сервер
        const serverYear = await getServerBirthdayBonusYear(phone)
        if (serverYear === now.getFullYear()) {
            console.log('[BirthdayBonus] already credited this year (server)')
            await AsyncStorage.setItem(key, '1')
            return false
        }

        console.log('[BirthdayBonus] crediting 300 bonus points...')
        const res = await api.bonus.bonusIn(clientId, 300)
        console.log('[BirthdayBonus] bonusIn response:', JSON.stringify(res.data))

        await AsyncStorage.setItem(key, '1')
        await setServerBirthdayBonusYear(phone, now.getFullYear())

        const { default: useNotificationStore } = await import('../notification')
        useNotificationStore.getState().setMessage('🎉 С Днём рождения! Вам начислено 300 бонусов!', 'success')

        const { default: NotificationService } = await import('../../services/NotificationService')
        NotificationService.scheduleBirthdayBonusReminders()

        return true
    } catch (e: any) {
        console.warn('[BirthdayBonus] failed:', e?.response?.status, e?.message)
        return false
    }
}

const useProfileStore = create<State>()(devtools((set, get) => ({
    formData: {
        fullName: "",
        dateBirth: "",
    },

    saveData: async () => {
        const { setMessage } = useNotificationStore.getState()
        const { userData } = useAuthStore.getState()
        const addressList = useDeliveryStore.getState().addresses
        const data = get().formData

        // Сохраняем локально
        await AsyncStorage.setItem("addressList", JSON.stringify(addressList))
        await AsyncStorage.setItem("profileData", JSON.stringify(data))

        // Отправляем на сервер
        try {
            await axios.post(`${API_BASE}/wp-json/ferma/v1/profile/update`, {
                phone: userData.phoneNumber,
                full_name: data.fullName,
                birth_date: data.dateBirth,
            })
        } catch (e) {
            console.warn('[Profile] Server sync failed:', e)
        }

        // Планируем уведомление о дне рождения
        if (data.dateBirth) {
            const { default: NotificationService } = await import('../../services/NotificationService')
            await NotificationService.scheduleBirthdayNotification(data.dateBirth)
        }

        // Начисляем бонусы если сегодня день рождения и ещё не начислены в этом году
        let isBirthdayCredited = false
        if (data.dateBirth && userData.kilbilClientId) {
            isBirthdayCredited = await checkAndCreditBirthdayBonus(data.dateBirth, userData.kilbilClientId, userData.phoneNumber)
            if (isBirthdayCredited) {
                const { default: useBonusStore } = await import('../bonus')
                await useBonusStore.getState().getBonuses()
            }
        }

        if (!isBirthdayCredited) {
            setMessage("Данные сохранены", "success")
        }
    },

    getProfileData: async () => {
        const data = await AsyncStorage.getItem("profileData")
        const parsedData = data && JSON.parse(data) as { fullName: string, dateBirth: string }

        if (parsedData) {
            set({ formData: parsedData })
        }
    },

    checkBirthdayBonusOnLaunch: async () => {
        try {
            const profileDataStr = await AsyncStorage.getItem("profileData")
            if (!profileDataStr) return
            const { dateBirth } = JSON.parse(profileDataStr) as { fullName: string, dateBirth: string }
            if (!dateBirth) return

            const userDataStr = await AsyncStorage.getItem("userData")
            if (!userDataStr) return
            const { kilbilClientId, phoneNumber } = JSON.parse(userDataStr)
            if (!kilbilClientId || !phoneNumber) return

            const credited = await checkAndCreditBirthdayBonus(dateBirth, kilbilClientId, phoneNumber)
            if (credited) {
                const { default: useBonusStore } = await import('../bonus')
                await useBonusStore.getState().getBonuses()
            }
        } catch (e) {
            console.warn('[BirthdayBonusOnLaunch] failed:', e)
        }
    },

    changeProfileData: (value: string, type: Types) => {
        const formData = { ...get().formData }

        switch (type) {
            case "fullName": formData.fullName = value; break;
            case "dateBirth": formData.dateBirth = value; break;
        }

        set({ formData })
    }
})))

export default useProfileStore