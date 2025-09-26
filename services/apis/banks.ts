import { AxiosClient } from '@/utils/axios'
import { BankAccount, BankAccountPayload } from '@/types/bank'

const axiosClient = new AxiosClient()

// --- Create a Paystack bank account ---
export const createBankAccount = async (
  payload: BankAccountPayload
): Promise<BankAccount | null> => {
  try {
    const response = await axiosClient.post<BankAccount>(
      '/account/banks/paystack/',
      payload
    )
    return response.data?.data ?? null
  } catch (error) {
    console.error('Error creating bank account:', error)
    return null
  }
}

// --- Fetch all user bank accounts ---
export const fetchUserBanks = async (): Promise<BankAccount[]> => {
  try {
    const response = await axiosClient.get<BankAccount[]>('/account/banks/')
    return response.data
  } catch (error) {
    console.error('Error fetching user banks:', error)
    return []
  }
}

// --- Fetch a single bank account by ID ---
export const fetchBankById = async (id: string): Promise<BankAccount | null> => {
  try {
    const response = await axiosClient.get<BankAccount>(`/account/banks/${id}/`)
    return response.data
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
    const response = await axiosClient.put<BankAccount>(
      `/account/banks/paystack/${id}/edit/`,
      payload
    )
    return response.data
  } catch (error) {
    console.error(`Error updating bank account ${id}:`, error)
    return null
  }
}

// --- Set a bank as primary ---
export const setPrimaryBank = async (id: string): Promise<BankAccount | null> => {
  try {
    const response = await axiosClient.post(`/account/banks/${id}/primary/`)
    // Unwrap the BankAccount from the response
    return response.data?.data ?? null
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
    throw error // so the component can catch it
  }
}
