import { CartType } from "../../types";

export interface State {
    cartList: CartType[];
    syncCartToServer: () => Promise<void>;
    calculateAmount: () => number;
    addItemToCart: (item: CartType) => Promise<void>;
    setItemInCart: (item: CartType) => Promise<void>;
    removeItemFromCart: (id: string) => Promise<void>;
    getCartList: () => Promise<void>;
    changeCartItem: (id: string, updatedItem: CartType) => Promise<void>;
    clearCart: () => Promise<void>;
}