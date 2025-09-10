'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Users, FolderOpen, Plus, Loader } from 'lucide-react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getProjects } from '@/services/apis/project'
import {
  addReviewer,
  listReviewers,
  removeReviewer,
} from '@/services/apis/reviewers'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { isAxiosError } from 'axios'
import { adminCreateProject } from '@/services/apis/admin'

export default function AdminDashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const queryClient = useQueryClient()
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [selectedLabelers, setSelectedLabelers] = useState<number[]>([])
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
  })

  const { data: labelers = [] } = useQuery({
    queryKey: ['labelers'],
    queryFn: listReviewers,
  })

  const { data: projects, isPending: isFetchingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  const { mutate: toggleActiveMutation, isPending: isToggling } = useMutation({
    mutationFn: async () => {},
  })

  const { mutate: addReviewerMutation, isPending: isAdding } = useMutation({
    mutationFn: addReviewer,
    onSuccess: () => {
      setSelectedLabelers([])
      setSelectedProject(null)
      queryClient.invalidateQueries({ queryKey: ['labelers'] })
    },
  })

  const { mutate: removeReviewerMutation, isPending: isRemoving } = useMutation(
    {
      mutationFn: removeReviewer,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['labelers'] })
      },
    }
  )

  const { mutate: createMutation, isPending } = useMutation({
    mutationFn: adminCreateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setNewProject({ name: '', description: '' })
      setOpen(false)
      router.push('/client/projects/task')
      setError('')
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      if (isAxiosError(err)) setError(err.response?.data.detail || err.message)
    },
  })

  const currentTab = searchParams.get('tab') || 'projects'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', value)
    router.push(`?${params.toString()}`)
  }

  // useEffect(() => {
  //   if (projectsData?.projects) {
  //     setProjects(projectsData.projects)
  //   }
  // }, [projectsData])

  const handleAssignLabelers = () => {
    if (!selectedProject) return

    selectedLabelers.map((labelerId) => {
      addReviewerMutation({
        user_id: labelerId,
        group_id: selectedProject,
      })
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">
            <FolderOpen className="mr-2 h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="labelers">
            <Users className="mr-2 h-4 w-4" />
            Labelers
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <Plus className="mr-2 h-4 w-4" />
            Assignments
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="my-5 flex items-center justify-between">
            <h2 className="w-full flex-1 text-xl font-semibold">
              Project Overview
            </h2>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 md:w-auto">
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

          <div className="grid gap-4">
            {isFetchingProjects ? (
              <div className="space-y-5">
                <Skeleton className="h-28 bg-white/5" />
                <Skeleton className="h-28 bg-white/5" />
                <Skeleton className="h-28 bg-white/5" />
                <Skeleton className="h-28 bg-white/5" />
              </div>
            ) : projects?.projects.length ? (
              projects?.projects.map((project) => (
                <Card key={project.id} className="bg-card/20 p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">
                          {project.name}
                        </h3>
                        <Badge
                          variant={
                            project.status === 'completed'
                              ? 'default'
                              : 'secondary'
                          }
                          className="capitalize"
                        >
                          {project.status}
                        </Badge>
                        {/* <Badge variant="outline">{project.type}</Badge> */}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Progress: {project.task_stats.completed_tasks}/
                        {project.task_stats.total_tasks} tasks completed
                      </p>
                      {/* <p className="text-muted-foreground text-sm">
                      Assigned Labelers: {project.assignedLabelers} | Deadline:{' '}
                      {project.deadline}
                    </p> */}
                    </div>
                    <div className="flex space-x-2">
                      <Button asChild size="sm">
                        <Link href={`/admin/projects/${project.id}`}>
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="bg-secondary mt-4 h-2 w-full rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${(project.task_stats.completed_tasks / project.task_stats.total_tasks) * 100}%`,
                      }}
                    />
                  </div>
                </Card>
              ))
            ) : (
              <div className="my-10">
                No project has been created yet
                <Button className="mx-5" onClick={() => setOpen(true)}>
                  Create Now
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Labelers Tab */}
        <TabsContent value="labelers" className="space-y-6">
          <div className="my-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Labeler Management</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Labeler
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completed Tasks</TableHead>
                  {/* <TableHead>Accuracy</TableHead> */}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labelers.map((labeler) => (
                  <TableRow key={labeler.id}>
                    <TableCell className="font-medium">
                      {labeler.username}
                    </TableCell>
                    <TableCell>{labeler.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={labeler.is_active ? 'default' : 'secondary'}
                      >
                        {labeler.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{labeler.completed_clusters}</TableCell>
                    {/* <TableCell>{'labeler.accuracy'}%</TableCell> */}
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeReviewerMutation(labeler.id)}
                        >
                          {isRemoving ? <Loader size="sm" /> : 'Remove'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActiveMutation()}
                        >
                          {isToggling ? (
                            <Loader size="sm" />
                          ) : labeler.is_active ? (
                            'Deactivate'
                          ) : (
                            'Activate'
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Assign Labelers to Projects
            </h2>
          </div>

          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project-select">Select Project</Label>
                <Select
                  onValueChange={(value) => setSelectedProject(Number(value))}
                  value={selectedProject?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.projects.map((project) => (
                      <SelectItem
                        key={project.id}
                        value={project.id.toString()}
                      >
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Select Labelers to Assign</Label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {labelers
                    .filter((l) => l.is_active)
                    .map((labeler) => (
                      <Card key={labeler.id} className="p-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`labeler-${labeler.id}`}
                            checked={selectedLabelers.includes(labeler.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLabelers([
                                  ...selectedLabelers,
                                  labeler.id,
                                ])
                              } else {
                                setSelectedLabelers(
                                  selectedLabelers.filter(
                                    (id) => id !== labeler.id
                                  )
                                )
                              }
                            }}
                            className="cursor-pointer rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`labeler-${labeler.id}`}
                              className="cursor-pointer font-medium"
                            >
                              {labeler.username}
                            </label>
                            <p className="text-muted-foreground text-sm">
                              {labeler.email}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {/* Accuracy: {labeler.}% | */}
                              Assigned Tasks: {labeler.assigned_clusters.length}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>

              <Button
                onClick={handleAssignLabelers}
                disabled={
                  selectedLabelers.length === 0 || !selectedProject || isAdding
                }
              >
                {isAdding ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Assign Selected Labelers'
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
