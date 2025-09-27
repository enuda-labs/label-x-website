'use client'

import React, { useState } from 'react'
import { uploadToCloudinary } from '@/utils/cloudinary'
import {
  ArrowLeft,
  CheckCircle,
  Upload,
  Settings,
  Play,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import DataTypeSelection, {
  DataType,
} from '@/components/project/data-type-selection'
import TaskConfiguration, {
  TaskConfig,
} from '@/components/project/task/task-configurations'
import { createTaskCluster, getCostBreakdown } from '@/services/apis/task'
import { TaskItem } from '@/components/project/task/task-item'
import { isAxiosError } from 'axios'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import costBreakdown from './datapoint-cost'
import { getMyPlan } from '@/services/apis/subscription'

enum AnnotationStep {
  DATA_TYPE = 'data_type',
  CONFIGURE = 'configure',
  PREVIEW = 'preview',
  SUBMIT = 'submit',
}

const Annotate = () => {
  const { id: projectId } = useParams()

  const [currentStep, setCurrentStep] = useState<AnnotationStep>(
    AnnotationStep.DATA_TYPE
  )
  const [dataType, setDataType] = useState<DataType | null>(null)
  const [taskConfig, setTaskConfig] = useState<TaskConfig>({
    taskName: '',
    description: '',
    inputType: 'multiple_choice',
    labellingChoices: [],
    instructions: '',
    labellersRequired: 15,
    tasks: [{ id: '1', data: '', file: null }],
    deadline: new Date(),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  const { data: system_costs } = useQuery({
    queryKey: ['system_costs'],
    queryFn: getCostBreakdown,
  })

  const { data: myPlan } = useQuery({
    queryKey: ['myPlan'],
    queryFn: getMyPlan,
  })

  const stepLabels = {
    [AnnotationStep.DATA_TYPE]: 'Select Data Type',
    [AnnotationStep.CONFIGURE]: 'Configure Task',
    [AnnotationStep.PREVIEW]: 'Review & Preview',
    [AnnotationStep.SUBMIT]: 'Success',
  }

  const getStepNumber = (step: AnnotationStep): number => {
    return Object.values(AnnotationStep).indexOf(step) + 1
  }

  const getCurrentProgress = (): number => {
    return (
      (getStepNumber(currentStep) / Object.values(AnnotationStep).length) * 100
    )
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case AnnotationStep.DATA_TYPE:
        return !!dataType
      case AnnotationStep.CONFIGURE:
        return !!(
          taskConfig.taskName &&
          taskConfig.description &&
          taskConfig.instructions &&
          taskConfig.tasks.length > 0 &&
          taskConfig.tasks.every((task) => task.data.trim()) &&
          (taskConfig.inputType === 'text' ||
            taskConfig.inputType === 'video' ||
            taskConfig.inputType === 'voice' ||
            taskConfig.inputType === 'image' ||
            taskConfig.labellingChoices.length > 0) &&
          taskConfig.deadline
        )
      case AnnotationStep.PREVIEW:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (
      currentStep === AnnotationStep.CONFIGURE &&
      taskConfig.labellersRequired < 15
    ) {
      return toast('Minimum required labellers is 15')
    }
    const steps = Object.values(AnnotationStep)
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const steps = Object.values(AnnotationStep)
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    } else {
      router.back()
    }
  }

  const validateAndSubmit = async () => {
    if (!dataType || !canProceed()) {
      toast('Validation Error', {
        description: 'Please complete all required fields before submitting.',
      })
      return
    }

    setIsSubmitting(true)
    let uploadedFileUrl = ''
    if (dataType !== 'TEXT') {
      const fileTask =
        taskConfig.tasks[0].file || taskConfig.tasks[0].recordedBlob
      if (fileTask) {
        try {
          uploadedFileUrl = await uploadToCloudinary(fileTask)
          setTaskConfig((prev) => ({
            ...prev,
            tasks: [
              {
                ...prev.tasks[0],
              },
            ],
          }))
        } catch (err) {
          console.log(err)
          toast('File Upload Error', { description: 'Failed to upload file.' })
          setIsSubmitting(false)
          return
        }
      }
    }
    try {
      if (dataType !== 'TEXT' && !uploadedFileUrl) {
        toast('File Upload Error', { description: 'File upload not found' })
        setIsSubmitting(false)
        return
      }

      const taskBody = (task: TaskItem) =>
        dataType === 'TEXT'
          ? {
              data: task.data,
            }
          : {
              data: task.data,
              file: {
                file_url: uploadedFileUrl,
                file_name: task.file?.name || task.data || '',
                file_size_bytes:
                  task.file?.size || task.recordedBlob?.size || 0,
                file_type: task.file?.type || task.recordedBlob?.type || '',
              },
            }

      await createTaskCluster({
        tasks: taskConfig.tasks.map((task) => taskBody(task)),
        labelling_choices: taskConfig.labellingChoices,
        input_type: taskConfig.inputType,
        labeller_instructions: taskConfig.instructions,
        deadline: taskConfig.deadline?.toISOString().split('T')[0],
        labeller_per_item_count: taskConfig.labellersRequired,
        task_type: dataType,
        annotation_method: 'manual',
        project: Number(projectId),
        ...(uploadedFileUrl ? { file_url: uploadedFileUrl } : {}),
      })

      setCurrentStep(AnnotationStep.SUBMIT)
      toast('Task Submitted Successfully!', {
        description:
          'Your annotation task has been created and will be processed by our labellers.',
      })
    } catch (error) {
      console.log('Submission Error:', error)
      if (isAxiosError(error))
        toast('Submission Failed', {
          description:
            error.response?.data.error ||
            error.response?.data.message ||
            'There was an error submitting your task. Please try again.',
        })
      else
        toast('Submission Failed', {
          description:
            'There was an error submitting your task. Please try again.',
        })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Enhanced preview component for different data types
  const renderDataPreview = () => {
    if (!dataType || taskConfig.tasks.length === 0) return null

    const getFileUrl = (file: File | Blob | null | undefined) => {
      if (dataType === 'CSV') return null
      return file ? URL.createObjectURL(file) : null
    }

    switch (dataType) {
      case 'VIDEO':
        const firstVideoTask = taskConfig.tasks[0]
        const videoUrl = getFileUrl(
          firstVideoTask.file || firstVideoTask.recordedBlob
        )

        return (
          <Card className="shadow-soft bg-card/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="text-primary h-5 w-5" />
                Video Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {videoUrl ? (
                <div className="space-y-3">
                  <video
                    controls
                    className="max-h-64 w-full rounded-lg bg-black"
                    preload="metadata"
                  >
                    <source
                      src={videoUrl}
                      type={
                        firstVideoTask.file?.type ||
                        firstVideoTask.recordedBlob?.type
                      }
                    />
                    Your browser does not support the video tag.
                  </video>
                  <p className="text-muted-foreground text-sm">
                    {firstVideoTask.recordedBlob
                      ? 'Video Record'
                      : firstVideoTask.file?.name}{' '}
                    (
                    {(
                      (firstVideoTask.file?.size ||
                        firstVideoTask.recordedBlob?.size ||
                        0) /
                      (1024 * 1024)
                    ).toFixed(2)}{' '}
                    MB)
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No video file found</p>
              )}
            </CardContent>
          </Card>
        )

      case 'IMAGE':
        const imageUrls = taskConfig.tasks
          .slice(0, 2)
          .map((task) => ({ url: getFileUrl(task.file), task }))
          .filter((item) => item.url)

        return (
          <Card className="shadow-soft bg-card/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="text-primary h-5 w-5" />
                Image Preview ({taskConfig.tasks.length} total)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {imageUrls.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {imageUrls.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <Image
                        width={500}
                        height={500}
                        src={item.url!}
                        alt={`Preview ${index + 1}`}
                        className="h-48 w-full rounded-lg border object-cover"
                      />
                      <p className="text-muted-foreground text-xs">
                        {item.task.file?.name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No image files found</p>
              )}
              {taskConfig.tasks.length > 2 && (
                <p className="text-muted-foreground mt-3 text-xs">
                  ... and {taskConfig.tasks.length - 2} more images
                </p>
              )}
            </CardContent>
          </Card>
        )

      case 'AUDIO':
        const firstAudioTask = taskConfig.tasks[0]
        const audioUrl = getFileUrl(firstAudioTask.file)

        return (
          <Card className="shadow-soft bg-card/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="text-primary h-5 w-5" />
                Audio Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {audioUrl ? (
                <div className="space-y-3">
                  <audio controls className="w-full" preload="metadata">
                    <source src={audioUrl} type={firstAudioTask.file?.type} />
                    Your browser does not support the audio tag.
                  </audio>
                  <p className="text-muted-foreground text-sm">
                    {firstAudioTask.file?.name} (
                    {((firstAudioTask.file?.size || 0) / (1024 * 1024)).toFixed(
                      2
                    )}{' '}
                    MB)
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No audio file found</p>
              )}
            </CardContent>
          </Card>
        )

      case 'CSV':
        const firstCSVTask = taskConfig.tasks[0]
        return (
          <Card className="shadow-soft bg-card/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-primary h-5 w-5" />
                {dataType} Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {firstCSVTask.file?.name} (
                {((firstCSVTask.file?.size || 0) / (1024 * 1024)).toFixed(2)}{' '}
                MB)
              </p>
            </CardContent>
          </Card>
        )

      case 'PDF':
        const firstFileTask = taskConfig.tasks[0]
        const fileUrl = getFileUrl(firstFileTask.file)

        return (
          <Card className="shadow-soft bg-card/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-primary h-5 w-5" />
                {dataType} Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fileUrl ? (
                <div className="space-y-3">
                  <iframe
                    src={fileUrl}
                    className="h-64 w-full rounded-lg border"
                    title="File Preview"
                  />
                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <span>{firstFileTask.file?.name}</span>
                    <span>
                      {(
                        (firstFileTask.file?.size || 0) /
                        (1024 * 1024)
                      ).toFixed(2)}{' '}
                      MB
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(fileUrl, '_blank')}
                  >
                    Open in New Tab
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No {dataType.toLowerCase()} file found
                </p>
              )}
            </CardContent>
          </Card>
        )

      case 'TEXT':
        return (
          <Card className="shadow-soft bg-card/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-primary h-5 w-5" />
                Text Data Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 border-primary max-h-32 space-y-2 overflow-y-auto rounded-lg border p-4">
                {taskConfig.tasks.slice(0, 3).map((task, index) => (
                  <div key={task.id} className="text-sm">
                    <span className="font-medium">Task {index + 1}:</span>{' '}
                    {task.data.slice(0, 100)}
                    {task.data.length > 100 ? '...' : ''}
                  </div>
                ))}
                {taskConfig.tasks.length > 3 && (
                  <div className="text-muted-foreground text-xs">
                    ... and {taskConfig.tasks.length - 3} more items
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case AnnotationStep.DATA_TYPE:
        return (
          <DataTypeSelection
            onSelect={(type) => {
              setDataType(type)
              setTimeout(() => handleNext(), 300)
            }}
            selected={dataType || undefined}
          />
        )

      case AnnotationStep.CONFIGURE:
        return (
          <div className="space-y-6">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-semibold">
                Configure Your Task
              </h2>
              <p className="text-muted-foreground">
                Set up how you want your {dataType?.toLowerCase()} data labeled
              </p>
            </div>
            <div className="mx-auto max-w-4xl bg-black/5">
              <TaskConfiguration
                dataType={dataType!}
                onConfigChange={setTaskConfig}
                initialConfig={taskConfig}
              />
            </div>
          </div>
        )

      case AnnotationStep.PREVIEW:
        return (
          <div className="space-y-6">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-semibold">Review & Preview</h2>
              <p className="text-muted-foreground">
                Confirm your task details and data preview
              </p>
            </div>
            <div className="mx-auto max-w-4xl space-y-6">
              {/* Task Summary Card */}
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
                          Data Type
                        </h4>
                        <p className="font-semibold">{dataType}</p>
                      </div>
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
                          Input Type
                        </h4>
                        <p className="text-sm capitalize">
                          {taskConfig.inputType.replace('_', ' ')}
                        </p>
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
                          Task Items
                        </h4>
                        <p className="text-sm">
                          {taskConfig.tasks.length} item
                          {taskConfig.tasks.length !== 1 && 's'}
                        </p>
                      </div>
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
                      <div>
                        <h4 className="text-muted-foreground text-sm font-medium">
                          Data points to be used
                        </h4>
                        <p
                          className={`text-sm ${
                            system_costs &&
                            dataType &&
                            myPlan &&
                            myPlan.user_data_points.data_points_balance <
                              costBreakdown(
                                system_costs?.data,
                                taskConfig,
                                dataType
                              ).totalCost
                              ? 'text-red-500'
                              : 'text-green-500'
                          }`}
                        >
                          {dataType &&
                            system_costs &&
                            costBreakdown(
                              system_costs?.data,
                              taskConfig,
                              dataType
                            ).totalCost?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Preview Card */}
              {renderDataPreview()}
            </div>
          </div>
        )

      case AnnotationStep.SUBMIT:
        return (
          <div className="py-12 text-center">
            <div className="mx-auto max-w-md">
              <CheckCircle className="text-success mx-auto mb-6 h-16 w-16" />
              <h2 className="mb-4 text-3xl font-bold">
                Task Submitted Successfully!
              </h2>
              <p className="text-muted-foreground mb-8">
                {`Your annotation task "${taskConfig.taskName}" has been created and will be processed by our labellers. 
                You'll receive updates as work progresses.`}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/client/overview')}
                  className="h-12 w-full"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => {
                    setCurrentStep(AnnotationStep.DATA_TYPE)
                    setDataType(null)
                    setTaskConfig({
                      taskName: '',
                      description: '',
                      inputType: 'multiple_choice',
                      labellingChoices: [],
                      instructions: '',
                      labellersRequired: 1,
                      tasks: [{ id: '1', data: '', file: null }],
                      deadline: new Date(),
                    })
                  }}
                  variant="outline"
                  className="border-primary h-12 w-full bg-transparent"
                >
                  Create Another Task
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
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
                <h1 className="text-xl font-semibold">Annotate a Task</h1>
                <p className="text-muted-foreground text-sm">
                  Upload your dataset and configure how you want it labeled
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {currentStep !== AnnotationStep.SUBMIT && (
        <div className="bg-card/20 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">
                Step {getStepNumber(currentStep)} of{' '}
                {Object.values(AnnotationStep).length - 1}
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

      {currentStep !== AnnotationStep.SUBMIT && (
        <footer className="sticky bottom-0 border-t backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === AnnotationStep.DATA_TYPE}
              >
                Back
              </Button>

              {currentStep === AnnotationStep.PREVIEW ? (
                <Button
                  onClick={validateAndSubmit}
                  disabled={!canProceed() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Upload className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Task'
                  )}
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

export default Annotate
