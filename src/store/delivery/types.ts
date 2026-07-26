import { AddressType, SuggestionType } from "@/types"

export interface State {
    addresses: AddressType[],
    deliveryData: { id: number, type: number, city?: number } | null,
    suggestionList: SuggestionType[]

    changeDelivery: (id: number, type: number, city?: number) => Promise<void>,
    getAddressesList: () => Promise<void>,
    getDelivery: () => Promise<void>,
    addAddressList: (value: string) => Promise<void>,
    removeAddressList: (index: number) => Promise<void>
    changeAddressList: (value: AddressType, index: number) => Promise<void>
    getSugesstions: (query: string) => Promise<void>
}