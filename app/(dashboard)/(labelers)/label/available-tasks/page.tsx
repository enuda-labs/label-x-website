'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, FileText, ImageIcon, Video, Database, Clock } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

type AvailableTask = {
  id: number
  project_name: string
  description: string
  task_type: string
  tasks_count: number
  deadline: string
}

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

const mockTasks: AvailableTask[] = [
  {
    id: 1,
    project_name: 'E-commerce Product Labels',
    description: 'Label product categories for training AI.',
    task_type: 'IMAGE',
    tasks_count: 25,
    deadline: '2025-09-05',
  },
  {
    id: 2,
    project_name: 'Chat Moderation Dataset',
    description: 'Annotate messages for offensive content.',
    task_type: 'TEXT',
    tasks_count: 100,
    deadline: '2025-09-10',
  },
  {
    id: 3,
    project_name: 'Video Scene Segmentation',
    description: 'Mark transitions between different scenes.',
    task_type: 'VIDEO',
    tasks_count: 10,
    deadline: '2025-09-12',
  },
]

const AvailableTasksPage = () => {
  const [tasks, setTasks] = useState<AvailableTask[]>(mockTasks)
  const [assigning, setAssigning] = useState<number | null>(null)
  const [selectedTask, setSelectedTask] = useState<AvailableTask | null>(null)

  const handleAssign = (taskId: number) => {
    setAssigning(taskId)
    setTimeout(() => {
      toast('Task assigned successfully!', { description: 'Check your Assigned tab.' })
      setTasks(prev => prev.filter(t => t.id !== taskId))
      setSelectedTask(null)
      setAssigning(null)
    }, 500)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold">Available Tasks</h1>

      {tasks.length === 0 && <p className="text-muted-foreground">No available tasks right now.</p>}

      <div className="grid gap-6">
        {tasks.map(task => (
          <Card key={task.id} className="shadow-soft bg-card/20 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">{getTypeIcon(task.task_type)}</div>
                <div>
                  <CardTitle className="text-lg">{task.project_name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  <Badge variant="outline" className="mt-2">{task.task_type}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Due: {new Date(task.deadline).toLocaleDateString()}
              </div>

              <Button onClick={() => setSelectedTask(task)} disabled={assigning === task.id}>
                Assign to Me
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to assign task <b>{selectedTask?.project_name}</b> to yourself?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTask(null)}>Cancel</Button>
            <Button onClick={() => selectedTask && handleAssign(selectedTask.id)} disabled={assigning === selectedTask?.id}>
              {assigning === selectedTask?.id ? 'Assigning...' : 'Yes, Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AvailableTasksPage
