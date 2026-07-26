/**
 * CDN Image Mapping
 * Маппинг product ID -> CDN URL для изображений
 */

import cdnMapping from '../assets/cdn_mapping.json'
import CDN_CONFIG from './cdn'

/**
 * Получить CDN URL изображения по ID товара
 * @param productId - ID товара из МойСклад
 * @param index - Индекс изображения (0 по умолчанию)
 * @returns Полный CDN URL изображения или пустая строка
 */
export function getCDNImageUrl(productId: string, index: number = 0): string {
  try {
    if (!CDN_CONFIG.enabled) {
      return ''
    }
    
    const productImages = cdnMapping.products[productId]
    
    if (!productImages || !Array.isArray(productImages)) {
      // Товар не найден в mapping - это новый товар или товар без изображений
      // Возвращаем пустую строку - компоненты покажут placeholder
      return ''
    }
    
    const filename = productImages[index]
    
    if (!filename) {
      return ''
    }
    
    // URL-encode filename для корректной работы с кириллицей
    const encodedFilename = encodeURIComponent(filename)
    const fullUrl = `${cdnMapping.cdn_base_url}/${encodedFilename}`
    return fullUrl
    
  } catch (error) {
    return ''
  }
}

/**
 * Получить все изображения товара
 * @param productId - ID товара
 * @returns Массив URL изображений
 */
export function getAllProductImages(productId: string): string[] {
  try {
    const productImages = cdnMapping.products[productId]
    
    if (!productImages || !Array.isArray(productImages)) {
      return []
    }
    
    return productImages.map(filename => 
      `${cdnMapping.cdn_base_url}/${encodeURIComponent(filename)}`
    )
    
  } catch (error) {
    return []
  }
}

/**
 * Проверить наличие изображений у товара
 * @param productId - ID товара
 * @returns true если есть изображения
 */
export function hasImages(productId: string): boolean {
  const productImages = cdnMapping.products[productId]
  return Array.isArray(productImages) && productImages.length > 0
}

export default { getCDNImageUrl, getAllProductImages, hasImages }

