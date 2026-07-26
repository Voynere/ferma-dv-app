import { IFavorite } from "../../types";

export interface State {
    favoriteList: IFavorite[],

    addItemToFav: (item: IFavorite) => Promise<void>,
    removeItemFromFav: (id: string) => Promise<void>,
    getFavoriteList: () => Promise<void>
    inFavExist: (id: string) => boolean
}