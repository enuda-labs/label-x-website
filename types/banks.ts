export type BankAccount = {
  id: string
  account_number: string
  bank_code: string
  bank_name: string
  created_at: string
  updated_at: string
  account_name: string
  is_primary: boolean
  platform: string
  user: number
}

export type BankAccountPayload = {
  account_number: string
  bank_code: string
  platform: string
}
