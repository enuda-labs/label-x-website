'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/shared/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMutation, useQuery } from '@tanstack/react-query'
import { acceptProjectInvitation } from '@/services/apis/project'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useGlobalStore } from '@/context/store'
import Link from 'next/link'

const InvitationAcceptancePage = () => {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const { user, isLoggedIn } = useGlobalStore()
  const [invitationData, setInvitationData] = useState<any>(null)

  const { mutate: acceptInvitation, isPending: isAccepting } = useMutation({
    mutationFn: () => acceptProjectInvitation(token),
    onSuccess: (data) => {
      toast.success('Invitation accepted successfully!')
      // Redirect to project
      router.push(`/client/projects/${data.project.id}`)
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error || 'Failed to accept invitation'
      toast.error(errorMessage)
      if (errorMessage.includes('expired')) {
        setTimeout(() => {
          router.push('/client/projects')
        }, 3000)
      }
    },
  })

  useEffect(() => {
    if (!isLoggedIn) {
      // Store invitation token and redirect to login/signup
      const returnTo = `/client/projects/invitations/${token}`
      router.push(
        `/auth/login?returnTo=${encodeURIComponent(returnTo)}&invitation_token=${token}`
      )
    }
  }, [isLoggedIn, token, router])

  const handleAccept = () => {
    if (!user) {
      router.push(
        `/auth/login?returnTo=${encodeURIComponent(`/client/projects/invitations/${token}`)}&invitation_token=${token}`
      )
      return
    }
    acceptInvitation()
  }

  if (!isLoggedIn) {
    return (
      <DashboardLayout title="Accept Invitation">
        <Card className="border-white/10 bg-white/5">
          <CardContent className="py-8 text-center">
            <p className="mb-4 text-white/60">
              Please log in or sign up to accept this invitation
            </p>
            <div className="flex justify-center gap-2">
              <Button
                onClick={() =>
                  router.push(
                    `/auth/login?returnTo=${encodeURIComponent(`/client/projects/invitations/${token}`)}&invitation_token=${token}`
                  )
                }
                className="bg-primary hover:bg-primary/90"
              >
                Log In
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/auth/signup?invitation_token=${token}`)
                }
                className="border-white/10"
              >
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Accept Project Invitation">
      <div className="mx-auto max-w-2xl">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Project Invitation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              {isAccepting ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="text-primary h-12 w-12 animate-spin" />
                  <p className="text-white/60">Accepting invitation...</p>
                </div>
              ) : (
                <>
                  <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-400" />
                  <p className="mb-2 text-lg text-white">
                    You've been invited to join a project!
                  </p>
                  <p className="text-white/60">
                    Click the button below to accept the invitation and join the
                    project.
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-center gap-3">
              <Button
                onClick={handleAccept}
                disabled={isAccepting}
                className="bg-primary hover:bg-primary/90"
              >
                {isAccepting ? 'Accepting...' : 'Accept Invitation'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/client/projects')}
                disabled={isAccepting}
                className="border-white/10"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default InvitationAcceptancePage
