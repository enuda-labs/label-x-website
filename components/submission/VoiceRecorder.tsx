"use client";

import React, { useRef, useState } from "react";
import { readableSize, formatTime, attachBlobToElement, getSupportedMime } from "@/utils/mediaHelpers";
import { uploadToCloudinary, copyToClipboard } from "@/utils/cloudinaryUpload";
import { annotateTask } from "@/services/apis/clusters";
import { AxiosError } from "axios";

type Props = {
  taskId: string;
  maxAudioSec?: number;
  onSuccess: () => void;
};

export default function VoiceSubmission({ taskId, maxAudioSec = 60, onSuccess }: Props) {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [audioElapsed, setAudioElapsed] = useState(0);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [isPreparingMic, setIsPreparingMic] = useState(false);
  const [audioCloudUrl, setAudioCloudUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioTimerRef = useRef<number | null>(null);

  const startAudioTimer = () => {
    setAudioElapsed(0);
    if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    audioTimerRef.current = window.setInterval(() => setAudioElapsed((t) => t + 1), 1000);
  };

  const stopAudioTimer = () => {
    if (audioTimerRef.current) {
      clearInterval(audioTimerRef.current);
      audioTimerRef.current = null;
    }
  };

  const startAudioRecording = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("MediaDevices API unavailable");
      }

      // 🎙️ Begin preparation state
      setIsPreparingMic(true);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // ✅ Prime microphone before recording
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      // warm-up read
      let warmed = false;
      const warmupPromise = new Promise<void>((resolve) => {
        processor.onaudioprocess = () => {
          if (!warmed) {
            warmed = true;
            resolve();
          }
        };
      });

      // ⏳ Wait until mic is ready
      await warmupPromise;
      processor.disconnect();
      source.disconnect();

      // ✅ Warm-up complete
      setIsPreparingMic(false);

      // ✅ after mic warmed, record
      const audioMime = getSupportedMime([
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/aac",
      ]);
      if (!audioMime) throw new Error("No supported audio format available.");

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

      // ✅ Start recording after mic is ready
      mr.start(200);
      audioRecorderRef.current = mr;
      setIsRecordingAudio(true);
      startAudioTimer();

      // ⏱️ Auto stop
      setTimeout(() => {
        if (mr.state === "recording") {
          mr.stop();
          setIsRecordingAudio(false);
        }
      }, maxAudioSec * 1000);
    } catch (err: unknown) {
      console.error(err);
      setIsPreparingMic(false); // stop preparing state on error
      if (err instanceof DOMException && err.name === "NotAllowedError") {
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
      if (audioRecorderRef.current?.state === "recording") audioRecorderRef.current.stop();
    } finally {
      setIsRecordingAudio(false);
      stopAudioTimer();
    }
  };

  const discardAudio = () => {
    setAudioBlob(null);
    setAudioCloudUrl(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioDuration(null);
    setAudioElapsed(0);
    audioRef.current?.pause();
    audioRef.current?.removeAttribute("src");
    audioRef.current?.load();
  };

  const handleUploadAudio = async () => {
    if (!audioBlob) {
      setError("No audio to upload.");
      return;
    }
    setUploadingAudio(true);
    setAudioCloudUrl(null);
    try {
      const url = await uploadToCloudinary(audioBlob, "video");
      setAudioCloudUrl(url);
      await annotateTask({ task_id: Number(taskId), labels: [url] });
      onSuccess();
      discardAudio();
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      setError(error.response?.data?.detail || error.message || "Upload failed.");
    } finally {
      setUploadingAudio(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white/60">Voice Note</div>
          <div className="mt-2 text-sm text-white/80">
            Record a short voice note for labelers.
          </div>
        </div>
        <div className="text-xs text-white/60">Max {maxAudioSec}s</div>
      </div>

      <div className="mt-4 space-y-3">
        {/* 🎙 Recording controls */}
        <div className="flex items-center gap-2">
          {!isRecordingAudio ? (
            <button
              type="button"
              className="rounded-md bg-red-600 px-3 py-2 text-sm cursor-pointer font-medium text-white"
              onClick={startAudioRecording}
            >
              Record
            </button>
          ) : (
            <button
              type="button"
              className="rounded-md bg-zinc-700 px-3 py-2 text-sm cursor-pointer font-medium text-white"
              onClick={stopAudioRecording}
            >
              Stop
            </button>
          )}

          <button
            type="button"
            className="rounded-md border border-white/10 px-3 py-2 text-sm cursor-pointer text-white/80"
            onClick={() => audioRef.current?.play()}
            disabled={!audioBlob}
          >
            Play
          </button>

          <button
            type="button"
            className="rounded-md border border-white/10 px-3 py-2 text-sm cursor-pointer text-white/80"
            onClick={discardAudio}
            disabled={!audioBlob}
          >
            Discard
          </button>

          {audioBlob && (
            <div className="ml-auto text-xs text-white/60">
              {readableSize(audioBlob.size)} •{" "}
              {audioDuration ? `${formatTime(audioDuration)}` : "Recorded"}
            </div>
          )}
        </div>

        {/* 🌀 Preparing microphone */}
        {isPreparingMic && (
          <div className="text-xs text-white/60 flex items-center gap-2">
            <span className="animate-spin rounded-full h-3 w-3 border-t-2 border-white/40"></span>
            Preparing microphone...
          </div>
        )}

        {/* 🎛 Recording status */}
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              isRecordingAudio ? "bg-red-500 animate-pulse" : "bg-white/20"
            }`}
            aria-hidden
          />
          <div className="text-xs text-white/60">
            {isRecordingAudio
              ? `Recording — ${formatTime(audioElapsed)}`
              : audioBlob
              ? `Recorded • ${
                  audioDuration ? formatTime(audioDuration) : "—"
                }`
              : "Not recorded"}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 h-2 rounded overflow-hidden mt-2">
          <div
            className="h-2 bg-red-500"
            style={{
              width: `${Math.min(
                100,
                isRecordingAudio
                  ? (audioElapsed / maxAudioSec) * 100
                  : audioDuration
                  ? (audioDuration / maxAudioSec) * 100
                  : 0
              )}%`,
            }}
          />
        </div>

        {/* Audio player */}
        <audio
          ref={audioRef}
          controls
          src={audioUrl ?? undefined}
          className="w-full"
        />

        {/* Upload button */}
        {audioBlob && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleUploadAudio}
              disabled={!audioBlob || uploadingAudio}
              className="w-full rounded-md cursor-pointer bg-primary hover:bg-primary/90 px-4 py-2 text-sm font-medium text-white"
            >
              {uploadingAudio ? "Uploading…" : "Upload"}
            </button>
          </div>
        )}

        {audioUrl && (
          <div className="mt-2 text-xs">
            <a
              href={audioUrl}
              download="recording_audio.webm"
              className="underline"
            >
              Download audio
            </a>
          </div>
        )}

        {audioCloudUrl && (
          <div className="mt-2 text-xs flex items-center gap-2">
            <a
              href={audioCloudUrl}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Open uploaded audio
            </a>
            <button
              onClick={() => copyToClipboard(audioCloudUrl)}
              className="text-xs underline"
            >
              Copy URL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
