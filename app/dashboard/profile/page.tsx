'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/shared/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getUserDetails,
  updateUsername,
  changePassword,
} from '@/services/apis/user'
import { getMyPlan } from '@/services/apis/subscription'
import { useRouter } from 'next/navigation'
import { TwoFactorSettings } from '@/components/profile/two-factor-settings'
import { isAxiosError } from 'axios'

interface UserProfile {
  name: string
  email: string
  company: string
  plan: string
}

const Profile = () => {
  const router = useRouter()
  const qc = useQueryClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    company: '',
    plan: '',
  })
  const [formData, setFormData] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const { data } = useQuery({
    queryKey: ['user'],
    queryFn: getUserDetails,
  })

  const { data: myPlan } = useQuery({
    queryKey: ['myPlan'],
    queryFn: getMyPlan,
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!data?.user) return
        const { username, email } = data.user

        const profileData = {
          name: username,
          email,
          company: '',
          plan: myPlan?.plan.name || '',
        }

        setProfile(profileData)

        setLoading(false)
      } catch (error) {
        console.error('Error fetching user profile:', error)
        setLoading(false)
      }
    }

    if (data?.user.id) {
      fetchProfile()

      setFormData({
        username: data.user.username,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setLoading(false)
    }
  }, [data?.user, myPlan?.plan.name])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((f) => ({ ...f, [name]: value }))
  }

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await updateUsername(formData.username)
      await qc.invalidateQueries({ queryKey: ['userDetail'] })
      toast('Username updated', {
        description: 'Your username has been successfully updated.',
      })
    } catch (err) {
      if (isAxiosError(err))
        toast('Update failed', { description: err.message || 'Check console.' })
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    if (formData.newPassword !== formData.confirmPassword) {
      toast("Passwords don't match", {
        description: 'New password and confirmation must match.',
      })
      setIsSaving(false)
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      )
      toast('Password updated', {
        description: 'Your password has been successfully changed.',
      })
      setFormData({
        username: formData.username,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      if (isAxiosError(err))
        toast('Update failed', { description: err.message || 'Check console.' })
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Profile">
        <div className="p-8">
          <Skeleton className="mb-4 h-8 w-2/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Profile">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <Card className="border-white/10 bg-white/5 p-6 md:col-span-1">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary text-xl text-white">
                {profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="mt-4 text-xl font-semibold text-white">
              {profile.name}
            </h3>
            <p className="text-center text-white/60">{profile.email}</p>
            {!profile.plan ? (
              <Button
                className="bg-primary cursor-pointer"
                onClick={() => router.push('/subscriptions')}
              >
                Subscribe now
              </Button>
            ) : (
              <div className="bg-primary/20 rounded-full px-4 py-1">
                <span className="text-primary text-sm font-medium capitalize">
                  {profile.plan} Plan
                </span>
              </div>
            )}
            <div className="mt-4 w-full border-t border-white/10 pt-4">
              <div className="mb-3 flex items-start">
                <Check className="mt-0.5 mr-2 h-4 w-4 text-green-400" />
                <span className="text-sm text-white/80">Email verified</span>
              </div>
              <div className="flex items-start">
                {myPlan ? (
                  <Check className="mt-0.5 mr-2 h-4 w-4 text-green-400" />
                ) : (
                  <X className="mt-0.5 mr-2 h-4 w-4 text-red-400" />
                )}
                <span className="text-sm text-white/80">
                  Subscription active
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-8 md:col-span-2">
          <Card className="border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-lg font-medium text-white">
              Update Username
            </h3>
            <form onSubmit={handleUsernameUpdate}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 mt-2"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Username'}
                </Button>
              </div>
            </form>
          </Card>

          <TwoFactorSettings />

          <Card className="border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-lg font-medium text-white">
              Change Password
            </h3>
            <form onSubmit={handlePasswordUpdate}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>
                <Separator className="bg-white/10" />
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 mt-6"
                disabled={isSaving}
              >
                {isSaving ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Profile
