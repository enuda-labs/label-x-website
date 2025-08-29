'use client'

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  User,
  Search,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  FileText,
  Video,
  Database,
  ImageIcon,
  ChevronRight,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { fetchAssignedClusters, fetchPendingClusters } from '@/services/apis/clusters'
import { AssignedCluster } from '@/types/clusters'
import { getUserDetails } from '@/services/apis/user'

// 🔹 Extend AssignedCluster with a status field
type ClusterWithStatus = AssignedCluster & {
  status: 'assigned' | 'pending' | 'completed'
}

// 🔹 Hardcoded label categories
const HARDCODED_LABEL_CHOICES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports',
]

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

const ProjectsContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [clusters, setClusters] = useState<ClusterWithStatus[]>([])
  const [pendingClusters, setPendingClusters] = useState<ClusterWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const currentTab = searchParams.get('task') || 'assigned'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('task', value)
    router.push(`?${params.toString()}`)
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

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [assigned, pending] = await Promise.all([
          fetchAssignedClusters(),
          fetchPendingClusters(),
        ])

        // Add status dynamically
        const assignedWithStatus: ClusterWithStatus[] = assigned.map((task) => ({
          ...task,
          status: task.pending_tasks === 0 ? 'completed' : 'assigned',
        }))
        const pendingWithStatus: ClusterWithStatus[] = pending.map((task) => ({
          ...task,
          status: 'pending',
        }))

        setClusters(assignedWithStatus)
        setPendingClusters(pendingWithStatus)
      } catch (err) {
        console.error('Error fetching clusters', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredTasks = useMemo(() => {
    return clusters.filter((task) => {
      const matchesSearch =
        task.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.labeller_instructions.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === 'all' || task.task_type === typeFilter
      return matchesSearch && matchesType
    })
  }, [searchTerm, typeFilter, clusters])

  const getStatus = (task: ClusterWithStatus) => task.status

  const getTasksByStatus = (status: ClusterWithStatus['status']) => {
    return filteredTasks.filter((task) => getStatus(task) === status)
  }

  const getTaskCounts = () => {
    return {
      assigned: clusters.filter((t) => getStatus(t) === 'assigned').length,
      pending: pendingClusters.length,
      completed: clusters.filter((t) => getStatus(t) === 'completed').length,
    }
  }

  const taskCounts = getTaskCounts()

  const renderTaskCard = (task: ClusterWithStatus) => {
    const totalTasks = task.tasks_count ?? 0
    const pendingTasks = task.pending_tasks ?? 0
    const completedTasks = totalTasks - pendingTasks
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    return (
      <Card
        key={task.id}
        className="shadow-soft bg-card/20 hover:shadow-glow transition-all duration-300"
      >
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getTypeIcon(task.task_type)}
            </div>

            <div>
              <CardTitle className="text-lg">{task.project_name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {task.labeller_instructions}
              </p>

              <div className="flex items-center gap-2 mt-2 text-sm">
                {getStatus(task) === 'assigned' && (
                  <span className="flex items-center text-blue-500">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Assigned
                  </span>
                )}
                {getStatus(task) === 'pending' && (
                  <span className="flex items-center text-yellow-500">
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Pending
                  </span>
                )}
                {getStatus(task) === 'completed' && (
                  <span className="flex items-center text-green-500">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Completed
                  </span>
                )}
                <span className="text-xs text-muted-foreground">MEDIUM</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>
                {completedTasks} / {totalTasks} items
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Label Options:</p>
            <div className="flex flex-wrap gap-2">
              {HARDCODED_LABEL_CHOICES.map((choice, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {choice}
                </Badge>
              ))}
              {task.input_type === 'text_input' && (
                <Badge variant="outline" className="text-xs">
                  Text Input
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                <Clock className="h-4 w-4 inline mr-1" />
                Due: {new Date(task.deadline).toLocaleDateString()}
              </div>
            </div>
            <Link href={`/label/${task.id}`}>
              <Button variant="default">
                Continue Labeling
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="bg-card/20 border-b backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-muted-foreground">All Projects</span>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
 <span suppressHydrationWarning>
   {userLoading ? 'Loading...' : `${username} (${role})`}
 </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">All Projects</h1>
          <p className="text-muted-foreground">
            Manage and track all your labeling tasks across different projects
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="TEXT">Text</SelectItem>
              <SelectItem value="IMAGE">Image</SelectItem>
              <SelectItem value="VIDEO">Video</SelectItem>
              <SelectItem value="PDF">PDF</SelectItem>
              <SelectItem value="CSV">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="assigned" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Assigned ({taskCounts.assigned})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              Pending ({taskCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed ({taskCounts.completed})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="space-y-6">
            <div className="grid gap-6">
              {getTasksByStatus('assigned').map(renderTaskCard)}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <div className="grid gap-6">
              {pendingClusters.map(renderTaskCard)}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <div className="grid gap-6">
              {getTasksByStatus('completed').map(renderTaskCard)}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

const LabelerProjectsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <header className="bg-card/20 border-b backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </header>
          <main className="container mx-auto px-4 py-8 space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-10 w-full" />
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card/20 p-6">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-2" />
                <Skeleton className="h-2 w-full" />
              </Card>
            ))}
          </main>
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  )
}

export default LabelerProjectsPage
