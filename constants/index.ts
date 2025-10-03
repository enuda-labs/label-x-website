export const ACCESS_TOKEN_KEY = 'accessToken'
export const REFRESH_TOKEN_KEY = 'refreshToken'
export const ROLE = 'role'
export const USER_DATA = 'user_data'

// ------ TO BE DELETED ----

interface ProjectSummary {
  id: number
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'in_review' | 'completed'
  total_tasks: number
  completed_tasks: number
  total_labels: number
  assigned_labelers: number
  deadline: string
  created_at: string
  input_type: string
  completion_percentage: number
}

export const mockProjects: ProjectSummary[] = [
  {
    id: 29,
    title: 'Image Color Recognition',
    description: 'Record a video saying the most obvious color in each image',
    status: 'in_review',
    total_tasks: 150,
    completed_tasks: 45,
    total_labels: 89,
    assigned_labelers: 8,
    deadline: '2025-10-15',
    created_at: '2025-09-22',
    input_type: 'video',
    completion_percentage: 30,
  },
  {
    id: 30,
    title: 'Product Review Sentiment Analysis',
    description: 'Classify customer reviews as positive, negative, or neutral',
    status: 'in_progress',
    total_tasks: 500,
    completed_tasks: 320,
    total_labels: 640,
    assigned_labelers: 15,
    deadline: '2025-10-20',
    created_at: '2025-09-18',
    input_type: 'text',
    completion_percentage: 64,
  },
  {
    id: 31,
    title: 'Medical Image Annotation',
    description: 'Identify and mark anomalies in X-ray images',
    status: 'in_progress',
    total_tasks: 200,
    completed_tasks: 85,
    total_labels: 255,
    assigned_labelers: 5,
    deadline: '2025-11-01',
    created_at: '2025-09-20',
    input_type: 'image',
    completion_percentage: 42.5,
  },
  {
    id: 32,
    title: 'Audio Transcription Quality Check',
    description: 'Verify and correct automated transcriptions',
    status: 'completed',
    total_tasks: 100,
    completed_tasks: 100,
    total_labels: 300,
    assigned_labelers: 12,
    deadline: '2025-09-30',
    created_at: '2025-09-10',
    input_type: 'audio',
    completion_percentage: 100,
  },
  {
    id: 33,
    title: 'Vehicle Detection Dataset',
    description: 'Draw bounding boxes around vehicles in street images',
    status: 'pending',
    total_tasks: 1000,
    completed_tasks: 0,
    total_labels: 0,
    assigned_labelers: 20,
    deadline: '2025-11-30',
    created_at: '2025-10-01',
    input_type: 'image',
    completion_percentage: 0,
  },
]

export interface TaskItem {
  id: number
  serial_no: string
  task_type: string
  data: string
  human_reviewed: boolean
  processing_status: string
  created_at: string
  file_name?: string
  file_type?: string
  file_url?: string
  file_size_bytes?: number
}

export interface Reviewer {
  id: number
  username: string
  email: string
  is_active: boolean
  is_reviewer: boolean
  domains?: Array<{ domain: string }>
}

export interface Label {
  id: number
  label: string | null
  label_file_url: string | null
  created_at: string
  notes: string | null
  task: number
  labeller: number
}

export interface Project {
  id: number
  title: string
  tasks: TaskItem[]
  assigned_reviewers: Reviewer[]
  choices: string[]
  my_labels: Label[]
  input_type: string
  labeller_instructions: string
  deadline: string
  labeller_per_item_count: number
  task_type: string
  annotation_method: string
  status: string
  completion_percentage: number
  project: number
  created_at: string
}

// Extended mock data with more labelers and reviews
export const mockProjectData: Record<number, Project> = {
  29: {
    id: 29,
    title: 'Image Color Recognition',
    tasks: Array.from({ length: 150 }, (_, i) => ({
      id: i + 1,
      serial_no: Math.random().toString(36).substring(2, 8).toUpperCase(),
      task_type: 'IMAGE',
      data: '',
      human_reviewed: i % 3 === 0,
      processing_status: i % 3 === 0 ? 'COMPLETED' : 'REVIEW_NEEDED',
      created_at: new Date(
        Date.now() - Math.random() * 10000000000
      ).toISOString(),
      file_name: `image_${i + 1}`,
      file_type: 'image/png',
      file_url: `https://placehold.co/600x400/${Math.floor(Math.random() * 16777215).toString(16)}/FFFFFF.png`,
      file_size_bytes: 700 + Math.floor(Math.random() * 1000),
    })),
    assigned_reviewers: [
      {
        id: 1,
        username: 'sarah_chen',
        email: 'sarah@example.com',
        is_active: true,
        is_reviewer: true,
        domains: [{ domain: 'Computer Vision' }],
      },
      {
        id: 2,
        username: 'kyrian',
        email: 'kyrian@example.com',
        is_active: true,
        is_reviewer: true,
        domains: [{ domain: 'Customer Support / NLP' }],
      },
      {
        id: 3,
        username: 'alex_rodriguez',
        email: 'alex@example.com',
        is_active: true,
        is_reviewer: true,
        domains: [{ domain: 'Image Analysis' }],
      },
      {
        id: 4,
        username: 'maya_patel',
        email: 'maya@example.com',
        is_active: true,
        is_reviewer: true,
        domains: [],
      },
      {
        id: 5,
        username: 'david_kim',
        email: 'david@example.com',
        is_active: true,
        is_reviewer: true,
        domains: [{ domain: 'Data Annotation' }],
      },
      {
        id: 6,
        username: 'emma_wilson',
        email: 'emma@example.com',
        is_active: true,
        is_reviewer: true,
        domains: [{ domain: 'Quality Control' }],
      },
      {
        id: 7,
        username: 'james_brown',
        email: 'james@example.com',
        is_active: true,
        is_reviewer: true,
        domains: [],
      },
      {
        id: 8,
        username: 'lisa_garcia',
        email: 'lisa@example.com',
        is_active: false,
        is_reviewer: true,
        domains: [{ domain: 'Visual Recognition' }],
      },
    ],
    choices: [],
    my_labels: Array.from({ length: 89 }, (_, i) => ({
      id: i + 1,
      label: null,
      label_file_url: `https://res.cloudinary.com/dq5lhbsae/video/upload/v1758803445/sample_${i}.webm`,
      created_at: new Date(
        Date.now() - Math.random() * 5000000000
      ).toISOString(),
      notes: i % 5 === 0 ? 'Clear and accurate response' : null,
      task: (i % 150) + 1,
      labeller: (i % 8) + 1,
    })),
    input_type: 'video',
    labeller_instructions:
      'Record a video saying the most obvious color in this image',
    deadline: '2025-10-15',
    labeller_per_item_count: 20,
    task_type: 'IMAGE',
    annotation_method: 'manual',
    created_at: '2025-09-22T09:31:11.099216Z',
    status: 'in_review',
    completion_percentage: 30,
    project: 15,
  },
}
