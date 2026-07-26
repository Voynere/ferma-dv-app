import { orderPayload } from "../../functions";
import { IOrder } from "../../types";
import axios from "axios";
import { MOYSKLAD_TOKEN } from "./products";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH = { Authorization: `Bearer ${MOYSKLAD_TOKEN}` }

async function getNextOrderNumber(offset = 0): Promise<string> {
    try {
        const res = await axios.get(
            'https://api.moysklad.ru/api/remap/1.2/entity/customerorder',
            {
                headers: AUTH,
                params: {
                    filter: 'name~=ПРИЛ-',
                    order: 'created,desc',
                    limit: 1,
                },
            }
        )

        const lastName: string | undefined = res.data?.rows?.[0]?.name
        const match = lastName?.match(/ПРИЛ-(\d+)/)

        if (match) {
            const next = parseInt(match[1], 10) + 1 + offset
            await AsyncStorage.setItem('order_counter', String(next))
            return String(next).padStart(6, '0')
        }
    } catch (e: any) {
        console.log('[getNextOrderNumber] server fetch failed, falling back:', e?.response?.status, e?.message)
    }

    const current = await AsyncStorage.getItem('order_counter')
    const next = (current ? parseInt(current) : 0) + 1 + offset
    await AsyncStorage.setItem('order_counter', String(next))
    return String(next).padStart(6, '0')
}

export const createCustomer = async (name: string, phone: string) => {
    const payload = {
        name, phone,
        tags: ["Мобильное приложение"]
    }

    const response = await axios.post("https://api.moysklad.ru/api/remap/1.2/entity/counterparty", payload, {
        headers: AUTH
    })
    return response
};

export const updateCustomer = async (id: string, data: { name?: string }) => {
    const response = await axios.put(
        `https://api.moysklad.ru/api/remap/1.2/entity/counterparty/${id}`,
        data,
        { headers: AUTH }
    )
    return response
};

export const getCustomer = async (phone: string) => {
    const response = await axios.get(`https://api.moysklad.ru/api/remap/1.2/entity/counterparty?filter=phone=${phone}`, {
        headers: AUTH
    })
    return response.data
};

export const createOrder = async (data: IOrder) => {
    const MAX_ATTEMPTS = 5
    let lastError: any = null

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const orderNumber = await getNextOrderNumber(attempt)
        const payload = orderPayload({ ...data, orderNumber })

        try {
            return await axios.post(
                "https://api.moysklad.ru/api/remap/1.2/entity/customerorder",
                payload,
                { headers: AUTH }
            )
        } catch (err: any) {
            lastError = err
            const errors = err?.response?.data?.errors
            const msg = Array.isArray(errors) && errors[0]?.error
                ? String(errors[0].error)
                : ''
            const isUniqueConflict = msg.toLowerCase().includes('уникальност') || msg.includes('name')

            if (isUniqueConflict && attempt < MAX_ATTEMPTS - 1) {
                console.log(`[createOrder] name conflict on ПРИЛ-${orderNumber}, retrying (attempt ${attempt + 2}/${MAX_ATTEMPTS})`)
                continue
            }

            throw err
        }
    }

    throw lastError
};
export const getOrders = async (customerId: string) => {
    const response = await axios.get(`https://api.moysklad.ru/api/remap/1.2/entity/customerorder?filter=agent=https://api.moysklad.ru/api/remap/1.2/entity/counterparty/${customerId}`, {
        headers: AUTH
    })

    return response.data.rows
};

export const getAppOrders = async (customerId: string) => {
    const agentFilter = `agent=https://api.moysklad.ru/api/remap/1.2/entity/counterparty/${customerId}`
    const namePrefixFilter = `name~${encodeURIComponent('ПРИЛ-')}`
    const response = await axios.get(
        `https://api.moysklad.ru/api/remap/1.2/entity/customerorder?filter=${agentFilter};${namePrefixFilter}`,
        { headers: AUTH }
    )

    return response.data.rows
};

export const getDataFromURL = async (url: string) => {
    return await axios.get(url, {
        headers: AUTH
    })
}

export const checkPromoCode = async (code: string) => {
    try {
        const searchCode = code.trim().toUpperCase()
        const response = await axios.get(
            `https://api.moysklad.ru/api/remap/1.2/entity/customentity?filter=name~${encodeURIComponent(searchCode)}`,
            { headers: AUTH }
        )

        if (response.data.rows && response.data.rows.length > 0) {
            const promo = response.data.rows.find((p: any) =>
                p.name?.toUpperCase() === searchCode
            ) || response.data.rows[0]

            const discountAttr = promo.attributes?.find((attr: any) =>
                attr.name === 'Скидка' || attr.name === 'Размер скидки' || attr.name === 'Discount'
            )
            const discount = discountAttr?.value || promo.discount || 0

            const activeAttr = promo.attributes?.find((attr: any) =>
                attr.name === 'Активен' || attr.name === 'Активный' || attr.name === 'Active'
            )
            const isActive = activeAttr ? activeAttr.value !== false : true

            const discountValue = typeof discount === 'number' ? discount : parseFloat(String(discount)) || 0

            return {
                valid: isActive && discountValue > 0,
                discount: discountValue,
                id: promo.id
            }
        }

        return { valid: false, discount: 0, id: null }
    } catch (error: any) {
        return { valid: false, discount: 0, id: null }
    }
}