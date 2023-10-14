import {create} from 'zustand'
import {persist} from 'zustand/middleware'

interface GeneralState {
    isProfileSettingModalOpen: boolean
    isLoginModalOpen: boolean
    isCreateRoomModalOpen: boolean
    toggleProfileSettingsModal: ()=> void
    toggleLoginModal: () => void
    toggleCreateRoomModal: () => void
}

export const useGeneralStore = create<GeneralState>()(
    persist((set) => ({
        isProfileSettingModalOpen: false,
        isLoginModalOpen: false,
        isCreateRoomModalOpen: false,

        toggleProfileSettingsModal: ()=> set((state) => ({
            isProfileSettingModalOpen: !state.isProfileSettingModalOpen
        })),
        toggleLoginModal: () => set((state) => ({
            isLoginModalOpen: !state.isLoginModalOpen
        })),
        toggleCreateRoomModal: () => set((state) => ({
            isCreateRoomModalOpen: !state.isCreateRoomModalOpen
        }))
    }),
    {
        name:"general-store"
    })
)