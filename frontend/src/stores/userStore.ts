import { User } from "../gql/graphql"
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
    id: number | undefined
    avatarUrl: string | null
    fullname: string
    email?: string
    updateProfileImage: (image: string) => void
    updateUserName: (name: string) => void
    setUser: (user: User) => void
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            id: undefined,
            fullname: "",
            avatarUrl: null,
            email: "",
            updateProfileImage: (image) => set({ avatarUrl: image }),
            updateUserName: (name) => set({ fullname: name }),
            setUser: (user) => set({ id: user.id, avatarUrl: user.avatarUrl, email: user.email, fullname: user.fullname })
        }),
        {
            name: "user-storage"
        }
    )
)