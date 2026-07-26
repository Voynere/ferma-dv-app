import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { MOYSKLAD_TOKEN } from "./products"

const NO_IMAGE = '__none__'
const CACHE_KEY = '@moysklad_image_cache_v1'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7

type CacheEntry = { url: string; ts: number }
type ImageCache = { [productId: string]: CacheEntry }

const memCache: ImageCache = {}
const inflight: { [productId: string]: Promise<string> } = {}
let persistHydrated = false
let persistTimer: ReturnType<typeof setTimeout> | null = null

async function hydrateCache() {
  if (persistHydrated) return
  persistHydrated = true
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY)
    if (!raw) return
    const parsed: ImageCache = JSON.parse(raw)
    const now = Date.now()
    for (const id in parsed) {
      if (now - parsed[id].ts < CACHE_TTL_MS) {
        memCache[id] = parsed[id]
      }
    }
  } catch {}
}

function schedulePersist() {
  if (persistTimer) return
  persistTimer = setTimeout(async () => {
    persistTimer = null
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(memCache))
    } catch {}
  }, 2000)
}

function setCache(productId: string, url: string) {
  memCache[productId] = { url, ts: Date.now() }
  schedulePersist()
}

function readCache(productId: string): string | null {
  const entry = memCache[productId]
  if (!entry) return null
  if (Date.now() - entry.ts >= CACHE_TTL_MS) {
    delete memCache[productId]
    return null
  }
  return entry.url
}

async function fetchFirstImageUrl(entity: 'product' | 'variant', productId: string): Promise<string> {
  const response = await axios.get(
    `https://api.moysklad.ru/api/remap/1.2/entity/${entity}/${productId}`,
    { headers: { Authorization: MOYSKLAD_TOKEN }, timeout: 5000 }
  )

  const images = response.data?.images
  if (!images?.meta?.href) return ''

  const imagesResponse = await axios.get(images.meta.href, {
    headers: { Authorization: MOYSKLAD_TOKEN },
    timeout: 5000,
  })

  const rows = imagesResponse.data?.rows
  if (!rows || rows.length === 0) return ''

  const firstImage = rows[0]
  // Для сетки товаров предпочитаем миниатюру/превью — грузится в разы быстрее оригинала.
  return (
    firstImage?.miniature?.downloadHref ||
    firstImage?.tiny?.downloadHref ||
    firstImage?.meta?.downloadHref ||
    ''
  )
}

async function resolveImage(entity: 'product' | 'variant', productId: string): Promise<string> {
  await hydrateCache()

  const cached = readCache(productId)
  if (cached !== null) {
    return cached === NO_IMAGE ? '' : cached
  }

  if (inflight[productId]) {
    return inflight[productId]
  }

  const promise = (async () => {
    try {
      const url = await fetchFirstImageUrl(entity, productId)
      setCache(productId, url || NO_IMAGE)
      return url
    } catch {
      setCache(productId, NO_IMAGE)
      return ''
    } finally {
      delete inflight[productId]
    }
  })()

  inflight[productId] = promise
  return promise
}

export async function getMoyskladImageUrl(productId: string): Promise<string> {
  return resolveImage('product', productId)
}

export async function getMoyskladVariantImageUrl(productId: string): Promise<string> {
  return resolveImage('variant', productId)
}
