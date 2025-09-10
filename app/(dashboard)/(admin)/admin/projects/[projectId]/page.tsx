'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  CheckSquare,
  CheckSquare2Icon,
  Square,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { adminGetProject, Cluster } from '@/services/apis/admin'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/shared/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton'
import { listReviewers } from '@/services/apis/reviewers'
import { assignReviewers, removeReviewers } from '@/services/apis/task'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'

const ProjectManagement = () => {
  const { projectId } = useParams()
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
  const [selectedReviewers, setSelectedReviewers] = useState<number[]>([])

  const { mutate: assignReviewersMutation, isPending: isAssigning } =
    useMutation({
      mutationFn: assignReviewers,
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: ['project', projectId] })
        setIsModalOpen(false)
        setSelectedReviewers([])
        setSearchTerm('')
        setSelectedCluster(null)
      },
      onError(error) {
        toast('Error assigning reviewer', {
          description: isAxiosError(error)
            ? error.response?.data?.error || error.message
            : error.message,
        })
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

  const availableReviewers = filteredReviewers.filter(
    (reviewer) => !selectedCluster?.assigned_reviewers.includes(reviewer.id)
  )

  const handleReviewerToggle = (reviewerId: number) => {
    setSelectedReviewers((prev) =>
      prev.includes(reviewerId)
        ? prev.filter((id) => id !== reviewerId)
        : [...prev, reviewerId]
    )
  }

  const handleMarkAll = () => {
    if (!selectedCluster) return

    const requiredCount = selectedCluster.labeller_per_item_count
    const reviewersToSelect = availableReviewers
      .slice(0, requiredCount)
      .map((r) => r.id)
    setSelectedReviewers(reviewersToSelect)
  }

  const handleAssignSelected = () => {
    if (!selectedCluster || selectedReviewers.length === 0) return

    assignReviewersMutation({
      id: selectedCluster.id,
      reviewer_ids: selectedReviewers,
    })
  }

  const handleRemoveReviewer = (clusterId: number, reviewerId: number) => {
    removeReviewersMutation({ id: clusterId, reviewer_ids: [reviewerId] })
  }

  const openAddReviewerModal = (cluster: Cluster) => {
    setSelectedCluster(cluster)
    setSelectedReviewers([])
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedReviewers([])
    setSearchTerm('')
    setSelectedCluster(null)
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

  return (
    <div className="min-h-screen bg-[#1b1d20]">
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
            </div>
          </div>
        </Card>

        <Card className="border-gray-700 bg-[#1b1d20] px-5">
          <h2 className="text-2xl font-semibold text-white">Tasks</h2>

          <div className="grid gap-6">
            {project.clusters.map((cluster) => (
              <Card
                key={cluster.id}
                className="overflow-hidden border-gray-700 bg-[#2a2a2a] transition-all duration-200 hover:border-[#d45c08]/30 hover:shadow-2xl"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="mb-4 flex flex-col items-start justify-between gap-5 md:flex-row">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d45c08]/30 bg-[#d45c08]/20">
                        <div className="text-[#d45c08]">
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
                        className="border-none bg-[#d45c08] text-white hover:bg-[#d45c08]/80"
                        onClick={() => openAddReviewerModal(cluster)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Reviewer
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 transition-colors hover:border-[#d45c08] hover:bg-[#d45c08] hover:text-white"
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
                    <p className="mb-2 text-sm font-medium text-white">
                      Labeling Instructions:
                    </p>
                    <p className="text-sm text-gray-300">
                      {cluster.labeller_instructions}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-[#d45c08]" />
                      <div>
                        <p className="text-xs text-gray-400">Required Labels</p>
                        <p className="text-sm font-semibold text-white">
                          {cluster.labeller_per_item_count}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-[#d45c08]" />
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
                      <Calendar className="h-4 w-4 text-[#d45c08]" />
                      <div>
                        <p className="text-xs text-gray-400">Deadline</p>
                        <p className="text-sm font-semibold text-white">
                          {cluster.deadline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-[#d45c08]" />
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
                      <p className="mb-2 text-sm font-medium text-[#d45c08]">
                        Available Choices:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cluster.choices.map((choice) => (
                          <Badge
                            key={choice.id}
                            className="border-gray-600 bg-gray-700 text-xs text-gray-300 transition-colors hover:bg-[#d45c08] hover:text-white"
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
                          <h4 className="mb-3 text-sm font-semibold text-[#d45c08]">
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
                          <h4 className="mb-3 text-sm font-semibold text-[#d45c08]">
                            Timeline
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-[#d45c08]" />
                              <div>
                                <p className="text-gray-400">Created:</p>
                                <p className="font-medium text-white">
                                  {formatDate(cluster.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-[#d45c08]" />
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
                          <h4 className="mb-3 text-sm font-semibold text-[#d45c08]">
                            Assigned Reviewers
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {cluster.assigned_reviewers.map((reviewerId) => {
                              return (
                                <div
                                  key={reviewerId}
                                  className="group flex items-center space-x-2 rounded-full border border-[#d45c08]/30 bg-[#d45c08]/20 px-3 py-2"
                                >
                                  <User className="h-3 w-3 text-[#d45c08]" />
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
          <Dialog open={isModalOpen} onOpenChange={closeModal}>
            <DialogContent className="max-w-2xl border-gray-700 bg-[#1b1d20] text-white">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Add Reviewers to Task #{selectedCluster?.id}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Select reviewers to assign to this task. Required labelers:{' '}
                  {selectedCluster?.labeller_per_item_count}
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
                    className="w-full rounded-lg border border-gray-600 bg-[#2a2a2a] py-2 pr-4 pl-10 text-white placeholder-gray-400 transition-colors focus:border-[#d45c08] focus:outline-none"
                  />
                </div>

                {/* Mark All Button */}
                {availableReviewers.length > 0 && selectedCluster && (
                  <div className="mb-4 flex items-center justify-between rounded-lg border border-[#d45c08]/30 bg-[#d45c08]/10 p-3">
                    <div className="text-sm">
                      <span className="text-white">
                        Select first {selectedCluster.labeller_per_item_count}{' '}
                        available reviewers
                      </span>
                      <div className="text-xs text-gray-400">
                        {selectedReviewers.length} selected
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleMarkAll}
                      className="border-[#d45c08] bg-transparent text-[#d45c08] hover:bg-[#d45c08] hover:text-white"
                      disabled={
                        !!selectedCluster &&
                        selectedCluster?.assigned_reviewers.length >=
                          selectedCluster.labeller_per_item_count
                      }
                    >
                      Mark All ({selectedCluster.labeller_per_item_count})
                    </Button>
                  </div>
                )}

                {/* Reviewers List */}
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {availableReviewers.map((reviewer) => (
                    <div
                      key={reviewer.id}
                      className="flex items-center space-x-3 rounded-lg border border-gray-600 bg-[#2a2a2a] p-3 transition-colors hover:border-[#d45c08]/50 hover:bg-[#d45c08]/5"
                    >
                      <button>
                        {selectedReviewers.includes(reviewer.id) ? (
                          <CheckSquare2Icon
                            onClick={() => handleReviewerToggle(reviewer.id)}
                            className="border-gray-500 data-[state=checked]:border-[#d45c08] data-[state=checked]:bg-[#d45c08]"
                          />
                        ) : (
                          <Square
                            onClick={() => handleReviewerToggle(reviewer.id)}
                            className="border-gray-500 data-[state=checked]:border-[#d45c08] data-[state=checked]:bg-[#d45c08]"
                          />
                        )}
                      </button>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d45c08]/20">
                        <User className="h-4 w-4 text-[#d45c08]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {reviewer.username}
                        </p>
                        <p className="text-sm text-gray-400">
                          {reviewer.email}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Already Assigned Reviewers (Disabled) */}
                  {selectedCluster?.assigned_reviewers.map((reviewerId) => {
                    const reviewer = reviewers.find((r) => r.id === reviewerId)
                    if (
                      !reviewer ||
                      (!reviewer.username
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) &&
                        !reviewer.email
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) &&
                        !reviewer.id
                          .toString()
                          .includes(searchTerm.toLowerCase()))
                    )
                      return null

                    return (
                      <div
                        key={reviewer.id}
                        className="flex items-center space-x-3 rounded-lg border border-gray-600 bg-gray-700/50 p-3 opacity-60"
                      >
                        <CheckSquare className="border-gray-500" />
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-300">
                            {reviewer.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            {reviewer.email} - Already Assigned
                          </p>
                        </div>
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

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignSelected}
                  disabled={selectedReviewers.length === 0 || isAssigning}
                  className="bg-[#d45c08] text-white hover:bg-[#d45c08]/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAssigning
                    ? 'Assigning...'
                    : `Assign Selected (${selectedReviewers.length})`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    </div>
  )
}

export default ProjectManagement
