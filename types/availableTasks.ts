// types/clusters.ts
export interface TaskChoice {
  id: number
  label: string
  value?: string // optional, depending on backend
}

export interface AvailableCluster {
  id: number
  choices: TaskChoice[]
  input_type: 'multiple_choice' | 'text' | string
  labeller_instructions: string
  deadline: string
  labeller_per_item_count: number
  task_type: 'IMAGE' | 'TEXT' | 'VIDEO' | 'PDF' | 'CSV'
  annotation_method: string
  created_at: string
  updated_at: string
  status: 'pending' | 'completed' | 'in_progress' | string
  project: number
  created_by: number
  assigned_reviewers: number[]
  name?: string
  description?: string
  project_name?: string
}
