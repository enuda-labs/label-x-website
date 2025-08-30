import { AxiosClient } from '@/utils/axios'

const axiosClient = new AxiosClient()

interface CreateProjectPayload {
  name: string
  description: string
}

export interface Project {
  id: number
  name: string
  created_by: number
  description: string
  created_at: string
  members: { id: number; username: string; email: string }[]
  status: string
  cluster_stats: {
    assigned_labellers: number
    completed_clusters: number
    total_clusters: number
    tasks: {
      completed_by_ai: number
      completed_by_reviewer: number
      total_tasks: number
    }
  }
  clusters: Cluster[]
}

export interface Cluster {
  id: number
  choices: {
    id: number
    option_text: string
    cluster: number
  }[]
  input_type: string
  labeller_instructions: string
  deadline: string
  labeller_per_item_count: number
  task_type: string
  annotation_method: string
  created_at: string
  updated_at: string
  status: string
  project: number
  created_by: number
  assigned_reviewers: number[]
}

export const adminCreateProject = async (payload: CreateProjectPayload) => {
  const response = await axiosClient.post<CreateProjectPayload, Project>(
    'account/projects/create/',
    payload
  )
  return response.data
}
export const adminGetProject = async (id: string) => {
  const response = await axiosClient.get<Project>(
    `account/admin/project/${id}/`
  )
  return response.data
}
