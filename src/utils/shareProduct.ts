import { ProductType } from '../types'
import { WEBSITE_BASE_URL, APP_URL_SCHEME } from '../constants'

const APP_SCHEME = APP_URL_SCHEME
const APP_HOST = 'product'

export function generateProductDeepLink(productId: string): string {
    return `${APP_SCHEME}://${APP_HOST}/${productId}`
}

export function generateProductWebLink(productId: string): string {
    return `${WEBSITE_BASE_URL}/product/${productId}`
}

export function generateProductLink(productId: string): string {
    return generateProductDeepLink(productId)
}

export function generateShareMessage(product: ProductType): string {
    const deepLink = generateProductDeepLink(product.id)
    const webLink = generateProductWebLink(product.id)
    const priceText = product.weighed ? `${product.price} ₽/кг` : `${product.price} ₽`
    
    const message = [
        `🛒 ${product.name}`,
        '',
        `💰 Цена: ${priceText}`,
        '',
        `📱 Бурёнка - магазин фермерских продуктов`,
        '',
        `Открыть в приложении:`,
        `${deepLink}`,
        '',
        `Или в браузере:`,
        `${webLink}`
    ].join('\n')
    
    return message
}

export function generateShareUrl(product: ProductType): string {
    return generateProductLink(product.id)
}

