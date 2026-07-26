import api from '../../api'
import { State } from './types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

const useBonusStore = create<State>()(devtools((set, get) => ({
    bonuses: 0,

    getBonuses: async () => {
        try {
            const { default: useAuthStore } = await import('../auth')
            const { userData } = useAuthStore.getState()
            
            const storageUserDataStr = await AsyncStorage.getItem("userData")
            const storageUserData = storageUserDataStr ? JSON.parse(storageUserDataStr) : null
            
            const phoneNumber = userData.phoneNumber !== "" ? userData.phoneNumber : storageUserData?.phoneNumber
            
            if (!phoneNumber) {
                set({ bonuses: 0 })
                return
            }

            const response = await api.bonus.getClient(phoneNumber)
            console.log('[getBonuses] raw response:', JSON.stringify(response.data))

            if (response.data) {
                if (typeof response.data.balance === 'number') {
                    set({ bonuses: response.data.balance })
                } else if (response.data.balance !== undefined) {
                    const bonusValue = parseFloat(response.data.balance) || 0
                    set({ bonuses: bonusValue })
                } else {
                    console.warn('[getBonuses] no balance field in response:', Object.keys(response.data))
                    set({ bonuses: 0 })
                }
            } else {
                set({ bonuses: 0 })
            }
        } catch (error: any) {
            console.error('[getBonuses] error:', error?.response?.status, JSON.stringify(error?.response?.data))
            set({ bonuses: 0 })
        }
    },
    changeBonus: async () => { },
    calculateBonus: async (bonusType: number, express: boolean) => {
        const { bonuses } = get()
        const { default: useCartStore } = await import('../cart')
        const { calculateAmount } = useCartStore.getState()

        const totalOrderPrice = calculateAmount()
        const bonusAmount = bonusType === 0 ? totalOrderPrice * 0.30 : totalOrderPrice * 0.02
        const totalBonus = bonuses < bonusAmount ? bonuses : bonusAmount

        return Math.round(totalBonus)
    }
})))

export default useBonusStore
