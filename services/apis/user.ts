'use client'

import { AxiosClient } from '@/utils/axios'
import { UserData } from './auth'

const axiosClient = new AxiosClient()

interface ListEarningResponse {
  status: 'success'
  data: {
    id: string
    balance: string
    created_at: string
    updated_at: string
    labeler: number
  }
  message: 'Labelers earnings'
  success: true
}
/**
 * Fetch current user’s details (id, username, email, etc.)
 */
export const getUserDetails = async () => {
  const response = await axiosClient.get<{
    status: string
    user: UserData
  }>('/account/user/detail/')
  return response.data
}
export interface Bank {
  id: number
  name: string
  slug: string
  code: string
  longcode: string
  gateway: string | null
  pay_with_bank: boolean
  supports_transfer: boolean
  available_for_direct_debit: boolean
  active: boolean
  country: string
  currency: string
  type: string
  is_deleted: boolean
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
}

// API response wrapper interface
export interface BankListResponse {
  status: 'success' | 'error'
  data: Bank[]
  message: string | null
  success: boolean
}

// Optional: More specific types for known values
export interface BankWithSpecificTypes {
  id: number
  name: string
  slug: string
  code: string
  longcode: string
  gateway: string | null
  pay_with_bank: boolean
  supports_transfer: boolean
  available_for_direct_debit: boolean
  active: boolean
  country: 'Nigeria' // Based on your data
  currency: 'NGN' // Based on your data
  type: 'nuban' // Based on your data, could be union type if more exist
  is_deleted: boolean
  createdAt: string // Could use Date if you parse the strings
  updatedAt: string // Could use Date if you parse the strings
}

// If you want to work with Date objects instead of strings
export interface BankWithDates {
  id: number
  name: string
  slug: string
  code: string
  longcode: string
  gateway: string | null
  pay_with_bank: boolean
  supports_transfer: boolean
  available_for_direct_debit: boolean
  active: boolean
  country: string
  currency: string
  type: string
  is_deleted: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Change only the username
 */
export const updateUsername = async (username: string) => {
  const response = await axiosClient.post<{ username: string }>(
    '/account/update-username/',
    { username }
  )
  return response.data
}
export const listEarnings = async () => {
  const response = await axiosClient.get<ListEarningResponse>(
    '/account/labeler/earnings/'
  )
  return response.data
}
export const listBanks = async () => {
  const response = await axiosClient.get<BankListResponse>(
    '/payment/paystack/banks/'
  )
  return response.data
}

/**
 * Change the user’s password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  const response = await axiosClient.post('/account/change-password/', {
    current_password: currentPassword,
    new_password: newPassword,
    confirm_password: confirmPassword,
  })
  return response.data
}
