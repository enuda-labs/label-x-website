'use client'

import React, { useEffect, useState } from 'react'
import { Download, X, TrendingUp } from 'lucide-react'
import { TransactionsContent } from './transactions'
import { Button } from '../ui/button'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { listEarnings, withdraw } from '@/services/apis/user'
import { fetchCurrentMonthEarnings } from '@/services/apis/earning-history'
import { CurrentMonthEarningsData } from '@/types/earning-history'
import { fetchUserBanks } from '@/services/apis/banks'
import { BankAccount } from '@/types/banks'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'


interface WithdrawData {
  transaction_id?: string
}

interface WithdrawResponse {
  status: 'success' | 'error'
  message: string
  data: WithdrawData | null
  success?: boolean
  error?: string
}


const maskAccount = (acc?: string) => {
  if (!acc) return ''
  const s = String(acc)
  if (s.length <= 4) return s
  return '****' + s.slice(-4)
}

const EarningOverview = () => {
  const queryClient = useQueryClient()
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [accountNo, setAccountNo] = useState('')
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null)
  const [userBanks, setUserBanks] = useState<BankAccount[]>([])
  const [loadingBanks, setLoadingBanks] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  // Earnings query
  const { data } = useQuery({
    queryFn: listEarnings,
    queryKey: ['earning'],
    staleTime: 1000 * 60,
  })

  // Current month earnings query
  const { data: currentMonthEarnings } = useQuery<CurrentMonthEarningsData | null>({
    queryFn: fetchCurrentMonthEarnings,
    queryKey: ['currentMonthEarnings'],
  })

  // Derived earnings values (safe defaults)
  const earnings = {
    totalEarnings: Number(data?.data?.balance ?? 0),
    availableBalance: Number(data?.data?.balance ?? 0),
    currentMonthAmount: Number(currentMonthEarnings?.amount ?? 0),
    currentMonthName: currentMonthEarnings?.current_month ?? '',
    daysLeftInMonth: currentMonthEarnings?.days_left_in_month ?? 0,
  }

  // Load user's banks (saved accounts)
  useEffect(() => {
    const loadBanks = async () => {
      setLoadingBanks(true)
      try {
        const banks = await fetchUserBanks()
        setUserBanks(banks || [])

        // If there's a primary bank, select it; otherwise pick the first (if any)
        const primary = (banks || []).find((b) => b.is_primary)
        const initial = primary ?? banks?.[0] ?? null
        if (initial) {
          setSelectedBankId(String(initial.id))
          setAccountNo(initial.account_number ?? '')
        } else {
          setSelectedBankId(null)
          setAccountNo('')
        }
      } catch (err) {
        console.error('Error fetching user banks:', err)
        toast('Error', { description: 'Failed to fetch your banks.' })
      } finally {
        setLoadingBanks(false)
      }
    }

    loadBanks()
  }, [])

  // Keep account number in sync when user selects another bank from dropdown
  useEffect(() => {
    if (!selectedBankId) {
      setAccountNo('')
      return
    }
    const b = userBanks.find((x) => String(x.id) === String(selectedBankId))
    if (b) setAccountNo(b.account_number ?? '')
  }, [selectedBankId, userBanks])

  // Helper to extract message from axios or generic error
  const extractErrorMessage = (err: unknown): string => {
    if (isAxiosError(err)) {
      const data = err.response?.data
      // check common shapes: { error: '...', message: '...' } or string
      if (data) {
        if (typeof data.error === 'string') return data.error
        if (typeof data.message === 'string') return data.message
        try {
          return JSON.stringify(data)
        } catch {
          return 'Server returned an error'
        }
      }
      return err.message ?? 'Request failed'
    }
    if (err instanceof Error) return err.message
    try {
      return String(err)
    } catch {
      return 'An unexpected error occurred'
    }
  }

  // Withdraw mutation
  const withdrawMutation = useMutation<WithdrawResponse, unknown, { account_number: string; amount: string; bank_code: string }>({
   mutationFn: (payload) => withdraw(payload),
   onSuccess: (res) => {
     toast(res.message)
     queryClient.invalidateQueries({ queryKey: ['earning'] })
     setWithdrawAmount('')
     setAccountNo('')
     setSelectedBankId(null)
     setShowWithdrawModal(false)
     setWithdrawing(false)
   },
   onError: (err) => {
     const msg = extractErrorMessage(err)
     toast.success(msg)
     setWithdrawing(false)
   },
 })

  const openWithdrawModal = () => {
    // prefer primary
    if (userBanks.length > 0) {
      const primary = userBanks.find((b) => b.is_primary)
      const pick = primary ?? userBanks[0]
      setSelectedBankId(String(pick.id))
      setAccountNo(pick.account_number ?? '')
    } else {
      setSelectedBankId(null)
      setAccountNo('')
    }
    setShowWithdrawModal(true)
  }

  const handleWithdraw = async () => {
    const bank = userBanks.find((b) => String(b.id) === String(selectedBankId))
    if (!bank) {
      toast('Bank not found')
      return
    }

    if (!withdrawAmount || !selectedBankId || accountNo.length < 1) {
      toast('Please fill in all fields correctly')
      return
    }

    setWithdrawing(true)

    withdrawMutation.mutate(
      {
        account_number: accountNo,
        amount: withdrawAmount,
        bank_code: bank.bank_code ?? '',
      },
      {
        onSuccess: (res) => {
          toast(res?.message ?? 'Withdrawal request submitted')
          queryClient.invalidateQueries({ queryKey: ['earning'] })
          setWithdrawAmount('')
          setAccountNo('')
          setSelectedBankId(null)
          setShowWithdrawModal(false)
          setWithdrawing(false)
        },
        onError: (err) => {
          const msg =
            isAxiosError(err) && err.response?.data?.error
              ? err.response.data.error
              : 'Withdrawal failed'
              toast.success(msg)
          setWithdrawing(false)
        },
      }
    )
  }



  // Earnings content (mini dashboard)
  const EarningsContent = () => (
    <div className="space-y-6 px-2 py-6">
      <div className="rounded-lg py-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Earnings Overview</h2>

          <button
            onClick={openWithdrawModal}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white transition-colors hover:bg-orange-600"
          >
            <Download size={16} /> Withdraw
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card rounded-lg p-4">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="text-blue-400" size={20} />
              <span className="text-sm text-gray-300">Available Balance</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${Number(earnings.availableBalance ?? 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-card rounded-lg p-4">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="text-green-400" size={20} />
              <span className="text-sm text-gray-300">Current Month ({earnings.currentMonthName})</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${Number(earnings.currentMonthAmount ?? 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">{earnings.daysLeftInMonth} days left in month</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <div className="flex-1 overflow-auto">
        <EarningsContent />
      </div>

      <TransactionsContent showTen />

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-background mx-4 w-full max-w-md rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Withdraw Funds</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="cursor-pointer text-gray-400 transition-colors hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Amount to Withdraw</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-card px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Select Bank Account</label>

                {loadingBanks ? (
                  <div className="text-sm text-gray-400">Loading accounts...</div>
                ) : userBanks.length === 0 ? (
                  <div className="text-sm text-gray-400">
                    No saved bank accounts. Please add a bank in the Bank Accounts page.
                  </div>
                ) : (
                  <select
                    value={selectedBankId ?? ''}
                    onChange={(e) => setSelectedBankId(e.target.value || null)}
                    className="w-full rounded-lg border border-gray-600 bg-card px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Choose a bank</option>
                    {userBanks.map((b) => (
                      <option key={b.id} value={String(b.id)}>
                        {b.bank_name ?? b.bank_name} — {maskAccount(b.account_number)}
                        {b.is_primary ? ' (Primary)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Account Number</label>
                <input
                  type="text"
                  maxLength={20}
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-card px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter account number"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 bg-card text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <button
    onClick={handleWithdraw}
    disabled={
      !withdrawAmount ||
      !selectedBankId ||
      accountNo.length < 1 ||
      withdrawing
    }
    className="flex-1 cursor-pointer rounded-lg bg-orange-500 text-white disabled:opacity-50"
  >
    {withdrawing ? 'Initiating...' : 'Withdraw'}
  </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EarningOverview
