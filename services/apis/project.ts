import { AxiosClient } from '@/utils/axios';

const axiosClient = new AxiosClient();

export interface Project {
  id: number;
  name: string;
  created_by: number;
  description: string;
  created_at: string;
}

export interface StatsResponse {
  status: string;
  data: {
    total_tasks: number;
    completed_tasks: number;
    completion_percentage: number;
  };
}
export const getProjects = async () => {
  const response = await axiosClient.get<Project[]>('account/organization/project/list/');
  return response.data;
};
export const getStats = async () => {
  const response = await axiosClient.get<StatsResponse>('tasks/completion-stats/');
  return response.data;
};
