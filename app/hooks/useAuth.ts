import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authApi } from '~/api/auth'
import { useAuthStore } from '~/stores/authStore'
import type { LoginPayload, RegisterPayload } from '~/types/auth'

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
}

export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (response) => {
      const { access_token, user } = response.data

      setAuth(user, access_token)
      window.localStorage.setItem('wardrobe:has-session', 'true')

      queryClient.setQueryData(authKeys.me(), user)

      if (!user.profile_completed) {
        navigate('/onboarding')
      } else {
        navigate('/catalog')
      }
    },
  })
}

export function useRegister() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (response) => {
      const { access_token, user } = response.data

      // Simpan ke store
      setAuth(user, access_token)
      window.localStorage.setItem('wardrobe:has-session', 'true')

      // Cache data user ke query client
      queryClient.setQueryData(authKeys.me(), user)

      // User baru selalu belum complete profile
      navigate('/onboarding')
    },
  })
}

// ============================================================
// useLogout
// ============================================================

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear store
      clearAuth()
      window.localStorage.removeItem('wardrobe:has-session')

      // Clear semua cache query
      queryClient.clear()

      navigate('/login')
    },
    onError: () => {
      // Tetap clear auth walau request gagal
      // Supaya user tidak terjebak di state login
      clearAuth()
      window.localStorage.removeItem('wardrobe:has-session')
      queryClient.clear()

      navigate('/login')
    },
  })
}
