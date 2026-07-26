import { State } from './types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { calculateDeliveryPrice, getZoneForLocation, formatPrice } from '../../functions'
import api from '../../api'
import { CartType, IOrder, OrderItemType } from '../../types'
import { selfPickupList } from '../../constants'
import { ordersDTO } from '../../functions/dtos'
import { navigate } from '../../components/Navigation'
import NotificationService from '../../services/NotificationService'
import { resolveStoreQueueFromDelivery } from '../../utils/storePriority'

const calculateItemRequiredAmount = (item: CartType) => {
    if (item.isWeighted) {
        return item.weight ?? item.amount
    }
    return item.amount
}

const selectStoreForCart = (items: CartType[], storeQueue: string[]): string | null => {
    if (!items.length) {
        return storeQueue[0] || null
    }

    const checkedStores = new Set<string>()

    const canFulfillFromStore = (storeId: string) => {
        const canFulfill = items.every(item => {
            const required = calculateItemRequiredAmount(item)
            const stockMap = item.stockByStore

            if (stockMap && Object.prototype.hasOwnProperty.call(stockMap, storeId)) {
                return stockMap[storeId] >= required
            }

            if (item.storeId === storeId && item.stock !== undefined) {
                return item.stock >= required
            }

            if (!stockMap && !item.storeId && item.stock !== undefined) {
                return item.stock >= required
            }

            return false
        })

        if (canFulfill) {
            return true
        }

        checkedStores.add(storeId)

        return false
    }

    for (const storeId of storeQueue) {
        if (canFulfillFromStore(storeId)) {
            return storeId
        }
    }

    const candidatePool = new Set<string>()
    items.forEach(item => {
        if (item.stockByStore) {
            Object.keys(item.stockByStore).forEach(id => candidatePool.add(id))
        }
        if (item.storeId) {
            candidatePool.add(item.storeId)
        }
    })

    for (const storeId of candidatePool) {
        if (!checkedStores.has(storeId) && canFulfillFromStore(storeId)) {
            return storeId
        }
    }

    const fallbackStore = items.find(item => item.storeId)?.storeId
    if (fallbackStore && !checkedStores.has(fallbackStore) && canFulfillFromStore(fallbackStore)) {
        return fallbackStore
    }

    const fallbackQueueStore = storeQueue.find(storeId => !checkedStores.has(storeId))
    if (fallbackQueueStore && canFulfillFromStore(fallbackQueueStore)) {
        return fallbackQueueStore
    }

    return null
}

