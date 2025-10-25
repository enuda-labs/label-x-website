"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Eye,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Database,
  Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AxiosError } from "axios"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import Image from "next/image"
import { fetchTaskById, assignTaskToMe } from "@/services/apis/clusters"
import { ApiResponse } from "@/types/ApiResponse"

// ---------------- Types ----------------
interface TaskFile {
  file_url?: string
  file_name?: string
  file_size_bytes?: number
  file_type?: string
}

interface ApiTaskItem extends TaskFile {
  id?: number
  serial_no?: string
  task_type?: "TEXT" | "IMAGE" | "VIDEO" | "PDF" | "CSV"
  data?: string
}

interface ApiTaskResponse {
  id?: number
  tasks?: ApiTaskItem[]
  title?: string
  labelling_choices?: Array<{ option_text: string }>
  choices?: Array<{ option_text: string }>
  input_type?: "multiple_choice" | "text_input"
  labeller_instructions?: string
  task_type?: "TEXT" | "IMAGE" | "VIDEO" | "PDF" | "CSV"
}


interface ApiError {
  detail?: string
  message?: string
  error?: string
}


// ---------------- Helpers ----------------
const getTaskTypeIcon = (type?: string) => {
  switch (type) {
    case "TEXT":
      return <FileText className="size-5" />
    case "IMAGE":
      return <ImageIcon className="size-5" />
    case "VIDEO":
      return <Video className="size-5" />
    case "CSV":
    case "PDF":
      return <Database className="size-5" />
    default:
      return <FileText className="size-5" />
  }
}

const FALLBACK_LABELS = [
  { option_text: "Electronics" },
  { option_text: "Clothing" },
  { option_text: "Home & Garden" },
  { option_text: "Sports" },
]

