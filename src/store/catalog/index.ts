import api from '../../api'
import { CachedState, State } from './types'
import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { imagePreloader } from '../../utils/imageBatchPreloader'
import useDeliveryStore from '../delivery'
import { resolveStoreQueueFromDelivery } from '../../utils/storePriority'

const imageUrlCache: Record<string, string> = {}

const resolveStoreQueue = () => {
    const { deliveryData, addresses } = useDeliveryStore.getState()
    console.log('deliveryData:', deliveryData)
    console.log('addresses:', addresses)
    const queue = resolveStoreQueueFromDelivery(deliveryData, addresses)
    console.log('resolved queue:', queue)
    return queue
}

const useCatalogStore = create<CachedState>()(
    persist(
        (set, get) => ({
            category: "",
            catalogList: [],
            productList: [],
            searchList: [],
            search: "",
            isLoading: false,
            isCategoriesLoading: false,
            isPagination: false,
            pages: 0,
            activePage: 1,
            activeProduct: null,
            activeProductImage: null,
            productWithAtrList: [],
            isAtributesLoading: false,
            activeKilbilActionIds: [],
            selectedAmounts: {},
            scrollOffset: 0,
            setScrollOffset: (offset: number) => set({ scrollOffset: offset }),
            resetScrollOffset: () => set({ scrollOffset: 0 }),
            listScrollOffset: 0,
            setListScrollOffset: (offset: number) => set({ listScrollOffset: offset }),
            resetListScrollOffset: () => set({ listScrollOffset: 0 }),
            categoriesCache: null,
            productsCache: {},
            searchCache: {},

            changeSearch: (value) => set({ search: value }),
            changePage: (page: number) => set({ activePage: page }),
            changeIsPagination: (value: boolean, size: number) => set({ isPagination: value, pages: Math.ceil(size / 20) }),
            setCategory: (categoryId: string) => set({ category: categoryId }),
            changeCategory: (value: string) => {
                set({ category: value, activePage: 1, productsCache: {}, scrollOffset: 0, listScrollOffset: 0 })
            },

            clearProductsCache: () => {
                set({ productsCache: {} })
            },

            setSelectedAmount: (productId: string, amount: number) => {
                set((state) => ({
                    selectedAmounts: { ...state.selectedAmounts, [productId]: amount }
                }))
            },
            getSelectedAmount: (productId: string) => {
                return get().selectedAmounts[productId]
            },
            clearSelectedAmount: (productId: string) => {
                const { selectedAmounts } = get()
                const newAmounts = { ...selectedAmounts }
                delete newAmounts[productId]
                set({ selectedAmounts: newAmounts })
            },
            getCategories: async () => {
                set({ isCategoriesLoading: true })

                const response = await api.products.getCategories()
                const hidden = ['новый год']
                const filtered = response.filter(
                    (cat: any) => !hidden.includes(cat.name?.toLowerCase())
                )
                set({ catalogList: filtered, categoriesCache: filtered, isCategoriesLoading: false })
            },
            getProducts: async (catalogId) => {
              const { activePage, category, productsCache, isLoading: currentlyLoading } = get()

              if (currentlyLoading) return

              const storeQueue = resolveStoreQueue()
              const storeKey = storeQueue[0] || 'default'
              const key = `${category || catalogId}_${activePage}_${storeKey}`

              set({ isLoading: true })

              if (productsCache[key]) {
                set({ productList: productsCache[key], isLoading: false })
                return
              }

              const response = await api.products.getProducts(
                (activePage - 1) * 20,
                category || catalogId,
                storeQueue
              )

              const kilbilIds = [...new Set(response.filter(p => p.kilbilPromo).map(p => p.kilbilPromo!.id))]
              set((state) => ({
                productList: response,
                productsCache: { ...state.productsCache, [key]: response },
                isLoading: false,
                activeKilbilActionIds: kilbilIds.length ? kilbilIds : state.activeKilbilActionIds,
              }))
            },

            getImage: (productId: string, index?: number) => {
                return api.products.getImage(productId, index || 0)
            },

            preloadImages: async (productIds: string[]) => {
            },

            searchProduct: async () => {
                const { search } = get()
                await get().searchProductByName(search)
            },

            searchProductByName: async (name: string) => {
                const { searchCache } = get()
                if (name.length === 0) {
                    set({ searchList: [] })
                    return
                }

                if (searchCache[name]) {
                    set({ searchList: searchCache[name] })
                    return
                }

                const storeQueue = resolveStoreQueue()
                const response = await api.products.searchProduct(name, storeQueue)
                set((state) => ({
                    searchList: response,
                    searchCache: { ...state.searchCache, [name]: response },
                }))
            },

            getProduct: async (id: string) => {
                console.log('[STORE getProduct] called with id:', id)
                try {
                    const { getImage } = get()
                    set({ isLoading: true, activeProductImage: null, activeProduct: null })

                    const storeQueue = resolveStoreQueue()
                    console.log('[STORE getProduct] storeQueue:', storeQueue)
                    const response = await api.products.getProduct(id, storeQueue)
                    console.log('[STORE getProduct] response stock:', response?.stock, 'stockByStore:', response?.stockByStore)

                    set({
                        isLoading: false,
                        activeProduct: response
                    })

                    const imageUrl = getImage(response.image, 0)
                    set({ activeProductImage: imageUrl || null })
                } catch (error) {
                    console.log('[STORE getProduct] ERROR:', error?.message || error)
                    set({ isLoading: false })
                }
            },

            getDataFromAtributes: async (id: string) => {
                try {
                    const startTime = Date.now()
                    set({ isAtributesLoading: true, productWithAtrList: [] })

                    const storeQueue = resolveStoreQueue()
                    const response = await api.products.getProductFromAtributes(id, storeQueue)

                    const elapsed = Date.now() - startTime
                    const minLoadTime = 500
                    if (elapsed < minLoadTime) {
                        await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsed))
                    }

                    const kilbilIds = [...new Set(response.filter(p => p.kilbilPromo).map(p => p.kilbilPromo!.id))]
                    set((state) => ({
                        isAtributesLoading: false,
                        productWithAtrList: response,
                        activeKilbilActionIds: kilbilIds.length ? kilbilIds : state.activeKilbilActionIds,
                    }))
                } catch (error) {
                    set({ isAtributesLoading: false, productWithAtrList: [] })
                }
            },
        }),
        {
            name: 'catalog-cache',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                categoriesCache: state.categoriesCache,
                productsCache: state.productsCache,
                searchCache: state.searchCache,
            })
        }
    )
)

export default useCatalogStore