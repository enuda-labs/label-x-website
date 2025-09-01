'use client'

import React, { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { useParams, useRouter} from 'next/navigation'
import {
  ArrowLeft,
  Check,
  Save,
  Eye,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Database,
  Video,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { TaskProgress } from '@/types/taskProgress'
import {
  fetchTaskById,
  annotateTask,
  annotateMissingAsset,
  fetchTaskProgress,
} from '@/services/apis/clusters'
import { ApiResponse } from '@/types/ApiResponse'

interface TaskFile {
  file_url?: string
  file_name?: string
  file_size_bytes?: number
  file_type?: string
}

interface ApiTaskItem extends TaskFile {
  id?: number
  serial_no?: string
  task_type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'PDF' | 'CSV'
  data?: string
}

interface ApiTaskResponse {
  id?: number
  tasks?: ApiTaskItem[]
  title?: string
  labelling_choices?: Array<{ option_text: string }>
  choices?: Array<{ option_text: string }>
  input_type?: 'multiple_choice' | 'text_input'
  labeller_instructions?: string
  task_type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'PDF' | 'CSV'
  /** 👇 existing user’s annotations in order of tasks */
  my_labels?: string[]
}


interface Label {
  label?: string
  notes?: string
}

const buildHydratedResponses = (payload: ApiTaskResponse) => {
  const items = payload.tasks ?? []
  const labels: Label[] = (payload.my_labels ?? []).map((l) => ({ label: l }))
  const sameLength = labels.length === items.length

  return items.map((task, idx) => {
    let labelObj: Label | undefined
    if (sameLength) {
      labelObj = labels[idx]
    } else if (labels.length > 0) {
      labelObj = labels[0]
    }

    const val = labelObj?.label
    const notes = labelObj?.notes ?? ''

    return { answer: val ? [String(val)] : [], notes }
  })
}


interface ApiErrorResponse {
  detail?: string
  message?: string
}



const getTaskTypeIcon = (type?: string) => {
  switch (type) {
    case 'TEXT':
      return <FileText className="size-5" />
    case 'IMAGE':
      return <ImageIcon className="size-5" />
    case 'VIDEO':
      return <Video className="size-5" />
    case 'CSV':
    case 'PDF':
      return <Database className="size-5" />
    default:
      return <FileText className="size-5" />
  }
}

const FALLBACK_LABELS = [
  { option_text: 'Electronics' },
  { option_text: 'Clothing' },
  { option_text: 'Home & Garden' },
  { option_text: 'Sports' },
]

const LabelTask = () => {
  const { taskId } = useParams()

  const router = useRouter()

  const [taskData, setTaskData] = useState<ApiTaskResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [completedItems, setCompletedItems] = useState(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [responses, setResponses] = useState<
    Array<{ answer: string[]; notes: string }>
  >([])
  const [progressData, setProgressData] = useState<TaskProgress | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)


  const refreshTaskData = async () => {
    if (!taskId) return

    try {
      const idToFetch = Array.isArray(taskId) ? Number(taskId[0]) : Number(taskId)

      const resp = (await fetchTaskById(idToFetch)) as ApiResponse | { data: ApiTaskResponse }
      const payload: ApiTaskResponse = 'data' in resp && resp.data ? resp.data : (resp as ApiTaskResponse)

      setTaskData(payload || null)

      // hydrate existing labels instead of wiping
      const hydrated = buildHydratedResponses(payload)
      setResponses(hydrated)
      setCompletedItems(hydrated.filter(r => r.answer.length > 0).length)

      setCurrentItemIndex(0)
      setSelectedCategory(hydrated[0]?.answer?.[0] ?? '')
      setNotes(hydrated[0]?.notes ?? '')

      const progress = await fetchTaskProgress(idToFetch)
      setProgressData(progress)
    } catch (err) {
      console.error('Failed to refresh task data', err)
    }
  }




  useEffect(() => {
    if (!taskId) return

    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const idToFetch = Array.isArray(taskId)
          ? Number(taskId[0])
          : Number(taskId)

        // 👇 Explicit type assertion so resp is not "unknown"
        const resp = (await fetchTaskById(idToFetch)) as
          | ApiResponse
          | { data: ApiTaskResponse }

        let payload: ApiTaskResponse
        if ('data' in resp && resp.data) {
          payload = resp.data as ApiTaskResponse
        } else {
          payload = resp as ApiTaskResponse
        }

        if (cancelled) return
        setTaskData(payload || null)

        // ✅ Hydrate answers from API
        const hydrated = buildHydratedResponses(payload)
        console.log("Hydrated responses:", hydrated)

        setResponses(hydrated)

  // Prefill the current input (works for both multiple_choice & text_input)
  const firstAnswer = hydrated[0]?.answer?.[0] ?? ''
  setSelectedCategory(firstAnswer)

  // Completed count = how many items already have an answer
  setCompletedItems(hydrated.filter(r => r.answer.length > 0).length)

  setCurrentItemIndex(0)
  setNotes('') // you can later hydrate notes if your API returns them

      } catch (err: unknown) {
        let message = 'Failed to load task. Please try again.'
        if (err instanceof Error) {
          console.error('Failed to fetch task', err)
          message = err.message
        }
        setError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [taskId])








  useEffect(() => {
    if (!taskId) return
    ;(async () => {
      try {
        const idToFetch = Array.isArray(taskId)
          ? Number(taskId[0])
          : Number(taskId)
        const progress = await fetchTaskProgress(idToFetch)
        setProgressData(progress)
      }  catch (err: unknown) {
  if (err instanceof Error) {
    console.error('Failed to fetch task progress', err.message)
  } else {
    console.error('Failed to fetch task progress', err)
  }
}
    })()
  }, [taskId])





  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading task...
      </div>
    )
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded bg-red-50 p-6 text-red-700">{error}</div>
      </div>
    )


  if (!taskData)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Task not found
      </div>
    )


  const items = taskData.tasks ?? []
  const totalItems = items.length
  const currentItem = items[currentItemIndex] ?? { data: '' }
  const inputType = taskData.input_type ?? 'multiple_choice'
  const labellingChoices = taskData.choices ?? taskData.labelling_choices ?? []
  const progress =
  progressData && progressData.total_tasks > 0
    ? Math.round((progressData.completed_tasks / progressData.total_tasks) * 100)
    : totalItems > 0
    ? Math.round((completedItems / totalItems) * 100)
    : 0

  const isLastItem = currentItemIndex === totalItems - 1

  const choicesToShow =
    labellingChoices.length > 0 ? labellingChoices : FALLBACK_LABELS
  const itemType = currentItem?.task_type ?? taskData.task_type ?? 'TEXT'

  // helper to go to an item index and restore saved response (if present)
  const goToItemIndex = (index: number) => {
    if (index < 0 || index >= totalItems) return
    setCurrentItemIndex(index)
    const saved = responses[index]
    if (saved) {
      setSelectedCategory(saved.answer?.[0] || '')
      setNotes(saved.notes || '')
    } else {
      setSelectedCategory('')
      setNotes('')
    }
  }


  // --- Handlers ---
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
  }


  // --- Handlers ---
  const handleSubmitLabelLocal = () => {
    const selectedCategoryToSend = selectedCategory?.trim() || ''

    if (
      (inputType === 'multiple_choice' && !selectedCategoryToSend) ||
      (inputType === 'text_input' && selectedCategoryToSend.length === 0)
    ) {
      toast('Please provide an answer', {
        description: 'All items must be labeled before you can continue.',
      })
      return
    }

    setShowConfirmDialog(true)
  }


  const handleConfirmSubmit = async () => {
    const currentTaskIdToSend = currentItem?.id
    if (!currentTaskIdToSend) return

    try {
      setIsSubmitting(true)

      // Build labels depending on input type
      let labelsToSend: string[] = []
      if (inputType === "text_input") {
        if (selectedCategory && selectedCategory.trim() !== "") {
          labelsToSend = [selectedCategory.trim()]
        }
      } else {
        if (selectedCategory) {
          labelsToSend = [selectedCategory]
        }
      }

      const payload = {
        task_id: currentTaskIdToSend,
        labels: labelsToSend,
        notes,
      }

      const resp = await annotateTask(payload)

      // update local responses
      const newResponses = [...responses]
      newResponses[currentItemIndex] = {
        answer: labelsToSend,
        notes,
      }
      setResponses(newResponses)

      // completed count: only increment if this item didn’t have an answer before
      setCompletedItems((prev) =>
        newResponses[currentItemIndex]?.answer?.length > 0 ? prev : prev + 1
      )

      toast("Item labeled", {
        description:
          resp?.message ??
          `Item labeled as "${labelsToSend.length > 0 ? labelsToSend[0] : "—"}"`,
      })

      await refreshTaskData()

      // move forward
      if (currentItemIndex < totalItems - 1) {
        goToItemIndex(currentItemIndex + 1)
      } else {
        toast("All items completed in this cluster.")
        router.push("/label/overview")
      }
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      const status = error.response?.status

      // ✅ Always use DB error (never generic)
      const dbError =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Unknown server error"

      if (status === 400 && dbError.toLowerCase().includes("already")) {
        toast("You already labeled this task", {
          description: dbError,
        })
        setShowConfirmDialog(false)
      } else {
        toast("Task not available", {
          description: dbError, // 👈 always DB error
        })
      }

      console.error("handleConfirmSubmit error:", {
        status,
        dbError,
        raw: error,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentItemIndex < totalItems - 1) {
      goToItemIndex(currentItemIndex + 1)
    }
  }

  // Mark missing — now persists immediately via annotateMissingAsset
  const handleMarkMissing = async () => {
    const taskIdToSend = currentItem?.id
    if (!taskIdToSend) return

    const serial = currentItem?.serial_no ?? currentItem?.id
    const noteForServer = `Marked missing${serial ? ` (serial: ${serial})` : ''}`

    try {
      setIsSubmitting(true)

      const resp = await annotateMissingAsset(taskIdToSend, {
        labels: ["MISSING_ASSET"],
        notes: noteForServer,
      })

      toast('Marked as missing', {
        description: resp.message ?? 'Missing asset recorded',
      })

      await refreshTaskData()

      const newResponses = [...responses]
      newResponses[currentItemIndex] = {
        answer: ['MISSING_ASSET'],
        notes: noteForServer,
      }
      setResponses(newResponses)
      setCompletedItems(prev => prev + 1)

      // ✅ advance or redirect if last item
      if (currentItemIndex < totalItems - 1) {
        goToItemIndex(currentItemIndex + 1)
      } else {
        toast('All items completed in this cluster.')
        router.push('/label/tasks') // 👈 redirect after last item
      }

    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string; message?: string }>
      const detail = error.response?.data?.detail || error.message || ''

      toast('Failed to mark missing', {
        description: detail || 'An error occurred',
      })
      console.error('Mark missing failed', err)
    } finally {
      setIsSubmitting(false)
    }
  }


  // Build payload (labels + notes)
  // const buildLabelsForSubmission = () => {
  //   const labels: string[] = []
  //   const notesArr: string[] = []
  //
  //   for (const r of responses) {
  //     if (r.answer && r.answer.length > 0) {
  //       labels.push(...r.answer) // merge all answers
  //     }
  //     if (r.notes && r.notes.trim() !== '') {
  //       notesArr.push(r.notes.trim())
  //     }
  //   }
  //
  //   return {
  //     task_id: taskData?.id ?? Number(taskId),
  //     labels,
  //     notes: notesArr.join(' | ') || '',
  //   }
  // }

  // Submit labels using annotateTask helper (final / batch submit)
  // const currentTaskId = Array.isArray(taskId)
  //   ? Number(taskId[0])
  //   : Number(taskId) || 0

  // const submitLabels = async () => {
  //   const payload = buildLabelsForSubmission()
  //
  //   if (payload.labels.length === 0 && !payload.notes) {
  //     toast('Nothing to submit', {
  //       description: 'Please provide at least one label or note.',
  //     })
  //     return
  //   }
  //
  //   try {
  //     setIsSubmitting(true)
  //     const resp = await annotateTask(payload)
  //
  //     toast('Task labels submitted successfully', {
  //       description: resp?.message ?? 'Submission succeeded',
  //     })
  //     setShowConfirmDialog(false)
  //
  //     // After final/batch submission: advance to next item in cluster if present,
  //     // otherwise keep on last item (you can change this to navigate to next cluster if desired)
  //     if (currentItemIndex < totalItems - 1) {
  //       goToItemIndex(currentItemIndex + 1)
  //     } else {
  //       toast('All items in this cluster submitted.')
  //     }
  //   } catch (err: unknown) {
  //     const error = err as AxiosError<{ detail?: string; message?: string }>
  //     const status = error.response?.status
  //     const detail =
  //       error.response?.data?.detail ||
  //       error.response?.data?.message ||
  //       error.message ||
  //       ''
  //
  //     if (
  //       status === 400 &&
  //       typeof detail === 'string' &&
  //       detail.toLowerCase().includes('already label')
  //     ) {
  //       toast('You already labeled this task', {
  //         description: detail || 'This task has already been labeled.',
  //       })
  //       setShowConfirmDialog(false)
  //
  //       if (currentItemIndex < totalItems - 1) {
  //         goToItemIndex(currentItemIndex + 1)
  //       }
  //       return
  //     }
  //
  //     if (status === 401 || status === 403) {
  //       toast('Not authorized', {
  //         description: detail || 'Please sign in and try again.',
  //       })
  //       setShowConfirmDialog(false)
  //       return
  //     }
  //
  //     console.error('Annotate failed', status, error)
  //     toast('Failed to submit labels', {
  //       description: detail || 'An error occurred while submitting labels.',
  //     })
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }
  //


  // Next/Previous should move between items within the cluster
  const handleNextTask = () => {
    if (currentItemIndex < totalItems - 1) {
      goToItemIndex(currentItemIndex + 1)
    } else {
      toast('This is the last item in the cluster.')
    }
  }

  const handlePreviousTask = () => {
    if (currentItemIndex > 0) {
      goToItemIndex(currentItemIndex - 1)
    } else {
      toast('This is the first item in the cluster.')
    }
  }

  // --- Render ---
  return (
    <div className="bg-card/20 min-h-screen">
    <header className="bg-card/30 sticky top-0 z-50 border-b backdrop-blur-sm">
<div className="container mx-auto px-4 py-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <Link href="/label/overview">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>
    </div>
    <div className="flex items-center gap-3">
      <Badge variant="outline">
        {progressData?.completed_tasks ?? completedItems} completed
      </Badge>
    </div>
  </div>
</div>
</header>


      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-muted-foreground text-sm">
              {progressData
                ? `Progress: ${progressData.completed_tasks}/${progressData.total_tasks}`
                : `${progress}% complete`}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 flex items-start gap-2">
          <div className="pt-1">{getTaskTypeIcon(taskData.task_type)}</div>
          <div>
            <h1 className="text-xl font-semibold">
              {taskData.title ?? `Task #${taskData.id ?? taskId}`}
            </h1>
            <p className="text-muted-foreground text-sm">
              Item {currentItemIndex + 1} of {totalItems}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* MAIN CONTENT (left) */}
          <div className="lg:col-span-2">
            <Card className="shadow-soft bg-card/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="text-primary h-5 w-5" /> Content to Label
                </CardTitle>
              </CardHeader>

              <CardContent>
                {(() => {
                  const fileUrl = currentItem?.file_url ?? null
                  const fileName = currentItem?.file_name ?? null

                  const serial = currentItem?.serial_no ?? currentItem?.id
                  const description = currentItem?.data ?? ''

                  const isMissingMedia =
                    (itemType === 'IMAGE' || itemType === 'VIDEO') &&
                    !fileUrl &&
                    (!description || description.trim() === '')

                  const renderCsvPreview = (csvText: string) => {
                    try {
                      const rows = csvText
                        .split('\n')
                        .map((r) => r.split(',').map((c) => c.trim()))
                        .filter((r) => r.length > 0)
                      const head = rows[0] ?? []
                      const sample = rows.slice(1, 6)
                      return (
                        <div className="bg-muted/10 mt-4 overflow-auto rounded p-2">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr>
                                {head.map((h, i) => (
                                  <th
                                    key={i}
                                    className="px-2 py-1 text-left font-medium"
                                  >
                                    {h || `col${i + 1}`}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {sample.map((r, ri) => (
                                <tr key={ri}>
                                  {r.map((cell, ci) => (
                                    <td key={ci} className="px-2 py-1">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    } catch {
                      return null
                    }
                  }

                  if (isMissingMedia) {
                    return (
                      <div className="text-center">
                        <div className="bg-muted/20 mt-4 rounded-lg border-2 border-dashed p-8">
                          <div className="flex flex-col items-center gap-4">
                            <ImageIcon className="text-muted-foreground h-10 w-10" />
                            <p className="text-muted-foreground text-center text-sm">
                              No {itemType?.toLowerCase()} provided for this
                              item.
                            </p>
                            <p className="text-muted-foreground text-center text-sm">
                              {serial
                                ? `Serial: ${serial}`
                                : `Item ID: ${currentItem?.id ?? '—'}`}
                            </p>
                            <div className="mt-4 flex gap-2">
                              <Button
                                variant="outline"
                                onClick={handleMarkMissing}
                                disabled={isSubmitting}
                              >
                                Mark Missing
                              </Button>
                              <Button onClick={handleNext}>Skip</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (fileUrl) {
                    if (itemType === 'IMAGE') {
                      return (
                        <div className="text-center">
                          <Image
                            src={fileUrl}
                            alt={fileName ?? `image-${currentItem?.id}`}
                            width={800}
                            height={600}
                            className="mx-auto h-auto max-w-full rounded-lg"
                            style={{ maxHeight: '400px' }}
                          />
                          <div className="bg-muted/50 mt-4 rounded-lg p-4">
                            {fileName && (
                              <p className="text-muted-foreground text-sm">
                                File: {fileName}
                              </p>
                            )}
                            <p className="mt-2 text-lg">{description}</p>
                          </div>
                        </div>
                      )
                    }

                    if (itemType === 'VIDEO') {
                      return (
                        <div className="text-center">
                          <video
                            src={fileUrl}
                            controls
                            className="mx-auto h-auto max-w-full rounded-lg"
                            style={{ maxHeight: '400px' }}
                          />
                          <div className="bg-muted/50 mt-4 rounded-lg p-4">
                            {fileName && (
                              <p className="text-muted-foreground text-sm">
                                File: {fileName}
                              </p>
                            )}
                            <p className="mt-2 text-lg">{description}</p>
                          </div>
                        </div>
                      )
                    }

                    if (itemType === 'PDF') {
                      return (
                        <div className="text-center">
                          <iframe
                            src={fileUrl}
                            title={fileName || `pdf-${currentItem?.id}`}
                            className="mx-auto w-full rounded-lg"
                            style={{ height: 520, border: 0 }}
                          />
                          <div className="bg-muted/50 mt-4 rounded-lg p-4">
                            {fileName && (
                              <p className="text-muted-foreground text-sm">
                                File:{' '}
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline"
                                >
                                  {fileName}
                                </a>
                              </p>
                            )}
                            <p className="mt-2 text-lg">{description}</p>
                          </div>
                        </div>
                      )
                    }

                    if (itemType === 'CSV') {
                      return (
                        <div>
                          <div className="bg-muted/50 mt-4 rounded-lg p-4">
                            {fileName && (
                              <p className="text-muted-foreground text-sm">
                                File:{' '}
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline"
                                >
                                  {fileName}
                                </a>
                              </p>
                            )}
                            <p className="mt-2 text-lg">{description}</p>
                          </div>
                          {description &&
                            description.includes(',') &&
                            renderCsvPreview(description)}
                        </div>
                      )
                    }

                    return (
                      <div className="bg-muted/50 rounded-lg p-6">
                        {fileName ? (
                          <p className="text-muted-foreground text-sm">
                            File:{' '}
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                            >
                              {fileName}
                            </a>
                          </p>
                        ) : null}
                        <p className="mt-2 text-lg leading-relaxed">
                          {description || 'No content available'}
                        </p>
                      </div>
                    )
                  }

                  return (
                    <div className="bg-muted/50 rounded-lg p-6">
                      <p className="text-lg leading-relaxed">
                        {description || 'No content available'}
                      </p>
                      {currentItem?.file_name && (
                        <div className="text-muted-foreground mt-4 text-sm">
                          <p>Document: {currentItem.file_name}</p>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            <Card className="bg-card/20 border-primary border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="text-primary h-4 w-4" /> Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {taskData.labeller_instructions ??
                    'Follow the instructions provided for this task.'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/20">
              <CardHeader>
                <CardTitle className="text-base">
                  {inputType === 'multiple_choice' && choicesToShow.length > 0
                    ? 'Select Label Option *'
                    : 'Provide Answer *'}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {inputType === 'multiple_choice' && choicesToShow.length > 0 ? (
                  choicesToShow.map((choice, index) => (
                    <Button
                    key={index}
                    variant={selectedCategory === choice.option_text ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => handleCategorySelect(choice.option_text)}
                    >
                    {selectedCategory === choice.option_text && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    {choice.option_text}
                    </Button>
                  ))

                ) : (
                  <Textarea
                  placeholder="Enter your response here..."
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="min-h-[100px] resize-none"
                  />

                )}
              </CardContent>
            </Card>

            <Card className="bg-card/20">
              <CardHeader>
                <CardTitle className="text-base">
                  Additional Notes (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any additional notes or observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </CardContent>
            </Card>

            <div className="space-y-3">
            <Button
            onClick={handleSubmitLabelLocal}
            disabled={inputType === 'multiple_choice' && !selectedCategory}
            className="w-full"
            variant="default"
            >

                <Save className="mr-2 h-4 w-4" />
                {isLastItem ? 'Complete Task' : 'Submit & Continue'}
              </Button>

              <p className="text-muted-foreground text-center text-xs">
                * All items must be labeled to complete the task
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePreviousTask}
                disabled={currentItemIndex === 0}
                variant="ghost"
                className="bg-card/20 flex-1"
              >
                Previous Task
              </Button>

              <Button onClick={handleNextTask} className="flex-1">
                Next Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      {/* Item Confirmation Modal */}
  <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
    <DialogContent className="border shadow-sm max-w-lg w-[90%] rounded-xl p-6 flex flex-col items-center justify-center">
      <DialogHeader>
        <DialogTitle>Confirm Item Annotation</DialogTitle>
        <DialogDescription>
          Please review your response for this item before continuing.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-3 text-sm">
  <div className="font-medium">Item {currentItemIndex + 1}:</div>
  <div className="text-muted-foreground">
    Answer: {selectedCategory || '—'}
  </div>
  {notes && (
    <div className="text-muted-foreground">
      Notes: {notes}
    </div>
  )}
</div>

      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
          Edit Response
        </Button>
        <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
          Confirm & Continue
        </Button>
      </DialogFooter>

    </DialogContent>
  </Dialog>

    </div>
  )
}

export default LabelTask
