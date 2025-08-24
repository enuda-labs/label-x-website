export const mockTasks: TaskItem[] = [
  {
    id: '1',
    title: 'Product Image Classification',
    tasks: [
      {
        file: {
          file_url: 'https://placehold.co/600x400.png',
          file_name: 'product1.jpg',
          file_size_bytes: 45000,
          file_type: 'jpg'
        },
        data: 'Classify this product image'
      }
    ],
    labelling_choices: [
      { option_text: 'Electronics' },
      { option_text: 'Clothing' },
      { option_text: 'Home & Garden' },
      { option_text: 'Sports' }
    ],
    input_type: 'multiple_choice',
    labeller_instructions: 'Classify product images into categories for e-commerce platform',
    deadline: '2024-08-25',
    labeller_per_item_count: 1250,
    task_type: 'IMAGE',
    annotation_method: 'manual',
    project: 1,
    completedItems: 340,
    priority: 'high',
    status: 'pending',
    created_at: '2024-08-15'
  },
  {
    id: '2',
    title: 'Customer Sentiment Analysis',
    tasks: [
      { data: 'This product is amazing! I love it so much.' }
    ],
    labelling_choices: [
      { option_text: 'Positive' },
      { option_text: 'Negative' },
      { option_text: 'Neutral' }
    ],
    input_type: 'multiple_choice',
    labeller_instructions: 'Label customer reviews as positive, negative, or neutral',
    deadline: '2024-08-30',
    labeller_per_item_count: 800,
    task_type: 'TEXT',
    annotation_method: 'manual',
    project: 1,
    completedItems: 150,
    priority: 'medium',
    status: 'assigned',
    created_at: '2024-08-10'
  },
  {
    id: '3',
    title: 'Document Information Extraction',
    tasks: [
      {
        file: {
          file_url: 'https://placehold.co/500x700.png',
          file_name: 'document1.pdf',
          file_size_bytes: 125000,
          file_type: 'pdf'
        },
        data: 'Extract key information from this document'
      }
    ],
    labelling_choices: [],
    input_type: 'text_input',
    labeller_instructions: 'Extract key information from PDF documents using text input',
    deadline: '2024-08-25',
    labeller_per_item_count: 25,
    task_type: 'PDF',
    annotation_method: 'manual',
    project: 1,
    completedItems: 0,
    priority: 'medium',
    status: 'assigned',
    created_at: '2024-08-12'
  },
  {
    id: '4',
    title: 'Video Content Moderation',
    tasks: [
      {
        file: {
          file_url: 'https://placehold.co/800x600.mp4',
          file_name: 'video1.mp4',
          file_size_bytes: 2500000,
          file_type: 'mp4'
        },
        data: 'Moderate video content'
      }
    ],
    labelling_choices: [
      { option_text: 'Safe' },
      { option_text: 'Inappropriate' },
      { option_text: 'Needs Review' }
    ],
    input_type: 'multiple_choice',
    labeller_instructions: 'Review video content for appropriate material',
    deadline: '2024-09-01',
    labeller_per_item_count: 150,
    task_type: 'VIDEO',
    annotation_method: 'manual',
    project: 2,
    completedItems: 150,
    priority: 'high',
    status: 'completed',
    created_at: '2024-08-05'
  },
  {
    id: '5',
    title: 'Medical Text Classification',
    tasks: [
      { data: 'Patient reports mild headache and fatigue.' }
    ],
    labelling_choices: [
      { option_text: 'Symptom' },
      { option_text: 'Diagnosis' },
      { option_text: 'Treatment' },
      { option_text: 'Other' }
    ],
    input_type: 'multiple_choice',
    labeller_instructions: 'Classify medical text into appropriate categories',
    deadline: '2024-09-05',
    labeller_per_item_count: 500,
    task_type: 'TEXT',
    annotation_method: 'manual',
    project: 2,
    completedItems: 500,
    priority: 'low',
    status: 'completed',
    created_at: '2024-07-20'
  },
  {
    id: '6',
    title: 'Survey Data Processing',
    tasks: [
      {
        file: {
          file_url: 'https://placehold.co/400x300.csv',
          file_name: 'survey_data.csv',
          file_size_bytes: 85000,
          file_type: 'csv'
        },
        data: 'Process survey response data'
      }
    ],
    labelling_choices: [],
    input_type: 'text_input',
    labeller_instructions: 'Extract and categorize responses from survey data',
    deadline: '2024-09-10',
    labeller_per_item_count: 300,
    task_type: 'CSV',
    annotation_method: 'manual',
    project: 3,
    completedItems: 45,
    priority: 'medium',
    status: 'pending',
    created_at: '2024-08-18'
  }
];

