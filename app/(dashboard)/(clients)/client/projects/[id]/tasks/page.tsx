'use client'
import DashboardLayout from '@/components/shared/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { getProject } from '@/services/apis/project'
import { exportToCSV, listTasksClusterInProject } from '@/services/apis/task'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

const ProjectTasks = () => {
  const { id }: { id: string } = useParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: project, isPending } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(Number(id)),
  })

  const { data: clusters = [], isPending: loading } = useQuery({
    queryKey: ['projectClusters', id],
    queryFn: () => listTasksClusterInProject(id),
  })

  const exportMutation = useMutation({
    mutationFn: exportToCSV,
    onSuccess: (response) => {
      console.log('response', response)
      toast('Export Successful')
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'tasks-export.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
    onError: () => {
      toast('Failed to export data')
    },
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-400/20 text-yellow-400'
      case 'in_progress':
        return 'bg-blue-400/20 text-blue-400'
      case 'completed':
        return 'bg-green-400/20 text-green-400'
      default:
        return 'bg-white/10 text-white/60'
    }
  }

  const filteredClusters = clusters.filter((cluster) =>
    JSON.stringify(cluster).toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isPending) {
    return (
      <DashboardLayout title="Project Tasks">
        <div className="space-y-4">
          <Skeleton className="h-40 bg-white/5" />
          <Skeleton className="h-40 bg-white/5" />
          <Skeleton className="h-40 bg-white/5" />
        </div>
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout title="Project Not Found">
        <div className="py-8 text-center">
          <p className="text-white/60">Project not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={`${project.name} Tasks`}>
      <div className="mb-6 flex flex-col items-start justify-between space-y-4">
        <div className="mb-6 flex w-full flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
          <div className="relative w-full md:w-64">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-white/40" />
            <Input
              placeholder="Search tasks..."
              className="border-white/10 bg-white/5 pl-9 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 w-full md:w-auto"
            onClick={() => router.push(`/client/projects/${id}/tasks/new`)}
          >
            <Plus className="mr-1 h-4 w-4" />
            New Task
          </Button>
        </div>
        <div className="w-full space-y-4">
          {loading ? (
            <>
              <Skeleton className="h-28 bg-white/5" />
              <Skeleton className="h-28 bg-white/5" />
              <Skeleton className="h-28 bg-white/5" />
              <Skeleton className="h-28 bg-white/5" />
            </>
          ) : filteredClusters.length > 0 ? (
            filteredClusters.map((cluster) => (
              <Card
                key={cluster.id}
                className="cursor-pointer border-white/10 bg-white/5 p-5"
                // onClick={() => router.push(`/client/projects/${cluster.id}`)}
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col justify-between md:flex-row md:items-center">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-white">
                          {cluster.task_type} Task
                        </h3>
                        <span
                          className={`ml-3 rounded-full px-2 py-1 text-xs ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status
                            .replace('_', ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-white/60">
                        {cluster.labeller_instructions}
                      </p>
                    </div>

                    {/* <div className="mt-3 md:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-primary h-8 border-white/10"
                      >
                        View Details
                      </Button>
                    </div> */}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                      <p className="mb-1 grid text-xs text-white/40">
                        Assigned Reviewers
                      </p>
                      <div className="flex items-center">
                        {cluster.assigned_reviewers.length}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-white/40">Created on</p>
                      <p className="text-sm text-white">
                        {formatDate(cluster.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-white/40">Deadline</p>
                      <p className="text-sm text-white">
                        {formatDate(cluster.deadline)}
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => exportMutation.mutate(cluster.id)}
                        disabled={exportMutation.isPending}
                      >
                        {exportMutation.isPending
                          ? 'Exporting...'
                          : 'Export Labels'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : clusters.length ? (
            <div className="py-8 text-center">
              <p className="text-white/60">{`No projects found matching "{searchQuery}"`}</p>
            </div>
          ) : (
            <div className="my-20 flex items-center justify-center">
              No task has been created for this project
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ProjectTasks
