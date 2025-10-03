export type Transaction = {
  id: string
  usd_amount: string
  ngn_amount: string
  status: 'pending' | 'failed' | 'success'
  created_at: string
  updated_at: string
  transaction_type: 'withdrawal' | 'deposit'
  description: string
  user: number
}
