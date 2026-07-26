import { OrderItemType, OrderType } from "@/types"

export interface State {
    afterAuth: boolean,
    ordersList: OrderType[],
    openedOrderId: string,
    openedOrderPositions: OrderItemType[]
    deliveryTime: string,
    isCreatingOrder: boolean,
    promoCode: string,
    promoDiscount: number,
    promoCodeId: string | null,
    isCheckingPromo: boolean,
    hasOrders: boolean,
    isCheckingOrders: boolean,

    changeDeliveryTime: (value: string) => void,
    changeOpenedOrderId: (value: string) => void,
    changeAfterAuth: (value: boolean) => void
    setPromoCode: (code: string) => void
    checkPromoCode: (code: string) => Promise<void>
    clearPromoCode: () => void
    checkUserOrders: () => Promise<void>
    getCustomer: () => Promise<string>
    createOrder: (bonusType: number, express: boolean, comment?: string) => Promise<void>
    getOrderList: () => Promise<string>
    getPositions: () => Promise<OrderItemType[]>
    repeatOrder: (orderId: string) => Promise<void>
}