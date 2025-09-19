import { CreditCard, Eye, Plus, X } from 'lucide-react'
import { useState } from 'react'

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

export const BanksContent = () => {
  const [showAddBankModal, setShowAddBankModal] = useState(false)
  const [newBank, setNewBank] = useState({
    name: '',
    accountNumber: '',
    accountName: '',
    routingNumber: '',
  })

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

  return (
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
