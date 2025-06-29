import { AxiosClient } from '@/utils/axios';

const axiosClient = new AxiosClient();

interface ProjectResponse {
  status: string;
  projects: Project[];
}

export interface Project {
  id: number;
  name: string;
  created_by: number;
  description: string;
  created_at: string;
  members: { id: number; username: string; email: string }[];
  task_stats: {
    total_tasks: number;
    completed_tasks: number;
    pending_review: number;
    in_progress: number;
    completion_percentage: number;
  };
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
  const response = await axiosClient.get<ProjectResponse>('account/projects/list/');
  return response.data;
};
export const getStats = async () => {
  const response = await axiosClient.get<StatsResponse>('tasks/completion-stats/');
  return response.data;
};
