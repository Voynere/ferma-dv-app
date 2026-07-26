import { CartType } from '../../types';
import { State } from './types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatPrice } from '../../functions';
import { roundWeightAmount } from '../../utils/roundAmount';
import api from '../../api';
import NotificationService from '../../services/NotificationService';

const useCartStore = create<State>()(
  devtools((set, get) => ({
    cartList: [],

    calculateAmount: () => {
      const cartList = get().cartList;
      const total = cartList.reduce((sum, item) => {
        if (item.isWeighted) {
          return sum + item.price * (item.weight || 0.1);
        } else {
          return sum + item.amount * item.price;
        }
      }, 0);

      return parseFloat(formatPrice(total));
    },

    syncCartToServer: async () => {
      try {
        const { default: useAuthStore } = await import('../auth');
        const { userData } = useAuthStore.getState();
        const { cartList } = get();

        await api.push.syncCart({
          phone: userData?.phoneNumber || '',
          items: cartList.map((item: any) => ({
            productId: item.id,
            amount: item.amount,
            weight: item.weight ?? null,
            price: item.price,
            name: item.name,
          })),
        });
      } catch (error) {
        console.log('[Cart] syncCartToServer error:', error);
      }
    },

    addItemToCart: async (item: CartType) => {
      const cart = get().cartList;
      const existing = cart.find((p) => p.id === item.id);
      const wasEmpty = cart.length === 0;

      let updatedCart;

      if (existing) {
        updatedCart = cart.map((p) => {
          if (p.id === item.id) {
            if (item.isWeighted && item.weight !== undefined && p.weight !== undefined) {
              const newWeight = roundWeightAmount(p.weight + item.weight);
              return { ...p, weight: newWeight };
            } else {
              const newAmount = p.amount + item.amount;
              return { ...p, amount: newAmount };
            }
          }
          return p;
        });
      } else {
        updatedCart = [...cart, item];
      }

      set({ cartList: updatedCart });
      await AsyncStorage.setItem('cartData', JSON.stringify(updatedCart));
      await get().syncCartToServer();

      if (wasEmpty) {
        NotificationService.scheduleAbandonedCartNotification();
      }
    },

    setItemInCart: async (item: CartType) => {
      const cart = get().cartList;
      const existing = cart.find((p) => p.id === item.id);

      let updatedCart;

      if (existing) {
        updatedCart = cart.map((p) => {
          if (p.id === item.id) {
            return { ...p, ...item };
          }
          return p;
        });
      } else {
        updatedCart = [...cart, item];
      }

      set({ cartList: updatedCart });
      await AsyncStorage.setItem('cartData', JSON.stringify(updatedCart));
      await get().syncCartToServer();
    },

    removeItemFromCart: async (id: string) => {
      const cart = get().cartList;
      const filteredData = cart.filter((item) => item.id !== id);

      set({ cartList: filteredData });
      await AsyncStorage.setItem('cartData', JSON.stringify(filteredData));
      await get().syncCartToServer();
    },

    getCartList: async () => {
      const data = await AsyncStorage.getItem('cartData');
      const parsedData = data ? (JSON.parse(data) as CartType[]) : [];

      if (parsedData.length > 0) {
        try {
          const { default: useCatalogStore } = await import('../catalog');
          const { getProduct } = useCatalogStore.getState();

          const updatedCart = await Promise.all(
            parsedData.map(async (item) => {
              try {
                const product = await getProduct(item.id);
                if (product) {
                  return {
                    ...item,
                    stock: product.stock,
                    stockByStore: product.stockByStore,
                    storeId: product.storeId,
                  };
                }
                return item;
              } catch {
                return item;
              }
            })
          );

          set({ cartList: updatedCart });
          await AsyncStorage.setItem('cartData', JSON.stringify(updatedCart));
          await get().syncCartToServer();
        } catch {
          set({ cartList: parsedData });
          await get().syncCartToServer();
        }
      } else {
        set({ cartList: parsedData });
        await get().syncCartToServer();
      }
    },

    changeCartItem: async (id: string, updatedItem: CartType) => {
      const cart = get().cartList;

      const updatedCart = cart.map((item) => (item.id === id ? updatedItem : item));

      set({ cartList: updatedCart });
      await AsyncStorage.setItem('cartData', JSON.stringify(updatedCart));
      await get().syncCartToServer();
    },

    clearCart: async () => {
      set({ cartList: [] });
      await AsyncStorage.setItem('cartData', JSON.stringify([]));
      await get().syncCartToServer();
      NotificationService.cancelAbandonedCartNotification();
    },
  }))
);

export default useCartStore;