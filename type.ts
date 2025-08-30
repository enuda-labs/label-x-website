/* eslint-disable @typescript-eslint/no-unused-vars */
interface TaskFile {
  file_url: string
  file_name: string
  file_size_bytes: number
  file_type: string
}

interface TaskData {
  file?: TaskFile
  data?: string
}

interface LabellingChoice {
  option_text: string
}

interface TaskItem {
  id: string
  title: string
  tasks: TaskData[]
  assigned_reviewers: []
  labelling_choices: LabellingChoice[]
  input_type: 'multiple_choice' | 'text_input'
  labeller_instructions: string
  deadline: string
  labeller_per_item_count: number
  task_type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'CSV' | 'PDF'
  annotation_method: 'manual'
  project: number
  completedItems: number
  priority: 'high' | 'medium' | 'low'
  status: 'assigned' | 'pending' | 'completed'
  created_at: string
}
