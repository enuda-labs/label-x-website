// services/apis/banks.ts
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
    // DON'T pass a generic that confuses your Axios wrapper.
    const response = await axiosClient.post('/account/banks/paystack/', payload)
    // response may be AxiosResponse. Use unwrap helper to get BankAccount
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
    // ensure we always return an array
    return (result ?? []) as BankAccount[]
  } catch (error) {
    console.error('Error fetching user banks:', error)
    return []
  }
}

// --- Fetch a single bank account by ID ---
export const fetchBankById = async (id: string): Promise<BankAccount | null> => {
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
    const response = await axiosClient.put(`/account/banks/paystack/${id}/edit/`, payload)
    const result = unwrap<BankAccount>(response)
    return result
  } catch (error) {
    console.error(`Error updating bank account ${id}:`, error)
    return null
  }
}

// --- Set a bank as primary ---
export const setPrimaryBank = async (id: string): Promise<BankAccount | null> => {
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
