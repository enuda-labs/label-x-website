'use client'

import React from 'react'
import { TrendingUp } from 'lucide-react'
import { TransactionsContent } from './transactions'
import { useQuery } from '@tanstack/react-query'
import { listEarnings } from '@/services/apis/user'
import { fetchCurrentMonthEarnings } from '@/services/apis/earning-history'
import { CurrentMonthEarningsData } from '@/types/earning-history'

const EarningOverview = () => {
  // Fetch earnings data
  const { data } = useQuery({
    queryFn: listEarnings,
    queryKey: ['earning'],
    staleTime: 1000 * 60,
  })

  // Fetch current month earnings
  const { data: currentMonthEarnings } =
    useQuery<CurrentMonthEarningsData | null>({
      queryFn: fetchCurrentMonthEarnings,
      queryKey: ['currentMonthEarnings'],
    })

  // Extract earnings values safely
  const earnings = {
    totalEarnings: Number(data?.data?.balance ?? 0),
    availableBalance: Number(data?.data?.balance ?? 0),
    currentMonthAmount: Number(currentMonthEarnings?.amount ?? 0),
    currentMonthName: currentMonthEarnings?.current_month ?? '',
    daysLeftInMonth: currentMonthEarnings?.days_left_in_month ?? 0,
  }

  return (
    <div className="min-h-screen">
      <div className="flex-1 overflow-auto">
        <div className="space-y-6 px-2 py-6">
          <div className="rounded-lg py-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Earnings Overview
              </h2>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-card rounded-lg p-4">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp className="text-blue-400" size={20} />
                  <span className="text-sm text-gray-300">Available Balance</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  ₦{earnings.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-card rounded-lg p-4">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp className="text-green-400" size={20} />
                  <span className="text-sm text-gray-300">
                    Current Month ({earnings.currentMonthName})
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  ₦{earnings.currentMonthAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-400">
                  {earnings.daysLeftInMonth} days left in month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <TransactionsContent showTen />
    </div>
  )
}

export default EarningOverview
