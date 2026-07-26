// src/store/stockSubscribe.ts
import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ProductType } from '../types'

type SubItem = {
  id: string
  name: string
  image?: string | null
}

type State = {
  subs: Record<string, SubItem>
  hydrated: boolean
  hydrate: () => Promise<void>
  isSubscribed: (id: string) => boolean
  toggleSubscribe: (p: ProductType) => Promise<boolean> // true=подписали, false=отписали
}

const KEY = 'stock_subs_v1'

const useStockSubscribeStore = create<State>((set, get) => ({
  subs: {},
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        set({ subs: parsed || {}, hydrated: true })
      } else {
        set({ hydrated: true })
      }
    } catch {
      set({ hydrated: true })
    }
  },

  isSubscribed: (id) => !!get().subs[id],

  toggleSubscribe: async (p) => {
    const cur = { ...get().subs }

    if (cur[p.id]) {
      delete cur[p.id]
      await AsyncStorage.setItem(KEY, JSON.stringify(cur))
      set({ subs: cur })
      return false
    }

    cur[p.id] = { id: p.id, name: p.name, image: (p as any).image ?? null }
    await AsyncStorage.setItem(KEY, JSON.stringify(cur))
    set({ subs: cur })
    return true
  },
}))

export default useStockSubscribeStore