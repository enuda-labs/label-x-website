// utils/auth.ts
import { AxiosClient } from '@/utils/axios'

const axiosClient = new AxiosClient()

/** ----- Auth: Login & Register ----- **/

export interface LoginBody {
  username: string
  password: string
  otp_code?: string // allow optional OTP for 2FA flows
}

export interface UserData {
  id: number
  username: string
  email: string
  is_reviewer: boolean
  is_admin: boolean
}

export interface LoginResponse {
  refresh: string
  access: string
  user_data: UserData
  data: {
    requires_email_verification: boolean
  }
}

export const login = async (payload: LoginBody): Promise<LoginResponse> => {
  const response = await axiosClient.post<LoginBody, LoginResponse>(
    '/account/login/',
    payload
  )
  return response.data
}

export interface RegisterBody {
  username: string
  email: string
  password: string
  role?: string
  domains?: number[]
  invitation_token?: string
}

export interface RegisterResponse {
  status: 'success' | 'error'
  user_data: {
    id: number
    username: string
    email: string
  }
}

export const register = async (
  payload: RegisterBody
): Promise<RegisterResponse> => {
  const response = await axiosClient.post<RegisterBody, RegisterResponse>(
    '/account/register/',
    payload
  )
  return response.data
}

/** ----- Two-Factor Authentication Setup & Verify ----- **/

// Data returned by the setup endpoint
export interface TwoFASetupData {
  qr_code_url: string
  secret_key: string
  is_verified: boolean
}

// Full API response for setup
interface TwoFASetupAPIResponse {
  status: string
  data: TwoFASetupData
  message: string | null
  success: boolean
}

/**
 * Fetches the QR code URL and secret key for setting up 2FA.
 */
export const get2FASetup = async (): Promise<TwoFASetupData> => {
  const resp = await axiosClient.get<TwoFASetupAPIResponse>(
    '/account/2fa/setup/'
  )
  return resp.data.data
}

// API response for verify
interface Verify2FAAPIResponse {
  status: string
  data: { is_verified: boolean }
  message: string | null
  success: boolean
}

/**
 * Verifies the 6-digit OTP code against the secret on the server.
 * Returns true if the code is valid and 2FA is now enabled.
 */
export const verify2FASetup = async (otp_code: string) => {
  const resp = await axiosClient.post<
    { otp_code: string },
    Verify2FAAPIResponse
  >('/account/2fa/setup/', { otp_code })
  return resp.data
}

/**
 * Disables two-factor authentication by validating the user password.
 */
export const disable2FASetup = async (password: string): Promise<void> => {
  await axiosClient.post<{ password: string }>('/account/2fa/disable/', {
    password,
  })
}

/** ----- Password Reset ----- **/

export interface PasswordResetRequestBody {
  email: string
}
export const requestPasswordReset = async (
  payload: PasswordResetRequestBody
): Promise<void> => {
  await axiosClient.post<PasswordResetRequestBody>(
    '/account/email/password/request-reset/',
    payload
  )
}

export interface PasswordResetVerifyBody {
  email: string
  otp: string
}

export const verifyPasswordResetCode = async (
  payload: PasswordResetVerifyBody
): Promise<void> => {
  await axiosClient.post<PasswordResetVerifyBody>(
    '/account/email/verify/',
    payload
  )
}

export interface PasswordResetBody {
  email: string
  otp: string
  new_password: string
}
export const resetPassword = async (
  payload: PasswordResetBody
): Promise<void> => {
  await axiosClient.post<PasswordResetBody>(
    '/account/email/password/reset/',
    payload
  )
}
