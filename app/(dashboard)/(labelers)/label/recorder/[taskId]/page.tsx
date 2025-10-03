'use client'

import { use } from 'react'
import { useSearchParams } from 'next/navigation'
import VoiceVideoSubmission from '@/components/VoiceVideoSubmission/VoiceVideoSubmission'
import DashboardLayout from '@/components/shared/dashboard-layout'

export default function RecorderPage({
  params,
}: {
  params: Promise<{ taskId: string }>
}) {
  const { taskId } = use(params) // ✅ unwrap the promise
  const searchParams = useSearchParams()
  const type = (searchParams.get('type') as 'voice' | 'video' | 'image') ?? null

  if (!type) {
    return <p className="text-red-500">❌ No recorder type provided</p>
  }

  return (
    <DashboardLayout title="Media Labeling">
      <h1 className="mb-4 text-xl font-bold text-white">
        Recorder for Task {taskId} ({type})
      </h1>

      <VoiceVideoSubmission type={type} taskId={taskId} />
    </DashboardLayout>
  )
}
