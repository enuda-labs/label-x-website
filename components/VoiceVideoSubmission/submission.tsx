"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// ✅ import split components
import VoiceSubmission from "@/components/VoiceSubmission";
import VideoSubmission from "@/components/VideoSubmission";
import ImageSubmission from "@/components/ImageSubmission";

type Props = {
  type: "voice" | "video" | "image";
  taskId: string;
};

export default function VoiceVideoSubmission({ type, taskId }: Props) {
  const [successOpen, setSuccessOpen] = useState(false);

  // auto-close success dialog
  useEffect(() => {
    if (!successOpen) return;
    const t = setTimeout(() => setSuccessOpen(false), 3000);
    return () => clearTimeout(t);
  }, [successOpen]);

  const handleSuccess = () => setSuccessOpen(true);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">
        {type === "voice" ? "Attach Voice Note" : type === "video" ? "Attach Video" : "Upload Image"}
      </h3>

      {/* ✅ Render split components */}
      <div className="grid gap-4 md:grid-cols-1">
        {type === "voice" && <VoiceSubmission taskId={taskId} onSuccess={handleSuccess} />}
        {type === "video" && <VideoSubmission taskId={taskId} onSuccess={handleSuccess} />}
        {type === "image" && <ImageSubmission taskId={taskId} onSuccess={handleSuccess} />}
      </div>

      <div className="text-sm text-white/60">
        Tips: Keep clips short (under 60s / 30s). The component records in webm if supported;
        server should accept webm or transcode. If permissions are blocked, open Chrome → lock icon → Site settings → Allow Camera & Microphone for localhost.
      </div>

      {/* ✅ Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="text-green-500 w-12 h-12" />
            </div>
            <DialogTitle className="text-lg font-semibold text-green-600">Upload Successful!</DialogTitle>
            <DialogDescription>
              Your {type === "voice" ? "voice note" : type === "video" ? "video" : "image"} has been uploaded successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center">
            <Button onClick={() => setSuccessOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
