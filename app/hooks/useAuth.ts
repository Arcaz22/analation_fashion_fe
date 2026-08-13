import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authApi } from '~/api/auth'
import { profileApi } from '~/api/profile'
import { profileKeys } from '~/hooks/useProfile'
import { getApiErrorMessage } from '~/lib/apiError'
import { useAuthStore } from '~/stores/authStore'
import { showToast } from '~/stores/toastStore'
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
    onSuccess: async (response) => {
      const { access_token, user } = response.data

      setAuth(user, access_token)
      window.localStorage.setItem('wardrobe:has-session', 'true')

      const profileResponse = await profileApi.me()
      const profile = profileResponse.data
      const profileCompleted =
        profile.profile_completed || Boolean(profile.skin_tone && profile.body_shape)
      const syncedUser = {
        ...user,
        profile_completed: profileCompleted,
      }

      setAuth(syncedUser, access_token)
      queryClient.setQueryData(authKeys.me(), syncedUser)
      queryClient.setQueryData(profileKeys.me(), profileResponse)

      showToast({
        type: 'success',
        title: 'Login berhasil',
        description: 'Selamat datang kembali.',
      })
      navigate(profileCompleted ? '/catalog' : '/onboarding')
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Login gagal',
        description: getApiErrorMessage(
          error,
          'Periksa email dan password Anda.'
        ),
      })
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
      showToast({
        type: 'success',
        title: 'Registrasi berhasil',
        description: 'Lengkapi profil untuk mulai memakai rekomendasi.',
      })
      navigate('/onboarding')
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: 'Registrasi gagal',
        description: getApiErrorMessage(error, 'Periksa data Anda dan coba lagi.'),
      })
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
      showToast({
        type: 'success',
        title: 'Logout berhasil',
      })
    },
    onError: () => {
      // Tetap clear auth walau request gagal
      // Supaya user tidak terjebak di state login
      clearAuth()
      window.localStorage.removeItem('wardrobe:has-session')
      queryClient.clear()

      navigate('/login')
      showToast({
        type: 'info',
        title: 'Sesi diakhiri',
        description: 'Anda sudah keluar dari aplikasi.',
      })
    },
  })
}
