import { AxiosClient } from '@/utils/axios'

const axiosClient = new AxiosClient()

interface CreateProjectPayload {
  name: string
  description: string
}
interface ProjectResponse {
  status: string
  projects: Project[]
}

export interface ProjectMember {
  id: number
  user: {
    id: number
    username: string
    email: string
  }
  role: string
  joined_at: string
}

export interface ProjectInvitation {
  id: number
  email: string
  role: string
  invited_by: {
    id: number
    username: string
    email: string
  }
  token: string
  status: string
  created_at: string
  expires_at: string
}

export interface Project {
  id: number
  name: string
  created_by: number
  description: string
  created_at: string
  members: { id: number; username: string; email: string }[]
  team_members?: ProjectMember[]
  pending_invitations?: ProjectInvitation[]
  status: string
  task_stats: {
    total_tasks: number
    completed_tasks: number
    pending_review: number
    in_progress: number
    completion_percentage: number
  }
}

export interface StatsResponse {
  status: string
  data: {
    pending_projects: number
    total_tasks: number
    completed_tasks: number
    completion_percentage: number
    total_projects: number
  }
}

interface User {
  id: number
  last_login: string
  username: string
  pid: string
  email: string
  password: string
  is_active: boolean
  is_reviewer: boolean
  is_admin: boolean
  date_joined: string
  last_activity: string
  is_staff: boolean
  is_superuser: boolean
  project: null | number
  groups: string[]
  user_permissions: string[]
}

interface Plan {
  id: number
  name: string
  monthly_fee: string
  included_data_points: number
  included_requests: number
  cost_per_extra_request: string
  stripe_monthly_plan_id: string
}

interface UserSubscription {
  id: number
  requests_used: number
  subscribed_at: string
  expires_at: string
  renews_at: string
  user: User
  plan: Plan
}

interface UserDataPoints {
  id: number
  used_data_points: number
  data_points_balance: number
  created_at: string
  updated_at: string
  user: number
}
export interface ProjectLog {
  id: number
  created_at: string
  updated_at: string
  message: string
  project: Project
  task: null | number
}

export interface ProjectData {
  id: number
  project_logs: ProjectLog[]
  user_subscription: UserSubscription
  user_data_points: UserDataPoints
  task_stats: { completion_percentage: 0; total_used_data_points: number }
  completion_percentage: 0
  total_used_data_points: null
  name: string
  description: string
  created_at: string
  updated_at: string
  status: string
  created_by: number
}

interface PieChartData {
  completed: number
  pending: number
  in_progress: number
}

interface DailyProgress {
  date: string
  task_count: number
  total_data_points: number
  human_reviewed_count: number
}

interface AccuracyTrend {
  date: string
  average_ai_confidence: number
}

interface ProjectChartsData {
  daily_progress: DailyProgress[]
  pie_chart_data: PieChartData
  accuracy_trend: AccuracyTrend[]
}

interface ProjectChartsResponse {
  status: string
  data: ProjectChartsData
  message: string
  success: boolean
}

interface ProjectChartsData {
  daily_progress: DailyProgress[]
  pie_chart_data: PieChartData
  accuracy_trend: AccuracyTrend[]
}

interface ProjectChartsResponse {
  status: string
  data: ProjectChartsData
  message: string
  success: boolean
}

export const createProject = async (payload: CreateProjectPayload) => {
  const response = await axiosClient.post<CreateProjectPayload, Project>(
    'account/organization/project/',
    payload
  )
  return response.data
}
export const getProjects = async () => {
  const response = await axiosClient.get<ProjectResponse>(
    'account/projects/list/'
  )
  return response.data
}
export const getProject = async (projectId: number) => {
  const response = await axiosClient.get<ProjectData>(
    `account/projects/${projectId}/`
  )
  return response.data
}
export const getProjectChart = async (projectId: number, days: number) => {
  const response = await axiosClient.get<ProjectChartsResponse>(
    `account/project/chart/${projectId}/days/${days}/`
  )
  return response.data
}

interface UpdateProjectPayload {
  status?: string
  name?: string
  description?: string
}

export const updateProject = async (
  projectId: number,
  payload: UpdateProjectPayload
) => {
  const response = await axiosClient.patch<UpdateProjectPayload, ProjectData>(
    `account/projects/edit/${projectId}/`,
    payload
  )
  return response.data
}

export const getStats = async () => {
  const response = await axiosClient.get<StatsResponse>(
    'tasks/completion-stats/'
  )
  return response.data
}

// Team Access Features API Functions

export interface AddMemberPayload {
  email?: string
  user_id?: number
  role: 'owner' | 'admin' | 'member' | 'viewer'
}

export interface InviteMemberPayload {
  email: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
}

export interface UpdateMemberRolePayload {
  role: 'owner' | 'admin' | 'member' | 'viewer'
}

export interface ProjectMembersResponse {
  status: string
  members: ProjectMember[]
}

export interface ProjectInvitationsResponse {
  status: string
  invitations: ProjectInvitation[]
}

export interface ProjectMemberResponse {
  status: string
  member: ProjectMember
}

export interface ProjectInvitationResponse {
  status: string
  invitation: ProjectInvitation
}

export interface AcceptInvitationResponse {
  status: string
  message: string
  member: ProjectMember
  project: {
    id: number
    name: string
  }
}

export const listProjectMembers = async (projectId: number) => {
  const response = await axiosClient.get<ProjectMembersResponse>(
    `account/projects/${projectId}/members/`
  )
  return response.data
}

export const addProjectMember = async (
  projectId: number,
  payload: AddMemberPayload
) => {
  const response = await axiosClient.post<
    AddMemberPayload,
    ProjectMemberResponse
  >(`account/projects/${projectId}/members/add/`, payload)
  return response.data
}

export const removeProjectMember = async (
  projectId: number,
  userId: number
) => {
  const response = await axiosClient.delete(
    `account/projects/${projectId}/members/${userId}/`
  )
  return response.data
}

export const updateProjectMemberRole = async (
  projectId: number,
  userId: number,
  payload: UpdateMemberRolePayload
) => {
  const response = await axiosClient.patch<
    UpdateMemberRolePayload,
    ProjectMemberResponse
  >(`account/projects/${projectId}/members/${userId}/role/`, payload)
  return response.data
}

export const inviteProjectMember = async (
  projectId: number,
  payload: InviteMemberPayload
) => {
  const response = await axiosClient.post<
    InviteMemberPayload,
    ProjectInvitationResponse
  >(`account/projects/${projectId}/invitations/send/`, payload)
  return response.data
}

export const listProjectInvitations = async (projectId: number) => {
  const response = await axiosClient.get<ProjectInvitationsResponse>(
    `account/projects/${projectId}/invitations/`
  )
  return response.data
}

export const cancelProjectInvitation = async (
  projectId: number,
  invitationId: number
) => {
  const response = await axiosClient.delete(
    `account/projects/${projectId}/invitations/${invitationId}/`
  )
  return response.data
}

export const acceptProjectInvitation = async (token: string) => {
  const response = await axiosClient.post<AcceptInvitationResponse>(
    `account/projects/invitations/${token}/accept/`
  )
  return response.data
}
