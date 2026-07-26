import { SvgProps } from "react-native-svg";

export interface CustomSvgProps extends SvgProps {
    color?: string;
    isBold?: boolean
}

export type ProductType = {
    image: string,
    price: number,
    name: string,
    id: string
    description: string
    pathName: string,
    country: string,
    volume: number
    weight: number
    weighed: boolean
    stock?: number
    stockByStore?: Record<string, number>
    storeId?: string
    isGreenPrice?: boolean
    actionDiscountPercent?: number   // % скидки акции (7 — зелёные, 10 — мясное/колбасный)
    actionName?: string              // имя акции из actions.json
    promoName?: string
    kilbilPromo?: {
        id: number
        name: string
        discountPercent?: number
        stickerText: string
        stickerColor: string
        stickerTextColor: string
    }
}

export type CartType = {
    image: string,
    name: string,
    amount: number,
    price: number,
    id: string
    isWeighted?: boolean
    weight?: number
    stock?: number
    stockByStore?: Record<string, number>
    storeId?: string
}

export type UserDataType = {
    uuid: string,
    phoneNumber: string,
    kilbilClientId: string
}

export interface ICategory {
    id: string;
    pathName: string;
    name: string;
    icon: null | React.FC<SvgProps>
    subCategory?: ICategory[]
}

export interface IFavorite {
    image: string
    name: string
    id: string
    price: number,
    isWeighted?: boolean
    weight?: number
    stock?: number
    stockByStore?: Record<string, number>
    storeId?: string
}

export type SuggestionType = {
    value: string,
    unrestricted_value: string,
    data: {
        geo_lat: string,
        geo_lon: string
    }
}

export type AddressType = {
    value: string,
    lat: number,
    lng: number
}

export type DeliveryJSONType = {
    express: number;
    zones: {
        zone: { id: number; name: string; };
        store: { id: string; name: string; };
        express: number;
        slots: {
            time: string;
            name: string;
            order: { from: number; to: number; price: number; }[];
        }[];
    }[]
}

export type OrderItemType = {
    amount: number,
    price: number,
    productId: string
}

export interface IOrder {
    customerId: string
    delivery: {
        type: number
        time: string
        address: string
    },
    storeId: string
    bonuses: {
        type: number
        amount: number
    },
    items: OrderItemType[]
    comment?: string
    promoCode?: {
        code: string
        discount: number
        id: string
    }
    orderNumber?: string
}

export type OrderType = {
    id: string
    created: string,
    name: string,
    deliveryType: string,
    sum: number,
    bonus: string,
    positions: string
    status: string,
    store: string,
}

export type SlotType = {
    value: string,
    id: string
}