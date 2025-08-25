import { AxiosClient } from '@/utils/axios'
import { AssignedCluster } from '@/types/clusters'

const axiosClient = new AxiosClient()

// --- API Calls ---
export const fetchAssignedClusters = async (): Promise<AssignedCluster[]> => {
  const response = await axiosClient.get<{ status: string; data: AssignedCluster[] }>(
    '/tasks/my-assigned-clusters/'
  )
  return response.data.data
}

export const fetchTaskById = async (taskId: string | number) => {
  const response = await axiosClient.get(`/tasks/cluster/${taskId}/`)
  return response.data // full task details
}

// --- Annotate API (same style as above) ---
export const annotateTask = async (payload: { task_id: number; labels: string[] }) => {
  const response = await axiosClient.post('/tasks/annotate/', payload)
  return response.data
}

export const annotateMissingAsset = async (taskId: number, notes?: string) => {
  const labels = notes && notes.trim() !== '' ? [notes.trim(), 'MISSING_ASSET'] : ['MISSING_ASSET']
  const response = await axiosClient.post('/tasks/annotate/', { task_id: taskId, labels })
  return response.data
}
