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

export type InputType = 'multiple_choice' | 'text'

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
  inputType: InputType
  labellingChoices: LabellingChoice[]
  instructions: string
  deadline: Date
  labellersRequired: number
  tasks: TaskItemType[]
}

const TaskConfiguration: React.FC<TaskConfigurationProps> = ({
  dataType,
  onConfigChange,
  initialConfig = {},
}) => {
  const [config, setConfig] = useState<TaskConfig>({
    taskName: initialConfig.taskName || '',
    description: initialConfig.description || '',
    inputType: initialConfig.inputType || 'multiple_choice',
    labellingChoices: initialConfig.labellingChoices || [],
    instructions: initialConfig.instructions || '',
    deadline: initialConfig.deadline || new Date(),
    labellersRequired: initialConfig.labellersRequired || 1,
    tasks: initialConfig.tasks || [{ id: '1', data: '', file: null }],
  })

  const [newChoice, setNewChoice] = useState('')

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
  const selectedFilesCount = config.tasks.filter((task) => task.file).length

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
              className="flex gap-6"
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
                type="number"
                min="15"
                value={config.labellersRequired}
                onChange={(e) =>
                  updateConfig({
                    labellersRequired: parseInt(e.target.value) || 1,
                  })
                }
                className="border-border focus:border-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Status Indicator - Shows when files are selected */}
      {dataType !== 'TEXT' && hasSelectedFiles && (
        <Card className="shadow-soft b border-green-200 dark:border-green-800 dark:bg-green-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Files Selected</span>
              {getDataTypeIcon()}
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-300">
              {selectedFilesCount} {dataType.toLowerCase()} file(s) uploaded and
              ready
            </div>
            <div className="mt-3 max-h-32 space-y-1 overflow-y-auto">
              {config.tasks
                .filter((task) => task.file)
                .map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-green-600 dark:text-green-300"
                  >
                    <div className="h-1 w-1 flex-shrink-0 rounded-full bg-green-500"></div>
                    <span className="flex-1 truncate">{task.file?.name}</span>
                    <span className="flex-shrink-0 text-green-500 dark:text-green-400">
                      ({((task.file?.size || 0) / 1024).toFixed(1)}KB)
                    </span>
                  </div>
                ))}
            </div>
            <div className="mt-3 text-xs text-green-600 dark:text-green-300">
              Note: Files are still selected even if the input field appears
              empty
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TaskConfiguration
