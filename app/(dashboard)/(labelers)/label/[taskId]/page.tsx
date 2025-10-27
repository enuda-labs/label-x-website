'use client'

import React, { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { useParams, useRouter } from 'next/navigation'
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
import VoiceVideoSubmission from '@/components/VoiceVideoSubmission/VoiceVideoSubmission'

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
  input_type?: 'multiple_choice' | 'text_input' | 'voice' | 'video'
  labeller_instructions?: string
  task_type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'PDF' | 'CSV'
  my_labels?: Array<{ id: number; label: string; notes?: string }>
}

interface Label {
  id?: number | string
  label?: string
  notes?: string

  // common task association keys
  task?: number | string
  task_id?: number | string
  item?: number | string
  item_id?: number | string
  id_of_task?: number | string

  // file references
  label_file_url?: string
  file_url?: string
  label_file_name?: string
  file_name?: string

  // text-only labels
  label_text?: string
}

// Put this where your other helpers live
const buildHydratedResponses = (payload: ApiTaskResponse) => {
  const items = payload.tasks ?? []

  // --- build index maps for faster/more robust matching ---
  const byTaskId = new Map<number, Label[]>()
  const byFileUrl = new Map<string, Label[]>()
  const byFileName = new Map<string, Label[]>()

  const pushToMap = <K extends string | number>(
    map: Map<K, Label[]>,
    key: K,
    value: Label
  ) => {
    if (key == null) return
    const existing = map.get(key) ?? []
    existing.push(value)
    map.set(key, existing)
  }

  const labels: Label[] = Array.isArray(payload.my_labels)
    ? payload.my_labels
    : []

  for (const lbl of labels) {
    const possibleIds = [
      lbl.task,
      lbl.task_id,
      lbl.item,
      lbl.item_id,
      lbl.id_of_task,
    ].filter((x) => x !== undefined && x !== null)

    for (const id of possibleIds) {
      const n = typeof id === 'string' && /^\d+$/.test(id) ? Number(id) : id
      if (typeof n === 'number') pushToMap(byTaskId, n, lbl)
    }

    const fileUrl = (lbl.label_file_url ?? lbl.file_url ?? '').toString()
    const fileName = (lbl.label_file_name ?? lbl.file_name ?? '').toString()

    if (fileUrl) pushToMap(byFileUrl, fileUrl, lbl)
    if (fileName) pushToMap(byFileName, fileName, lbl)
  }

  // helper to detect media types by task_type or file extension
  const detectType = (taskTypeRaw: unknown, url?: string): string => {
    const t = (taskTypeRaw ?? '').toString().toLowerCase()
    if (
      t.includes('image') ||
      t.includes('video') ||
      t.includes('audio') ||
      t.includes('voice')
    )
      return t
    if (!url) return t
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? ''
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'].includes(ext))
      return 'image'
    if (['mp4', 'webm', 'mov', 'mkv', 'ogv'].includes(ext)) return 'video'
    if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext)) return 'audio'
    return t
  }

  // track used file urls so we don't reuse the same URL for multiple tasks unless it's the only match
  const usedUrls = new Set<string>()

  const chooseBestCandidate = (
    candidates: Label[],
    preferMediaUrl: boolean
  ): Label | null => {
    if (!candidates || candidates.length === 0) return null
    // prefer candidate that has label_file_url when expecting media
    if (preferMediaUrl) {
      const withUrl = candidates.find((c) => c.label_file_url ?? c.file_url)
      if (withUrl) return withUrl
    }
    // prefer textual label if not media
    const withText = candidates.find((c) => c.label ?? c.label_text)
    if (withText) return withText
    // fallback to first
    return candidates[0]
  }

  // DEBUG: log what we received (remove or guard in prod)
  console.debug('buildHydratedResponses: tasks', items)
  console.debug('buildHydratedResponses: my_labels', labels)

  return items.map((task) => {
    const taskId = task.id ?? null
    const fileUrl = task.file_url ?? ''
    const fileName = task.file_name ?? ''
    const taskType = detectType(
      task.task_type ?? payload.task_type ?? payload.input_type,
      fileUrl
    )

    // gather candidate label objects from different indexes
    let candidates: Label[] = []
    if (taskId != null && byTaskId.has(taskId))
      candidates = candidates.concat(byTaskId.get(taskId) ?? [])
    if (fileUrl && byFileUrl.has(fileUrl))
      candidates = candidates.concat(byFileUrl.get(fileUrl) ?? [])
    if (fileName && byFileName.has(fileName))
      candidates = candidates.concat(byFileName.get(fileName) ?? [])

    // dedupe candidate list references
    candidates = Array.from(new Set(candidates))

    // choose best candidate per heuristics
    const preferMediaUrl = ['image', 'video', 'audio', 'voice'].includes(
      taskType
    )
    let match = chooseBestCandidate(candidates, preferMediaUrl)

    // if chosen match uses a url that's already used for another task and we have alternatives,
    // try to pick a different candidate first
    if (match) {
      const candidateUrl = (
        match.label_file_url ??
        match.file_url ??
        ''
      ).toString()
      if (candidateUrl && usedUrls.has(candidateUrl)) {
        const alt = candidates.find((c) => {
          const url = (c.label_file_url ?? c.file_url ?? '').toString()
          return url && !usedUrls.has(url) && c !== match
        })
        if (alt) match = alt
      }
    }

    // final value selection
    let value = ''
    if (match) {
      const labelFileUrl = (
        match.label_file_url ??
        match.file_url ??
        ''
      ).toString()
      const labelText = (match.label ?? match.label_text ?? '').toString()

      if (preferMediaUrl) {
        // prefer file url, else text fallback
        value = labelFileUrl || labelText
        if (labelFileUrl) usedUrls.add(labelFileUrl)
      } else {
        value = labelText || labelFileUrl
        if (labelFileUrl && !labelText) usedUrls.add(labelFileUrl)
      }
    }

    return {
      answer: value ? [value] : [],
      notes: match?.notes ?? '',
    }
  })
}

