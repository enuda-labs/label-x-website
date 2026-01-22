'use client'

import React, { useState } from 'react'
import {
  Plus,
  X,
  Calendar,
  Users,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Mic,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DataType } from '../data-type-selection'
import TaskItem, { TaskItem as TaskItemType } from './task-item'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQuery } from '@tanstack/react-query'
import { listReviewersDomains } from '@/services/apis/reviewers'

export type InputType = 'multiple_choice' | 'video' | 'voice' | 'image' | 'text'

interface TaskConfigurationProps {
  dataType: DataType
  onConfigChange: (config: TaskConfig) => void
  initialConfig?: Partial<TaskConfig>
}

export interface LabellingChoice {
  option_text: string
}

export interface TaskConfig {
  taskName: string
  description: string
  labeler_domain: number
  inputType: InputType
  labellingChoices: LabellingChoice[]
  instructions: string
  deadline: Date
  labellersRequired: number
  tasks: TaskItemType[]
  language?: string // Language for subtitle annotation
}

const TaskConfiguration: React.FC<TaskConfigurationProps> = ({
  dataType,
  onConfigChange,
  initialConfig = {},
}) => {
  const [config, setConfig] = useState<TaskConfig>({
    taskName: initialConfig.taskName || '',
    description: initialConfig.description || '',
    labeler_domain: initialConfig.labeler_domain || 0,
    inputType: initialConfig.inputType || 'multiple_choice',
    labellingChoices: initialConfig.labellingChoices || [],
    instructions: initialConfig.instructions || '',
    deadline: initialConfig.deadline || new Date(),
    labellersRequired: initialConfig.labellersRequired || 15,
    tasks: initialConfig.tasks || [{ id: '1', data: '', file: null }],
    language: initialConfig.language || 'English',
  })

  const [newChoice, setNewChoice] = useState('')

  const { data: domains } = useQuery({
    queryKey: ['labeler_domains'],
    queryFn: listReviewersDomains,
  })

  const updateConfig = (updates: Partial<TaskConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onConfigChange(newConfig)
  }

  const addChoice = () => {
    if (
      newChoice.trim() &&
      !config.labellingChoices.some(
        (choice) => choice.option_text === newChoice.trim()
      )
    ) {
      const choices = [
        ...config.labellingChoices,
        { option_text: newChoice.trim() },
      ]
      updateConfig({ labellingChoices: choices })
      setNewChoice('')
    }
  }

  const removeChoice = (choiceToRemove: string) => {
    const choices = config.labellingChoices.filter(
      (choice) => choice.option_text !== choiceToRemove
    )
    updateConfig({ labellingChoices: choices })
  }

  const addTask = () => {
    const newTask: TaskItemType = {
      id: (config.tasks.length + 1).toString(),
      data: '',
      file: null,
      recordedBlob: null,
      recordedUrl: null,
      recordingType: null,
    }
    updateConfig({ tasks: [...config.tasks, newTask] })
  }

  const updateTask = (index: number, updatedTask: TaskItemType) => {
    const tasks = [...config.tasks]
    tasks[index] = updatedTask
    updateConfig({ tasks })
  }

  const removeTask = (index: number) => {
    if (config.tasks.length > 1) {
      const tasks = config.tasks.filter((_, i) => i !== index)
      updateConfig({ tasks })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addChoice()
    }
  }

  const formatDateTimeLocal = (date: Date) => {
    if (!date) return ''
    const offset = date.getTimezoneOffset() * 60000
    const localDate = new Date(date.getTime() - offset)
    return localDate.toISOString().slice(0, 16)
  }

  const getDataTypeIcon = () => {
    switch (dataType) {
      case 'IMAGE':
        return <ImageIcon className="h-4 w-4" />
      case 'VIDEO':
        return <Video className="h-4 w-4" />
      case 'AUDIO':
        return <Music className="h-4 w-4" />
      case 'PDF':
      case 'CSV':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const hasSelectedFiles = config.tasks.some((task) => task.file)
  const hasRecordings = config.tasks.some((task) => task.recordedBlob)
  const selectedFilesCount = config.tasks.filter((task) => task.file).length
  const recordingsCount = config.tasks.filter(
    (task) => task.recordedBlob
  ).length
  const totalContentCount = selectedFilesCount + recordingsCount

  return (
    <div className="space-y-6">
      <Card className="shadow-soft bg-card/20">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Task Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="task-name" className="text-sm font-medium">
              Task Name *
            </Label>
            <Input
              id="task-name"
              placeholder="e.g., Image Classification for Wildlife Detection"
              value={config.taskName}
              onChange={(e) => updateConfig({ taskName: e.target.value })}
              className="border-border focus:border-primary"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what this task involves and what kind of data needs to be labeled..."
              value={config.description}
              onChange={(e) => updateConfig({ description: e.target.value })}
              className="border-border focus:border-primary min-h-[100px] resize-none"
            />
          </div>

          {/* Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Labeler Field *
            </Label>
            <Select
              onValueChange={(value) =>
                updateConfig({ labeler_domain: Number(value) })
              }
              value={
                config.labeler_domain
                  ? config.labeler_domain.toString()
                  : undefined
              }
            >
              <SelectTrigger className="w-full" style={{ height: 44 }}>
                <SelectValue placeholder="Select Field" />
              </SelectTrigger>
              <SelectContent>
                {domains?.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id.toString()}>
                    {domain.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium">
              Language *
            </Label>
            <Select
              onValueChange={(value) => updateConfig({ language: value })}
              value={config.language || 'English'}
            >
              <SelectTrigger className="w-full" style={{ height: 44 }}>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Igbo">Igbo</SelectItem>
                <SelectItem value="Hausa">Hausa</SelectItem>
                <SelectItem value="Yoruba">Yoruba</SelectItem>
                <SelectItem value="Swahili">Swahili</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="Portuguese">Portuguese</SelectItem>
                <SelectItem value="Arabic">Arabic</SelectItem>
                <SelectItem value="Chinese">Chinese</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
                <SelectItem value="Japanese">Japanese</SelectItem>
                <SelectItem value="Korean">Korean</SelectItem>
                <SelectItem value="German">German</SelectItem>
                <SelectItem value="Italian">Italian</SelectItem>
                <SelectItem value="Russian">Russian</SelectItem>
                <SelectItem value="Turkish">Turkish</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Input Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              How should labelers respond? *
            </Label>
            <RadioGroup
              value={config.inputType}
              onValueChange={(value: InputType) =>
                updateConfig({ inputType: value })
              }
              className="flex flex-wrap gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple_choice" id="multiple_choice" />
                <Label
                  htmlFor="multiple_choice"
                  className="cursor-pointer text-sm"
                >
                  Multiple Choice (Select from options)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="text_input" />
                <Label htmlFor="text_input" className="cursor-pointer text-sm">
                  Text Input (Free text response)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video" className="cursor-pointer text-sm">
                  Video
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="voice" id="voice" />
                <Label htmlFor="voice" className="cursor-pointer text-sm">
                  Audio
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="image" />
                <Label htmlFor="image" className="cursor-pointer text-sm">
                  Image
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Labelling Choices (only for multiple choice) */}
          {config.inputType === 'multiple_choice' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Labelling Options *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a labelling option"
                  value={newChoice}
                  onChange={(e) => setNewChoice(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="border-border focus:border-primary"
                />
                <Button
                  onClick={addChoice}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {config.labellingChoices.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {config.labellingChoices.map((choice) => (
                    <Badge
                      key={choice.option_text}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1"
                    >
                      {choice.option_text}
                      <button
                        onClick={() => removeChoice(choice.option_text)}
                        className="hover:text-destructive ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Task Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Task Items *</Label>
              <Button
                onClick={addTask}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Task Item
              </Button>
            </div>

            <div className="space-y-3">
              {config.tasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  dataType={dataType}
                  onUpdate={(updatedTask) => updateTask(index, updatedTask)}
                  onRemove={() => removeTask(index)}
                  canRemove={config.tasks.length > 1}
                />
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-sm font-medium">
              Instructions for Labellers *
            </Label>
            <Textarea
              id="instructions"
              placeholder="Provide clear, detailed instructions for how labellers should approach this task..."
              value={config.instructions}
              onChange={(e) => updateConfig({ instructions: e.target.value })}
              className="border-border focus:border-primary min-h-[120px] resize-none"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Deadline */}
            <div className="space-y-2">
              <Label
                htmlFor="deadline"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Calendar className="h-4 w-4" />
                Deadline
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={formatDateTimeLocal(config.deadline) || ''}
                onChange={(e) =>
                  updateConfig({
                    deadline: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  })
                }
                className="border-border focus:border-primary"
                min={(() => {
                  const d = new Date()
                  d.setHours(d.getHours() + 24)
                  return d.toISOString().slice(0, 16)
                })()}
              />
            </div>

            {/* Labellers Required */}
            <div className="space-y-2">
              <Label
                htmlFor="labellers"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Users className="h-4 w-4" />
                Labellers per Item
              </Label>
              <Input
                id="labellers"
                value={config.labellersRequired}
                onChange={(e) =>
                  updateConfig({
                    labellersRequired: parseInt(e.target.value || '0'),
                  })
                }
                className="border-border focus:border-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Status Indicator - Shows when files are selected or recordings made */}
      {dataType !== 'TEXT' && (hasSelectedFiles || hasRecordings) && (
        <Card className="shadow-soft border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Content Ready</span>
              {getDataTypeIcon()}
            </div>

            <div className="mt-2 space-y-1 text-sm text-green-600 dark:text-green-300">
              {hasSelectedFiles && (
                <div>{selectedFilesCount} file(s) uploaded</div>
              )}
              {hasRecordings && (
                <div className="flex items-center gap-2">
                  <Mic className="h-3 w-3" />
                  {recordingsCount} recording(s) made
                </div>
              )}
              <div className="font-medium">
                Total: {totalContentCount} {dataType.toLowerCase()} item(s)
                ready
              </div>
            </div>

            <div className="mt-3 max-h-32 space-y-1 overflow-y-auto">
              {config.tasks
                .filter((task) => task.file || task.recordedBlob)
                .map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-green-600 dark:text-green-300"
                  >
                    <div className="h-1 w-1 flex-shrink-0 rounded-full bg-green-500"></div>
                    {task.file ? (
                      <>
                        <span className="flex-1 truncate">
                          {task.file.name}
                        </span>
                        <span className="flex-shrink-0 text-green-500 dark:text-green-400">
                          ({((task.file.size || 0) / 1024).toFixed(1)}KB)
                        </span>
                      </>
                    ) : task.recordedBlob ? (
                      <>
                        <span className="flex-1 truncate">
                          {task.recordingType} recording
                        </span>
                        <span className="flex-shrink-0 text-green-500 dark:text-green-400">
                          ({((task.recordedBlob.size || 0) / 1024).toFixed(1)}
                          KB)
                        </span>
                      </>
                    ) : null}
                  </div>
                ))}
            </div>

            {(dataType === 'AUDIO' || dataType === 'VIDEO') && (
              <div className="mt-3 text-xs text-green-600 dark:text-green-300">
                Note: Both file uploads and recordings are supported. Content is
                preserved even if input fields appear empty.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TaskConfiguration
