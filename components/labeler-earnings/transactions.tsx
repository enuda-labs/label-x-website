'use client'

import { useEffect, useState, useMemo } from 'react'
import { Filter, Search } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { Transaction } from '@/types/transactions'
import { fetchUserTransactions } from '@/services/apis/transactions'

export const TransactionsContent = ({ showTen = false }: { showTen?: boolean }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true)
        const data = await fetchUserTransactions()
        setTransactions(data)
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [])

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-white">Transaction History</h1>
          <p className="text-gray-400">
            View all your deposits and withdrawals
          </p>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Transactions Table */}
      <div className="bg-card/70 overflow-hidden rounded-lg border border-gray-700">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading...</div>
        ) : transactionsToShow.length === 0 ? (
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
                  <tr
                    key={transaction.id}
                    className="hover:bg-card/50 transition-colors"
                  >
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
                          transaction.status === 'completed'
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

        {showTen && filteredTransactions.length > 10 && (
          <Link href="/label/earnings/history" className="flex justify-end p-4">
            <Button className="px-8">View All</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
