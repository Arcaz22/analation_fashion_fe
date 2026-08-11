import { create } from 'zustand'
import type { User } from '~/types/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isInitialized: boolean
}

interface AuthActions {
  setAuth: (user: User, accessToken: string) => void
  setAccessToken: (accessToken: string) => void
  setProfileCompleted: (profileCompleted: boolean) => void
  clearAuth: () => void
  setInitialized: () => void
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
    }),

  setAccessToken: (accessToken) =>
    set({
      accessToken,
    }),

  setProfileCompleted: (profileCompleted) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            profile_completed: profileCompleted,
          }
        : state.user,
    })),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }),

  setInitialized: () =>
    set({
      isInitialized: true,
    }),
}))
