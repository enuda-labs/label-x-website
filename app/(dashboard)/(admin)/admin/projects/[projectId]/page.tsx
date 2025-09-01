'use client'

import { useState } from 'react'
//import { useParams} from "next/navigation";
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  ArrowLeft,
  Calendar,
  Users,
  Eye,
  CheckCircle,
  Clock,
  Image as LucideImage,
  FileText,
  Headphones,
  Video,
  Tag,
  User,
  UserPlus,
  Search,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { adminGetProject, Cluster } from '@/services/apis/admin'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/shared/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton'
import { listReviewers } from '@/services/apis/reviewers'
import { assignReviewers, removeReviewers } from '@/services/apis/task'

// Mock data - would come from API
// const mockProjects = {
//   1: {
//     id: 1,
//     name: 'Image Classification Project',
//     type: 'IMAGE',
//     status: 'Active',
//     totalTasks: 150,
//     completedTasks: 45,
//     deadline: '2025-09-15',
//     description:
//       'Classify product images into different categories for e-commerce platform',
//     createdAt: '2025-08-10',
//     instructions:
//       'Please categorize each image into one of the following categories: Electronics, Clothing, Home & Garden, Sports, or Other. Look at the main product in the image and select the most appropriate category.',
//   },
//   2: {
//     id: 2,
//     name: 'Text Sentiment Analysis',
//     type: 'TEXT',
//     status: 'Active',
//     totalTasks: 300,
//     completedTasks: 120,
//     deadline: '2025-09-30',
//     description: 'Analyze customer reviews for sentiment classification',
//     createdAt: '2025-08-05',
//     instructions:
//       'Rate each customer review as Positive, Negative, or Neutral based on the overall sentiment expressed.',
//   },
// }

// const mockAssignments = {
//   1: [
//     {
//       labelerId: 1,
//       labelerName: 'John Doe',
//       labelerEmail: 'john@example.com',
//       assignedTasks: 50,
//       completedTasks: 18,
//       accuracy: 95,
//       status: 'Active',
//       assignedDate: '2025-08-15',
//       lastActivity: '2025-08-25',
//     },
//     {
//       labelerId: 2,
//       labelerName: 'Jane Smith',
//       labelerEmail: 'jane@example.com',
//       assignedTasks: 50,
//       completedTasks: 15,
//       accuracy: 92,
//       status: 'Active',
//       assignedDate: '2025-08-16',
//       lastActivity: '2025-08-26',
//     },
//     {
//       labelerId: 4,
//       labelerName: 'Sarah Wilson',
//       labelerEmail: 'sarah@example.com',
//       assignedTasks: 50,
//       completedTasks: 12,
//       accuracy: 97,
//       status: 'Active',
//       assignedDate: '2025-08-17',
//       lastActivity: '2025-08-24',
//     },
//   ],
//   2: [
//     {
//       labelerId: 2,
//       labelerName: 'Jane Smith',
//       labelerEmail: 'jane@example.com',
//       assignedTasks: 100,
//       completedTasks: 45,
//       accuracy: 92,
//       status: 'Active',
//       assignedDate: '2025-08-10',
//       lastActivity: '2025-08-26',
//     },
//     {
//       labelerId: 5,
//       labelerName: 'David Brown',
//       labelerEmail: 'david@example.com',
//       assignedTasks: 100,
//       completedTasks: 38,
//       accuracy: 91,
//       status: 'Active',
//       assignedDate: '2025-08-12',
//       lastActivity: '2025-08-25',
//     },
//     {
//       labelerId: 1,
//       labelerName: 'John Doe',
//       labelerEmail: 'john@example.com',
//       assignedTasks: 100,
//       completedTasks: 37,
//       accuracy: 95,
//       status: 'Active',
//       assignedDate: '2025-08-14',
//       lastActivity: '2025-08-26',
//     },
//   ],
// }

// const availableLabelers = [
//   { id: 3, name: 'Mike Johnson', email: 'mike@example.com', accuracy: 88 },
//   { id: 6, name: 'Lisa Davis', email: 'lisa@example.com', accuracy: 94 },
// ]

