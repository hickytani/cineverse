'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        if (token) localStorage.setItem('cv_token', token)
        else localStorage.removeItem('cv_token')
        set({ token })
      },
      logout: () => {
        localStorage.removeItem('cv_token')
        set({ user: null, token: null })
      },
    }),
    {
      name: 'cv-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
