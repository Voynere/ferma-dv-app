import ICategory from "../types"
import ProductType from "../types"

export interface State {
    category: string,
    catalogList: ICategory[]
    productList: ProductType[]
    isLoading: boolean,
    isPagination: boolean,
    pages: number
    activePage: number
    search: string
    searchList: { name: string, id: string }[]

    changeSearch: (value: string) => void
    changePage: (page: number) => void
    changeIsPagination: (value: boolean, size: number) => void
    changeCategory: (value: string) => void
    getCategories: () => Promise<void>
    getProducts: (catalogId: string) => Promise<void>
    getImage: (link: string, isClear?: boolean) => Promise<any>
    searchProduct: () => Promise<void>
    searchProductByName: (name: string) => Promise<void>
}

export interface PreloadImagesFunction {
    (links: string[]): Promise<void>
}

export interface CachedState {
    category: string
    catalogList: ICategory[]
    productList: ProductType[]
    searchList: { name: string, id: string }[]
    search: string
    isLoading: boolean
    isCategoriesLoading: boolean
    isPagination: boolean
    pages: number
    activePage: number
    activeProduct: ProductType | null
    activeProductImage: string | null
    productWithAtrList: ProductType[]
    isAtributesLoading: boolean
    activeKilbilActionIds: number[]
    selectedAmounts: Record<string, number>

    scrollOffset: number
    setScrollOffset: (offset: number) => void
    resetScrollOffset: () => void
    listScrollOffset: number
    setListScrollOffset: (offset: number) => void
    resetListScrollOffset: () => void
    categoriesCache: any[] | null
    productsCache: Record<string, any>
    searchCache: Record<string, any>

    changeSearch: (value: string) => void
    changePage: (page: number) => void
    changeIsPagination: (value: boolean, size: number) => void
    setCategory: (categoryId: string) => void
    changeCategory: (value: string) => void
    clearProductsCache: () => void
    setSelectedAmount: (productId: string, amount: number) => void
    getSelectedAmount: (productId: string) => number | undefined
    clearSelectedAmount: (productId: string) => void
    getCategories: () => Promise<void>
    getProducts: (catalogId: string) => Promise<void>
    getImage: (productId: string, index?: number) => string
    preloadImages: (productIds: string[]) => Promise<void>
    searchProduct: () => Promise<void>
    searchProductByName: (name: string) => Promise<void>
    getProduct: (id: string) => Promise<void>
    getDataFromAtributes: (id: string) => Promise<void>
}