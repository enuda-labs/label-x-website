import { AxiosClient } from '@/utils/axios'

const axiosClient = new AxiosClient()

export const listReviewersDomains = async () => {
  const response = await axiosClient.get<Domains[]>('/reviewer/domains/')
  return response.data
}
export const listReviewers = async () => {
  const response = await axiosClient.get<Reviewer[]>('/account/reviewers/')
  return response.data
}

export const addReviewer = async (payload: AddReviewerPayload) => {
  const response = await axiosClient.post<
    AddReviewerPayload,
    { detail: string }
  >('/account/make-reviewer/', payload)
  return response.data
}

export const removeReviewer = async (id: number) => {
  const response = await axiosClient.post(`/account/remove-reviewer/`, {
    user_id: id,
  })
  return response.data
}

interface Choice {
  id: number
  option_text: string
  cluster: number
}

interface AssignedCluster {
  id: number
  choices: Choice[]
  input_type: string
  labeller_instructions: string
  deadline: string // ISO date string
  labeller_per_item_count: number
  task_type: 'IMAGE' | 'TEXT'
  annotation_method: string
  created_at: string // ISO datetime string
  updated_at: string // ISO datetime string
  status: string
  project: number
  created_by: number
  assigned_reviewers: number[]
}

export interface Reviewer {
  id: number
  username: string
  email: string
  is_active: boolean
  assigned_clusters: AssignedCluster[]
  completed_clusters: number
}

interface AddReviewerPayload {
  user_id: number
  group_id: number
}

export interface Domains {
  id: number
  domain: string
  created_at: string
  updated_at: string
}
