import { State } from './types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api';
import { AddressType } from '../../types';
import useGlobalStore from '../index';

const useDeliveryStore = create<State>()(devtools((set, get) => ({
    addresses: [],
    deliveryData: null,
    suggestionList: [],
    isDeliverySet: false,

    changeDelivery: async (id: number, type: number, city?: number) => {
        const data = JSON.stringify({ id, type, city })
        await AsyncStorage.setItem("deliveryData", data)
        set({ deliveryData: { id, type, city } })
        
        // Автоматически устанавливаем флаг что доставка настроена
        const { setDeliverySet } = useGlobalStore.getState()
        setDeliverySet(true)
    },
    getAddressesList: async () => {
        const data = await AsyncStorage.getItem("addressList")
        data && set({ addresses: JSON.parse(data) })
    },
    getDelivery: async () => {
        const data = await AsyncStorage.getItem("deliveryData")
        if (data) {
            set({ deliveryData: JSON.parse(data) })
            // Если есть сохраненные данные доставки, устанавливаем флаг
            const { setDeliverySet } = useGlobalStore.getState()
            setDeliverySet(true)
        }
    },
    addAddressList: async (value: AddressType) => {
        const data = await AsyncStorage.getItem("addressList")
        let newData: AddressType[] = []
        const parsedData = data && JSON.parse(data) as AddressType[]

        if (parsedData) {
            newData = [...parsedData, value]
        } else {
            newData = [value]
        }

        set({ addresses: newData })
        await AsyncStorage.setItem("addressList", JSON.stringify(newData))
    },
    removeAddressList: async (index: number) => {
        const data = await AsyncStorage.getItem("addressList")
        let newData: AddressType[] = []
        const parsedData = data && JSON.parse(data) as AddressType[]

        if (parsedData) {
            const filteredData = parsedData.filter((_, i) => i !== index)
            newData = filteredData
        }

        set({ addresses: newData })
        await AsyncStorage.setItem("addressList", JSON.stringify(newData))
    },
    changeAddressList: async (value: AddressType, index: number) => {
        const addresses = get().addresses
        const newArray = [...addresses]
        newArray[index] = value;
        set({ addresses: newArray })
        await AsyncStorage.setItem("addressList", JSON.stringify(newArray))
    },
    getSugesstions: async (query: string) => {
        try {
            const response = await api.delivery.getSugesstionAdreses(query)
            set({ suggestionList: response.data.suggestions })
        } catch (error) {
        }
    },
    checkDeliverySet: async () => {
        const data = await AsyncStorage.getItem("deliveryData")
        if (data) {
            set({ isDeliverySet: true })
        } else {
            set({ isDeliverySet: false })
        }
    }
})))

export default useDeliveryStore