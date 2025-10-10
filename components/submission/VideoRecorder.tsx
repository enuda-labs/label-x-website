"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { readableSize, formatTime, getSupportedMime, attachBlobToElement } from "@/utils/mediaHelpers";
import { uploadToCloudinary, copyToClipboard } from "@/utils/cloudinaryUpload";
import { annotateTask } from "@/services/apis/clusters";
import { AxiosError } from "axios";

type Props = {
  taskId: string;
  onSuccess?: () => void;
  maxVideoSec?: number; // optional, defaults to 60
};

export default function VideoSubmission({ taskId, onSuccess, maxVideoSec = 60 }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoElapsed, setVideoElapsed] = useState(0);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoCloudUrl, setVideoCloudUrl] = useState<string | null>(null);
  const [audioOnly, setAudioOnly] = useState(false);

  const cameraPreviewRef = useRef<HTMLVideoElement | null>(null);
  const recordedVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoTimerRef = useRef<number | null>(null);

  // Timer
  const startTimer = () => {
    setVideoElapsed(0);
    if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    videoTimerRef.current = window.setInterval(() => setVideoElapsed((t) => t + 1), 1000);
  };

  const stopTimer = () => {
    if (videoTimerRef.current) {
      clearInterval(videoTimerRef.current);
      videoTimerRef.current = null;
    }
  };

  const startVideoRecording = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("MediaDevices API unavailable");
      }

      // 🎥 Get combined stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoChunksRef.current = [];

      // ✅ Warm up microphone before starting MediaRecorder
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      let warmed = false;
      const warmupPromise = new Promise<void>((resolve) => {
        processor.onaudioprocess = () => {
          if (!warmed) {
            warmed = true;
            resolve();
          }
        };
      });

      await warmupPromise;

      // clean up warmup nodes
      processor.disconnect();
      source.disconnect();

      // ✅ Safe mime type
      const videoMime = getSupportedMime([
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4",
      ]);
      if (!videoMime) throw new Error("No supported video format available.");

      // 🔴 Show live preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      // 🎬 Setup MediaRecorder
      const mr = new MediaRecorder(stream, { mimeType: videoMime });

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size) videoChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        try {
          const blob = new Blob(videoChunksRef.current, { type: videoMime });
          if (!blob || blob.size === 0) {
            setError("Recording failed — no video captured.");
            stream.getTracks().forEach((t) => t.stop());
            stopVideoTimer();
            return;
          }

          if (videoUrl) URL.revokeObjectURL(videoUrl);
          setVideoBlob(blob);

          const url = URL.createObjectURL(blob);
          setVideoUrl(url);

          await attachBlobToElement(videoRef.current, blob, (d) => setVideoDuration(d), setError);
        } finally {
          stream.getTracks().forEach((t) => t.stop());
          stopVideoTimer();
        }
      };

      // ✅ Start with a short timeslice (flush chunks early)
      mr.start(200);
      videoRecorderRef.current = mr;
      setIsRecordingVideo(true);
      startVideoTimer();

      // Auto stop after maxVideoSec
      setTimeout(() => {
        if (mr.state === "recording") {
          mr.stop();
          setIsRecordingVideo(false);
        }
      }, maxVideoSec * 1000);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Permission denied: allow camera and microphone access.");
      } else if (err instanceof Error) {
        setError(`Failed to start video recording: ${err.message}`);
      } else {
        setError("Failed to start video recording: Unknown error.");
      }
    }
  };

  const stopVideoRecording = () => {
    try {
      if (videoRecorderRef.current?.state === "recording") videoRecorderRef.current.stop();
    } finally {
      setIsRecordingVideo(false);
      stopTimer();
    }
  };

  const discardVideo = () => {
    setVideoBlob(null);
    setVideoCloudUrl(null);
    if (videoURL) URL.revokeObjectURL(videoURL);
    setVideoURL(null);
    setVideoDuration(null);
    setVideoElapsed(0);
    recordedVideoRef.current?.pause();
    recordedVideoRef.current?.removeAttribute("src");
    recordedVideoRef.current?.load();
  };

  const handleUploadVideo = async () => {
    if (!videoBlob) {
      setError("No video to upload.");
      return;
    }
    setUploadingVideo(true);
    setVideoCloudUrl(null);
    try {
      const resourceType = "video";
      const url = await uploadToCloudinary(videoBlob, resourceType);
      setVideoCloudUrl(url);
      await annotateTask({ task_id: Number(taskId), labels: [url] });
      discardVideo();
      onSuccess?.(); // ✅ trigger parent modal
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      setError(error.response?.data?.detail || error.message || "Upload failed.");
    } finally {
      setUploadingVideo(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white/60">Video Recording</div>
          <div className="mt-2 text-sm text-white/80">Record a short video note.</div>
        </div>
        <div className="text-xs text-white/60">Max {maxVideoSec}s</div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-600/40 bg-red-600/10 p-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Camera preview */}
      <video
        ref={cameraPreviewRef}
        autoPlay
        muted
        className={`w-full rounded-lg ${isRecordingVideo ? "border-2 border-green-500" : ""}`}
      />

      {/* Recorded video */}
      {videoURL && !isRecordingVideo && (
        <video
          ref={recordedVideoRef}
          controls
          src={videoURL ?? undefined}
          className="w-full rounded-lg"
        />
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!isRecordingVideo ? (
          <Button onClick={startVideoRecording} className="bg-red-600 hover:bg-red-700 text-white">
            Record
          </Button>
        ) : (
          <Button onClick={stopVideoRecording} className="bg-zinc-700 text-white">
            Stop
          </Button>
        )}

        <Button
          variant="outline"
          onClick={discardVideo}
          disabled={!videoBlob}
          className="text-white/80"
        >
          Discard
        </Button>

        {videoBlob && (
          <div className="ml-auto text-xs text-white/60">
            {readableSize(videoBlob.size)} • {videoDuration ? formatTime(videoDuration) : "Recorded"}
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="flex items-center gap-3">
        <div
          className={`h-3 w-3 rounded-full ${
            isRecordingVideo ? "bg-red-500 animate-pulse" : "bg-white/20"
          }`}
        />
        <div className="text-xs text-white/60">
          {isRecordingVideo
            ? `Recording — ${formatTime(videoElapsed)}`
            : videoBlob
            ? `Recorded • ${videoDuration ? formatTime(videoDuration) : "—"}`
            : "Not recorded"}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/10 h-2 rounded overflow-hidden">
        <div
          className="h-2 bg-red-500"
          style={{
            width: `${Math.min(
              100,
              (isRecordingVideo ? videoElapsed : videoDuration ?? 0) / maxVideoSec * 100
            )}%`,
          }}
        />
      </div>

      {/* Extract Audio Only */}
      {videoBlob && !isRecordingVideo && (
        <div className="flex items-center gap-2">
          <input
            id="audioOnly"
            type="checkbox"
            className="h-4 w-4 accent-primary"
            onChange={(e) => setAudioOnly(e.target.checked)}
            checked={audioOnly}
          />
          <label htmlFor="audioOnly" className="text-sm text-white/80">
            Extract audio only
          </label>
        </div>
      )}

      {/* Upload */}
      {videoBlob && (
        <Button
          onClick={handleUploadVideo}
          disabled={uploadingVideo}
          className="w-full bg-primary hover:bg-primary/90 text-white"
        >
          {uploadingVideo ? "Uploading…" : "Upload"}
        </Button>
      )}

      {/* Uploaded URL */}
      {videoCloudUrl && (
        <div className="mt-2 text-xs flex items-center gap-2">
          <a href={videoCloudUrl} target="_blank" rel="noreferrer" className="underline">
            Open uploaded video
          </a>
          <button onClick={() => copyToClipboard(videoCloudUrl)} className="text-xs underline">
            Copy URL
          </button>
        </div>
      )}
    </div>
  );
}
