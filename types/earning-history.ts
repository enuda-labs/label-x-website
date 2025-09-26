// --- Current Month Earnings ---

// Data inside the response
export interface CurrentMonthEarningsData {
  amount: number
  current_month: string
  days_left_in_month: number
}

// Full API response
export interface CurrentMonthEarningsResponse {
  status: 'success' | 'error'
  message: string
  data: CurrentMonthEarningsData
}

// --- Earnings History (Last 6 months) ---

// Single month entry
export interface MonthEarnings {
  amount: number
  month_year: string
}

// Data inside the response
export interface EarningsHistoryData {
  labeller_username: string
  months_included: number
  history: MonthEarnings[]
}

// Full API response
export interface EarningsHistoryResponse {
  status: 'success' | 'error'
  message: string
  data: EarningsHistoryData
}
