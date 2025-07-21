import { AxiosClient } from '@/utils/axios';

const axiosClient = new AxiosClient();

interface CreateProjectPayload {
  name: string;
  description: string;
}
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
  status: string;
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
    pending_projects: number;
    total_tasks: number;
    completed_tasks: number;
    completion_percentage: number;
  };
}

interface User {
  id: number;
  last_login: string;
  username: string;
  pid: string;
  email: string;
  password: string;
  is_active: boolean;
  is_reviewer: boolean;
  is_admin: boolean;
  date_joined: string;
  last_activity: string;
  is_staff: boolean;
  is_superuser: boolean;
  project: null | number;
  groups: string[];
  user_permissions: string[];
}

interface Plan {
  id: number;
  name: string;
  monthly_fee: string;
  included_data_points: number;
  included_requests: number;
  cost_per_extra_request: string;
  stripe_monthly_plan_id: string;
}

interface UserSubscription {
  id: number;
  requests_used: number;
  subscribed_at: string;
  expires_at: string;
  renews_at: string;
  user: User;
  plan: Plan;
}

interface UserDataPoints {
  id: number;
  used_data_points: number;
  data_points_balance: number;
  created_at: string;
  updated_at: string;
  user: number;
}
export interface ProjectLog {
  id: number;
  created_at: string;
  updated_at: string;
  message: string;
  project: Project;
  task: null | number;
}

export interface ProjectData {
  id: number;
  project_logs: ProjectLog[];
  user_subscription: UserSubscription;
  user_data_points: UserDataPoints;
  total_used_data_points: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: string;
  created_by: number;
}

interface PieChartData {
  completed: number;
  pending: number;
  in_progress: number;
}

interface ProjectChartsData {
  daily_progress: []; // Update with specific type when you have sample data
  pie_chart_data: PieChartData;
  accuracy_trend: []; // Update with specific type when you have sample data
}

interface ProjectChartsResponse {
  status: string;
  data: ProjectChartsData;
  message: string;
  success: boolean;
}
export const createProject = async (payload: CreateProjectPayload) => {
  const response = await axiosClient.post<CreateProjectPayload, Project>(
    'account/organization/project/',
    payload
  );
  return response.data;
};
export const getProjects = async () => {
  const response = await axiosClient.get<ProjectResponse>('account/projects/list/');
  return response.data;
};
export const getProject = async (projectId: number) => {
  const response = await axiosClient.get<ProjectData>(`account/projects/${projectId}/`);
  return response.data;
};
export const getProjectChart = async (projectId: number, days: number) => {
  const response = await axiosClient.get<ProjectChartsResponse>(
    `account/project/chart/${projectId}/days/${days}/`
  );
  return response.data;
};

interface UpdateProjectPayload {
  status?: string;
  name?: string;
  description?: string;
}

export const updateProject = async (projectId: number, payload: UpdateProjectPayload) => {
  const response = await axiosClient.patch<UpdateProjectPayload, ProjectData>(
    `account/projects/edit/${projectId}/`,
    payload
  );
  return response.data;
};

export const getStats = async () => {
  const response = await axiosClient.get<StatsResponse>('tasks/completion-stats/');
  return response.data;
};
