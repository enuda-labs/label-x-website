'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Video,
  FileText,
  Image as ImageIcon,
  Mic,
  Download,
  Eye,
  Calendar,
  Users,
  ArrowLeft,
  Search,
  Filter,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Image from 'next/image'
import { Label, mockProjectData } from '@/constants'

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 className="h-4 w-4" />
    case 'REVIEW_NEEDED':
      return <Clock className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

const getStatusColor = (
  status: string
): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch (status) {
    case 'COMPLETED':
      return 'default'
    case 'REVIEW_NEEDED':
      return 'secondary'
    default:
      return 'destructive'
  }
}

const getResponseTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'video':
      return <Video className="h-5 w-5" />
    case 'text':
      return <FileText className="h-5 w-5" />
    case 'image':
      return <ImageIcon className="h-5 w-5" />
    case 'audio':
      return <Mic className="h-5 w-5" />
    default:
      return <FileText className="h-5 w-5" />
  }
}

const ProjectReviews = () => {
  const { id: projectId } = useParams()
  console.log(projectId)
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLabeler, setSelectedLabeler] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const project = mockProjectData[Number(projectId)]

  if (!project) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-2 text-xl font-bold">Project Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The project you&#39;re looking for doesn&#39;t exist or has been
              removed.
            </p>
            <Button onClick={() => router.push('/client-dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderLabelResponse = (label: Label, inputType: string) => {
    if (label.label_file_url) {
      switch (inputType.toLowerCase()) {
        case 'video':
          return (
            <div className="space-y-2">
              <video controls className="w-full max-w-md rounded-lg border">
                <source src={label.label_file_url} type="video/webm" />
                Your browser does not support the video tag.
              </video>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(label.label_file_url!, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          )
        case 'audio':
          return (
            <div className="space-y-2">
              <audio controls className="w-full max-w-md">
                <source src={label.label_file_url} />
                Your browser does not support the audio tag.
              </audio>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(label.label_file_url!, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          )
        case 'image':
          return (
            <div className="space-y-2">
              <Image
                src={label.label_file_url}
                alt="Label response"
                width={500}
                height={400}
                className="w-full max-w-md rounded-lg border"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(label.label_file_url!, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          )
        default:
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(label.label_file_url!, '_blank')}
            >
              <Download className="mr-2 h-4 w-4" />
              Download File
            </Button>
          )
      }
    }

    if (label.label) {
      return (
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm">{label.label}</p>
        </div>
      )
    }

    return <p className="text-muted-foreground text-sm">No response provided</p>
  }

  const getLabelerById = (labellerId: number) => {
    return project.assigned_reviewers.find((r) => r.id === labellerId)
  }

  const groupLabelsByLabeler = () => {
    const grouped: Record<number, Label[]> = {}
    const filtered = project.my_labels.filter((label) => {
      const matchesSearch =
        searchQuery === '' ||
        project.tasks
          .find((t) => t.id === label.task)
          ?.serial_no.toLowerCase()
          .includes(searchQuery.toLowerCase())
      const matchesLabeler =
        selectedLabeler === 'all' || label.labeller === Number(selectedLabeler)
      return matchesSearch && matchesLabeler
    })

    filtered.forEach((label) => {
      if (!grouped[label.labeller]) {
        grouped[label.labeller] = []
      }
      grouped[label.labeller].push(label)
    })
    return grouped
  }

  const filteredTasks = project.tasks.filter((task) => {
    const matchesSearch =
      searchQuery === '' ||
      task.serial_no.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      selectedStatus === 'all' || task.processing_status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-card/50 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/client-dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <p className="text-muted-foreground">
                  Review labeler submissions and track progress
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Project Overview */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <FileText className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.tasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.tasks.filter((t) => t.human_reviewed).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reviews
              </CardTitle>
              <Eye className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.my_labels.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion</CardTitle>
              <Calendar className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.completion_percentage.toFixed(1)}%
              </div>
              <Progress
                value={project.completion_percentage}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Project Details */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Project Details</CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">
                  {project.labeller_instructions}
                </p>
              </div>
              <Badge
                variant={
                  project.status === 'in_review' ? 'secondary' : 'default'
                }
              >
                {project.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center gap-2">
                {getResponseTypeIcon(project.input_type)}
                <div>
                  <p className="text-sm font-medium">Response Type</p>
                  <p className="text-muted-foreground text-sm capitalize">
                    {project.input_type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Deadline</p>
                  <p className="text-muted-foreground text-sm">
                    {new Date(project.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Labelers</p>
                  <p className="text-muted-foreground text-sm">
                    {project.assigned_reviewers.length} assigned
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Required Reviews</p>
                  <p className="text-muted-foreground text-sm">
                    {project.labeller_per_item_count} per item
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reviews">
              Reviews ({project.my_labels.length})
            </TabsTrigger>
            <TabsTrigger value="tasks">
              Tasks ({project.tasks.length})
            </TabsTrigger>
            <TabsTrigger value="labelers">
              Labelers ({project.assigned_reviewers.length})
            </TabsTrigger>
          </TabsList>

          {/* Labeler Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                      placeholder="Search by task serial number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={selectedLabeler}
                    onValueChange={setSelectedLabeler}
                  >
                    <SelectTrigger className="w-full md:w-[200px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="All Labelers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Labelers</SelectItem>
                      {project.assigned_reviewers.map((labeler) => (
                        <SelectItem
                          key={labeler.id}
                          value={labeler.id.toString()}
                        >
                          {labeler.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reviews by Labeler */}
            <div className="grid gap-6">
              {Object.entries(groupLabelsByLabeler()).map(
                ([labellerId, labels]) => {
                  const labeler = getLabelerById(Number(labellerId))
                  if (!labeler) return null

                  return (
                    <Card key={labellerId}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="text-lg">
                                {labeler.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">
                                {labeler.username}
                              </CardTitle>
                              <p className="text-muted-foreground text-sm">
                                {labeler.email}
                              </p>
                              {labeler.domains &&
                                labeler.domains.length > 0 && (
                                  <div className="mt-2 flex gap-2">
                                    {labeler.domains.map((d, i) => (
                                      <Badge
                                        key={i}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {d.domain}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {labels.length}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              submissions
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
                          {labels.slice(0, 5).map((label) => {
                            const task = project.tasks.find(
                              (t) => t.id === label.task
                            )
                            return (
                              <div
                                key={label.id}
                                className="bg-card/50 space-y-3 rounded-lg border p-4"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">
                                      Task #{task?.serial_no}
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                      {new Date(
                                        label.created_at
                                      ).toLocaleDateString()}{' '}
                                      at{' '}
                                      {new Date(
                                        label.created_at
                                      ).toLocaleTimeString()}
                                    </p>
                                  </div>
                                  {task && (
                                    <Badge
                                      variant={getStatusColor(
                                        task.processing_status
                                      )}
                                      className="flex items-center gap-1"
                                    >
                                      {getStatusIcon(task.processing_status)}
                                      <span className="text-xs">
                                        {task.processing_status}
                                      </span>
                                    </Badge>
                                  )}
                                </div>

                                {task?.file_url && (
                                  <div>
                                    <p className="text-muted-foreground mb-2 text-xs font-medium">
                                      Original Task:
                                    </p>
                                    <Image
                                      src={task.file_url}
                                      alt="Task"
                                      width={500}
                                      height={400}
                                      className="w-full max-w-sm rounded-lg border"
                                    />
                                  </div>
                                )}

                                <div>
                                  <p className="text-muted-foreground mb-2 text-xs font-medium">
                                    Labeler Response:
                                  </p>
                                  {renderLabelResponse(
                                    label,
                                    project.input_type
                                  )}
                                </div>

                                {label.notes && (
                                  <div>
                                    <p className="text-muted-foreground mb-2 text-xs font-medium">
                                      Notes:
                                    </p>
                                    <div className="bg-muted/50 rounded p-2 text-sm">
                                      {label.notes}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                          {labels.length > 5 && (
                            <p className="text-muted-foreground py-2 text-center text-sm">
                              Showing 5 of {labels.length} submissions
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                }
              )}
            </div>
          </TabsContent>

          {/* All Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Tasks</CardTitle>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="REVIEW_NEEDED">
                        Review Needed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Serial No.</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reviewed</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.slice(0, 50).map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">
                            {task.serial_no}
                          </TableCell>
                          <TableCell>{task.task_type}</TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusColor(task.processing_status)}
                              className="flex w-fit items-center gap-1"
                            >
                              {getStatusIcon(task.processing_status)}
                              <span className="text-xs">
                                {task.processing_status}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {task.human_reviewed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(task.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredTasks.length > 50 && (
                    <p className="text-muted-foreground py-4 text-center text-sm">
                      Showing 50 of {filteredTasks.length} tasks
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Labelers Tab */}
          <TabsContent value="labelers">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {project.assigned_reviewers.map((labeler) => {
                const submissions = project.my_labels.filter(
                  (l) => l.labeller === labeler.id
                ).length
                return (
                  <Card
                    key={labeler.id}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {labeler.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">
                              {labeler.username}
                            </CardTitle>
                            <p className="text-muted-foreground text-sm">
                              {labeler.email}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={labeler.is_active ? 'default' : 'outline'}
                        >
                          {labeler.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {labeler.domains && labeler.domains.length > 0 && (
                        <div>
                          <p className="mb-2 text-sm font-medium">Expertise:</p>
                          <div className="flex flex-wrap gap-2">
                            {labeler.domains.map((d, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                              >
                                {d.domain}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Submissions:</p>
                          <p className="text-2xl font-bold">{submissions}</p>
                        </div>
                        <Progress
                          value={(submissions / project.my_labels.length) * 100}
                          className="mt-2 h-2"
                        />
                        <p className="text-muted-foreground mt-1 text-xs">
                          {(
                            (submissions / project.my_labels.length) *
                            100
                          ).toFixed(1)}
                          % of total reviews
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ProjectReviews
