import { Label, Reviewer, TaskItem } from './constants'

interface TaskFile {
  file_url: string
  file_name: string
  file_size_bytes: number
  file_type: string
}
export interface TaskData {
  file?: TaskFile
  data?: string
}

interface LabellingChoice {
  id: string
  option_text: string
  cluster: string
}
export interface TaskClusterItem {
  id: string
  choices: LabellingChoice[]
  name: string
  description: string
  input_type: 'multiple_choice' | 'text_input'
  labeller_instructions: string
  deadline: string
  labeller_per_item_count: number
  task_type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'CSV' | 'PDF'
  annotation_method: 'manual'
  created_at: string
  updated_at: string
  status: 'assigned' | 'pending' | 'completed'
  completion_percentage: number
  project: number
  created_by: number
  labeler_domain: number
  assigned_reviewers: number[]
  completedItems: number
  priority: 'high' | 'medium' | 'low'
  labelling_choices: LabellingChoice[]
}

export interface TaskItemDetails
  extends Omit<TaskClusterItem, 'assigned_reviewers'> {
  tasks: TaskItem[]
  my_labels: Label[]
  assigned_reviewers: Reviewer[]
}
