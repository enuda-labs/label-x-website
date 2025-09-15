"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import VoiceVideoSubmission from "@/components/VoiceVideoSubmission/VoiceVideoSubmission";

export default function RecorderPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = use(params); // ✅ unwrap the promise
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as "voice" | "video") ?? null;

  if (!type) {
    return <p className="text-red-500">❌ No recorder type provided</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4 text-white">
        Recorder for Task {taskId} ({type})
      </h1>
      <VoiceVideoSubmission type={type} taskId={taskId} />
    </div>
  );
}
