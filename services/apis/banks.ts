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
    return response.data
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
