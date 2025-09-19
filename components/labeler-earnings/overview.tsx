import React, { useState } from 'react'
import {
  DollarSign,
  CreditCard,
  Download,
  Plus,
  X,
  Calendar,
  TrendingUp,
  Clock,
  Eye,
  Filter,
  Search,
} from 'lucide-react'

const EarningOverview = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showAddBankModal, setShowAddBankModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [selectedBank, setSelectedBank] = useState('')
  const [newBank, setNewBank] = useState({
    name: '',
    accountNumber: '',
    accountName: '',
    routingNumber: '',
  })

  // Mock data
  const earnings = {
    totalEarnings: 1250.75,
    availableBalance: 950.25,
    pendingEarnings: 300.5,
    thisMonth: 450.75,
    lastWithdrawal: 300.0,
    withdrawalDate: '2025-09-15',
  }

  const banks = [
    {
      id: 1,
      name: 'Chase Bank',
      accountNumber: '****1234',
      accountName: 'John Doe',
      isDefault: true,
    },
    {
      id: 2,
      name: 'Bank of America',
      accountNumber: '****5678',
      accountName: 'John Doe',
      isDefault: false,
    },
  ]

  const transactions = [
    {
      id: 1,
      type: 'earning',
      amount: 25.5,
      description: 'Image Classification - Batch #142',
      date: '2025-09-19',
      status: 'completed',
    },
    {
      id: 2,
      type: 'withdrawal',
      amount: -300.0,
      description: 'Withdrawal to Chase Bank',
      date: '2025-09-15',
      status: 'completed',
    },
    {
      id: 3,
      type: 'earning',
      amount: 18.75,
      description: 'Text Annotation - Project Alpha',
      date: '2025-09-18',
      status: 'completed',
    },
    {
      id: 4,
      type: 'earning',
      amount: 42.25,
      description: 'Object Detection - Dataset V2',
      date: '2025-09-17',
      status: 'pending',
    },
    {
      id: 5,
      type: 'withdrawal',
      amount: -150.0,
      description: 'Withdrawal to Bank of America',
      date: '2025-09-10',
      status: 'completed',
    },
    {
      id: 6,
      type: 'earning',
      amount: 33.0,
      description: 'Sentiment Analysis - Customer Reviews',
      date: '2025-09-16',
      status: 'completed',
    },
  ]

  const handleWithdraw = () => {
    if (withdrawAmount && selectedBank) {
      // Handle withdrawal logic here
      console.log(`Withdrawing $${withdrawAmount} to ${selectedBank}`)
      setShowWithdrawModal(false)
      setWithdrawAmount('')
      setSelectedBank('')
    }
  }

  const handleAddBank = () => {
    if (newBank.name && newBank.accountNumber && newBank.accountName) {
      // Handle add bank logic here
      console.log('Adding new bank:', newBank)
      setShowAddBankModal(false)
      setNewBank({
        name: '',
        accountNumber: '',
        accountName: '',
        routingNumber: '',
      })
    }
  }

  const DashboardContent = () => (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-2xl font-bold text-white">
          Labeler Dashboard
        </h1>
        <p className="text-gray-400">
          Complete your labeling tasks to help improve AI and machine learning
          models
        </p>
      </div>

      {/* Earnings Overview */}
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
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
          <div className="rounded-lg bg-gray-700 p-4">
            <div className="mb-2 flex items-center gap-2">
              <DollarSign className="text-green-400" size={20} />
              <span className="text-sm text-gray-300">Total Earnings</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${earnings.totalEarnings.toFixed(2)}
            </p>
          </div>

          <div className="rounded-lg bg-gray-700 p-4">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="text-blue-400" size={20} />
              <span className="text-sm text-gray-300">Available Balance</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${earnings.availableBalance.toFixed(2)}
            </p>
          </div>

          <div className="rounded-lg bg-gray-700 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Clock className="text-yellow-400" size={20} />
              <span className="text-sm text-gray-300">Pending Earnings</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${earnings.pendingEarnings.toFixed(2)}
            </p>
          </div>

          <div className="rounded-lg bg-gray-700 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="text-purple-400" size={20} />
              <span className="text-sm text-gray-300">This Month</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${earnings.thisMonth.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-gray-700 p-4">
          <p className="text-sm text-gray-300">
            Last withdrawal:{' '}
            <span className="font-medium text-white">
              ${earnings.lastWithdrawal.toFixed(2)}
            </span>{' '}
            on {earnings.withdrawalDate}
          </p>
        </div>
      </div>

      {/* Task Statistics */}
    </div>
  )

  const BanksContent = () => (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-white">Bank Accounts</h1>
          <p className="text-gray-400">Manage your withdrawal accounts</p>
        </div>
        <button
          onClick={() => setShowAddBankModal(true)}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white transition-colors hover:bg-orange-600"
        >
          <Plus size={16} />
          Add Bank Account
        </button>
      </div>

      <div className="space-y-4">
        {banks.map((bank) => (
          <div
            key={bank.id}
            className="rounded-lg border border-gray-700 bg-gray-800 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-500/20 p-3">
                  <CreditCard className="text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-white">{bank.name}</h3>
                  <p className="text-sm text-gray-400">{bank.accountNumber}</p>
                  <p className="text-sm text-gray-400">{bank.accountName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {bank.isDefault && (
                  <span className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-400">
                    Default
                  </span>
                )}
                <button className="text-gray-400 transition-colors hover:text-white">
                  <Eye size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const TransactionsContent = () => (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-white">
            Transaction History
          </h1>
          <p className="text-gray-400">
            View all your earnings and withdrawal activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-gray-700 px-3 py-2 text-white transition-colors hover:bg-gray-600">
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
              className="rounded-lg border border-gray-600 bg-gray-700 py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
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
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="transition-colors hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-300">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        transaction.type === 'earning'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {transaction.type === 'earning'
                        ? 'Earning'
                        : 'Withdrawal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <span
                      className={
                        transaction.amount > 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }
                    >
                      {transaction.amount > 0 ? '+' : ''}$
                      {Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        transaction.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {transaction.status === 'completed'
                        ? 'Completed'
                        : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && <DashboardContent />}
        {activeTab === 'earnings' && <DashboardContent />}
        {activeTab === 'banks' && <BanksContent />}
        {activeTab === 'transactions' && <TransactionsContent />}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-6">
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

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Available Balance: ${earnings.availableBalance.toFixed(2)}
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Select Bank Account
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="">Choose a bank account</option>
                  {banks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name} - {bank.accountNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg bg-gray-700 p-3">
                <p className="text-sm text-gray-300">
                  <span className="text-yellow-400">⚠️</span> Withdrawals
                  typically take 1-3 business days to process.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || !selectedBank}
                  className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-600"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bank Modal */}
      {showAddBankModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                Add Bank Account
              </h3>
              <button
                onClick={() => setShowAddBankModal(false)}
                className="text-gray-400 transition-colors hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Chase Bank"
                  value={newBank.name}
                  onChange={(e) =>
                    setNewBank({ ...newBank, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Account Number
                </label>
                <input
                  type="text"
                  placeholder="Enter account number"
                  value={newBank.accountNumber}
                  onChange={(e) =>
                    setNewBank({ ...newBank, accountNumber: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={newBank.accountName}
                  onChange={(e) =>
                    setNewBank({ ...newBank, accountName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Routing Number
                </label>
                <input
                  type="text"
                  placeholder="Enter routing number"
                  value={newBank.routingNumber}
                  onChange={(e) =>
                    setNewBank({ ...newBank, routingNumber: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddBankModal(false)}
                  className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBank}
                  disabled={
                    !newBank.name ||
                    !newBank.accountNumber ||
                    !newBank.accountName
                  }
                  className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-600"
                >
                  Add Bank
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
