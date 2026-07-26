export type ModalTypes = "orderHistory" | ""

export interface State {
    isAuth: boolean,
    modal: boolean,
    modalType: ModalTypes
    enableScroll: boolean,
    isFirstLaunch: boolean,
    isDeliverySet: boolean,
    hideNavigation: boolean,

    changeEnableScroll: (value: boolean) => void
    changeIsAuth: (value: boolean) => void
    changeModal: (value: boolean, type: ModalTypes) => void
    setFirstLaunch: (value: boolean) => void
    setDeliverySet: (value: boolean) => void
    setHideNavigation: (value: boolean) => void
}