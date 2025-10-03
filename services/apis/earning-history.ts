import { AxiosClient } from '@/utils/axios'
import {
  CurrentMonthEarningsResponse,
  CurrentMonthEarningsData,
  EarningsHistoryResponse,
  EarningsHistoryData,
} from '@/types/earning-history'

const axiosClient = new AxiosClient()

// --- Fetch current month earnings ---
export const fetchCurrentMonthEarnings =
  async (): Promise<CurrentMonthEarningsData | null> => {
    try {
      const response = await axiosClient.get<CurrentMonthEarningsResponse>(
        '/payment/earnings/current-month/'
      )
      return response.data?.data ?? null
    } catch (error) {
      console.error('Error fetching current month earnings:', error)
      return null
    }
  }

// --- Fetch earnings history (last 6 months) ---
export const fetchEarningsHistory =
  async (): Promise<EarningsHistoryData | null> => {
    try {
      const response = await axiosClient.get<EarningsHistoryResponse>(
        '/payment/earnings/history/'
      )
      return response.data?.data ?? null
    } catch (error) {
      console.error('Error fetching earnings history:', error)
      return null
    }
  }
