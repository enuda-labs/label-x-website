'use client'

import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Clock,
  FileText,
  Video,
  Database,
  ChevronRight,
  User,
  ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  fetchAssignedClusters,
  fetchTaskProgress,
} from '@/services/apis/clusters'
import { AssignedCluster } from '@/types/clusters'
import { getUserDetails } from '@/services/apis/user'
import { TaskProgress } from '@/types/taskProgress'

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



const LabelerDashboard = () => {
  const [clusters, setClusters] = useState<
    (AssignedCluster & { progress?: TaskProgress | null })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    const loadClusters = async () => {
      try {
        setLoading(true)
        const data = await fetchAssignedClusters()

        // fetch progress for each cluster
        const enriched = await Promise.all(
          data.map(async (cluster) => {
            try {
              const progress = await fetchTaskProgress(cluster.id)
              return { ...cluster, progress }
            } catch {
              return { ...cluster, progress: null }
            }
          })
        )

        setClusters(enriched)
      } catch {
        setError('Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }

    loadClusters()
  }, [])

  return (
    <div className="min-h-screen">
      <header className="bg-card/20 border-b backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Labeler Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span suppressHydrationWarning>
                  {userLoading ? 'Loading...' : `${username} (${role})`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Your Assigned Tasks</h1>
          <p className="text-muted-foreground">
            Complete your labeling tasks to help improve AI and machine learning
            models
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Active Tasks */}
          <Card className="bg-card/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <FileText className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{clusters.length}</p>
                  <p className="text-muted-foreground text-sm">Active Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="bg-card/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-success/10 rounded-lg p-2">
                  <Clock className="text-success h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {clusters.reduce(
                      (acc, c) => acc + (c.tasks_count - c.pending_tasks),
                      0
                    )}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Items Completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remaining */}
          <Card className="bg-card/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-warning/10 rounded-lg p-2">
                  <Database className="text-warning h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {clusters.reduce((acc, c) => acc + c.pending_tasks, 0)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Items Remaining
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Progress */}
          <Card className="bg-card/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/10 rounded-lg p-2">
                  <ChevronRight className="text-secondary h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {clusters.length > 0
                      ? Math.round(
                          (clusters.reduce(
                            (acc, c) => acc + (c.tasks_count - c.pending_tasks),
                            0
                          ) /
                            clusters.reduce(
                              (acc, c) => acc + c.tasks_count,
                              0
                            )) *
                            100
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Overall Progress
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Current Tasks</h2>

          {loading && <p>Loading tasks...</p>}
          {error && <p className="text-red-500">{error}</p>}

          <div className="grid gap-6">
            {clusters.slice(0, 3).map((task) => (
              <Card
                key={task.id}
                className="shadow-soft bg-card/20 hover:shadow-glow transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 rounded-lg p-2">
                        {getTypeIcon(task.task_type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {task.project_name}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {task.labeller_instructions}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {task.progress
                          ? `${task.progress.completed_tasks}/${task.progress.total_tasks}`
                          : `${task.tasks_count - task.pending_tasks}/${task.tasks_count}`}{' '}
                        items
                      </span>
                    </div>
                    <Progress
                      value={
                        task.progress
                          ? task.progress.completion_percentage
                          : ((task.tasks_count - task.pending_tasks) /
                              task.tasks_count) *
                            100
                      }
                      className="h-2"
                    />
                  </div>


                  <div>
                    <p className="mb-2 text-sm font-medium">Label Options:</p>
                    <div className="flex flex-wrap gap-2">
                    {task.choices?.length
  ? task.choices.map((choice, index) => (
      <Badge key={index} variant="outline" className="text-xs">
        {choice.option_text}
      </Badge>
    ))
  : task.input_type === 'text_input' && (
      <Badge variant="outline" className="text-xs">
        Text Input
      </Badge>
    )}

                      {task.input_type === 'text_input' && (
                        <Badge variant="outline" className="text-xs">
                          Text Input
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  {/* Footer */}
  <div className="flex items-center justify-between pt-2">
    <div className="text-muted-foreground text-sm">
      <Clock className="mr-1 inline h-4 w-4" />
      Due:{' '}
      {new Date(task.progress?.deadline || task.deadline).toLocaleDateString()}
    </div>

    <Link href={`/label/${task.id}`}>
  <Button variant="default">
    {task.pending_tasks === 0
      ? "Review"
      : task.pending_tasks < task.tasks_count
      ? "Continue Labeling"
      : "Start Labeling"}
    <ChevronRight className="ml-2 h-4 w-4" />
  </Button>
</Link>

  </div>

                </CardContent>
              </Card>
            ))}
          </div>

          <Link href="/label/tasks" className="flex items-end justify-end">
            <Button>View All Task</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default LabelerDashboard
