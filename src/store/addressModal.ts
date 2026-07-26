import { create } from 'zustand'

interface AddressModalState {
    isOpen: boolean
    openModal: () => void
    closeModal: () => void
}

const useAddressModalStore = create<AddressModalState>((set) => ({
    isOpen: false,
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false }),
}))

export default useAddressModalStore