const useCheckoutStore = create<State>()(devtools((set, get) => ({
    afterAuth: false,
    ordersList: [],
    openedOrderId: "",
    openedOrderPositions: [],
    deliveryTime: "",
    isCreatingOrder: false,
    promoCode: "",
    promoDiscount: 0,
    promoCodeId: null,
    isCheckingPromo: false,
    hasOrders: false,
    isCheckingOrders: false,

    changeDeliveryTime: (value: string) => set({ deliveryTime: value }),
    changeAfterAuth: (value: boolean) => set({ afterAuth: value }),
    changeOpenedOrderId: (value: string) => set({ openedOrderId: value }),
    
    setPromoCode: (code: string) => set({ promoCode: code }),
    
    checkPromoCode: async (code: string) => {
        if (!code || code.trim() === "") {
            set({ promoCode: "", promoDiscount: 0, promoCodeId: null })
            return
        }
        
        set({ isCheckingPromo: true })
        try {
            const result = await api.order.checkPromoCode(code.trim())
            if (result.valid) {
                set({ 
                    promoCode: code.trim(), 
                    promoDiscount: result.discount, 
                    promoCodeId: result.id,
                    isCheckingPromo: false
                })
            } else {
                set({ 
                    promoCode: code.trim(), 
                    promoDiscount: 0, 
                    promoCodeId: null,
                    isCheckingPromo: false
                })
            }
        } catch (error) {
            set({ 
                promoCode: code.trim(), 
                promoDiscount: 0, 
                promoCodeId: null,
                isCheckingPromo: false
            })
        }
    },
    
    clearPromoCode: () => set({ promoCode: "", promoDiscount: 0, promoCodeId: null }),
    
    checkUserOrders: async () => {
        try {
            set({ isCheckingOrders: true })
            const customerId = await get().getCustomer()
            if (customerId) {
                const orders = await api.order.getAppOrders(customerId)
                set({ hasOrders: orders.length > 0, isCheckingOrders: false })
            } else {
                set({ hasOrders: false, isCheckingOrders: false })
            }
        } catch (error) {
            set({ hasOrders: false, isCheckingOrders: false })
        }
    },

    getCustomer: async () => {
        try {
            const { default: useAuthStore } = await import('../auth')
            const { default: useProfileStore } = await import('../profile')

            const { userData } = useAuthStore.getState()
            const { formData } = useProfileStore.getState()

            const response = await api.order.getCustomer(userData.phoneNumber)

            if (response.meta.size !== 0) {
                const customerId = response.rows[0].id
                const currentName = response.rows[0].name
                const userName = formData.fullName !== "" ? formData.fullName : null

                if (userName && userName !== currentName) {
                    await api.order.updateCustomer(customerId, { name: userName })
                }

                return customerId
            } else {
                const userName = formData.fullName === "" ? userData.phoneNumber : formData.fullName
                const newCustomer = await api.order.createCustomer(userName, userData.phoneNumber)
                return newCustomer.data.id
            }
        } catch (error: any) {
            return undefined
        }
    },

    createOrder: async (bonusType: number, express: boolean, comment?: string) => {
        try {
            set({ isCreatingOrder: true })
            
            const { default: useNotificationStore } = await import('../notification')
            const { default: useCartStore } = await import('../cart')
            const { default: useDeliveryStore } = await import('../delivery')
            const { default: useBonusStore } = await import('../bonus')
            
            const { setMessage } = useNotificationStore.getState()

            const { getCustomer, deliveryTime } = get()
            const { clearCart, cartList, calculateAmount } = useCartStore.getState()
            const { addresses, deliveryData } = useDeliveryStore.getState()
            const { calculateBonus } = useBonusStore.getState()

            const customerId = await getCustomer()

            const DEFAULT_DELIVERY_PRICE = 399
            const address = addresses.find((_, index) => index === deliveryData?.id)
            const zone = address && getZoneForLocation(address?.lat, address?.lng)
            const storeQueue = resolveStoreQueueFromDelivery(deliveryData, addresses)
            const storeId = selectStoreForCart(cartList, storeQueue)
            console.log('storeQueue:', storeQueue)
            console.log('storeId:', storeId)
            console.log('cartList stocks:', cartList.map(i => ({
                name: i.id,
                stockByStore: i.stockByStore,
                storeId: i.storeId,
                stock: i.stock
            })))
            const pickupCityIndex = deliveryData?.city ?? 0
            const pickupPoint = deliveryData?.type === 1
                ? selfPickupList[pickupCityIndex]?.list?.[deliveryData?.id || 0]
                : undefined
            const bonusAmount = await calculateBonus(bonusType, express)
            
            let deliveryPrice = DEFAULT_DELIVERY_PRICE
            if (deliveryData?.type === 1) {
                deliveryPrice = 0
            } else if (zone) {
                try {
                    deliveryPrice = calculateDeliveryPrice(calculateAmount(), zone.description, express)
                } catch {
                    deliveryPrice = DEFAULT_DELIVERY_PRICE
                }
            }
            const orderAmount = calculateAmount()

            const items: OrderItemType[] = cartList.map(i => ({
                amount: Number((i.isWeighted && i.weight) ? (i.amount * i.weight).toFixed(1) : i.amount),
                price: Number(formatPrice(i.price)),
                productId: i.id
            }))
            const itemsWithDelivery = [...items, {
                amount: 1,
                price: deliveryPrice,
                productId: "bca82cda-cfaa-11ee-0a80-0d920004a1bb"
            }]

            if (!storeId) {
                setMessage("Не удалось подобрать склад для заказа", "error")
                set({ isCreatingOrder: false })
                return
            }

            if (deliveryTime === "") {
                setMessage(`Укажите время ${deliveryData?.type === 0 ? "доставки" : "самовывоза"}`, "error")
                set({ isCreatingOrder: false })
                return
            }

            const { promoCode, promoCodeId, promoDiscount } = get()
            const totalAmount = orderAmount + deliveryPrice - bonusAmount - promoDiscount
            
            const payload: IOrder = {
                bonuses: {
                    amount: bonusAmount,
                    type: bonusType
                },
                customerId: customerId,
                delivery: {
                    address: deliveryData?.type === 0
                        ? address?.value || ""
                        : pickupPoint?.address || "",
                    time: deliveryTime,
                    type: deliveryData ? deliveryData?.type : 1
                },
                items: deliveryData?.type === 1 ? items : itemsWithDelivery,
                storeId: storeId,
                comment: comment || "",
                promoCode: promoCode && promoCodeId ? {
                    code: promoCode,
                    discount: promoDiscount,
                    id: promoCodeId
                } : undefined
            }

            const response = await api.order.createOrder(payload)

            const orderNumber = response?.data?.name || 'Неизвестен'

            clearCart()

            await NotificationService.updateLastOrderDate()
            NotificationService.cancelRepeatOrderReminders()
            NotificationService.cancelNewUserReminder()

            const finalAmount = orderAmount + deliveryPrice - (bonusType === 0 ? bonusAmount : 0) - promoDiscount
            
            set({ isCreatingOrder: false })
            
            navigate('orderSuccess', { orderAmount: finalAmount, orderNumber: orderNumber })

        } catch (error: any) {
            set({ isCreatingOrder: false })

            console.log('[createOrder] FAILED')
            console.log('message:', error?.message)
            console.log('status:', error?.response?.status)
            console.log('data:', JSON.stringify(error?.response?.data, null, 2))
            console.log('config.url:', error?.config?.url)
            console.log('config.headers:', JSON.stringify(error?.config?.headers, null, 2))

            const { default: useNotificationStore } = await import('../notification')
            const { setMessage } = useNotificationStore.getState()

            const moyskladErrors = error?.response?.data?.errors
            const firstMsg = Array.isArray(moyskladErrors) && moyskladErrors[0]?.error
                ? moyskladErrors[0].error
                : null

            setMessage(
                firstMsg
                    ? `МойСклад: ${firstMsg}`
                    : `Ошибка при создании заказа${error?.response?.status ? ` (${error.response.status})` : ''}`,
                "error"
            )
        }
    },

    getOrderList: async () => {
        const { default: useNotificationStore } = await import('../notification')
        const { setMessage } = useNotificationStore.getState()
        const { getCustomer } = get()
        const customerId = await getCustomer()

        if (customerId) {
            const response = await api.order.getOrders(customerId)
            const data = await ordersDTO(response)
            set({ ordersList: data })
        } else {
            setMessage("Ошибка при получении списка заказов", "error")
        }
    },

    getPositions: async () => {
        set({ openedOrderPositions: [] })

        const { ordersList, openedOrderId } = get()
        const activeOrder = ordersList.find(i => i.id === openedOrderId)

        if (activeOrder) {
            const response = await api.order.getDataFromURL(activeOrder.positions)
            const rows = response.data.rows || []

            const newArray = await Promise.all(
                rows.map(async (i: any) => {
                    const product = await api.order.getDataFromURL(i.assortment.meta.href)
                    const productId = product.data?.name || ""

                    return {
                        amount: i.quantity,
                        price: Number(i.price) / 100,
                        productId: productId
                    }
                })
            )

            set({ openedOrderPositions: newArray })
        }
    },

    repeatOrder: async (orderId: string) => {
        const { default: useCartStore } = await import('../cart')
        const { default: useNotificationStore } = await import('../notification')
        const { addItemToCart } = useCartStore.getState()
        const { setMessage } = useNotificationStore.getState()

        const { ordersList } = get()
        const order = ordersList.find(o => o.id === orderId)
        if (!order) return

        try {
            const DELIVERY_ID = "bca82cda-cfaa-11ee-0a80-0d920004a1bb"

            const response = await api.order.getDataFromURL(order.positions)
            const rows: any[] = response.data.rows || []

            for (const row of rows) {
                const href: string = row?.assortment?.meta?.href || ""
                if (!href) continue

                const productId = href.split("?")[0].split("/").pop() || ""
                if (!productId || productId === DELIVERY_ID) continue

                try {
                    const product = await api.products.getProduct(productId)
                    if (!product) continue

                    const qty: number = row.quantity || 1

                    await addItemToCart({
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        price: product.price,
                        amount: product.weighed ? 1 : Math.round(qty),
                        isWeighted: product.weighed,
                        weight: product.weighed ? qty : undefined,
                        stock: product.stock,
                        stockByStore: product.stockByStore,
                        storeId: product.storeId,
                    })
                } catch {
                    // пропускаем недоступный товар
                }
            }

            setMessage("Товары добавлены в корзину", "success")
        } catch {
            setMessage("Не удалось повторить заказ", "error")
        }
    }
})))

export default useCheckoutStore
