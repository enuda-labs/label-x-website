'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation' // ✅ import router
import { AxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/shared/dashboard-layout'
import {
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Video,
  Database,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { AvailableCluster } from '@/types/availableTasks'
import { fetchAvailableTasks, assignTaskToMe } from '@/services/apis/clusters'
import { getUserDetails } from '@/services/apis/user'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants'

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'TEXT':
      return <FileText className="h-4 w-4" />
    case 'IMAGE':
      return <ImageIcon className="h-4 w-4" />
    case 'VIDEO':
      return <Video className="h-4 w-4" />
    case 'CSV':
    case 'PDF':
      return <Database className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const AvailableClustersPage = () => {
  const [clusters, setClusters] = useState<AvailableCluster[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<number | null>(null)
  const [selectedCluster, setSelectedCluster] =
    useState<AvailableCluster | null>(null)

  const router = useRouter()

  interface BackendError {
    error?: string
    message?: string
    detail?: string
  }

  // fetch user details
  const {
    data: userData,
    isLoading: userLoading,
    error,
  } = useQuery({
    queryKey: ['user'],
    queryFn: getUserDetails,
    retry: false,
  })

  // Handle deleted user or authentication errors
  useEffect(() => {
    if (error) {
      const axiosError = error as any
      if (
        axiosError?.response?.status === 401 ||
        axiosError?.response?.status === 403
      ) {
        // User is deleted or unauthorized - clear tokens and redirect to login
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        router.push('/auth/login')
      }
    }
  }, [error, router])

  // Don't render if user data is missing or error occurred
  if (error && (error as any)?.response?.status === 401) {
    return null // Will redirect in useEffect
  }

  const username = userData?.user?.username ?? 'Unknown User'

  // derive role
  let role = 'No role'
  if (userData?.user?.is_staff) role = 'Admin'
  else if (userData?.user?.is_reviewer) role = 'Reviewer'
  else role = 'User'

  // Load clusters on mount
  useEffect(() => {
    const loadClusters = async () => {
      try {
        setLoading(true)
        const data = await fetchAvailableTasks()
        setClusters(data)
      } catch {
        toast.error('Failed to fetch available clusters')
      } finally {
        setLoading(false)
      }
    }
    loadClusters()
  }, [])

  const handleAssign = async (clusterId: number) => {
    setAssigning(clusterId)
    try {
      await assignTaskToMe(clusterId)
      toast.success('Cluster assigned successfully!', {
        description: 'Check your Assigned tab.',
      })
      setClusters((prev) => prev.filter((c) => c.id !== clusterId))
      setSelectedCluster(null)
      router.push(`/label/tasks`)
    } catch (err: unknown) {
      let backendError = 'Failed to assign cluster. Please try again.'

      if (err instanceof AxiosError) {
        const status = err.response?.status
        const data = err.response?.data

        if (data) {
          const backendData = data as BackendError
          backendError =
            backendData.error ||
            backendData.message ||
            backendData.detail ||
            JSON.stringify(data)
        }

        if (status === 400) backendError ||= 'Bad Request: Invalid input'
        else if (status === 403)
          backendError ||= 'Forbidden: You are not authorized'
        else if (status === 404)
          backendError ||= 'Not Found: Cluster does not exist'
      } else if (err instanceof Error) {
        backendError = err.message
      }

      toast.error(backendError)
    } finally {
      setAssigning(null)
    }
  }

  return (
    <DashboardLayout title="Available Projects">
      <div className="mb-4 flex items-center justify-end gap-3">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          <span suppressHydrationWarning>
            {userLoading ? 'Loading...' : `${username} (${role})`}
          </span>
        </div>
      </div>

      {loading && <p className="text-muted-foreground">Loading clusters...</p>}
      {!loading && clusters.length === 0 && (
        <p className="text-muted-foreground">
          No available clusters right now.
        </p>
      )}

      <div className="grid gap-6">
        {clusters.map((cluster) => (
          <Card
            key={cluster.id}
            className="shadow-soft bg-card/20 hover:shadow-glow transition-all duration-300"
          >
            <CardHeader>
              <div className="flex flex-col space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-lg p-2">
                        {getTypeIcon(cluster.task_type)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {cluster.name || `${cluster.task_type} Task`}
                        </CardTitle>
                        {cluster.description && (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {cluster.description}
                          </p>
                        )}
                        {cluster.labeller_instructions && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            Instructions: {cluster.labeller_instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{cluster.task_type}</Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs">
                      Task Type
                    </p>
                    <p className="text-sm">{cluster.task_type}</p>
                  </div>
                  {cluster.project_name && (
                    <div>
                      <p className="text-muted-foreground mb-1 text-xs">
                        Project
                      </p>
                      <p className="text-sm">{cluster.project_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs">
                      Input Type
                    </p>
                    <p className="text-sm capitalize">
                      {cluster.input_type === 'multiple_choice'
                        ? 'Multiple Choice'
                        : cluster.input_type === 'text'
                          ? 'Text Input'
                          : cluster.input_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs">
                      Deadline
                    </p>
                    <p className="text-sm">
                      {new Date(cluster.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs">
                      Labellers Required
                    </p>
                    <p className="text-sm">{cluster.labeller_per_item_count}</p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {cluster.choices && cluster.choices.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Label Options:</p>
                  <div className="flex flex-wrap gap-2">
                    {cluster.choices.map((choice, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {choice.label || choice.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setSelectedCluster(cluster)}
                  disabled={assigning === cluster.id}
                >
                  Assign to Me
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/label/reviewTasks/${cluster.id}`)
                  }
                >
                  Review Task
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Dialog
        open={!!selectedCluster}
        onOpenChange={() => setSelectedCluster(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to assign cluster{' '}
              <b>
                {selectedCluster?.name || `${selectedCluster?.task_type} Task`}
              </b>{' '}
              (#
              {selectedCluster?.id}) to yourself?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCluster(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedCluster && handleAssign(selectedCluster.id)
              }
              disabled={assigning === selectedCluster?.id}
            >
              {assigning === selectedCluster?.id
                ? 'Assigning...'
                : 'Yes, Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

export default AvailableClustersPage
