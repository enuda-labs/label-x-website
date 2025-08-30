export interface AssignedCluster {
  id: number
  input_type: string
  task_type: 'TEXT' | 'IMAGE' | 'VIDEO'
  annotation_method: string
  project: number
  project_name: string
  deadline: string
  labeller_per_item_count: number
  labeller_instructions: string
  tasks_count: number
  pending_tasks: number
choices?: Choice[]
  // add this if backend includes it
  status?: 'pending' | 'in_progress' | 'completed' | string
}
