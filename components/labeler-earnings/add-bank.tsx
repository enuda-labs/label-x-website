'use client'

import { CreditCard, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { fetchStripeAccount, initializeStripeAccount } from '@/services/apis/banks'

export const BanksContent = () => {
  const [stripeAccount, setStripeAccount] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadStripeAccount = async () => {
      try {
        const res = await fetchStripeAccount()
        if (res) {
          const account = res.data || res
          if (account && account.account_id) {
            setStripeAccount(account)
          } else {
            setStripeAccount(null)
          }
        } else {
          setStripeAccount(null)
        }
      } catch (err) {
        console.error('Error fetching Stripe account:', err)
        toast('Error', { description: 'Failed to load Stripe connection status.' })
      }
    }
    loadStripeAccount()
  }, [])

  const handleConnectStripe = async () => {
    setLoading(true)
    try {
      const link = await initializeStripeAccount()
      if (link) {
        window.location.href = link
      } else {
        toast('Error', { description: 'Unable to initialize Stripe connection.' })
      }
    } catch (err) {
      console.error('Error initializing Stripe:', err)
      toast('Error', { description: 'Stripe initialization failed.' })
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

        {!stripeAccount ? (
          <Button onClick={handleConnectStripe} className="flex items-center gap-2">
            <Plus size={16} /> {loading ? 'Connecting...' : 'Connect Stripe Account'}
          </Button>
        ) : (
          <span className="rounded bg-green-500/20 px-3 py-2 text-sm text-green-400">
            Stripe Connected
          </span>
        )}
      </div>

      {stripeAccount && (
        <div className="border-card bg-card hover:bg-card/70 rounded-lg border p-6 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 rounded-lg p-3">
                <CreditCard className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-medium text-white">Stripe Account</h3>
                <p className="text-sm text-gray-400">
                  Account ID: {stripeAccount.account_id}
                </p>
                <p className="text-sm text-gray-400">
                  Payouts: {stripeAccount.payouts_enabled ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-sm text-gray-400">
                  Status: {stripeAccount.status}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
