'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'   // ✅ import router
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
  Clock,
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
  const [selectedCluster, setSelectedCluster] = useState<AvailableCluster | null>(null)

  const router = useRouter()   // ✅ initialize router

  interface BackendError {
    error?: string
    message?: string
    detail?: string
  }

  // fetch user details
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: getUserDetails,
  })

  const username = userData?.user?.username ?? 'Unknown User'

  // derive role
  let role = 'No role'
  if (userData?.user?.is_admin) role = 'Admin'
  else if (userData?.user?.is_reviewer) role = 'Reviewer'
  else role = 'User'

  const userId = userData?.user?.id;


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
        else if (status === 403) backendError ||= 'Forbidden: You are not authorized'
        else if (status === 404) backendError ||= 'Not Found: Cluster does not exist'
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
    <div className="flex items-center justify-end mb-4 gap-3">
       <div className="text-muted-foreground flex items-center gap-2 text-sm">
         <User className="h-4 w-4" />
         <span suppressHydrationWarning>
           {userLoading ? 'Loading...' : `${username} (${role})`}
         </span>
       </div>
     </div>

      {loading && <p className="text-muted-foreground">Loading clusters...</p>}
      {!loading && clusters.length === 0 && (
        <p className="text-muted-foreground">No available clusters right now.</p>
      )}

      <div className="grid gap-6">
        {clusters.map((cluster) => (
          <Card
            key={cluster.id}
            className="shadow-soft bg-card/20 hover:shadow-glow transition-all duration-300"
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  {getTypeIcon(cluster.task_type)}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {cluster.labeller_instructions}
                  </CardTitle>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Cluster #{cluster.id}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {cluster.task_type}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                Deadline: {new Date(cluster.deadline).toLocaleDateString()}
              </div>

              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                Labellers allowed: {cluster.labeller_per_item_count}
              </div>


              <div className="flex gap-3">
    {/* Show "Assign to Me" if user not assigned */}
    {!cluster.assigned_reviewers?.includes(userId) && (
      <Button
        onClick={() => setSelectedCluster(cluster)}
        disabled={assigning === cluster.id}
      >
        Assign to Me
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    )}

    {/* Show "Review Task" if user assigned */}
    {!cluster.assigned_reviewers?.includes(userId) && (
      <Button
        variant="outline"
        onClick={() => router.push(`/label/reviewTasks/${cluster.id}`)}
      >
        Review Task
      </Button>
    )}
  </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={!!selectedCluster} onOpenChange={() => setSelectedCluster(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to assign cluster{' '}
              <b>{selectedCluster?.labeller_instructions}</b> (#{selectedCluster?.id}) to
              yourself?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCluster(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedCluster && handleAssign(selectedCluster.id)}
              disabled={assigning === selectedCluster?.id}
            >
              {assigning === selectedCluster?.id ? 'Assigning...' : 'Yes, Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  </DashboardLayout>
  )
}

export default AvailableClustersPage
