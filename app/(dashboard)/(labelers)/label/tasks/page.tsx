'use client'

import React, { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  User,
  Search,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TaskCard } from '@/components/project/task/label-task-card'
import { mockTasks } from '@/constants/temp'
import { Skeleton } from '@/components/ui/skeleton'

const ProjectsContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const currentTab = searchParams.get('task') || 'assigned'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('task', value)
    router.push(`?${params.toString()}`)
  }

  const filteredTasks = React.useMemo(() => {
    return mockTasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.labeller_instructions
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      const matchesPriority =
        priorityFilter === 'all' || task.priority === priorityFilter
      const matchesType = typeFilter === 'all' || task.task_type === typeFilter

      return matchesSearch && matchesPriority && matchesType
    })
  }, [searchTerm, priorityFilter, typeFilter])

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter((task) => task.status === status)
  }

  const getTaskCounts = () => {
    return {
      assigned: mockTasks.filter((t) => t.status === 'assigned').length,
      pending: mockTasks.filter((t) => t.status === 'pending').length,
      completed: mockTasks.filter((t) => t.status === 'completed').length,
    }
  }

  const taskCounts = getTaskCounts()

  return (
    <div className="min-h-screen">
      <header className="bg-card/20 border-b backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">All Projects</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                John Labeler
              </div>
            </div>
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

        {/* Filters */}
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
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
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

        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
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
              {getTasksByStatus('assigned').length === 0 ? (
                <Card className="bg-card/20 p-8 text-center">
                  <AlertCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-medium">
                    No assigned tasks
                  </h3>
                  <p className="text-muted-foreground">
                    You have no assigned tasks at the moment.
                  </p>
                </Card>
              ) : (
                getTasksByStatus('assigned').map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <div className="grid gap-6">
              {getTasksByStatus('pending').length === 0 ? (
                <Card className="p-8 bg-card/20 text-center">
                  <PlayCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-medium">No pending tasks</h3>
                  <p className="text-muted-foreground">
                    You have no pending tasks at the moment.
                  </p>
                </Card>
              ) : (
                getTasksByStatus('pending').map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <div className="grid gap-6">
              {getTasksByStatus('completed').length === 0 ? (
                <Card className="bg-card/20 p-8 text-center">
                  <CheckCircle2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-medium">
                    No completed tasks
                  </h3>
                  <p className="text-muted-foreground">
                    You haven&#39;t completed any tasks yet.
                  </p>
                </Card>
              ) : (
                getTasksByStatus('completed').map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
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
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            {/* Title */}
            <div className="mb-8">
              <Skeleton className="mb-2 h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-full md:w-[180px]" />
              <Skeleton className="h-10 w-full md:w-[180px]" />
            </div>

            {/* Tabs*/}
            <div className="space-y-6">
              <Skeleton className="h-10 w-full lg:w-[400px]" />

              {/* Task Cards */}
              <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-card/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-64" />
                            <div className="flex gap-2">
                              <Skeleton className="h-5 w-16" />
                              <Skeleton className="h-5 w-12" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-14" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                        <Skeleton className="h-9 w-32" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  )
}

export default LabelerProjectsPage
