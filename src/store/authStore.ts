import { create } from 'zustand'
import { Profile } from '@/types'

interface AuthState {
  profile: Profile | null
  setProfile: (profile: Profile | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
}))