const ProjectManagement = () => {
  const { projectId } = useParams()
  // const [selectedLabeler, setSelectedLabeler] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data: project, isPending } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => adminGetProject(projectId as string),
  })

  const { data: reviewers = [] } = useQuery({
    queryKey: ['reviewers'],
    queryFn: listReviewers,
  })

  const [expandedCluster, setExpandedCluster] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { mutate: assignReviewersMutation } = useMutation({
    mutationFn: assignReviewers,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
  })

  const { mutate: removeReviewersMutation } = useMutation({
    mutationFn: removeReviewers,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
  })
  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'IMAGE':
        return <LucideImage className="h-4 w-4" />
      case 'TEXT':
        return <FileText className="h-4 w-4" />
      case 'AUDIO':
        return <Headphones className="h-4 w-4" />
      case 'VIDEO':
        return <Video className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const toggleExpanded = (clusterId: number) => {
    setExpandedCluster(expandedCluster === clusterId ? null : clusterId)
  }

  const filteredReviewers = reviewers.filter(
    (reviewer) =>
      reviewer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reviewer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reviewer.id.toString().includes(searchTerm.toLowerCase())
  )

  const handleAddReviewer = (clusterId: number, reviewerId: number) => {
    assignReviewersMutation({ id: clusterId, reviewer_ids: [reviewerId] })
    // setClusters((prev) =>
    //   prev.map((cluster) => {
    //     if (cluster.id === clusterId) {
    //       return {
    //         ...cluster,
    //         assigned_reviewers: [...cluster.assigned_reviewers, reviewerId],
    //       }
    //     }
    //     return cluster
    //   })
    // )
    setIsModalOpen(false)
    setSearchTerm('')
    setSelectedCluster(null)
  }

  const handleRemoveReviewer = (clusterId: number, reviewerId: number) => {
    removeReviewersMutation({ id: clusterId, reviewer_ids: [reviewerId] })
    // setClusters((prev) =>
    //   prev.map((cluster) => {
    //     if (cluster.id === clusterId) {
    //       return {
    //         ...cluster,
    //         assigned_reviewers: cluster.assigned_reviewers.filter(
    //           (id) => id !== reviewerId
    //         ),
    //       }
    //     }
    //     return cluster
    //   })
    // )
  }

  // const getReviewerById = (id: number) => {
  //   return [{ id: 1 }].find((reviewer) => reviewer.id === id)
  // }

  const openAddReviewerModal = (cluster: Cluster) => {
    setSelectedCluster(cluster)
    setIsModalOpen(true)
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
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Project Not Found</h1>
          <Button asChild>
            <Link href="/admin">Back to Admin Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  // const handleRemoveLabeler = (labelerId: number) => {
  //   console.log(`Removing labeler ${labelerId} from project ${projectId}`)
  //   //  integrate with API
  // }

  // const handleAssignLabeler = () => {
  //   if (selectedLabeler) {
  //     console.log(
  //       `Assigning labeler ${selectedLabeler} to project ${projectId}`
  //     )
  //     // integrate with API
  //     setSelectedLabeler(null)
  //   }
  // }

  return (
    <div className="min-h-screen">
      <div className="bg-card/30 supports-[backdrop-filter]:bg-bcard/40 border-b py-3 backdrop-blur">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Link>
        </Button>
        <div className="px-4 py-4">
          <div className="flex">
            <div className="flex flex-col gap-x-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <div className="mt-1 flex items-center space-x-4">
                  <Badge
                    variant={
                      project.status === 'Active' ? 'default' : 'secondary'
                    }
                  >
                    {project.status}
                  </Badge>
                  {/* <Badge variant="outline">{project.type}</Badge> */}
                  <span className="text-muted-foreground text-sm">
                    Created: {project.created_at}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="bg-card/20 p-6">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Tasks
                </p>
                <p className="text-2xl font-bold">
                  {project.cluster_stats.total_clusters}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Completed Tasks
                </p>
                <p className="text-2xl font-bold">
                  {project.cluster_stats.completed_clusters}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Pending Tasks
                </p>
                <p className="text-2xl font-bold">
                  {project.cluster_stats.total_clusters -
                    project.cluster_stats.completed_clusters}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Assigned Labelers
                </p>
                <p className="text-2xl font-bold">
                  {project.cluster_stats.assigned_labellers}
                </p>
              </div>
            </div>
          </Card>

          {/* <Card className="p-6">
            <div className="flex items-start space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Deadline
                </p>
                <p className="text-lg font-semibold">{project.deadline}</p>
              </div>
            </div>
          </Card> */}
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 p-6">
          <h3 className="mb-4 text-lg font-semibold">Project Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>
                  {Math.round(
                    (project.cluster_stats.completed_clusters /
                      project.cluster_stats.total_clusters) *
                      100
                  )}
                  %
                </span>
              </div>
              <Progress
                value={
                  (project.cluster_stats.completed_clusters /
                    project.cluster_stats.total_clusters) *
                  100
                }
                className="h-2"
              />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="text-center">
                <p className="text-primary text-2xl font-bold">
                  {
                    project.clusters.filter(
                      (cluster) => cluster.assigned_reviewers.length
                    ).length
                  }
                </p>
                <p className="text-muted-foreground text-sm">Tasks Assigned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {project.cluster_stats.tasks.completed_by_reviewer}
                </p>
                <p className="text-muted-foreground text-sm">
                  Completed by Labelers
                </p>
              </div>
              {/* <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {averageAccuracy}%
                </p>
                <p className="text-muted-foreground text-sm">
                  Average Accuracy
                </p>
              </div> */}
            </div>
          </div>
        </Card>

        <Card className="px-5">
          <h2 className="text-2xl font-semibold">Tasks</h2>
          {/* <div className="text-sm text-gray-400">
                {project.clusters.length} total tasks
              </div> */}

          <div className="grid gap-6">
            {project.clusters.map((cluster) => (
              <Card
                key={cluster.id}
                className="overflow-hidden border-gray-700 bg-[#2a2a2a] transition-all duration-200 hover:border-[#ff6900]/30 hover:shadow-2xl"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="mb-4 flex flex-col items-start justify-between gap-5 md:flex-row">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#ff6900]/30 bg-[#ff6900]/20">
                        <div className="text-[#ff6900]">
                          {getTaskTypeIcon(cluster.task_type)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Task #{cluster.id}
                        </h3>
                        <div className="mt-1 flex items-center space-x-2">
                          <Badge className={getStatusColor(cluster.status)}>
                            {cluster.status}
                          </Badge>
                          <Badge className="border-gray-600 bg-gray-700 text-xs text-gray-300">
                            {cluster.task_type}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="border-none bg-[#ff6900] text-white hover:bg-[#ff6900]/80"
                        onClick={() => openAddReviewerModal(cluster)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Reviewer
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 transition-colors hover:border-[#ff6900] hover:bg-[#ff6900] hover:text-white"
                        onClick={() => toggleExpanded(cluster.id)}
                      >
                        {expandedCluster === cluster.id
                          ? 'Less Details'
                          : 'View Details'}
                        <Eye className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mb-4 rounded-lg border border-gray-700 bg-[#1a1a1a] p-4">
                    <p className="mb-2 text-sm font-medium">
                      Labeling Instructions:
                    </p>
                    <p className="text-sm text-gray-300">
                      {cluster.labeller_instructions}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-[#ff6900]" />
                      <div>
                        <p className="text-xs text-gray-400">Required Labels</p>
                        <p className="text-sm font-semibold text-white">
                          {cluster.labeller_per_item_count}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-[#ff6900]" />
                      <div>
                        <p className="text-xs text-gray-400">
                          Assigned Reviewers
                        </p>
                        <p className="text-sm font-semibold text-white">
                          {cluster.assigned_reviewers.length}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-[#ff6900]" />
                      <div>
                        <p className="text-xs text-gray-400">Deadline</p>
                        <p className="text-sm font-semibold text-white">
                          {cluster.deadline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-[#ff6900]" />
                      <div>
                        <p className="text-xs text-gray-400">Input Type</p>
                        <p className="text-sm font-semibold text-white">
                          {cluster.input_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Choices */}
                  {cluster.choices && cluster.choices.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-medium text-[#ff6900]">
                        Available Choices:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cluster.choices.map((choice) => (
                          <Badge
                            key={choice.id}
                            className="border-gray-600 bg-gray-700 text-xs text-gray-300 transition-colors hover:bg-[#ff6900] hover:text-white"
                          >
                            {choice.option_text}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedCluster === cluster.id && (
                    <div className="mt-6 border-t border-gray-700 pt-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <h4 className="mb-3 text-sm font-semibold text-[#ff6900]">
                            Task Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Project ID:</span>
                              <span className="font-medium text-white">
                                {cluster.project}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Created By:</span>
                              <span className="font-medium text-white">
                                User #{cluster.created_by}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Annotation Method:
                              </span>
                              <span className="font-medium text-white capitalize">
                                {cluster.annotation_method}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="mb-3 text-sm font-semibold text-[#ff6900]">
                            Timeline
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-[#ff6900]" />
                              <div>
                                <p className="text-gray-400">Created:</p>
                                <p className="font-medium text-white">
                                  {formatDate(cluster.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-[#ff6900]" />
                              <div>
                                <p className="text-gray-400">Last Updated:</p>
                                <p className="font-medium text-white">
                                  {formatDate(cluster.updated_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Assigned Reviewers */}
                      {cluster.assigned_reviewers.length > 0 && (
                        <div className="mt-6">
                          <h4 className="mb-3 text-sm font-semibold text-[#ff6900]">
                            Assigned Reviewers
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {cluster.assigned_reviewers.map((reviewerId) => {
                              // const reviewer = getReviewerById(reviewerId)
                              return (
                                <div
                                  key={reviewerId}
                                  className="group flex items-center space-x-2 rounded-full border border-[#ff6900]/30 bg-[#ff6900]/20 px-3 py-2"
                                >
                                  <User className="h-3 w-3 text-[#ff6900]" />
                                  <span className="text-sm text-white">
                                    {`User #${reviewerId}`}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleRemoveReviewer(
                                        cluster.id,
                                        reviewerId
                                      )
                                    }
                                    className="ml-2 rounded-full p-1 opacity-60 transition-colors group-hover:opacity-100 hover:bg-red-500/20"
                                    title="Remove reviewer"
                                  >
                                    <X className="h-3 w-3 text-red-400 hover:text-red-300" />
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Add Reviewer Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-2xl border-gray-700 bg-[#2a2a2a] text-white">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Add Reviewer to Task #{selectedCluster?.id}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Select a reviewer to assign to this task. You can search by
                  name, email, or role.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reviewers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-600 bg-[#1a1a1a] py-2 pr-4 pl-10 text-white placeholder-gray-400 transition-colors focus:border-[#ff6900] focus:outline-none"
                  />
                </div>

                {/* Reviewers List */}
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {filteredReviewers.map((reviewer) => {
                    const isAlreadyAssigned =
                      selectedCluster?.assigned_reviewers.includes(reviewer.id)

                    return (
                      <div
                        key={reviewer.id}
                        className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                          isAlreadyAssigned
                            ? 'border-gray-600 bg-gray-700/50 opacity-60'
                            : 'border-gray-600 bg-[#1a1a1a] hover:border-[#ff6900]/50 hover:bg-[#ff6900]/5'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6900]/20">
                            <User className="h-4 w-4 text-[#ff6900]" />
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {reviewer.username}
                            </p>
                            <p className="text-sm text-gray-400">
                              {reviewer.email}
                            </p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          disabled={isAlreadyAssigned}
                          onClick={() =>
                            selectedCluster &&
                            handleAddReviewer(selectedCluster.id, reviewer.id)
                          }
                          className={`${
                            isAlreadyAssigned
                              ? 'cursor-not-allowed bg-gray-600 text-gray-400'
                              : 'bg-[#ff6900] text-white hover:bg-[#ff6900]/80'
                          }`}
                        >
                          {isAlreadyAssigned ? 'Already Assigned' : 'Assign'}
                        </Button>
                      </div>
                    )
                  })}

                  {filteredReviewers.length === 0 && (
                    <div className="py-8 text-center text-gray-400">
                      <User className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      <p>No reviewers found matching your search.</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
        {/*  {/*
        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">Labeler Assignments</TabsTrigger>
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="manage">Manage Assignments</TabsTrigger>
          </TabsList>

          //  Assignments Tab 
          <TabsContent value="assignments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Assigned Labelers</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Add Labeler</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign New Labeler</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        Select Labeler
                      </label>
                      <Select
                        onValueChange={(value) =>
                          setSelectedLabeler(Number(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a labeler" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLabelers.map((labeler) => (
                            <SelectItem
                              key={labeler.id}
                              value={labeler.id.toString()}
                            >
                              {labeler.name} ({labeler.accuracy}% accuracy)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleAssignLabeler}
                      disabled={!selectedLabeler}
                      className="w-full"
                    >
                      Assign Labeler
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Labeler</TableHead>
                    <TableHead>Assigned Tasks</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.labelerId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {assignment.labelerName}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {assignment.labelerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{assignment.assignedTasks}</TableCell>
                      <TableCell>{assignment.completedTasks}</TableCell>
                      <TableCell>
                        <div className="w-full">
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={
                                (assignment.completedTasks /
                                  assignment.assignedTasks) *
                                100
                              }
                              className="h-2 flex-1"
                            />
                            <span className="text-sm font-medium">
                              {Math.round(
                                (assignment.completedTasks /
                                  assignment.assignedTasks) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            assignment.accuracy >= 95
                              ? 'default'
                              : assignment.accuracy >= 90
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {assignment.accuracy}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="text-muted-foreground h-4 w-4" />
                          <span className="text-sm">
                            {assignment.lastActivity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleRemoveLabeler(assignment.labelerId)
                          }
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          // Details Tab 
          <TabsContent value="details" className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">
                Project Information
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium">Description</h4>
                  <p className="text-muted-foreground">{project.description}</p>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Type & Status</h4>
                  <div className="flex space-x-2">
                    <Badge variant="outline">{project.description}</Badge>
                    <Badge
                      variant={
                        project.status === 'Active' ? 'default' : 'secondary'
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">
                Labeling Instructions
              </h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm">{project.instructions}</p>
              </div>
            </Card>
          </TabsContent>

          // Manage Tab 
          <TabsContent value="manage" className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">
                Project Management Actions
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-20 flex-col">
                  <AlertCircle className="mb-2 h-6 w-6" />
                  Pause Project
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="mb-2 h-6 w-6" />
                  Bulk Assign Tasks
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Target className="mb-2 h-6 w-6" />
                  Export Results
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="mb-2 h-6 w-6" />
                  Extend Deadline
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        */}
      </div>
    </div>
  )
}

export default ProjectManagement
