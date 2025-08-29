import { AxiosClient } from '@/utils/axios'
import { AssignedCluster } from '@/types/clusters'
import { AvailableTask } from '@/types/availableTasks'
import { TaskProgress } from '@/types/taskProgress'
import { ApiResponse } from '@/types/ApiResponse'

const axiosClient = new AxiosClient()

// --- API Calls ---
export const fetchAssignedClusters = async (): Promise<AssignedCluster[]> => {
  const response = await axiosClient.get<{
    status: string
    data: AssignedCluster[]
  }>('/tasks/my-assigned-clusters/')
  return response.data.data
}

export const fetchPendingClusters = async (): Promise<AssignedCluster[]> => {
  const response = await axiosClient.get<{
    status: string
    data: AssignedCluster[]
  }>('/tasks/cluster/user/pending/')
  return response.data.data
}

export const fetchTaskById = async (taskId: string | number) => {
  const response = await axiosClient.get(`/tasks/cluster/${taskId}/`)
  return response.data // full task details
}

export const fetchAvailableTasks = async (): Promise<AvailableTask[]> => {
  const response = await axiosClient.get<{
    status: string
    data: {
      available_tasks: AvailableTask[]
      total_available: number
      assigned_clusters: number
    }
  }>('/tasks/available-for-annotation/')
  return response.data.data.available_tasks
}

export const assignTaskToMe = async (clusterId: number) => {
  const response = await axiosClient.post('/tasks/cluster/assign-to-self/', {
    cluster: clusterId,
  })
  return response.data
}

// --- Annotate API ---
export const annotateTask = async (payload: {
  task_id: number
  labels: string[]
  notes?: string
}): Promise<ApiResponse> => {
  const response = await axiosClient.post('/tasks/annotate/', payload)
  return response.data as ApiResponse
}

type AnnotateRequest = {
  task_id: number
  labels: string[]
  notes?: string
}

export const annotateMissingAsset = async (
  taskId: number,
  notes?: string
): Promise<ApiResponse> => {
  const trimmed = notes?.trim()
  const labels = trimmed ? [trimmed, 'MISSING_ASSET'] : ['MISSING_ASSET']

  const payload: AnnotateRequest = { task_id: taskId, labels }
  const response = await axiosClient.post('/tasks/annotate/', payload)

  return response.data as ApiResponse
}

export const fetchTaskProgress = async (
  clusterId: number
): Promise<TaskProgress> => {
  const response = await axiosClient.get<{ data: TaskProgress }>(
    `/tasks/cluster/${clusterId}/progress/`
  )
  return response.data.data
}