// ---------------- Component ----------------
const LabelTask = () => {
  const { reviewTaskId } = useParams<{ reviewTaskId: string }>()
  const router = useRouter()

  const [taskData, setTaskData] = useState<ApiTaskResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [notes, setNotes] = useState("")

  // assign flow
  const [assigning, setAssigning] = useState(false)
  const [confirmAssignOpen, setConfirmAssignOpen] = useState(false)

  // loadTask declared so handleAssign can refresh after successful assign
  const loadTask = async (idToFetch: number) => {
    try {
      setLoading(true)
      setError(null)
      const resp = (await fetchTaskById(idToFetch)) as ApiResponse | { data: ApiTaskResponse }
      const payload: ApiTaskResponse = "data" in resp && resp.data ? resp.data : (resp as ApiTaskResponse)
      setTaskData(payload || null)


    } catch (err) {
      // show friendly error
      const error = err as AxiosError<ApiError>
      if (error instanceof AxiosError) {
        if (!error.response) {
          setError("Network error: failed to reach server. Check your connection.")
        } else {
          const data = error.response.data
          const serverMsg = data?.detail || data?.message || data?.error
          setError(serverMsg || `Failed to load task (status ${error.response.status}).`)
        }
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred while loading the task.")
      }
    } finally {
      setLoading(false)
    }
  }

  // ✅ Fetch effect
  useEffect(() => {
    if (!reviewTaskId) {
      console.warn("❌ No reviewTaskId found in params")
      return
    }

    const idToFetch = Number(reviewTaskId)
    setCurrentItemIndex(0)
    setNotes("")
    loadTask(idToFetch)
  }, [reviewTaskId])

  const handleAssign = async () => {
    if (!reviewTaskId) return
    setAssigning(true)

    try {
      await assignTaskToMe(Number(reviewTaskId))
      toast.success("Cluster assigned successfully!", {
        description: "You can now work on this cluster.",
      })
      setConfirmAssignOpen(false)

      router.push(`/label/tasks`)
    } catch (err) {
      // Robust, user-friendly error handling
      let message = "Failed to assign cluster. Please try again."

      if (err instanceof AxiosError) {
        // network-level problem (no response)
        if (!err.response) {
          message = "Network error: couldn't reach the server. Check your connection."
        } else {
          const status = err.response.status
          const data = err.response.data
          const serverMsg = data?.detail || data?.message || data?.error || (typeof data === "string" ? data : null)

          switch (status) {
            case 400:
              message = serverMsg || "Bad request. Please check the input and try again."
              break
            case 401:
              message = serverMsg || "Unauthorized. Please sign in and try again."
              break
            case 403:
              message = serverMsg || "Forbidden. You don't have permission to assign this cluster."
              break
            case 404:
              message = serverMsg || "Cluster not found. It may have been removed."
              break
            case 409:
              message = serverMsg || "Conflict: this cluster may already be assigned."
              break
            case 422:
              message = serverMsg || "Validation failed. Please check the data and try again."
              break
            case 429:
              message = serverMsg || "Too many requests. Please wait a moment and try again."
              break
            case 500:
            case 502:
            case 503:
            case 504:
              message = serverMsg || `Server error (${status}). Please try again later.`
              break
            default:
              message = serverMsg || `Unexpected error (${status}).`
          }
        }
      } else if (err instanceof Error) {
        message = err.message
      } else {
        message = "An unknown error occurred during assignment."
      }

      toast.error(message)
      console.error("Assign error:", err)
    } finally {
      setAssigning(false)
    }
  }

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
  const currentItem = items[currentItemIndex] ?? { data: "" }
  const labellingChoices = taskData.choices ?? taskData.labelling_choices ?? []


  const choicesToShow = labellingChoices.length > 0 ? labellingChoices : FALLBACK_LABELS
  const itemType = currentItem?.task_type ?? taskData.task_type ?? "TEXT"

  const handleNextTask = () => {
    if (currentItemIndex < totalItems - 1) {
      setCurrentItemIndex(currentItemIndex + 1)
    }
  }

  const handlePreviousTask = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1)
    }
  }

  return (
    <div className="bg-card/20 min-h-screen">
      {/* HEADER */}
      <header className="bg-card/30 sticky top-0 z-50 border-b backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/label/overview")}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="default" size="sm" onClick={() => setConfirmAssignOpen(true)} disabled={assigning}>
              {assigning ? "Assigning..." : "Assign to Me"}
            </Button>
          </div>
        </div>
      </header>



      {/* MAIN CONTENT */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 flex items-start gap-2">
          <div className="pt-1">{getTaskTypeIcon(taskData.task_type)}</div>
          <div>
            <h1 className="text-xl font-semibold">{taskData.title ?? `Task #${taskData.id ?? reviewTaskId}`}</h1>
            <p className="text-muted-foreground text-sm">Item {currentItemIndex + 1} of {totalItems}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* TASK DISPLAY */}
          <div className="lg:col-span-2">
            <Card className="shadow-soft bg-card/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="text-primary h-5 w-5" /> Content to Label
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-6">
                  {itemType === "TEXT" && (
                    <p className="text-lg leading-relaxed">{currentItem?.data || "No text available"}</p>
                  )}

                  {itemType === "IMAGE" &&
    (currentItem?.file_url ? (
      <div className="relative w-full h-[400px] flex items-center justify-center">
        <Image
          src={currentItem.file_url}
          alt={currentItem.file_name || "Task Image"}
          fill
          className="rounded-lg shadow object-contain"
        />
      </div>
    ) : (
      <p className="text-sm text-gray-500">
        <AlertCircle className="inline-block mr-1" />No image available
      </p>
    ))}


                  {itemType === "VIDEO" &&
                    (currentItem?.file_url ? (
                      <video src={currentItem.file_url} controls className="w-full rounded-lg shadow" />
                    ) : (
                      <p className="text-sm text-gray-500">No video available</p>
                    ))}

                  {["PDF", "CSV"].includes(itemType) &&
                    (currentItem?.file_url ? (
                      <iframe src={currentItem.file_url} className="w-full h-[400px] border rounded-lg" />
                    ) : (
                      <p className="text-sm text-gray-500">No file available</p>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <Card className="bg-card/20 border-primary border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="text-primary h-4 w-4" /> Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{taskData.labeller_instructions ?? "Follow the instructions provided for this task."}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/20">
              <CardHeader>
                <CardTitle className="text-base">Available Labels</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {choicesToShow.map((choice, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 text-sm cursor-default select-none opacity-80">
                    {choice.option_text}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/20">
              <CardHeader>
                <CardTitle className="text-base">Additional Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea placeholder="Add any additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[80px]" />
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handlePreviousTask} disabled={currentItemIndex === 0} variant="ghost" className="bg-card/20 flex-1">
                Previous Task
              </Button>
              <Button onClick={handleNextTask} disabled={currentItemIndex >= totalItems - 1} className="flex-1">
                Next Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Assign */}
      <Dialog open={confirmAssignOpen} onOpenChange={setConfirmAssignOpen}>
        <DialogContent className="max-w-lg sm:top-1/2 sm:-translate-y-1/2 flex flex-col items-center justify-center">
          <DialogHeader>
            <DialogTitle>Confirm Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to assign this cluster (<b>{taskData.labeller_instructions}</b> #{taskData.id}) to yourself?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={assigning}>{assigning ? "Assigning..." : "Yes, Assign"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LabelTask
