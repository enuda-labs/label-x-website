import { AxiosClient } from '@/utils/axios'
import { BankAccount, BankAccountPayload } from '@/types/banks'

const axiosClient = new AxiosClient()

// Helper to unwrap responses that may come as either:
// 1) { data: ... }  (common pattern) OR
// 2) the raw payload directly (e.g. array/object)
const unwrap = <T>(resp: any): T | null => {
  if (!resp) return null
  // resp could be an AxiosResponse-like { data: ... }
  const top = resp.data ?? resp
  // If the API itself wraps again as { data: ... } (double-wrap), handle that:
  if (top && typeof top === 'object' && 'data' in top) {
    return top.data as T
  }
  return top as T
}

// --- Create a Paystack bank account ---
export const createBankAccount = async (
  payload: BankAccountPayload
): Promise<BankAccount | null> => {
  try {
    const response = await axiosClient.post('/account/banks/paystack/', payload)
    const result = unwrap<BankAccount>(response)
    return result
  } catch (error) {
    console.error('Error creating bank account:', error)
    return null
  }
}

// --- Fetch all user bank accounts ---
export const fetchUserBanks = async (): Promise<BankAccount[]> => {
  try {
    const response = await axiosClient.get('/account/banks/')
    const result = unwrap<BankAccount[] | BankAccount[]>(response)
    return (result ?? []) as BankAccount[]
  } catch (error) {
    console.error('Error fetching user banks:', error)
    return []
  }
}

// --- Fetch a single bank account by ID ---
export const fetchBankById = async (
  id: string
): Promise<BankAccount | null> => {
  try {
    const response = await axiosClient.get(`/account/banks/${id}/`)
    const result = unwrap<BankAccount>(response)
    return result
  } catch (error) {
    console.error(`Error fetching bank account ${id}:`, error)
    return null
  }
}

// --- Update a specific Paystack bank account ---
export const updateBankAccount = async (
  id: string,
  payload: BankAccountPayload
): Promise<BankAccount | null> => {
  try {
    const response = await axiosClient.put(
      `/account/banks/paystack/${id}/edit/`,
      payload
    )
    const result = unwrap<BankAccount>(response)
    return result
  } catch (error) {
    console.error(`Error updating bank account ${id}:`, error)
    return null
  }
}

// --- Set a bank as primary ---
export const setPrimaryBank = async (
  id: string
): Promise<BankAccount | null> => {
  try {
    const response = await axiosClient.post(`/account/banks/${id}/primary/`)
    const result = unwrap<BankAccount>(response)
    return result
  } catch (error) {
    console.error(`Error setting bank account ${id} as primary:`, error)
    return null
  }
}

// --- Delete a specific bank account ---
export const deleteBankAccount = async (id: string): Promise<void> => {
  try {
    await axiosClient.delete(`/account/banks/${id}/`)
  } catch (error) {
    console.error(`Error deleting bank account ${id}:`, error)
    throw error
  }
}

/* -------------------------------
   🟢 STRIPE CONNECT INTEGRATION
-------------------------------- */

// --- Fetch Stripe connected account ---
export const fetchStripeAccount = async (): Promise<any | null> => {
  try {
    const response = await axiosClient.get('/account/banks/stripe/')
    const result = unwrap<any>(response)
    return result
  } catch (error: any) {
    // 404 is expected when user doesn't have a Stripe account yet
    if (error?.response?.status === 404) {
      return null
    }
    console.error('Error fetching Stripe account:', error)
    return null
  }
}

// --- Initialize Stripe connection ---
export const initializeStripeAccount = async (): Promise<{
  link: string | null
  error?: string
}> => {
  try {
    const response = await axiosClient.post('/account/banks/stripe/initialize/')
    const result = unwrap<{ link: string }>(response)
    return { link: result?.link ?? null }
  } catch (error: any) {
    console.error('Error initializing Stripe account:', error)

    // Extract error message from response, but use generic message for user-facing errors
    const backendMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.response?.data?.detail

    // Use backend message if it's a generic user-friendly message, otherwise use default
    // This prevents exposing sensitive information like API keys
    const errorMessage =
      backendMessage &&
      !backendMessage.toLowerCase().includes('api key') &&
      !backendMessage.toLowerCase().includes('sk_') &&
      !backendMessage.toLowerCase().includes('secret')
        ? backendMessage
        : 'Unable to connect to payment service. Please try again later.'

    return { link: null, error: errorMessage }
  }
}
