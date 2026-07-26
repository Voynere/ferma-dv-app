import { deliveryDataObj } from '../constants/delivery'
import { selfPickupList } from '../constants'
import { AddressType } from '../types'
import { getZoneForLocation } from '../functions'

const baseStoreQueue = Array.from(new Set(deliveryDataObj.zones.map(item => item.store.id)))

export function getDefaultStoreQueue(): string[] {
    return [...baseStoreQueue]
}

export function getStoreIdByZone(zoneName?: string | null): string | null {
    if (!zoneName) {
        return null
    }
    const zone = deliveryDataObj.zones.find(item => item.zone.name === zoneName)
    return zone ? zone.store.id : null
}

export function buildStoreQueue(primary?: string | null): string[] {
    if (!primary) {
        return getDefaultStoreQueue()
    }
    const queue = [primary]
    for (const storeId of baseStoreQueue) {
        if (!queue.includes(storeId)) {
            queue.push(storeId)
        }
    }
    return queue
}

export function resolveStoreQueueFromDelivery(
    deliveryData: { id: number; type: number; city?: number } | null,
    addresses: AddressType[]
): string[] {
    if (deliveryData?.type === 0) {
        const address = addresses[deliveryData.id]
        if (address) {
            const zone = getZoneForLocation(address.lat, address.lng)
            const primary = getStoreIdByZone(zone?.description || zone?.name)
            return buildStoreQueue(primary)
        }
    }

    if (deliveryData?.type === 1) {
        const cityIndex = deliveryData.city ?? 0
        const pickup = selfPickupList[cityIndex]?.list?.[deliveryData.id]
        if (pickup?.storeId) {
            return [pickup.storeId]
        }
    }

    return getDefaultStoreQueue()
}

