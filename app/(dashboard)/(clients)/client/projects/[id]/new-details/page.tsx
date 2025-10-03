'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Eye,
  Calendar,
  Users,
  ArrowLeft,
} from 'lucide-react'
import Image from 'next/image'
import { Label, mockProjectData } from '@/constants'
import AllLabelersReviewsTab from '@/components/project/client/labelers-reviews-tab'
import AllTasksTab from '@/components/project/client/all-tasks-tabs'
import AllLabelers from '@/components/project/client/all-labelers'
import { getResponseTypeIcon } from '@/constants/status'

const ProjectReviews = () => {
  const { id: projectId } = useParams()
  //console.log(projectId)
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
            <Button onClick={() => router.push('/client/projects')}>
              Back to Projects
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

  const groupLabelsByLabeler = (): Record<string, Label[]> => {
    const grouped: Record<string, Label[]> = {}
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
      const labellerId = String(label.labeller)
      if (!grouped[labellerId]) {
        grouped[labellerId] = []
      }
      grouped[labellerId].push(label)
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
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="container mx-auto px-2 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/client/projects')}
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
          <AllLabelersReviewsTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedLabeler={selectedLabeler}
            setSelectedLabeler={setSelectedLabeler}
            project={project}
            groupLabelsByLabeler={groupLabelsByLabeler}
            getLabelerById={getLabelerById}
            renderLabelResponse={renderLabelResponse}
          />
          {/* All Tasks Tab */}
          <AllTasksTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedStatus={selectedLabeler}
            setSelectedStatus={setSelectedStatus}
            filteredTasks={filteredTasks}
          />

          {/* Labelers Tab */}
          <AllLabelers project={project} />
        </Tabs>
      </div>
    </div>
  )
}

export default ProjectReviews