interface ApiErrorResponse {
  detail?: string
  message?: string
  error?: string
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
  const [uploading, setUploading] = useState(false)

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
      const idToFetch = Array.isArray(taskId)
        ? Number(taskId[0])
        : Number(taskId)

      const resp = (await fetchTaskById(idToFetch)) as
        | ApiResponse
        | { data: ApiTaskResponse }
      const payload: ApiTaskResponse =
        'data' in resp && resp.data ? resp.data : (resp as ApiTaskResponse)

      setTaskData(payload || null)

      // hydrate existing labels instead of wiping
      const hydrated = buildHydratedResponses(payload)
      setResponses(hydrated)
      setCompletedItems(hydrated.filter((r) => r.answer.length > 0).length)

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
        console.log('Hydrated responses:', hydrated)

        setResponses(hydrated)

        // Prefill the current input (works for both multiple_choice & text_input)
        const firstAnswer = hydrated[0]?.answer?.[0] ?? ''
        setSelectedCategory(firstAnswer)

        // Completed count = how many items already have an answer
        setCompletedItems(hydrated.filter((r) => r.answer.length > 0).length)

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
      } catch (err: unknown) {
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
  const inputType = (taskData?.input_type ?? 'multiple_choice')
    .toString()
    .toLowerCase()
  const labellingChoices = taskData.choices ?? taskData.labelling_choices ?? []
  const progress =
    progressData && progressData.total_tasks > 0
      ? Math.round(
          (progressData.completed_tasks / progressData.total_tasks) * 100
        )
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
      if (inputType === 'text_input') {
        if (selectedCategory && selectedCategory.trim() !== '') {
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
        notes: notes || '',
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

      toast('Item labeled', {
        description:
          resp?.message ??
          `Item labeled as "${labelsToSend.length > 0 ? labelsToSend[0] : '—'}"`,
      })

      await refreshTaskData()

      // move forward
      if (currentItemIndex < totalItems - 1) {
        goToItemIndex(currentItemIndex + 1)
      } else {
        toast('All items completed in this cluster.')
        router.push('/label/overview')
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<ApiErrorResponse>

      const status = axiosErr.response?.status

      const detail =
        axiosErr.response?.data?.detail ||
        axiosErr.response?.data?.message ||
        axiosErr.response?.data?.error ||
        axiosErr.message ||
        'Unknown server error'

      // If your toast library always has .error, call it directly
      if ('error' in toast && typeof toast.error === 'function') {
        toast.error(detail)
      } else {
        toast(detail)
      }

      if (status === 400 && detail.toLowerCase().includes('already')) {
        setShowConfirmDialog(false)
      }

      console.error('handleConfirmSubmit error:', {
        status,
        detail,
        raw: axiosErr,
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
        labels: ['MISSING_ASSET'],
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
      setCompletedItems((prev) => prev + 1)

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
    if (uploading) {
      const confirmMove = window.confirm(
        'A file is still uploading. Are you sure you want to move to the next item?'
      )
      if (!confirmMove) return // user canceled → stop navigation
    }

    if (currentItemIndex < totalItems - 1) {
      goToItemIndex(currentItemIndex + 1)
    } else {
      toast('This is the last item in the cluster.')
    }
  }

  const handlePreviousTask = () => {
    if (uploading) {
      const confirmMove = window.confirm(
        'A file is still uploading. Are you sure you want to go back?'
      )
      if (!confirmMove) return
    }

    if (currentItemIndex > 0) {
      goToItemIndex(currentItemIndex - 1)
    } else {
      toast('This is the first item in the cluster.')
    }
  }

  console.log('itemType:', itemType)

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

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* MAIN CONTENT (left) */}
          <div className="flex-1">
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

                    if (
                      (itemType as string) === 'VOICE' ||
                      (itemType as string) === 'AUDIO'
                    ) {
                      return (
                        <div className="text-center">
                          <audio
                            src={fileUrl}
                            controls
                            className="mx-auto w-full max-w-md rounded-lg"
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
          <div className="w-full space-y-6 lg:w-[360px]">
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
            {responses[currentItemIndex]?.answer?.[0] &&
              (() => {
                const url = responses[currentItemIndex].answer[0]
                const ext = (
                  url.split('?')[0].split('.').pop() || ''
                ).toLowerCase()

                const isImage = [
                  'jpg',
                  'jpeg',
                  'png',
                  'gif',
                  'webp',
                  'bmp',
                  'tiff',
                ].includes(ext)
                const isVideo = ['mp4', 'webm', 'mov', 'mkv', 'ogv'].includes(
                  ext
                )
                const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(
                  ext
                )

                return (
                  <div className="mt-2">
                    <p className="text-muted-foreground text-sm">
                      Already uploaded:
                    </p>
                    <div className="mt-1">
                      {isImage && (
                        <Image
                          src={url}
                          alt="Uploaded image"
                          width={600}
                          height={400}
                          unoptimized
                          className="max-w-full rounded-md border object-contain"
                        />
                      )}
                      {isVideo && (
                        <video
                          src={url}
                          controls
                          className="w-full rounded-md border"
                          style={{ maxHeight: 280 }}
                        />
                      )}
                      {isAudio && (
                        <audio src={url} controls className="w-full" />
                      )}
                      {!isImage &&
                        !isVideo &&
                        !isAudio &&
                        inputType !== 'multiple_choice' && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            View uploaded file
                          </a>
                        )}
                    </div>
                  </div>
                )
              })()}

            {inputType === 'voice' || inputType === 'image' ? (
              <VoiceVideoSubmission
                type={inputType as 'video' | 'voice' | 'image'}
                taskId={currentItem?.id ? String(currentItem.id) : ''}
                setUploading={setUploading}
              />
            ) : (
              <>
                <Card className="bg-card/20">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {inputType === 'multiple_choice' &&
                      choicesToShow.length > 0
                        ? 'Select Label Option *'
                        : 'Provide Answer *'}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {inputType === 'multiple_choice' &&
                    choicesToShow.length > 0 ? (
                      choicesToShow.map((choice, index) => (
                        <Button
                          key={index}
                          variant={
                            selectedCategory === choice.option_text
                              ? 'default'
                              : 'outline'
                          }
                          className="w-full cursor-pointer justify-start"
                          onClick={() =>
                            handleCategorySelect(choice.option_text)
                          }
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
              </>
            )}

            {itemType?.toLowerCase() === 'video' && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="default"
                  className="gap-2"
                  onClick={() =>
                    router.push(
                      `/label/recorder/taskId=${currentItem?.id}?type=video`
                    )
                  }
                >
                  <Video className="h-4 w-4" />
                  Go to Video Submission
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {(inputType === 'multiple_choice' || inputType === 'text') && (
                <Button
                  onClick={handleSubmitLabelLocal}
                  disabled={
                    inputType === 'multiple_choice' && !selectedCategory
                  }
                  className="w-full"
                  variant="default"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {inputType === 'multiple_choice'
                    ? isLastItem
                      ? 'Complete Task'
                      : 'Submit Choice'
                    : isLastItem
                      ? 'Complete Task'
                      : 'Submit & Continue'}
                </Button>
              )}

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
        <DialogContent className="flex w-[90%] max-w-lg flex-col items-center justify-center rounded-xl border p-6 shadow-sm sm:top-1/2 sm:-translate-y-1/2">
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
                <div className="text-muted-foreground">Notes: {notes}</div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
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
