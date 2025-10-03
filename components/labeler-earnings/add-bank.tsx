'use client'

import { CreditCard, Eye, Plus, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import {
  createBankAccount,
  fetchUserBanks,
  updateBankAccount,
  setPrimaryBank,
  deleteBankAccount,
} from '@/services/apis/banks'
import { BankAccountPayload, BankAccount } from '@/types/banks'
import { fetchPaystackBanks } from '@/services/apis/paystack'
import { PaystackBank } from '@/types/paystack'

export const BanksContent = () => {
  const [banks, setBanks] = useState<BankAccount[]>([])
  const [showBankModal, setShowBankModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [paystackBanks, setPaystackBanks] = useState<PaystackBank[]>([])
  const [newBank, setNewBank] = useState<BankAccountPayload>({
    bank_code: '',
    account_number: '',
    platform: 'paystack',
  })

  // Helper to extract a robust string message from various error shapes
  const getErrorMessage = (
    err: unknown,
    fallback = 'An unexpected error occurred'
  ): string => {
    if (!err) return fallback
    if (err instanceof AxiosError) {
      const data = err.response?.data
      // common server message shapes: { message: '...' } or { detail: '...' } or message as string
      const maybeMsg = data?.message ?? data?.detail ?? data
      if (typeof maybeMsg === 'string') return maybeMsg
      try {
        return JSON.stringify(maybeMsg)
      } catch {
        return err.message ?? fallback
      }
    }
    if (err instanceof Error) return err.message
    try {
      return String(err)
    } catch {
      return fallback
    }
  }

  // Fetch user's banks
  useEffect(() => {
    const loadBanks = async () => {
      try {
        const userBanks = await fetchUserBanks()
        setBanks(userBanks)
      } catch (err: unknown) {
        console.error('Error fetching user banks:', err)
        toast('Error', { description: 'Failed to fetch your banks.' })
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
    } catch (error: unknown) {
      console.error('Error fetching Paystack banks:', error)
      // Not critical; inform user
      toast('Warning', { description: 'Unable to load bank list right now.' })
    }
  }

  const openViewBankModal = async (bank: BankAccount) => {
    setSelectedBank(bank)
    setNewBank({
      account_number: bank.account_number,
      bank_code: bank.bank_code,
      platform: bank.platform,
    })
    setShowBankModal(true)

    try {
      const banks = await fetchPaystackBanks()
      setPaystackBanks(banks)
    } catch (error: unknown) {
      console.error('Error fetching Paystack banks:', error)
      toast('Warning', { description: 'Unable to load bank list right now.' })
    }
  }

  const handleSaveBank = async () => {
    if (!newBank.account_number || !newBank.bank_code) {
      toast('Validation Error', {
        description: 'Please fill in all required fields.',
      })
      return
    }

    setLoading(true)
    try {
      if (selectedBank) {
        const updated = await updateBankAccount(selectedBank.id, newBank)
        if (updated) {
          setBanks(banks.map((b) => (b.id === updated.id ? updated : b)))
          toast('Success', { description: 'Bank updated successfully!' })
        } else {
          toast('Error', { description: 'Failed to update bank.' })
        }
      } else {
        const createdBank = await createBankAccount(newBank)
        if (createdBank && createdBank.id) {
          setBanks([createdBank, ...banks])
          toast('Success', { description: 'Bank added successfully!' })
        } else {
          toast('Error', { description: 'Failed to add bank.' })
        }
      }
      setShowBankModal(false)
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to save bank.')
      toast('Error', { description: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBank = async () => {
    if (!selectedBank) return
    setLoading(true)
    try {
      await deleteBankAccount(selectedBank.id)
      setBanks(banks.filter((b) => b.id !== selectedBank.id))
      toast('Success', { description: 'Bank deleted successfully!' })
      setShowDeleteModal(false)
      setShowBankModal(false)
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to delete bank.')
      toast('Error', { description: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePrimary = async (bank: BankAccount) => {
    setLoading(true)
    try {
      const updated = await setPrimaryBank(bank.id)
      if (!updated) throw new Error('Failed to update primary bank on server')

      setBanks((prev) =>
        prev.map((b) => ({ ...b, is_primary: b.id === updated.id }))
      )
      toast('Success', { description: `${updated.bank_name} is now primary` })
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to update primary bank.')
      toast('Error', { description: msg })
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
          <Plus size={16} /> Add Bank Account
        </Button>
      </div>

      <div className="space-y-4">
        {banks.map((bank, index) => (
          <div
            key={`${bank.id}-${index}`}
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

              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                {bank.is_primary && (
                  <span className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-400">
                    Primary
                  </span>
                )}

                <Button
                  size="sm"
                  onClick={() => openViewBankModal(bank)}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <Eye size={16} />
                </Button>

                <Switch
                  checked={bank.is_primary}
                  onCheckedChange={() => handleTogglePrimary(bank)}
                  className="flex-shrink-0 cursor-pointer"
                />

                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedBank(bank)
                    setShowDeleteModal(true)
                  }}
                  variant="destructive"
                  className="flex-shrink-0"
                >
                  <Trash size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Bank Modal */}
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

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Select Bank
                </label>
                <select
                  value={newBank.bank_code}
                  onChange={(e) => {
                    const selected = paystackBanks.find(
                      (b) => b.code === e.target.value
                    )
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
                  {paystackBanks.map((bank, idx) => (
                    <option key={`${bank.code}-${idx}`} value={bank.code}>
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
                  disabled={
                    !newBank.account_number || !newBank.bank_code || loading
                  }
                  className="flex-1 rounded-lg disabled:cursor-not-allowed"
                >
                  {loading
                    ? 'Saving...'
                    : selectedBank
                      ? 'Save Changes'
                      : 'Add Bank'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBank && (
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogTitle className="text-xl font-semibold text-white">
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedBank.bank_name} (
              {selectedBank.account_number})?
            </DialogDescription>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteBank}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-500"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
