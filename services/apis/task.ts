import {
  InputType,
  LabellingChoice,
} from '@/components/project/task/task-configurations'
import { AxiosClient } from '@/utils/axios'
import { ApiResponse } from './user'
import { SystemCosts } from '@/app/(dashboard)/(clients)/client/projects/[id]/tasks/new/datapoint-cost'
import { TaskData, TaskClusterItem, TaskItemDetails } from '@/type'

const axiosClient = new AxiosClient()

export const fetchAssignedTasks = async () => {
  const response = await axiosClient.get<RawTask[]>('/tasks/assigned-task')
  return response.data
}

export const fetchReviewTasks = async () => {
  const response = await axiosClient.get<ReviewTask[]>('/tasks/review-needed/')
  return response.data
}

export const assignTask = async (taskId: string) => {
  const response = await axiosClient.post<
    { task_id: string },
    { status: string; message: string }
  >('tasks/assign-to-me/', {
    task_id: taskId,
  })
  return response.data
}

export const fetchPendingReviews = async () => {
  const response = await axiosClient.get<ReviewTask[]>(
    '/tasks/my-pending-reviews/'
  )
  return response.data
}

export const fetchTasks = async () => {
  const response = await axiosClient.get<Task[]>('/tasks/my-tasks/')
  return response.data
}

export const fetchTask = async (taskId: string) => {
  const response = await axiosClient.get<fetchTaskResponse>(
    `/tasks/status/${taskId}/`
  )
  return response.data
}

export const assignReviewers = async ({
  id,
  reviewer_ids,
}: {
  id: number
  reviewer_ids: number[]
}) => {
  const response = await axiosClient.post<{ reviewer_ids: number[] }>(
    `/tasks/cluster/${id}/assign-reviewers/`,
    { reviewer_ids }
  )
  return response.data
}

export const removeReviewers = async ({
  id,
  reviewer_ids,
}: {
  id: number
  reviewer_ids: number[]
}) => {
  const response = await axiosClient.post<{ reviewer_ids: number[] }>(
    `/tasks/cluster/${id}/remove-reviewers/`,
    { reviewer_ids }
  )
  return response.data
}

export const submitReview = async (payload: Task[]) => {
  const response = await axiosClient.post<Task[]>(
    '/tasks/submit-review',
    payload
  )
  return response.data
}

export const completeReview = async (taskId: string) => {
  const response = await axiosClient.post<
    { task_id: string },
    { status: string; message: string }
  >('/tasks/review/complete/', {
    task_id: taskId,
  })
  return response.data
}

export const createTaskCluster = async (payload: TaskClusterPayload) => {
  const response = await axiosClient.post('/tasks/cluster/', payload)
  return response.data
}

export const listTasksClusterInProject = async (projectId: string) => {
  const response = await axiosClient.get<TaskClusterItem[]>(
    `/tasks/project/${projectId}/clusters/`
  )
  return response.data
}

export const clusterLabelsSummary = async (clusterId: string) => {
  const response = await axiosClient.get<TaskItemDetails>(
    `/tasks/cluster/${clusterId}/`
  )
  return response.data
}

export const exportToCSV = async (id: string) => {
  const response = await axiosClient.get<string>(
    `/tasks/cluster/${id}/export-to-csv/`
  )
  return response.data
}
export const getCostBreakdown = async () => {
  const response = await axiosClient.get<ApiResponse<SystemCosts>>(
    `/system/cost-settings/`
  )
  return response.data
}

export type ReviewTask = {
  task_type: string
  id: string
  serial_no: string
  data?: string | null | undefined
  ai_classification: string
  confidence: number
  human_reviewed: string
  final_label: string
  requires_human_review?: string | null
  text?: string
  priority: string
  created_at: string
  predicted_label?: string | null
  processing_status: 'ASSIGNED_REVIEWER' | 'REVIEWED' | 'PENDING' | string
  assigned_to: string | null // Updated to handle string or null
  ai_output?: {
    // Updated to allow ai_output to be undefined or null
    classification: string
    confidence: number | string
    text?: string | null
  } | null
  human_review?: {
    correction: string | null
    justification: string | null
  }
}

export type Task = {
  id: string
  text: string
  task_type: 'TEXT' | 'IMAGE' | 'VIDEO'
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  assigned_to: string | null
  created_at: string
  updated_at: string
  human_reviewed: boolean
  serial_no: string
  submitted_by: string
  task_id: number
  data?: string
}

export type fetchTaskResponse = {
  status: string
  data: {
    task_id: number
    serial_no: string
    task_type: string
    processing_status: string
    human_reviewed: boolean
    ai_output: {
      text: string
      confidence: number
      human_review: {
        correction: null
        justification: null
      }
      classification: string
      requires_human_review: boolean
    }
    submitted_by: string
    assigned_to: string
    created_at: string
    updated_at: string
  }
}

export interface RawTask {
  id: number
  serial_no: string
  task_type: string
  data: string
  ai_output: {
    text: string
    classification: string
    confidence: number
    requires_human_review: boolean
    human_review: {
      correction: string | null
      justification: string | null
    }
  }
  predicted_label: string
  human_reviewed: boolean
  final_label: string | null
  processing_status: string
  assigned_to: number
  created_at: string
  updated_at: string
  priority: string
  group: number
}

interface TaskClusterPayload {
  tasks: TaskData[]
  labelling_choices: LabellingChoice[]
  input_type: InputType
  labeller_instructions: string
  deadline: string
  labeller_per_item_count: number
  task_type: 'TEXT' | 'AUDIO' | 'IMAGE' | 'VIDEO' | 'CSV' | 'PDF'
  annotation_method: 'manual'
  project: number
  labeler_domain: number
  name: string
  description: string
}
