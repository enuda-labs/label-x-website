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
