import axios, { type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '~/stores/authStore'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(
  /\/+$/,
  ''
)

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

let isRefreshing = false
let failedQueue: {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}[] = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean
    }

    const is401 = error.response?.status === 401
    const isRefreshEndpoint = originalRequest.url?.includes('auth/refresh-token')
    const isLoginEndpoint = originalRequest.url?.includes('auth/login')
    const alreadyRetried = originalRequest._retry

    // Kalau 401 dari refresh atau login endpoint, langsung reject — jangan loop
    if (is401 && (isRefreshEndpoint || isLoginEndpoint)) {
      return Promise.reject(error)
    }

    // Kalau 401 dan belum pernah retry
    if (is401 && !alreadyRetried) {
      if (isRefreshing) {
        // Kalau sedang refresh, antri dulu
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            }
            return axiosInstance(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Hit refresh token endpoint
        const { data } = await axiosInstance.post('/auth/refresh-token')
        const newToken = data.data.access_token

        // Update store
        useAuthStore.getState().setAccessToken(newToken)

        // Proses antrian yang nunggu
        processQueue(null, newToken)

        // Retry request original dengan token baru
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        }

        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Refresh gagal — logout paksa
        processQueue(refreshError, null)
        useAuthStore.getState().clearAuth()
        window.localStorage.removeItem('wardrobe:has-session')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
