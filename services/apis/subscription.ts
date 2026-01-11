import { AxiosClient } from '@/utils/axios'

const axiosClient = new AxiosClient()

export interface SubscriptionPlan {
  id: number
  name: string
  monthly_fee: string
  cost_per_extra_request: string
  features?: string[] // Features list from the database
}

interface MyPlanResponse {
  plan: SubscriptionPlan
  wallet_balance: number
  subscribed_at: string
  expires_at: string
  request_balance: number
  user_data_points: {
    id: number
    used_data_points: number
    data_points_balance: number
    created_at: string
    updated_at: string
    user: number
  }
}

interface initializeResponse {
  status: string
  data: {
    payment_url: string
  }
  message: string
  success: boolean
}

export interface PaymentHistory {
  id: number
  created_at: string
  amount: string
  description: string
  status: string
  payment_url: string | null
  user: number
}
export const getSubscriptionPlans = async () => {
  const response = await axiosClient.get<{
    status: string
    detail: SubscriptionPlan[]
  }>('/subscription/plans')
  return response.data
}

export const getMyPlan = async () => {
  const response = await axiosClient.get<MyPlanResponse>(
    '/subscription/my_plan/'
  )
  return response.data
}

export const initializeSubscription = async (id: number) => {
  const response = await axiosClient.post<
    { subscription_plan: number },
    initializeResponse
  >('/subscription/initialize/', {
    subscription_plan: id,
  })
  return response.data
}

export const gePaymentHistory = async () => {
  const response = await axiosClient.get<PaymentHistory[]>(
    '/subscription/payment/history/'
  )
  return response.data
}
