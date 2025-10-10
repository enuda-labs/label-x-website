'use client'

import { useEffect, useState, useMemo } from 'react'
import { Filter, Search } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { Transaction } from '@/types/transactions'
import { fetchUserTransactions } from '@/services/apis/transactions'
import { fetchEarningsHistory } from '@/services/apis/earning-history'
import { EarningsHistoryData } from '@/types/earning-history'

export const TransactionsContent = ({ showTen = false }: { showTen?: boolean }) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'earnings'>('transactions')

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [earningsHistory, setEarningsHistory] = useState<EarningsHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // --- Load transactions ---
  useEffect(() => {
    if (activeTab !== 'transactions') return

    const loadTransactions = async () => {
      try {
        setLoading(true)
        const data = await fetchUserTransactions()
        // Sort by created_at descending (latest first)
        const sortedData = data.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setTransactions(sortedData)
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [activeTab])


  // --- Load earnings history ---
  useEffect(() => {
    if (activeTab !== 'earnings') return

    const loadEarningsHistory = async () => {
      try {
        setLoading(true)
        const data = await fetchEarningsHistory()
        setEarningsHistory(data)
      } catch (error) {
        console.error('Error fetching earnings history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEarningsHistory()
  }, [activeTab])

  // --- Normalize values to string for search ---
  const normalize = (val: unknown) => (val ? String(val).toLowerCase() : '')

  // --- Filter transactions ---
  const filteredTransactions = useMemo(() => {
    const query = searchQuery.toLowerCase()
    if (!query) return transactions

    return transactions.filter((t) => {
      return (
        normalize(t.description).includes(query) ||
        normalize(t.transaction_type).includes(query) ||
        normalize(t.status).includes(query) ||
        normalize(new Date(t.created_at).toLocaleDateString()).includes(query) ||
        normalize(t.usd_amount).includes(query) ||
        normalize(t.ngn_amount).includes(query)
      )
    })
  }, [transactions, searchQuery])

  const transactionsToShow = showTen ? filteredTransactions.slice(0, 10) : filteredTransactions

  return (
    <div className="space-y-6 p-6">
      {/* Tab Buttons */}
      <div className="flex gap-4">
      <button
        className={`px-4 py-2 rounded-lg cursor-pointer ${
          activeTab === 'transactions' ? 'bg-orange-500 text-white' : 'bg-card text-gray-300'
        }`}
        onClick={() => setActiveTab('transactions')}
      >
        Transactions
      </button>
      <button
        className={`px-4 py-2 rounded-lg cursor-pointer ${
          activeTab === 'earnings' ? 'bg-orange-500 text-white' : 'bg-card text-gray-300'
        }`}
        onClick={() => setActiveTab('earnings')}
      >
        Earnings History
      </button>
    </div>


      {/* Search bar only for transactions */}
      {activeTab === 'transactions' && (
        <div className="flex items-center gap-2 mt-4">
          <button className="bg-card flex items-center gap-2 rounded-lg px-3 py-2 text-white transition-colors hover:bg-gray-600">
            <Filter size={16} />
            Filter
          </button>
          <div className="relative">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-card rounded-lg border border-gray-600 py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-card/70 overflow-hidden rounded-lg border border-gray-700 mt-4">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading...</div>
        ) : activeTab === 'transactions' ? (
          <>
            {transactionsToShow.length === 0 ? (
              <div className="p-6 text-center text-gray-400">No transactions found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-card">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                        Amount (USD)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                        Amount (NGN)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {transactionsToShow.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-card/50 transition-colors">
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-300">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              transaction.transaction_type === 'deposit'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {transaction.transaction_type === 'deposit'
                              ? 'Deposit'
                              : 'Withdrawal'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {transaction.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          <span className="text-green-400">
                            ${parseFloat(transaction.usd_amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          <span className="text-orange-400">
                            ₦{parseFloat(transaction.ngn_amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          transaction.status === 'completed' || transaction.status === 'success' || transaction.status === 'successful'
                          ? 'bg-green-500/20 text-green-400'
                          : transaction.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                          }`}
                          >
                          {transaction.status}
                          </span>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          // Earnings history tab
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
    {earningsHistory?.history.map((e, idx) => (
      <div key={idx} className="bg-card rounded-lg p-4 shadow-md flex flex-col justify-between">
        <span className="text-gray-300 text-sm">{e.month_year}</span>
        <span className="text-xl font-bold text-white">${e.amount.toFixed(2)}</span>
      </div>
    ))}
  </div>
          </>
        )}
      </div>

      {/* View all button for transactions */}
      {activeTab === 'transactions' && showTen && filteredTransactions.length > 10 && (
        <Link href="/label/earnings/history" className="flex justify-end p-4">
          <Button className="px-8">View All</Button>
        </Link>
      )}
    </div>
  )
}
