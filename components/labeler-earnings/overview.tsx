'use client'

import React, { useState } from 'react'
import { Download, X, TrendingUp } from 'lucide-react'
import { TransactionsContent } from './transactions'
import { Button } from '../ui/button'
import { useQuery } from '@tanstack/react-query'
import { listBanks, listEarnings } from '@/services/apis/user'

const EarningOverview = () => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [selectedBank, setSelectedBank] = useState('')

  const { data } = useQuery({
    queryFn: listEarnings,
    queryKey: ['earning'],
  })
  const { data: listBanksData } = useQuery({
    queryFn: listBanks,
    queryKey: ['banks'],
  })
  const earnings = {
    totalEarnings: data?.data.balance,
    availableBalance: data?.data.balance,
  }

  const banks = listBanksData?.data.map((bank) => ({
    id: bank.id,
    name: bank.name,
  }))

  const handleWithdraw = () => {
    if (withdrawAmount && selectedBank) {
      // Handle withdrawal logic here
      console.log(`Withdrawing $${withdrawAmount} to ${selectedBank}`)
      setShowWithdrawModal(false)
      setWithdrawAmount('')
      setSelectedBank('')
    }
  }

  const EarningsContent = () => (
    <div className="space-y-6 px-2 py-6">
      <div className="rounded-lg py-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Earnings Overview
          </h2>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white transition-colors hover:bg-orange-600"
          >
            <Download size={16} />
            Withdraw
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* <div className="bg-card rounded-lg p-4">
            <div className="mb-2 flex items-center gap-2">
              <DollarSign className="text-green-400" size={20} />
              <span className="text-sm text-gray-300">Total Earnings</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${earnings.totalEarnings.toFixed(2)}
            </p>
          </div> */}

          <div className="bg-card rounded-lg p-4">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="text-blue-400" size={20} />
              <span className="text-sm text-gray-300">Available Balance</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${earnings.availableBalance}
            </p>
          </div>

          {/* <div className="bg-card rounded-lg p-4">
            <div className="mb-2 flex items-center gap-2">
              <Clock className="text-yellow-400" size={20} />
              <span className="text-sm text-gray-300">Pending Earnings</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${earnings.pendingEarnings.toFixed(2)}
            </p>
          </div> */}

          {/* <div className="bg-card rounded-lg p-4">
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="text-purple-400" size={20} />
              <span className="text-sm text-gray-300">This Month</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${earnings.thisMonth.toFixed(2)}
            </p>
          </div> */}
        </div>

        {/* <div className="bg-card rounded-lg p-4">
          <p className="text-sm text-gray-300">
            Last withdrawal:{' '}
            <span className="font-medium text-white">
              ${earnings.lastWithdrawal.toFixed(2)}
            </span>{' '}
            on {earnings.withdrawalDate}
          </p>
        </div> */}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <div className="flex-1 overflow-auto">
        <EarningsContent />
      </div>

      <TransactionsContent showTen />

      {showWithdrawModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-background mx-4 w-full max-w-md rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                Withdraw Funds
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-400 transition-colors hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Available Balance: ${earnings.availableBalance}
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-card w-full rounded-lg border border-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Select Bank Account
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="bg-card w-full rounded-lg border border-gray-600 px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="">Choose a bank account</option>
                  {banks?.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Account number
                </label>
                <input
                  type="number"
                  placeholder="Enter account number"
                  maxLength={10}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-card w-full rounded-lg border border-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-sm text-gray-300">
                  <span className="text-yellow-400">⚠️</span> Withdrawals
                  typically take 1-3 business days to process.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowWithdrawModal(false)}
                  className="bg-card flex-1 rounded-lg px-4 py-2 text-white transition-colors hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || !selectedBank}
                  className="flex-1 rounded-lg disabled:cursor-not-allowed"
                >
                  Withdraw
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EarningOverview
