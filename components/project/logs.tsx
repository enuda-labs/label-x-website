import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, User, FileText, Database } from 'lucide-react'
import { ProjectLog } from '@/services/apis/project'

interface ProjectLogsProps {
  logs: ProjectLog[]
}

export const ProjectLogs = ({ logs }: ProjectLogsProps) => {
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

  const getLogIcon = (message: string) => {
    if (message.includes('updated')) return <FileText className="h-4 w-4" />
    if (message.includes('completed')) return <Activity className="h-4 w-4" />
    if (message.includes('uploaded')) return <Database className="h-4 w-4" />
    return <User className="h-4 w-4" />
  }

  const getLogType = (message: string) => {
    if (message.includes('updated'))
      return { label: 'Update', color: 'bg-blue-400/20 text-blue-400' }
    if (message.includes('completed'))
      return { label: 'Completed', color: 'bg-green-400/20 text-green-400' }
    if (message.includes('uploaded'))
      return { label: 'Upload', color: 'bg-purple-400/20 text-purple-400' }
    return { label: 'Activity', color: 'bg-white/20 text-white/60' }
  }

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Activity className="mr-2 h-5 w-5" />
          Project Activity Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.length > 0 ? (
            logs.map((log) => {
              const logType = getLogType(log.message)
              return (
                <div
                  key={log.id}
                  className="flex items-start space-x-4 rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex-shrink-0 rounded-full bg-white/10 p-2 text-white/60">
                    {getLogIcon(log.message)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge className={logType.color}>{logType.label}</Badge>
                      <span className="text-xs text-white/50">
                        {formatDate(log.created_at)}
                      </span>
                    </div>

                    <p className="mb-2 text-sm text-white/80">{log.message}</p>

                    <div className="text-xs text-white/50">
                      <span>Project: {log.project.name}</span>
                      {log.project.created_by && (
                        <span className="ml-4">
                          User ID: {log.project.created_by}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-8 text-center">
              <Activity className="mx-auto mb-4 h-12 w-12 text-white/20" />
              <p className="text-white/60">No activity logs available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
