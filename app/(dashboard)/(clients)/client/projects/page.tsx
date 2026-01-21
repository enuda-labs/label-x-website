'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Search, Plus } from 'lucide-react'
import DashboardLayout from '@/components/shared/dashboard-layout'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProject, getProjects } from '@/services/apis/project'
import { isAxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import StatsOverview from '@/components/project/client/stats-overview'

interface Project {
  id: number
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  progress: number
  createdAt: string
  dataPoints: number
}

const Projects = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
  })
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const queryClient = useQueryClient()
  const { data: projectsData, isPending: isQueryPending } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  // Track initial mount time for minimum loading duration
  const mountTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (mountTimeRef.current === null) {
      mountTimeRef.current = Date.now()
    }
  }, [])

  useEffect(() => {
    const minLoadingTime = 3000 // 3 seconds minimum

    const processData = () => {
      try {
        if (projectsData) {
          setProjects(
            projectsData.projects.map((project) => ({
              id: project.id,
              name: project.name,
              description: project.description,
              status: project.task_stats.completion_percentage
                ? project.task_stats.completion_percentage === 100
                  ? 'completed'
                  : 'in_progress'
                : 'pending',
              progress: project.task_stats.completion_percentage,
              createdAt: project.created_at,
              dataPoints: 10000,
            }))
          )
        } else {
          setProjects([])
        }
      } catch (error) {
        console.error('Error processing projects:', error)
        setProjects([])
      }

      // Ensure minimum loading time of 3 seconds from mount
      if (mountTimeRef.current !== null) {
        const elapsed = Date.now() - mountTimeRef.current
        const remainingTime = Math.max(0, minLoadingTime - elapsed)

        setTimeout(() => {
          setLoading(false)
        }, remainingTime)
      } else {
        setLoading(false)
      }
    }

    // Process data when query completes (not pending)
    if (!isQueryPending) {
      processData()
    }
  }, [projectsData, isQueryPending])

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  const { mutate: createMutation, isPending } = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setNewProject({ name: '', description: '' })
      setOpen(false)
      setError('')
      // Redirect to the tasks page for the newly created project
      router.push(`/client/projects/${data.id}/tasks`)
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      if (isAxiosError(err)) setError(err.response?.data.detail || err.message)
    },
  })

  return (
    <DashboardLayout title="My Projects">
      <div className="mb-6 flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div className="relative w-full md:w-64">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-white/40" />
          <Input
            placeholder="Search projects..."
            className="border-white/10 bg-white/5 pl-9 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-[#0A0A0A] text-white">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription className="text-white/60">
                Fill in the details to create a new data review project.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="mb-2 text-sm font-medium text-white">
                  Project Name
                </label>
                <Input
                  placeholder="e.g., Content Moderation Project"
                  className="border-white/10 bg-white/5 text-white"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Description
                </label>
                <Input
                  placeholder="Brief description of the project"
                  className="border-white/10 bg-white/5 text-white"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <span className="text-sm text-red-500">{error}</span>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                onClick={() => createMutation(newProject)}
                disabled={isPending}
              >
                {isPending ? 'Creating Project...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <StatsOverview />
      {/* Projects List */}
      <div className="space-y-4">
        {loading || isQueryPending ? (
          <>
            <Skeleton className="h-28 bg-white/5" />
            <Skeleton className="h-28 bg-white/5" />
            <Skeleton className="h-28 bg-white/5" />
            <Skeleton className="h-28 bg-white/5" />
          </>
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer border-white/10 bg-white/5 p-5"
              onClick={() => router.push(`/client/projects/${project.id}`)}
            >
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col justify-between md:flex-row md:items-center">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-white">
                        {project.name}
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
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-3 md:mt-0">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 h-8"
                    >
                      View Details
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <p className="mb-1 grid text-xs text-white/40">Progress</p>
                    <div className="flex items-center">
                      <Progress
                        value={project.progress}
                        className="h-2 flex-1 bg-white/10"
                      />
                      <span className="ml-2 text-xs text-white/60">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                  <div></div>
                  <div>
                    <p className="mb-1 text-xs text-white/40">Timeline</p>
                    <p className="text-sm text-white">
                      Created: {formatDate(project.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : searchQuery && projects.length > 0 ? (
          <div className="py-8 text-center">
            <p className="text-white/60">{`No projects found matching "${searchQuery}"`}</p>
          </div>
        ) : !loading && projects.length === 0 ? (
          <div className="my-20 flex items-center justify-center">
            No project has been created for this account
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}

export default Projects
