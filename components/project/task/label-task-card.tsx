import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TaskClusterItem } from '@/type'
import {
  Clock,
  FileText,
  Video,
  Database,
  ChevronRight,
  ImageIcon,
  Calendar,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
} from 'lucide-react'
import Link from 'next/link'

export const TaskCard = ({ task }: { task: TaskClusterItem }) => {
  const progressPercentage =
    (task.completedItems / task.labeller_per_item_count) * 100

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
        return <AlertCircle className="h-4 w-4" />
      case 'pending':
        return <PlayCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'text-yellow-600'
      case 'pending':
        return 'text-orange-600'
      case 'completed':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className="shadow-soft bg-card/20 hover:shadow-glow transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              {getTypeIcon(task.task_type)}
            </div>
            <div>
              <CardTitle className="text-lg">{task.name}</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                {task.labeller_instructions}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div
                  className={`flex items-center gap-1 text-xs ${getStatusColor(task.status)}`}
                >
                  {getStatusIcon(task.status)}
                  <span className="capitalize">{task.status}</span>
                </div>
                <Badge
                  variant={getPriorityColor(task.priority)}
                  className="text-xs font-medium uppercase"
                >
                  {task.priority}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span>Progress</span>
            <span>
              {task.completedItems} / {task.labeller_per_item_count} items
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-muted-foreground mt-1 text-xs">
            {progressPercentage.toFixed(1)}% complete
          </div>
        </div>

        {/* Label Options */}
        <div>
          <p className="mb-2 text-sm font-medium">Label Options:</p>
          <div className="flex flex-wrap gap-2">
            {task.labelling_choices.slice(0, 3).map((choice, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {choice.option_text}
              </Badge>
            ))}
            {task.labelling_choices.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{task.labelling_choices.length - 3} more
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
        <div className="flex items-center justify-between pt-2">
          <div className="text-muted-foreground flex flex-col gap-1 text-xs">
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              Due: {new Date(task.deadline).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              Created: {new Date(task.created_at).toLocaleDateString()}
            </div>
          </div>
          <Link href={`/label/${task.id}`}>
            <Button
              variant={task.status === 'completed' ? 'outline' : 'default'}
              size="sm"
            >
              {task.status === 'completed'
                ? 'View Results'
                : 'Continue Labeling'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
