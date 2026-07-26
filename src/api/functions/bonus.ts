import axios from "axios"
import { KILBIL_API_KEY as apiKey } from "../../config/secrets"

export type KilbilActionRespond = {
    id: number
    value: number
    do_type: string
    unit_type: string
    work_type: string
}

export type KilbilAction = {
    id: number
    action: string
    responds: KilbilActionRespond[]
    week_days: number[]
    action_end: string | null
    action_begin: string
}

export type KilbilActionsResult = {
    goods: Record<string, Array<{ action: number; respond: number }>>
    actions: KilbilAction[]
}

export async function getActionsForArticles(articles: string[], tradeObjectId?: number): Promise<KilbilActionsResult> {
    if (!articles.length) return { goods: {}, actions: [] }
    const goods = articles.map(a => ({ article: a, price: 100, count: 1 }))
    const body: any = { goods }
    if (tradeObjectId) body.trade_object_id = tradeObjectId
    const response = await axios.post(
        `https://bonus.kilbil.ru/load/getactionslist?h=${apiKey}`,
        body,
        { timeout: 10000 }
    )
    return response.data
}

export async function registerUser(phone: string, uuid: string) {
    return await axios.post(`https://bonus.kilbil.ru/load/addclient?h=${apiKey}`, {
        phone: phone,
        first_name: uuid
    })
}

export async function getClient(phone: string) {
    try {
        const response = await axios.post(`https://bonus.kilbil.ru/load/searchclient?h=${apiKey}`, {
            search_mode: 0,
            search_value: phone,
        })
        return response
    } catch (error) {
        throw error
    }
}

export async function bonusIn(client_id: string, bonus_in: number) {
    return await axios.post(`https://bonus.kilbil.ru/load/manualadd?h=${apiKey}`, {
        client_id, bonus_in
    })
}

export async function bonusOut(client_id: string, bonus_out: number) {
    return await axios.post(`https://bonus.kilbil.ru/load/manualadd?h=${apiKey}`, {
        client_id, bonus_out
    })
}
