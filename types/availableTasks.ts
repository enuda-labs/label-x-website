// types/tasks.ts

export type AvailableTask = {
  id: number
  serial_no: string
  task_type: 'IMAGE' | 'TEXT'
  data: string
  cluster_id: number
  cluster_name: string
  priority: string
  created_at: string
  ai_confidence: number
  predicted_label: string | null
}
