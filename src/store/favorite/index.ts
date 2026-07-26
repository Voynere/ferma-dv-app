import { State } from './types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IFavorite } from '../../types';

const useFavoriteStore = create<State>()(devtools((set, get) => ({
    favoriteList: [],

    addItemToFav: async (item: IFavorite) => {
        const favorite = get().favoriteList;
        
        const exists = favorite.some(i => i.id === item.id);
        if (exists) {
            return;
        }
        
        const newArray = [...favorite, item];

        set({ favoriteList: newArray });
        await AsyncStorage.setItem("favoriteData", JSON.stringify(newArray));
    },
    removeItemFromFav: async (id: string) => {
        const favorite = get().favoriteList;
        const filteredData = favorite.filter(item => item.id !== id);

        set({ favoriteList: filteredData });
        await AsyncStorage.setItem("favoriteData", JSON.stringify(filteredData));
    },
    getFavoriteList: async () => {
        const data = await AsyncStorage.getItem("favoriteData");
        const parsedData = data ? JSON.parse(data) as IFavorite[] : [];

        set({ favoriteList: parsedData });
    },
    inFavExist: (id: string) => {
        const favorite = get().favoriteList;
        return favorite.some(i => i.id === id)
    }
})))

export default useFavoriteStore
