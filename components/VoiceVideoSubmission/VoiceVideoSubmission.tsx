"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  formatTime,
  getSupportedMime,
  readableSize,
  attachBlobToElement,
} from "@/utils/mediaHelpers";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { uploadToCloudinary, copyToClipboard } from "@/utils/cloudinaryUpload";
import { annotateTask } from "@/services/apis/clusters";
import { AxiosError } from "axios"


type Props = {
  type: "voice" | "video" | "image";
  taskId: string;
};

export default function VoiceVideoSubmission({ type, taskId }: Props) {
  const maxAudioSec = 60; // seconds
  const maxVideoSec = 30;

  // audio/video state
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);

  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);

  const [audioElapsed, setAudioElapsed] = useState(0);
  const [videoElapsed, setVideoElapsed] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  // cloudinary/upload states
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [audioCloudUrl, setAudioCloudUrl] = useState<string | null>(null);
  const [videoCloudUrl, setVideoCloudUrl] = useState<string | null>(null);

  // image support
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageCloudUrl, setImageCloudUrl] = useState<string | null>(null);

  // refs
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoStreamRef = useRef<MediaStream | null>(null);

  const cameraPreviewRef = useRef<HTMLVideoElement | null>(null);
  const recordedVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioTimerRef = useRef<number | null>(null);
  const videoTimerRef = useRef<number | null>(null);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((t) => t.stop());
        videoStreamRef.current = null;
      }
      if (audioRecorderRef.current && audioRecorderRef.current.state === "recording")
        audioRecorderRef.current.stop();
      if (videoRecorderRef.current && videoRecorderRef.current.state === "recording")
        videoRecorderRef.current.stop();
      if (audioTimerRef.current) window.clearInterval(audioTimerRef.current);
      if (videoTimerRef.current) window.clearInterval(videoTimerRef.current);
      // revoke previews if left
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // one useEffect to auto-close success dialog
  useEffect(() => {
    if (!successOpen) return;
    const t = setTimeout(() => setSuccessOpen(false), 3000);
    return () => clearTimeout(t);
  }, [successOpen]);

  // timers
  const startAudioTimer = () => {
    setAudioElapsed(0);
    if (audioTimerRef.current) window.clearInterval(audioTimerRef.current);
    audioTimerRef.current = window.setInterval(() => setAudioElapsed((e) => e + 1), 1000);
  };
  const stopAudioTimer = () => {
    if (audioTimerRef.current) {
      window.clearInterval(audioTimerRef.current);
      audioTimerRef.current = null;
    }
  };

  const startVideoTimer = () => {
    setVideoElapsed(0);
    if (videoTimerRef.current) window.clearInterval(videoTimerRef.current);
    videoTimerRef.current = window.setInterval(() => setVideoElapsed((e) => e + 1), 1000);
  };
  const stopVideoTimer = () => {
    if (videoTimerRef.current) {
      window.clearInterval(videoTimerRef.current);
      videoTimerRef.current = null;
    }
  };

  // ===== Image functions =====
  const handleUploadImage = async () => {
    if (!imageFile) {
      setError("No image selected.")
      return
    }
    setError(null)
    setUploadingImage(true)
    setImageCloudUrl(null)
    try {
      const url = await uploadToCloudinary(imageFile, "image")
      setImageCloudUrl(url)

      const payload = {
        task_id: Number(taskId),
        labels: url ? [url] : [],
      }
      await annotateTask(payload)
      setSuccessOpen(true)
      discardImage()
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>
      console.error(error)
      setError(error.response?.data?.detail || error.message || "Upload failed.")
    } finally {
      setUploadingImage(false)
    }
  }

  const discardImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setImageCloudUrl(null);
  };

  // ===== Audio upload =====
  const handleUploadAudio = async () => {
  if (!audioBlob) {
    setError("No audio to upload.")
    return
  }
  setError(null)
  setUploadingAudio(true)
  setAudioCloudUrl(null)
  try {
    const url = await uploadToCloudinary(audioBlob, "video") // ✅ keep video for audio uploads
    setAudioCloudUrl(url)

    const payload = {
      task_id: Number(taskId),
      labels: url ? [url] : [],
    }
    await annotateTask(payload)
    setSuccessOpen(true)
    discardAudio()
  } catch (err: unknown) {
    const error = err as AxiosError<{ detail?: string }>
    console.error(error)
    setError(error.response?.data?.detail || error.message || "Upload failed.")
  } finally {
    setUploadingAudio(false)
  }
}

  // ===== Video upload =====
  const handleUploadVideo = async () => {
    if (!videoBlob) {
      setError("No video to upload.");
      return;
    }
    setError(null);
    setUploadingVideo(true);
    setVideoCloudUrl(null);

    try {
      const url = await uploadToCloudinary(videoBlob, "video");
      setVideoCloudUrl(url);

      const payload = {
        task_id: Number(taskId),
        labels: url ? [url] : [],
      };

      await annotateTask(payload);
      setSuccessOpen(true);
      discardVideo();
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      console.error(error);
      setError(error.response?.data?.detail || error.message || "Upload failed.");
    } finally {
      setUploadingVideo(false);
    }
  };


  // ===== AUDIO recording =====
  const startAudioRecording = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("MediaDevices API unavailable");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const audioMime = getSupportedMime([
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/aac",
      ]);
      if (!audioMime) {
        throw new Error("No supported audio format available for recording.");
      }

      const mr = new MediaRecorder(stream, { mimeType: audioMime });
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size) audioChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        try {
          const blob = new Blob(audioChunksRef.current, { type: audioMime });
          if (!blob || blob.size === 0) {
            setError("Recording failed — no audio captured.");
            stream.getTracks().forEach((t) => t.stop());
            stopAudioTimer();
            return;
          }

          if (audioUrl) URL.revokeObjectURL(audioUrl);
          setAudioBlob(blob);
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);

          await attachBlobToElement(audioRef.current, blob, (d) => setAudioDuration(d), setError);
        } finally {
          stream.getTracks().forEach((t) => t.stop());
          stopAudioTimer();
        }
      };

      mr.start();
      audioRecorderRef.current = mr;
      setIsRecordingAudio(true);
      startAudioTimer();

      setTimeout(() => {
        if (mr.state === "recording") {
          mr.stop();
          setIsRecordingAudio(false);
        }
      }, maxAudioSec * 1000);
    } catch (err: unknown) {
      console.error(err);

      if (err && typeof err === "object" && "name" in err && (err as { name?: string }).name === "NotAllowedError") {
        setError("Permission denied: allow microphone access.");
      } else if (err instanceof Error) {
        setError(`Failed to start audio recording: ${err.message}`);
      } else {
        setError("Failed to start audio recording: Unknown error.");
      }
    }
  };


  const stopAudioRecording = () => {
    try {
      if (audioRecorderRef.current && audioRecorderRef.current.state === "recording")
        audioRecorderRef.current.stop();
    } catch (err) {
      console.warn(err);
    } finally {
      setIsRecordingAudio(false);
      stopAudioTimer();
    }
  };

  const discardAudio = () => {
    setAudioBlob(null);
    setAudioCloudUrl(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioDuration(null);
    setAudioElapsed(0);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }

    if (audioRecorderRef.current && audioRecorderRef.current.state === "recording") {
      audioRecorderRef.current.stop();
    }
  };

  // ===== VIDEO recording =====
  const startVideoRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoStreamRef.current = stream;

      if (cameraPreviewRef.current) {
        cameraPreviewRef.current.srcObject = stream;
        cameraPreviewRef.current.muted = true;
        cameraPreviewRef.current.play().catch(() => {});
      }

      const videoMime = getSupportedMime([
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ]);

      const mr = videoMime
        ? new MediaRecorder(stream, { mimeType: videoMime })
        : new MediaRecorder(stream);

      videoChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size) videoChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        try {
          const blob = new Blob(videoChunksRef.current, { type: videoMime || "video/webm" });
          if (!blob || blob.size === 0) {
            setError("Recording failed — no video captured.");
            if (videoStreamRef.current) {
              videoStreamRef.current.getTracks().forEach((t) => t.stop());
              videoStreamRef.current = null;
            }
            stopVideoTimer();
            return;
          }

          if (videoUrl) URL.revokeObjectURL(videoUrl);
          setVideoBlob(blob);
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);

          await attachBlobToElement(recordedVideoRef.current, blob, (d) => setVideoDuration(d));
        } finally {
          if (videoStreamRef.current) {
            videoStreamRef.current.getTracks().forEach((t) => t.stop());
            videoStreamRef.current = null;
          }
          if (cameraPreviewRef.current) cameraPreviewRef.current.srcObject = null;
          stopVideoTimer();
        }
      };

      mr.start();
      videoRecorderRef.current = mr;
      setIsRecordingVideo(true);
      startVideoTimer();

      setTimeout(() => {
        if (mr.state === "recording") {
          mr.stop();
          setIsRecordingVideo(false);
        }
      }, maxVideoSec * 1000);
    } catch (err: unknown) {
      console.error(err);

      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Permission denied: allow camera/microphone access.");
      } else if (err instanceof Error) {
        setError(`Failed to start video recording: ${err.message}`);
      } else {
        setError("Failed to start video recording: Unknown error.");
      }
    }
  };

  const stopVideoRecording = () => {
    try {
      if (videoRecorderRef.current && videoRecorderRef.current.state === "recording")
        videoRecorderRef.current.stop();
    } catch (err) {
      console.warn(err);
    } finally {
      setIsRecordingVideo(false);
      stopVideoTimer();
    }
  };

  const discardVideo = () => {
    setVideoBlob(null);
    setVideoCloudUrl(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setVideoDuration(null);
    setVideoElapsed(0);

    if (recordedVideoRef.current) {
      recordedVideoRef.current.pause();
      recordedVideoRef.current.removeAttribute("src");
      recordedVideoRef.current.load();
    }

    if (videoRecorderRef.current && videoRecorderRef.current.state === "recording") {
      videoRecorderRef.current.stop();
    }
  };

  // ===== UI =====
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">
        {type === "voice" ? "Attach Voice Note" : type === "video" ? "Attach Video" : "Upload Image"}
      </h3>

      {error && <div className="rounded-md border border-red-600/40 bg-red-600/10 p-3 text-red-200">{error}</div>}

      <div className="grid gap-4 md:grid-cols-1">
        {type === "voice" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-white/60">Voice Note</div>
                <div className="mt-2 text-sm text-white/80">Record a short voice note for labelers.</div>
              </div>
              <div className="text-xs text-white/60">Max {maxAudioSec}s</div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                {!isRecordingAudio ? (
                  <button type="button" className="rounded-md bg-red-600 px-3 py-2 text-sm cursor-pointer font-medium text-white" onClick={startAudioRecording}>
                    Record
                  </button>
                ) : (
                  <button type="button" className="rounded-md bg-zinc-700 px-3 py-2 text-sm cursor-pointer font-medium text-white" onClick={stopAudioRecording}>
                    Stop
                  </button>
                )}

                <button type="button" className="rounded-md border border-white/10 px-3 py-2 text-sm cursor-pointer text-white/80" onClick={() => audioRef.current?.play()} disabled={!audioBlob}>
                  Play
                </button>

                <button type="button" className="rounded-md border border-white/10 px-3 py-2 text-sm cursor-pointer text-white/80" onClick={discardAudio} disabled={!audioBlob}>
                  Discard
                </button>

                <button type="button" onClick={handleUploadAudio} disabled={!audioBlob || uploadingAudio} className="rounded-md border border-white/10 px-3 py-2 text-sm cursor-pointer text-white/80">
                  {uploadingAudio ? "Uploading…" : "Upload"}
                </button>

                {audioBlob && <div className="ml-auto text-xs text-white/60">{readableSize(audioBlob.size)} • {audioDuration ? `${formatTime(audioDuration)}` : "Recorded"}</div>}
              </div>

              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${isRecordingAudio ? "bg-red-500 animate-pulse" : "bg-white/20"}`} aria-hidden />
                <div className="text-xs text-white/60">{isRecordingAudio ? `Recording — ${formatTime(audioElapsed)}` : audioBlob ? `Recorded • ${audioDuration ? formatTime(audioDuration) : "—"}` : "Not recorded"}</div>
              </div>

              <div className="w-full bg-white/10 h-2 rounded overflow-hidden mt-2">
                <div className="h-2 bg-red-500" style={{ width: `${Math.min(100, (isRecordingAudio ? (audioElapsed / maxAudioSec) * 100 : (audioDuration ? (audioDuration / maxAudioSec) * 100 : 0)))}%` }} />
              </div>

              <audio ref={audioRef} controls src={audioUrl ?? undefined} className="w-full" />
              {audioUrl && (
                <div className="mt-2 text-xs">
                  <a href={audioUrl} download="recording_audio.webm" className="underline">Download audio</a>
                </div>
              )}

              {audioCloudUrl && (
                <div className="mt-2 text-xs flex items-center gap-2">
                  <a href={audioCloudUrl} target="_blank" rel="noreferrer" className="underline">Open uploaded audio</a>
                  <button onClick={() => copyToClipboard(audioCloudUrl)} className="text-xs underline">Copy URL</button>
                </div>
              )}
            </div>
          </div>
        )}

        {type === "image" && (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white/60">Image Upload</div>
          <div className="mt-2 text-sm text-white/80">
            Select an image file to upload for this task.
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {/* Styled Upload Button */}
        <div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (file) {
                if (imagePreview) URL.revokeObjectURL(imagePreview);
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              } else {
                discardImage();
              }
            }}
          />
          <label htmlFor="image-upload">
            <Button asChild variant="default" size="sm">
              <span>Choose Image</span>
            </Button>
          </label>
        </div>

        {imagePreview && (
          <div className="mt-3">
          <Image
     src={imagePreview}
     alt="Selected preview"
     width={400}
     height={400}
     unoptimized
     className="max-h-64 rounded-md border border-white/10 object-contain"
   />
            <div className="mt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={discardImage}
                className="text-xs"
              >
                Discard
              </Button>
              <Button
                onClick={handleUploadImage}
                disabled={!imageFile || uploadingImage}
                size="sm"
                className="text-xs"
              >
                {uploadingImage ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </div>
        )}

        {imageCloudUrl && (
          <div className="mt-2 text-xs flex items-center gap-2">
            <a
              href={imageCloudUrl}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Open uploaded image
            </a>
            <button
              onClick={() => copyToClipboard(imageCloudUrl)}
              className="text-xs underline"
            >
              Copy URL
            </button>
          </div>
        )}
      </div>
    </div>
  )}


        {type === "video" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-white/60">Video Recording</div>
                <div className="mt-2 text-sm text-white/80">Record a short video to show context to labelers.</div>
              </div>
              <div className="text-xs text-white/60">Max {maxVideoSec}s</div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                {!isRecordingVideo ? (
                  <button type="button" className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white" onClick={startVideoRecording}>
                    Record
                  </button>
                ) : (
                  <button type="button" className="rounded-md bg-zinc-700 px-3 py-2 text-sm font-medium text-white" onClick={stopVideoRecording}>
                    Stop
                  </button>
                )}

                <button type="button" className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/80" onClick={() => recordedVideoRef.current?.play()} disabled={!videoBlob}>Play</button>

                <button type="button" className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/80" onClick={discardVideo} disabled={!videoBlob}>Discard</button>

                <button type="button" onClick={handleUploadVideo} disabled={!videoBlob || uploadingVideo} className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/80">
                  {uploadingVideo ? "Uploading…" : "Upload"}
                </button>

                {videoBlob && <div className="ml-auto text-xs text-white/60">{readableSize(videoBlob.size)} • {videoDuration ? `${formatTime(videoDuration)}` : "Recorded"}</div>}
              </div>

              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${isRecordingVideo ? "bg-red-500 animate-pulse" : "bg-white/20"}`} aria-hidden />
                <div className="text-xs text-white/60">{isRecordingVideo ? `Recording — ${formatTime(videoElapsed)}` : videoBlob ? `Recorded • ${videoDuration ? formatTime(videoDuration) : "—"}` : "Not recorded"}</div>
              </div>

              <div className="w-full bg-white/10 h-2 rounded overflow-hidden mt-2">
                <div className="h-2 bg-red-500" style={{ width: `${Math.min(100, (isRecordingVideo ? (videoElapsed / maxVideoSec) * 100 : (videoDuration ? (videoDuration / maxVideoSec) * 100 : 0)))}%` }} />
              </div>

              <div className="w-full overflow-hidden rounded-md bg-black/30">
                <video ref={cameraPreviewRef} className="h-[180px] w-full object-cover" playsInline muted autoPlay />
              </div>

              <video ref={recordedVideoRef} controls src={videoUrl ?? undefined} className="w-full rounded-md" playsInline />

              {videoUrl && (
                <div className="mt-2 text-xs">
                  <a href={videoUrl} download="recording_video.webm" className="underline">Download video</a>
                </div>
              )}

              {videoCloudUrl && (
                <div className="mt-2 text-xs flex items-center gap-2">
                  <a href={videoCloudUrl} target="_blank" rel="noreferrer" className="underline">Open uploaded video</a>
                  <button onClick={() => copyToClipboard(videoCloudUrl)} className="text-xs underline">Copy URL</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-white/60">Tips: Keep clips short (under {maxAudioSec}s / {maxVideoSec}s). The component records in webm if supported; server should accept webm or transcode. If permissions are blocked, open Chrome → lock icon → Site settings → Allow Camera & Microphone for localhost.</div>

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
