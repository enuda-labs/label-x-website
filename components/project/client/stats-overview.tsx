import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Clock, FileText, Users } from 'lucide-react'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProjects, Project } from '@/services/apis/project'

function StatsOverview() {
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  const projects: Project[] = projectsData?.projects || []

  // Calculate statistics from real data
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(
      (p) =>
        p.task_stats.completion_percentage > 0 &&
        p.task_stats.completion_percentage < 100
    ).length,
    completedProjects: projects.filter(
      (p) => p.task_stats.completion_percentage === 100
    ).length,
    totalLabelers: projects.reduce(
      (sum, p) => sum + (p.members?.length || 0),
      0
    ),
  }

  return (
    <div className="mb-8 grid gap-6 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <FileText className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProjects}</div>
          <p className="text-muted-foreground mt-1 text-xs">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeProjects}</div>
          <p className="text-muted-foreground mt-1 text-xs">
            Currently in progress
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle2 className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedProjects}</div>
          <p className="text-muted-foreground mt-1 text-xs">
            Finished projects
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Labelers</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLabelers}</div>
          <p className="text-muted-foreground mt-1 text-xs">
            Across all projects
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default StatsOverview
