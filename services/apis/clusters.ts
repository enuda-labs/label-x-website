import { AxiosClient } from '@/utils/axios'
import { AssignedCluster } from '@/types/clusters'
import { AvailableTask } from '@/types/availableTasks'



const axiosClient = new AxiosClient()

// --- API Calls ---
export const fetchAssignedClusters = async (): Promise<AssignedCluster[]> => {
  const response = await axiosClient.get<{ status: string; data: AssignedCluster[] }>(
    '/tasks/my-assigned-clusters/'
  )
  return response.data.data
}


export const fetchPendingClusters = async (): Promise<AssignedCluster[]> => {
  const response = await axiosClient.get<{ status: string; data: AssignedCluster[] }>(
    '/tasks/cluster/user/pending/'
  )
  return response.data.data
}


export const fetchTaskById = async (taskId: string | number) => {
  const response = await axiosClient.get(`/tasks/cluster/${taskId}/`)
  return response.data // full task details
}



export const fetchAvailableTasks = async (): Promise<AvailableTask[]> => {
  const response = await axiosClient.get<{
    status: string
    data: { available_tasks: AvailableTask[]; total_available: number; assigned_clusters: number }
  }>('/tasks/available-for-annotation/')
  return response.data.data.available_tasks
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


export const fetchTaskProgress = async (clusterId: number) => {
  try {
    const response = await axiosClient.get(`/tasks/cluster/${clusterId}/progress/`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching task progress:', error)
    throw error
  }
}
