// components/VoiceVideoSubmission.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  maxAudioSec?: number;
  maxVideoSec?: number;
};

export default function VoiceVideoSubmission({
  maxAudioSec = 60,
  maxVideoSec = 30,
}: Props) {
  // state
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

  // refs
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoStreamRef = useRef<MediaStream | null>(null);

  const cameraPreviewRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordedVideoRef = useRef<HTMLVideoElement | null>(null);

  const audioTimerRef = useRef<number | null>(null);
  const videoTimerRef = useRef<number | null>(null);

  // Hidden file inputs for fallback (mobile Safari)
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

  // cleanup
  useEffect(() => {
    return () => {
      // stop any camera streams
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((t) => t.stop());
        videoStreamRef.current = null;
      }
      // stop recorders
      if (audioRecorderRef.current?.state === "recording") audioRecorderRef.current.stop();
      if (videoRecorderRef.current?.state === "recording") videoRecorderRef.current.stop();
      // clear timers
      if (audioTimerRef.current) window.clearInterval(audioTimerRef.current);
      if (videoTimerRef.current) window.clearInterval(videoTimerRef.current);
      // revoke object urls
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helpers
  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const startTimer = (setElapsed: React.Dispatch<React.SetStateAction<number>>, ref: React.MutableRefObject<number | null>) => {
    setElapsed(0);
    if (ref.current) window.clearInterval(ref.current);
    ref.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
  };
  const stopTimer = (ref: React.MutableRefObject<number | null>) => {
    if (ref.current) {
      window.clearInterval(ref.current);
      ref.current = null;
    }
  };

  // Detect MediaRecorder support at runtime (inside handlers / effects only)
  const mediaRecorderAvailable = (): boolean => {
    if (typeof window === "undefined") return false;
    return "MediaRecorder" in window;
  };

  const isTypeSupported = (type: string): boolean => {
    if (!mediaRecorderAvailable()) return false;
    const MR = (MediaRecorder as unknown) as { isTypeSupported?: (t: string) => boolean };
    try {
      return typeof MR.isTypeSupported === "function" ? !!MR.isTypeSupported(type) : false;
    } catch {
      return false;
    }
  };

  const getSupportedMime = (candidates: string[]) => {
    for (const c of candidates) {
      if (isTypeSupported(c)) return c;
    }
    return "";
  };

  const safeAttachAndPlay = async (el: HTMLMediaElement | null, blob: Blob, setDuration: (n: number | null) => void) => {
    if (!el) return;
    try {
      // revoke previous url if set on this element (we manage at state level)
      const url = URL.createObjectURL(blob);
      el.src = url;
      el.load();
      // wait for metadata or timeout
      await new Promise<void>((resolve) => {
        const onMeta = () => {
          el.removeEventListener("loadedmetadata", onMeta);
          resolve();
        };
        el.addEventListener("loadedmetadata", onMeta);
        // fallback short timeout
        setTimeout(resolve, 1200);
      });
      const dur = el.duration;
      if (!isFinite(dur) || Number.isNaN(dur)) setDuration(null);
      else setDuration(Math.round(dur));
      // try to play (may be blocked until user gesture)
      try {
        await el.play();
      } catch {
        // autoplay blocked — that's OK. user can press play.
      }
    } catch (err) {
      setDuration(null);
      setError("Recorded media may not be playable in this browser.");
    }
  };

  // ---------- AUDIO ----------
  const startAudioRecording = async () => {
    setError(null);
    try {
      if (!mediaRecorderAvailable()) {
        // fallback: open audio file input with capture (mobile Safari)
        if (audioFileInputRef.current) audioFileInputRef.current.click();
        else setError("Recording not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const audioMime = getSupportedMime(["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]) || "";
      const recorder = audioMime ? new MediaRecorder(stream, { mimeType: audioMime }) : new MediaRecorder(stream);

      recorder.ondataavailable = (ev: BlobEvent) => {
        if (ev.data && ev.data.size) audioChunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(audioChunksRef.current, { type: audioMime || "audio/webm" });
          if (!blob || blob.size === 0) {
            setError("No audio captured. Check microphone permissions and device.");
            // ensure tracks stopped
            stream.getTracks().forEach((t) => t.stop());
            stopTimer(audioTimerRef);
            return;
          }

          // revoke previous url if any
          if (audioUrl) {
            try { URL.revokeObjectURL(audioUrl); } catch {}
          }
          const url = URL.createObjectURL(blob);
          setAudioBlob(blob);
          setAudioUrl(url);

          await safeAttachAndPlay(audioRef.current, blob, (d) => setAudioDuration(d));
        } finally {
          stream.getTracks().forEach((t) => t.stop());
          stopTimer(audioTimerRef);
        }
      };

      recorder.start();
      audioRecorderRef.current = recorder;
      setIsRecordingAudio(true);
      startTimer(setAudioElapsed, audioTimerRef);

      // auto-stop after max
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
          setIsRecordingAudio(false);
        }
      }, maxAudioSec * 1000);
    } catch (err: unknown) {
      // handle specific DOMExceptions (AbortError, NotAllowedError)
      const e = err as { name?: string; message?: string };
      if (e?.name === "NotAllowedError" || e?.name === "SecurityError") {
        setError("Microphone access denied. Please allow microphone for this site.");
      } else if (e?.name === "AbortError") {
        setError("Microphone access aborted. Try again.");
      } else {
        setError("Failed to start audio recording.");
      }
    }
  };

  const stopAudioRecording = () => {
    try {
      if (audioRecorderRef.current && audioRecorderRef.current.state === "recording") audioRecorderRef.current.stop();
    } catch {
      // ignore
    } finally {
      setIsRecordingAudio(false);
      stopTimer(audioTimerRef);
    }
  };

  const discardAudio = () => {
    // stop ongoing recording defensively
    try {
      if (audioRecorderRef.current && audioRecorderRef.current.state === "recording") audioRecorderRef.current.stop();
    } catch {}
    audioChunksRef.current = [];
    if (audioUrl) {
      try { URL.revokeObjectURL(audioUrl); } catch {}
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setAudioDuration(null);
    setAudioElapsed(0);
    setIsRecordingAudio(false);
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      } catch {}
    }
  };

  // handle file input fallback for audio
  const onAudioFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    setError(null);
    // revoke previous
    if (audioUrl) {
      try { URL.revokeObjectURL(audioUrl); } catch {}
    }
    const blob = file;
    setAudioBlob(blob);
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    await safeAttachAndPlay(audioRef.current, blob, (d) => setAudioDuration(d));
    // reset input value so same file can be picked again if needed
    ev.currentTarget.value = "";
  };

  // ---------- VIDEO ----------
  const startVideoRecording = async () => {
    setError(null);
    try {
      if (!mediaRecorderAvailable()) {
        // fallback: open video file input with capture on mobile
        if (videoFileInputRef.current) videoFileInputRef.current.click();
        else setError("Video recording not supported in this browser.");
        return;
      }

      // request front camera by default (mobile)
      const constraints: MediaStreamConstraints = { video: { facingMode: "user" }, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoStreamRef.current = stream;

      // show preview
      if (cameraPreviewRef.current) {
        cameraPreviewRef.current.srcObject = stream;
        cameraPreviewRef.current.muted = true;
        // playsInline to avoid Safari fullscreen
        cameraPreviewRef.current.playsInline = true;
        cameraPreviewRef.current.play().catch(() => {});
      }

      videoChunksRef.current = [];

      const videoMime = getSupportedMime([
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/mp4", // maybe supported in some browsers
        "video/webm",
      ]) || "";

      const recorder = videoMime ? new MediaRecorder(stream, { mimeType: videoMime }) : new MediaRecorder(stream);

      recorder.ondataavailable = (ev: BlobEvent) => {
        if (ev.data && ev.data.size) videoChunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(videoChunksRef.current, { type: videoMime || "video/webm" });
          if (!blob || blob.size === 0) {
            setError("No video captured. Check camera permissions.");
            if (videoStreamRef.current) {
              videoStreamRef.current.getTracks().forEach((t) => t.stop());
              videoStreamRef.current = null;
            }
            stopTimer(videoTimerRef);
            return;
          }

          if (videoUrl) {
            try { URL.revokeObjectURL(videoUrl); } catch {}
          }
          const url = URL.createObjectURL(blob);
          setVideoBlob(blob);
          setVideoUrl(url);

          await safeAttachAndPlay(recordedVideoRef.current, blob, (d) => setVideoDuration(d));
        } finally {
          // cleanup preview stream
          if (videoStreamRef.current) {
            videoStreamRef.current.getTracks().forEach((t) => t.stop());
            videoStreamRef.current = null;
          }
          if (cameraPreviewRef.current) {
            cameraPreviewRef.current.srcObject = null;
            try { cameraPreviewRef.current.load(); } catch {}
          }
          stopTimer(videoTimerRef);
        }
      };

      recorder.start();
      videoRecorderRef.current = recorder;
      setIsRecordingVideo(true);
      startTimer(setVideoElapsed, videoTimerRef);

      // auto-stop
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
          setIsRecordingVideo(false);
        }
      }, maxVideoSec * 1000);
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e?.name === "NotAllowedError" || e?.name === "SecurityError") {
        setError("Camera or microphone permission denied. Please allow access for this site.");
      } else if (e?.name === "AbortError") {
        setError("Failed to start video capture (abort). Try again.");
      } else {
        setError("Failed to start video recording. If you're on iOS Safari, use the camera capture fallback button.");
      }
    }
  };

  const stopVideoRecording = () => {
    try {
      if (videoRecorderRef.current && videoRecorderRef.current.state === "recording") videoRecorderRef.current.stop();
    } catch {
      // ignore
    } finally {
      setIsRecordingVideo(false);
      stopTimer(videoTimerRef);
    }
  };

  const discardVideo = () => {
    try {
      if (videoRecorderRef.current && videoRecorderRef.current.state === "recording") videoRecorderRef.current.stop();
    } catch {}
    // stop camera stream
    if (videoStreamRef.current) {
      try {
        videoStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      videoStreamRef.current = null;
    }
    videoChunksRef.current = [];
    if (videoUrl) {
      try { URL.revokeObjectURL(videoUrl); } catch {}
    }
    setVideoUrl(null);
    setVideoBlob(null);
    setVideoDuration(null);
    setVideoElapsed(0);
    setIsRecordingVideo(false);

    // reset elements
    if (recordedVideoRef.current) {
      try {
        recordedVideoRef.current.pause();
        recordedVideoRef.current.removeAttribute("src");
        recordedVideoRef.current.load();
      } catch {}
    }
    if (cameraPreviewRef.current) {
      try {
        cameraPreviewRef.current.pause();
        cameraPreviewRef.current.srcObject = null;
        cameraPreviewRef.current.load();
      } catch {}
    }
  };

  const onVideoFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    setError(null);
    if (videoUrl) {
      try { URL.revokeObjectURL(videoUrl); } catch {}
    }
    const blob = file;
    setVideoBlob(blob);
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
    await safeAttachAndPlay(recordedVideoRef.current, blob, (d) => setVideoDuration(d));
    ev.currentTarget.value = "";
  };

  const readableSize = (b: number) => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
    return `${(b / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Attach Voice Note & Video</h3>

      {error && <div className="rounded-md border border-red-600/40 bg-red-600/10 p-3 text-red-200">{error}</div>}

      {/* hidden fallback file inputs */}
      <input
        ref={audioFileInputRef}
        type="file"
        accept="audio/*"
        capture="microphone"
        style={{ display: "none" }}
        onChange={onAudioFileChange}
      />
      <input
        ref={videoFileInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={onVideoFileChange}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Audio */}
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
                <button type="button" className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white" onClick={startAudioRecording}>
                  Record
                </button>
              ) : (
                <button type="button" className="rounded-md bg-zinc-700 px-3 py-2 text-sm font-medium text-white" onClick={stopAudioRecording}>
                  Stop
                </button>
              )}

              <button type="button" className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/80" onClick={async () => {
                if (!audioRef.current) return;
                try {
                  audioRef.current.load();
                  await audioRef.current.play();
                } catch {
                  // ignore autoplay errors; user can press play
                }
              }} disabled={!audioBlob}>
                Play
              </button>

              <button type="button" className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/80" onClick={discardAudio} disabled={!audioBlob && !isRecordingAudio}>
                Discard
              </button>

              {audioBlob && (
                <div className="ml-auto text-xs text-white/60">{readableSize(audioBlob.size)} • {audioDuration ? formatTime(audioDuration) : "Recorded"}</div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${isRecordingAudio ? "bg-red-500 animate-pulse" : "bg-white/20"}`} />
              <div className="text-xs text-white/60">
                {isRecordingAudio ? `Recording — ${formatTime(audioElapsed)}` : audioBlob ? `Recorded • ${audioDuration ? formatTime(audioDuration) : "—"}` : "Not recorded"}
              </div>
            </div>

            <div className="w-full bg-white/10 h-2 rounded overflow-hidden mt-2">
              <div
                className="h-2 bg-red-500"
                style={{ width: `${Math.min(100, (isRecordingAudio ? (audioElapsed / maxAudioSec) * 100 : (audioDuration ? (audioDuration / maxAudioSec) * 100 : 0)))}%` }}
              />
            </div>

            <audio ref={audioRef} controls src={audioUrl ?? undefined} className="w-full" />
          </div>
        </div>

        {/* Video */}
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

              <button type="button" className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/80" onClick={async () => {
                if (!recordedVideoRef.current) return;
                try {
                  recordedVideoRef.current.load();
                  await recordedVideoRef.current.play();
                } catch {
                  // ignore autoplay blocks
                }
              }} disabled={!videoBlob}>
                Play
              </button>

              <button type="button" className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/80" onClick={discardVideo} disabled={!videoBlob && !isRecordingVideo}>
                Discard
              </button>

              {videoBlob && (
                <div className="ml-auto text-xs text-white/60">{readableSize(videoBlob.size)} • {videoDuration ? formatTime(videoDuration) : "Recorded"}</div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${isRecordingVideo ? "bg-red-500 animate-pulse" : "bg-white/20"}`} />
              <div className="text-xs text-white/60">
                {isRecordingVideo ? `Recording — ${formatTime(videoElapsed)}` : videoBlob ? `Recorded • ${videoDuration ? formatTime(videoDuration) : "—"}` : "Not recorded"}
              </div>
            </div>

            <div className="w-full bg-white/10 h-2 rounded overflow-hidden mt-2">
              <div
                className="h-2 bg-red-500"
                style={{ width: `${Math.min(100, (isRecordingVideo ? (videoElapsed / maxVideoSec) * 100 : (videoDuration ? (videoDuration / maxVideoSec) * 100 : 0)))}%` }}
              />
            </div>

            <div className="w-full overflow-hidden rounded-md bg-black/30">
              <video ref={cameraPreviewRef} className="h-[180px] w-full object-cover" playsInline muted />
            </div>

            <video ref={recordedVideoRef} controls src={videoUrl ?? undefined} className="w-full rounded-md" />
          </div>
        </div>
      </div>

      <div className="text-sm text-white/60">
        Tips: Keep clips short (under {maxAudioSec}s / {maxVideoSec}s). If your browser doesn't support direct recording, the component will open your device's native recorder (file capture). On Chrome/Firefox desktop the in-page recorder is used. To enable camera/mic on localhost: click the lock icon → Site settings → Allow Camera & Microphone.
      </div>
    </div>
  );
}
