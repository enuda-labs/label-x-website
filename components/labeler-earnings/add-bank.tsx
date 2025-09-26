'use client'

import { CreditCard, Eye, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { createBankAccount, fetchUserBanks } from '@/services/apis/banks'
import { BankAccountPayload, BankAccount } from '@/types/banks'
import { fetchPaystackBanks } from '@/services/apis/paystack'
import { PaystackBank } from '@/types/paystack'

export const BanksContent = () => {
  const [banks, setBanks] = useState<BankAccount[]>([])
  const [showBankModal, setShowBankModal] = useState(false)
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [paystackBanks, setPaystackBanks] = useState<PaystackBank[]>([])

  const [newBank, setNewBank] = useState<BankAccountPayload>({
    bank_code: '',
    account_number: '',
    platform: 'paystack',
  })

  // Fetch user's banks on mount
  useEffect(() => {
    const loadBanks = async () => {
      try {
        const userBanks = await fetchUserBanks()
        setBanks(userBanks)
      } catch (err) {
        console.error('Error fetching user banks:', err)
        toast({
          title: 'Error',
          description: 'Failed to fetch your banks.',
          variant: 'destructive',
        })
      }
    }

    loadBanks()
  }, [])

  const openAddBankModal = async () => {
    setSelectedBank(null)
    setNewBank({ bank_code: '', account_number: '', platform: 'paystack' })
    setShowBankModal(true)

    try {
      const banks = await fetchPaystackBanks()
      setPaystackBanks(banks)
    } catch (error) {
      console.error('Error fetching Paystack banks:', error)
    }
  }

  const openViewBankModal = (bank: BankAccount) => {
    setSelectedBank(bank)
    setNewBank({
      account_number: bank.account_number,
      bank_code: bank.bank_code,
      platform: bank.platform,
    })
    setShowBankModal(true)
  }

  const handleSaveBank = async () => {
    if (!newBank.account_number || !newBank.bank_code) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    if (selectedBank) {
      console.log("Updating bank:", newBank)
      toast({
        title: "Success",
        description: "Bank updated successfully!",
      })
      setShowBankModal(false)
      setLoading(false)
      return
    }

    try {
      const createdBank = await createBankAccount(newBank)

      if (!createdBank || !createdBank.id) {
        toast({
          title: "Error",
          description: "Failed to add bank. Invalid server response.",
          variant: "destructive",
        })
        return
      }

      setBanks([createdBank, ...banks])
      toast({
        title: "Success",
        description: "Bank added successfully!",
      })
      setShowBankModal(false)
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to save bank.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-white">Bank Accounts</h1>
          <p className="text-gray-400">Manage your withdrawal accounts</p>
        </div>
        <Button onClick={openAddBankModal} className="flex items-center gap-2">
          <Plus size={16} />
          Add Bank Account
        </Button>
      </div>

      <div className="space-y-4">
        {banks.map((bank, index) => (
          <div
            key={`${bank.id}-${index}`}
            onClick={() => openViewBankModal(bank)}
            className="border-card bg-card hover:bg-card/70 cursor-pointer rounded-lg border p-6 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 rounded-lg p-3">
                  <CreditCard className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-white">{bank.bank_name}</h3>
                  <p className="text-sm text-gray-400">{bank.account_number}</p>
                  <p className="text-sm text-gray-400">{bank.account_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {bank.is_primary && (
                  <span className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-400">
                    Primary
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openViewBankModal(bank)
                  }}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showBankModal && (
        <Dialog open={showBankModal} onOpenChange={setShowBankModal}>
          <DialogContent>
            <DialogTitle className="text-xl font-semibold text-white">
              {selectedBank ? 'View / Edit Bank Account' : 'Add Bank Account'}
            </DialogTitle>
            <DialogDescription>
              {selectedBank
                ? 'You can view or edit your bank account details here.'
                : 'Add a new bank account for withdrawals.'}
            </DialogDescription>

            <div className="space-y-4 mt-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Select Bank
                </label>
                <select
                  value={newBank.bank_code}
                  onChange={(e) => {
                    const selected = paystackBanks.find((b) => b.code === e.target.value)
                    setNewBank({
                      ...newBank,
                      bank_code: selected?.code || '',
                      account_number: newBank.account_number,
                      platform: 'paystack',
                    })
                  }}
                  className="bg-card focus:ring-primary w-full rounded-lg border border-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:outline-none"
                >
                  <option value="">Select a bank</option>
                  {paystackBanks.map((bank, index) => (
                    <option key={`${bank.code}-${index}`} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Account Number
                </label>
                <input
                  type="text"
                  placeholder="Enter account number"
                  value={newBank.account_number}
                  onChange={(e) =>
                    setNewBank({ ...newBank, account_number: e.target.value })
                  }
                  className="bg-card focus:ring-primary w-full rounded-lg border border-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowBankModal(false)}
                  className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveBank}
                  disabled={!newBank.account_number || !newBank.bank_code || loading}
                  className="flex-1 rounded-lg disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : selectedBank ? 'Save Changes' : 'Add Bank'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
