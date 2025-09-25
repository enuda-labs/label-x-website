import { DataType } from '@/components/project/data-type-selection'
import {
  InputType,
  TaskConfig,
} from '@/components/project/task/task-configurations'

interface SystemCosts {
  base_cost: number
  dp_cost_per_labeller: number
  video_cost: number
  audio_cost: number
  image_cost: number
  text_cost: number
  multiple_choice_cost: number
  task_voice_cost: number
  task_text_cost: number
  task_image_cost: number
  task_video_cost: number
  task_audio_cost: number
  task_csv_cost: number
}

// Map task types to cost keys
const getTaskTypeCostKey = (dataType: DataType): keyof SystemCosts => {
  switch (dataType) {
    case 'TEXT':
      return 'text_cost'
    case 'AUDIO':
      return 'audio_cost'
    case 'IMAGE':
      return 'image_cost'
    case 'VIDEO':
      return 'video_cost'
    case 'CSV':
      return 'text_cost'
    case 'PDF':
      return 'text_cost' // PDF handled similar to text
    default:
      return 'text_cost'
  }
}

// Map input types to cost keys
const getInputTypeCostKey = (inputType: InputType): keyof SystemCosts => {
  switch (inputType) {
    case 'multiple_choice':
      return 'multiple_choice_cost'
    case 'text':
      return 'task_text_cost'
    case 'image':
      return 'task_image_cost'
    case 'voice':
      return 'task_audio_cost'
    case 'video':
      return 'task_video_cost'
    default:
      return 'task_text_cost'
  }
}

// Map data types to media cost keys
const getMediaCostKey = (dataType: DataType): keyof SystemCosts | null => {
  switch (dataType) {
    case 'AUDIO':
      return 'audio_cost'
    case 'VIDEO':
      return 'video_cost'
    case 'IMAGE':
      return 'image_cost'
    default:
      return null
  }
}

const costBreakdown = (config: TaskConfig, dataType: DataType) => {
  const systemCosts = {
    base_cost: 10,
    dp_cost_per_labeller: 10,
    video_cost: 10,
    audio_cost: 10,
    image_cost: 5,
    text_cost: 1,
    multiple_choice_cost: 1,
    task_voice_cost: 10,
    task_text_cost: 5,
    task_image_cost: 10,
    task_video_cost: 20,
    task_audio_cost: 15,
    task_csv_cost: 8,
  }
  const taskCount = config.tasks.length
  const labellersPerItem = config.labellersRequired
  const totalLabellers = taskCount * labellersPerItem

  // Base costs
  const baseCost = systemCosts.base_cost
  const dpCostPerLabeller = systemCosts.dp_cost_per_labeller

  // Task type cost (based on data type)
  const taskTypeCostKey = getTaskTypeCostKey(dataType)
  const taskTypeCost = systemCosts[taskTypeCostKey]

  // Input type cost (based on response method)
  const inputTypeCostKey = getInputTypeCostKey(config.inputType)
  const inputTypeCost = systemCosts[inputTypeCostKey]

  // Media cost (additional cost for media types)
  const mediaCostKey = getMediaCostKey(dataType)
  const mediaCost = mediaCostKey ? systemCosts[mediaCostKey] : 0

  // Calculate total cost
  const totalTaskTypeCost = taskTypeCost * taskCount
  const totalInputTypeCost = inputTypeCost * totalLabellers
  const totalLabellerCost = dpCostPerLabeller * totalLabellers
  console.log(
    baseCost,
    totalTaskTypeCost,
    totalInputTypeCost,
    totalLabellerCost
  )
  const totalCost =
    baseCost + totalTaskTypeCost + totalInputTypeCost + totalLabellerCost

  return {
    baseCost,
    taskCount,
    labellersPerItem,
    totalLabellers,
    taskTypeCost,
    inputTypeCost,
    mediaCost,
    dpCostPerLabeller,
    totalTaskTypeCost,
    totalInputTypeCost,
    totalLabellerCost,
    totalCost,
  }
}

export default costBreakdown
