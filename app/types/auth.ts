export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface User {
  id: number | string
  name: string
  email: string
  role: string
  profile_completed: boolean
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface AuthData {
  access_token: string
  token_type: 'Bearer'
  user: User
}

export interface RefreshTokenData {
  access_token: string
  token_type: 'Bearer'
}

export type LoginResponse = ApiResponse<AuthData>
export type RegisterResponse = ApiResponse<AuthData>
export type RefreshTokenResponse = ApiResponse<RefreshTokenData>
export type MeResponse = ApiResponse<User>
export type LogoutResponse = ApiResponse<null>
