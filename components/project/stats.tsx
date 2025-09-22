import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ProjectData } from '@/services/apis/project'
import { Activity, Database, TrendingUp, Clock } from 'lucide-react'

interface ProjectStatsProps {
  project: ProjectData
}

export const ProjectStats = ({ project }: ProjectStatsProps) => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/70">
            Progress
          </CardTitle>
          <Activity className="h-4 w-4 text-white/40" />
        </CardHeader>
        <CardContent>
          <div className="mb-2 text-2xl font-bold text-white">
            {project.task_stats.completion_percentage}%
          </div>
          <Progress
            value={project.task_stats.completion_percentage}
            className="h-2 bg-white/10"
          />
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/70">
            Data Points
          </CardTitle>
          <Database className="h-4 w-4 text-white/40" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {project.task_stats.total_used_data_points?.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-white/50">Total processed</p>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/70">
            Status
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-white/40" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white capitalize">
            {project.status.replace('_', ' ')}
          </div>
          <p className="mt-1 text-xs text-white/50">Current state</p>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/70">
            Days Active
          </CardTitle>
          <Clock className="h-4 w-4 text-white/40" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {Math.ceil(
              (new Date().getTime() - new Date(project.created_at).getTime()) /
                (1000 * 60 * 60 * 24)
            )}
          </div>
          <p className="mt-1 text-xs text-white/50">Since creation</p>
        </CardContent>
      </Card>
    </div>
  )
}
