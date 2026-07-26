import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { ModalTypes, State } from './types'
import AsyncStorage from '@react-native-async-storage/async-storage'

const useGlobalStore = create<State>()(
    persist(
        devtools((set) => ({
            isAuth: false,
            modal: false,
            modalType: "",
            enableScroll: true,
            isFirstLaunch: true,
            isDeliverySet: false,
            hideNavigation: false,

            changeEnableScroll: (value: boolean) => set({ enableScroll: value }),
            changeIsAuth: (value: boolean) => set({ isAuth: value }),
            changeModal: (value: boolean, type: ModalTypes) => set({ modal: value, modalType: type }),
            setFirstLaunch: (value: boolean) => set({ isFirstLaunch: value }),
            setDeliverySet: (value: boolean) => set({ isDeliverySet: value }),
            setHideNavigation: (value: boolean) => set({ hideNavigation: value }),
        })),
        {
            name: 'global-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                isFirstLaunch: state.isFirstLaunch,
                isAuth: state.isAuth,
                isDeliverySet: state.isDeliverySet,
            }),
        }
    )
)

export default useGlobalStore