// services/paystack.ts
import { AxiosClient } from '@/utils/axios'
import { PaystackBank } from '@/types/paystack'

const axiosClient = new AxiosClient()

export const fetchPaystackBanks = async (): Promise<PaystackBank[]> => {
  try {
    const response = await axiosClient.get<{ status: string; data: PaystackBank[] }>(
      '/payment/paystack/banks/'
    )

    if (Array.isArray(response.data.data)) {
      return response.data.data
    }

    return []
  } catch (error) {
    console.error('Error fetching Paystack banks:', error)
    return []
  }
}
