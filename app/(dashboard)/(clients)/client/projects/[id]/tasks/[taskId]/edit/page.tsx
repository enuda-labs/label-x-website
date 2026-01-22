'use client'

import React, { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle, Settings } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import TaskConfiguration, {
  TaskConfig,
} from '@/components/project/task/task-configurations'
import { updateTaskCluster } from '@/services/apis/task'
import { fetchTaskById } from '@/services/apis/clusters'
import { isAxiosError } from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataType } from '@/components/project/data-type-selection'

enum EditStep {
  CONFIGURE = 'configure',
  PREVIEW = 'preview',
  SUBMIT = 'submit',
}

const EditTask = () => {
  const { id: projectId, taskId } = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [currentStep, setCurrentStep] = useState<EditStep>(EditStep.CONFIGURE)
  const [taskConfig, setTaskConfig] = useState<TaskConfig>({
    taskName: '',
    description: '',
    inputType: 'multiple_choice',
    labellingChoices: [],
    labeler_domain: 0,
    instructions: '',
    labellersRequired: 15,
    tasks: [{ id: '1', data: '', file: null }],
    deadline: new Date(),
    language: 'English',
  })
  const [dataType, setDataType] = useState<DataType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch existing task cluster data
  const { data: clusterData, isPending: isLoading } = useQuery({
    queryKey: ['task-cluster', taskId],
    queryFn: () => fetchTaskById(taskId as string),
    enabled: !!taskId,
  })

  // Populate form when data loads
  useEffect(() => {
    if (clusterData) {
      // Handle both direct data and nested data structure
      const cluster = (clusterData as any).data || clusterData
      setDataType(cluster.task_type as DataType)

      // Map existing tasks to TaskItemType format
      const existingTasks = cluster.tasks?.map((task: any, index: number) => ({
        id: task.id?.toString() || (index + 1).toString(),
        data: task.data || task.file_name || '',
        file: null, // Can't restore File object from URL, but data will show the content/name
        recordedBlob: null,
        recordedUrl: null,
        recordingType: null,
      })) || [{ id: '1', data: '', file: null }]

      setTaskConfig({
        taskName: cluster.name || '',
        description: cluster.description || '',
        inputType: (cluster.input_type || 'multiple_choice') as any,
        labellingChoices:
          cluster.choices?.map((c: any) => ({
            option_text: c.option_text || c,
          })) || [],
        labeler_domain: cluster.labeler_domain || 0,
        instructions: cluster.labeller_instructions || '',
        labellersRequired: cluster.labeller_per_item_count || 15,
        tasks: existingTasks,
        deadline: cluster.deadline ? new Date(cluster.deadline) : new Date(),
        language: cluster.language || 'English',
      })
    }
  }, [clusterData])

  const stepLabels = {
    [EditStep.CONFIGURE]: 'Edit Task Configuration',
    [EditStep.PREVIEW]: 'Review Changes',
    [EditStep.SUBMIT]: 'Success',
  }

  const getStepNumber = (step: EditStep): number => {
    return Object.values(EditStep).indexOf(step) + 1
  }

  const getCurrentProgress = (): number => {
    return (getStepNumber(currentStep) / Object.values(EditStep).length) * 100
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case EditStep.CONFIGURE:
        return !!(
          taskConfig.taskName &&
          taskConfig.description &&
          taskConfig.instructions &&
          taskConfig.labeler_domain &&
          taskConfig.language &&
          taskConfig.deadline
        )
      case EditStep.PREVIEW:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    const steps = Object.values(EditStep)
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const steps = Object.values(EditStep)
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    } else {
      router.back()
    }
  }

  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateTaskCluster(Number(taskId), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-cluster', taskId] })
      queryClient.invalidateQueries({
        queryKey: ['projectClusters', projectId],
      })
      queryClient.invalidateQueries({ queryKey: ['labels', projectId, taskId] })
      setCurrentStep(EditStep.SUBMIT)
      toast.success('Task updated successfully!')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            'Failed to update task'
        )
      } else {
        toast.error('Failed to update task')
      }
    },
  })

  const handleSubmit = async () => {
    if (!canProceed()) {
      toast.error('Please complete all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      await updateMutation.mutateAsync({
        name: taskConfig.taskName,
        description: taskConfig.description,
        labeller_instructions: taskConfig.instructions,
        deadline: taskConfig.deadline?.toISOString().split('T')[0],
        labeller_per_item_count: taskConfig.labellersRequired,
        language: taskConfig.language || 'English',
        labeler_domain: taskConfig.labeler_domain,
        labelling_choices: taskConfig.labellingChoices,
      })
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case EditStep.CONFIGURE:
        return (
          <div className="space-y-6">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-semibold">Edit Task</h2>
              <p className="text-muted-foreground">
                Update your task configuration
              </p>
            </div>
            {dataType && (
              <div className="mx-auto max-w-4xl bg-black/5">
                <TaskConfiguration
                  dataType={dataType}
                  onConfigChange={setTaskConfig}
                  initialConfig={taskConfig}
                />
              </div>
            )}
          </div>
        )

      case EditStep.PREVIEW:
        return (
          <div className="space-y-6">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-semibold">Review Changes</h2>
              <p className="text-muted-foreground">Confirm your task updates</p>
            </div>
            <div className="mx-auto max-w-4xl space-y-6">
              <Card className="shadow-soft bg-card/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="text-primary h-5 w-5" />
                    Task Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-muted-foreground text-sm font-medium">
                          Task Name
                        </h4>
                        <p className="font-semibold">{taskConfig.taskName}</p>
                      </div>
                      <div>
                        <h4 className="text-muted-foreground text-sm font-medium">
                          Description
                        </h4>
                        <p className="text-sm">{taskConfig.description}</p>
                      </div>
                      <div>
                        <h4 className="text-muted-foreground text-sm font-medium">
                          Language
                        </h4>
                        <p className="text-sm">{taskConfig.language}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {taskConfig.inputType === 'multiple_choice' && (
                        <div>
                          <h4 className="text-muted-foreground text-sm font-medium">
                            Labelling Options
                          </h4>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {taskConfig.labellingChoices.map((choice) => (
                              <span
                                key={choice.option_text}
                                className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs"
                              >
                                {choice.option_text}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <h4 className="text-muted-foreground text-sm font-medium">
                          Labellers Required
                        </h4>
                        <p className="text-sm">
                          {taskConfig.labellersRequired} per item
                        </p>
                      </div>
                      {taskConfig.deadline && (
                        <div>
                          <h4 className="text-muted-foreground text-sm font-medium">
                            Deadline
                          </h4>
                          <p className="text-sm">
                            {taskConfig.deadline.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case EditStep.SUBMIT:
        return (
          <div className="py-12 text-center">
            <div className="mx-auto max-w-md">
              <CheckCircle className="text-success mx-auto mb-6 h-16 w-16" />
              <h2 className="mb-4 text-3xl font-bold">
                Task Updated Successfully!
              </h2>
              <p className="text-muted-foreground mb-8">
                Your task "{taskConfig.taskName}" has been updated successfully.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() =>
                    router.push(`/client/projects/${projectId}/tasks/${taskId}`)
                  }
                  className="h-12 w-full"
                >
                  View Task
                </Button>
                <Button
                  onClick={() =>
                    router.push(`/client/projects/${projectId}/tasks`)
                  }
                  variant="outline"
                  className="border-primary h-12 w-full bg-transparent"
                >
                  Back to Tasks
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card/20 min-h-screen">
        <header className="bg-card/30 sticky top-0 z-50 border-b backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button onClick={handleBack} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Edit Task</h1>
                <p className="text-muted-foreground text-sm">Loading...</p>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading task data...</div>
        </main>
      </div>
    )
  }

  if (!clusterData) {
    return (
      <div className="bg-card/20 min-h-screen">
        <header className="bg-card/30 sticky top-0 z-50 border-b backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button onClick={handleBack} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Edit Task</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-white/60">Task not found</p>
            <Button onClick={handleBack} className="mt-4">
              Go Back
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-card/20 min-h-screen">
      <header className="bg-card/30 sticky top-0 z-50 border-b backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={handleBack} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <div>
                <h1 className="text-xl font-semibold">Edit Task</h1>
                <p className="text-muted-foreground text-sm">
                  Update your task configuration
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {currentStep !== EditStep.SUBMIT && (
        <div className="bg-card/20 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">
                Step {getStepNumber(currentStep)} of{' '}
                {Object.values(EditStep).length - 1}
              </span>
              <span className="text-muted-foreground text-sm">
                {stepLabels[currentStep]}
              </span>
            </div>
            <Progress value={getCurrentProgress()} className="h-2" />
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">{renderStepContent()}</main>

      {currentStep !== EditStep.SUBMIT && (
        <footer className="sticky bottom-0 border-t backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === EditStep.CONFIGURE}
              >
                Back
              </Button>

              {currentStep === EditStep.PREVIEW ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Task'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  variant="default"
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default EditTask
