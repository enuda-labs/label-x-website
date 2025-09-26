import { AxiosClient } from '@/utils/axios'
import { Transaction } from '@/types/transactions'

const axiosClient = new AxiosClient()

// --- Fetch all user transactions ---
export const fetchUserTransactions = async (): Promise<Transaction[]> => {
  const response = await axiosClient.get<{
    status?: string
    data?: Transaction[]
  }>('/payment/user/transactions/')

  // Some APIs return `data.data`, others just return `data`
  if (Array.isArray(response.data)) {
    return response.data
  }
  if (response.data.data) {
    return response.data.data
  }

  return []
}
