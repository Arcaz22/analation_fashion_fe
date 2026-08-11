import { axiosInstance } from '~/api/axios'
import type {
  LoginPayload,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  RefreshTokenResponse,
  RegisterPayload,
  RegisterResponse,
} from '~/types/auth'

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>(
      '/auth/login',
      payload
    )
    return data
  },

  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const { data } = await axiosInstance.post<RegisterResponse>(
      '/auth/register',
      payload
    )
    return data
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const { data } = await axiosInstance.post<RefreshTokenResponse>(
      '/auth/refresh-token'
    )
    return data
  },

  logout: async (): Promise<LogoutResponse> => {
    const { data } = await axiosInstance.post<LogoutResponse>('/auth/logout')
    return data
  },

  me: async (): Promise<MeResponse> => {
    const { data } = await axiosInstance.get<MeResponse>('/auth/me')
    return data
  },
}
