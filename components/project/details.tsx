import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, Clock, Plus } from 'lucide-react'
import { ProjectCharts } from './charts'
import { ProjectLogs } from './logs'
import DashboardLayout from '../shared/dashboard-layout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProject, updateProject } from '@/services/apis/project'
import { ProjectStats } from './stats'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'

const ProjectDetail = ({ id }: { id: number }) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: project, isPending } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
  })

  const { mutate: updateStatus } = useMutation({
    mutationFn: (status: string) => updateProject(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      toast.success('Project status updated successfully')
    },
    onError: () => {
      toast.error('Failed to update project status')
    },
  })

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
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (isPending) {
    return (
      <DashboardLayout title="Project Details">
        <div className="space-y-6">
          <Skeleton className="h-32 bg-white/5" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Skeleton className="h-40 bg-white/5" />
            <Skeleton className="h-40 bg-white/5" />
            <Skeleton className="h-40 bg-white/5" />
          </div>
          <Skeleton className="h-96 bg-white/5" />
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
    <DashboardLayout title={project.name}>
      <Card className="mb-6 border-white/10 bg-white/5 p-6">
        <div className="flex flex-col justify-between md:flex-row md:items-center">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center">
                <h2 className="mr-3 text-2xl font-bold text-white">
                  {project.name}
                </h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge
                      className={`${getStatusColor(project.status)} cursor-pointer`}
                    >
                      {project.status
                        .replace('_', ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => updateStatus('pending')}>
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateStatus('in_progress')}
                    >
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateStatus('completed')}>
                      Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="mb-4 text-white/70">{project.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-white/60">
                <div className="flex items-center">
                  <CalendarDays className="mr-1 h-4 w-4" />
                  Created: {formatDate(project.created_at)}
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {formatDate(
                    new Date(
                      new Date(project.created_at).setFullYear(
                        new Date(project.created_at).getFullYear() + 1
                      )
                    ).toISOString()
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2 md:mt-0">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 h-8"
                onClick={() =>
                  router.push(`/client/projects/${project.id}/tasks/new`)
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-primary h-8 border-white/10"
                onClick={() =>
                  router.push(`/client/projects/${project.id}/tasks`)
                }
              >
                View Tasks
              </Button>
            </div>
          </div>
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Update Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => updateStatus('pending')}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus('in_progress')}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus('completed')}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </Card>

      <ProjectStats project={project} />
      <ProjectCharts projectId={project.id} />
      <ProjectLogs logs={project.project_logs} />
    </DashboardLayout>
  )
}

export default ProjectDetail
