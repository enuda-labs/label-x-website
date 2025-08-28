'use client'

import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, FileText, ImageIcon, Video, Database, Clock, User, } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { AvailableTask } from '@/types/availableTasks'
import { fetchAvailableTasks, assignTaskToMe } from '@/services/apis/clusters'
import { getUserDetails } from '@/services/apis/user'



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

const AvailableTasksPage = () => {
  const [tasks, setTasks] = useState<AvailableTask[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<number | null>(null)
  const [selectedTask, setSelectedTask] = useState<AvailableTask | null>(null)


  // fetch user details
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: getUserDetails,
  })

  console.log("userData from query:", userData)

  const username = userData?.user?.username ?? "Unknown User"

  // derive role
  let role = "No role"
  if (userData?.user?.is_admin) role = "Admin"
  else if (userData?.user?.is_reviewer) role = "Reviewer"
  else role = "User"



  // Load tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true)
        const data = await fetchAvailableTasks()
        setTasks(data)
      } catch (error) {
        toast.error('Failed to fetch available tasks')
      } finally {
        setLoading(false)
      }
    }
    loadTasks()
  }, [])

  const handleAssign = async (taskId: number) => {
    setAssigning(taskId)
    try {
      await assignTaskToMe(taskId)
      toast.success('Task assigned successfully!', { description: 'Check your Assigned tab.' })
      setTasks(prev => prev.filter(t => t.id !== taskId))
      setSelectedTask(null)
    } catch (err: any) {
    const backendError =
      err?.response?.data?.error || 'Failed to assign task. Please try again.'
    toast.error(backendError)
    } finally {
      setAssigning(null)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
    <header className="bg-card/20 border-b backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Available Tasks</h1>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
            {userLoading ? "Loading..." : `${username} (${role})`}
        </div>
      </div>
    </header>


      {loading && <p className="text-muted-foreground">Loading tasks...</p>}
      {!loading && tasks.length === 0 && (
        <p className="text-muted-foreground">No available tasks right now.</p>
      )}

      <div className="grid gap-6">
        {tasks.map(task => (
          <Card
            key={task.id}
            className="shadow-soft bg-card/20 hover:shadow-glow transition-all duration-300"
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">{getTypeIcon(task.task_type)}</div>
                <div>
                  <CardTitle className="text-lg">{task.cluster_name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">#{task.serial_no}</p>
                  <Badge variant="outline" className="mt-2">{task.task_type}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Created: {new Date(task.created_at).toLocaleDateString()}
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
              Are you sure you want to assign task <b>{selectedTask?.cluster_name}</b> (
              {selectedTask?.serial_no}) to yourself?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTask(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedTask && handleAssign(selectedTask.id)}
              disabled={assigning === selectedTask?.id}
            >
              {assigning === selectedTask?.id ? 'Assigning...' : 'Yes, Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AvailableTasksPage
