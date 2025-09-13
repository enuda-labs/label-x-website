"use client";

import React, { useEffect, useRef, useState } from "react";

export default function VoiceVideoSubmission() {
  const maxAudioSec = 60; // seconds
  const maxVideoSec = 30;
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

  useEffect(() => {
    // cleanup on unmount
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
      // Note: object URLs are revoked where they are created/cleared (discardAudio/discardVideo/onstop)
    };
  }, []);

  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

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

  const getSupportedMime = (candidates: string[]) => {
    const isSupported = (MediaRecorder as unknown as { isTypeSupported?: (type: string) => boolean }).isTypeSupported;

    if (typeof isSupported !== "function") return "";
    for (const m of candidates) {
      try {
        if (isSupported(m)) return m;
      } catch {
        // ignore
      }
    }
    return "";
  };

  // ---------- Add near top of file (helpers) ----------
  const isIOS = typeof navigator !== "undefined" && /iP(hone|od|ad)/.test(navigator.userAgent);



  // --- replace existing attachBlobToElement with this ---
  const attachBlobToElement = async (
    el: HTMLMediaElement | null,
    blob: Blob,
    setDuration: (n: number | null) => void
  ) => {
    if (!el || !blob) return;

    // create URL early so we can attach / offer download
    const url = URL.createObjectURL(blob);

    try {
      // For <video>, ensure inline playback attributes for iOS
      if (el instanceof HTMLVideoElement) {
        el.setAttribute("playsinline", "");
        el.setAttribute("webkit-playsinline", "");
        // ensure controls present so user can manually play if autoplay blocked
        el.controls = true;
        // clear any srcObject (camera preview) safely
        if ("srcObject" in el && el.srcObject) el.srcObject = null;
      }

      // Attach the blob URL before probing playback to ensure consistent behavior
      el.src = url;

      // Some browsers return empty string from canPlayType even though playback could work.
      // Use canPlayType as a hint but never treat it as absolute truth on mobile Safari.
      let canPlayHint = "";
      try {
        canPlayHint = typeof el.canPlayType === "function" ? (el.canPlayType(blob.type || "") || "") : "";
      } catch {
  canPlayHint = "";
}

      // If the browser *claims* not to play it, still attach the URL and try to load/play.
      // On iOS older versions this is common for WebM; we'll provide a download fallback.
      el.load();

      // Wait for metadata or fallback timeout
      await new Promise<void>((resolve) => {
        let resolved = false;
        const onMeta = () => {
          if (resolved) return;
          resolved = true;
          el.removeEventListener("loadedmetadata", onMeta);
          resolve();
        };
        el.addEventListener("loadedmetadata", onMeta);
        // fallback timeout (short) so we don't hang forever
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            el.removeEventListener("loadedmetadata", onMeta);
            resolve();
          }
        }, 1500);
      });

      // Determine duration if available
      const dur = el.duration;
      if (!isFinite(dur) || isNaN(dur)) {
        setDuration(null);
      } else {
        setDuration(Math.round(dur));
      }

      // attempt to play only if it makes sense (user likely initiated recording)
      try {
        // On many iOS variants, `.play()` will reject if autoplay policy or unsupported codec.
        await el.play();
        // Clear any previous error state
        setError(null);
      } catch (playErr) {
        // Play failed — report to console and show helpful message
        // If canPlay hint is empty or negative, inform user about format mismatch
        console.warn("Media play() failed:", playErr);
        if (isIOS && (canPlayHint === "" || canPlayHint === "no")) {
          setError(
            "Playback failed on this iOS version. The recorded format may not be supported in-browser. Try downloading the clip or use a device with newer Safari (or transcode server-side to MP4/H.264)."
          );
        } else {
          setError("Preview couldn't autoplay — tap the play button to try manually. If that fails, download the file to test it.");
        }
      }

      // Attach an error event listener to surface decoding/format errors
      const onError = () => {
        // el.error is a MediaError
        const mediaErr = (el as HTMLMediaElement).error;
        console.warn("Media element error:", mediaErr);
        setError(
          isIOS
            ? "This iOS/Safari version couldn't decode the recorded file. Please download and test locally; consider server-side transcoding to MP4/H.264 for compatibility."
            : "Playback failed. Try downloading the file or use another browser."
        );
      };
      el.removeEventListener("error", onError);
      el.addEventListener("error", onError);

      // Save URL in state (caller already does this, but ensure we leave URL available)
      // Caller will call URL.revokeObjectURL when replacing/clearing — so we don't revoke here.
    } catch (err) {
      console.warn("attachBlobToElement unexpected error:", err);
      setDuration(null);
      setError("Unable to prepare preview for this recording.");
      // still attach URL so user can download manually
      try {
        el.src = url;
        el.load();
      } catch {}
    }

    // helpful: expose download link in UI by returning URL or ensure caller saved it via setAudioUrl/setVideoUrl
    return;
  };


  // ===== AUDIO =====
  const startAudioRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const audioMime = getSupportedMime(["audio/webm;codecs=opus", "audio/webm"]);
      const mr = audioMime ? new MediaRecorder(stream, { mimeType: audioMime }) : new MediaRecorder(stream);

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size) audioChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        try {
          const blob = new Blob(audioChunksRef.current, { type: audioMime || "audio/webm" });
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

          await attachBlobToElement(audioRef.current, blob, (d) => setAudioDuration(d));
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
    } catch (err) {
      console.error(err);
      setError("Failed to start audio recording.");
    }
  };

  const stopAudioRecording = () => {
    try {
      if (audioRecorderRef.current && audioRecorderRef.current.state === "recording") audioRecorderRef.current.stop();
    } catch (err) {
      console.warn(err);
    } finally {
      setIsRecordingAudio(false);
      stopAudioTimer();
    }
  };

  const discardAudio = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioDuration(null);
    setAudioElapsed(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
    }
  };

  // ===== VIDEO =====
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
      const mr = videoMime ? new MediaRecorder(stream, { mimeType: videoMime }) : new MediaRecorder(stream);

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
    } catch (err) {
      console.error(err);
      setError("Failed to start video recording.");
    }
  };

  const stopVideoRecording = () => {
    try {
      if (videoRecorderRef.current && videoRecorderRef.current.state === "recording") videoRecorderRef.current.stop();
    } catch (err) {
      console.warn(err);
    } finally {
      setIsRecordingVideo(false);
      stopVideoTimer();
    }
  };

  const discardVideo = () => {
    setVideoBlob(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setVideoDuration(null);
    setVideoElapsed(0);
    if (recordedVideoRef.current) {
      recordedVideoRef.current.pause();
      recordedVideoRef.current.removeAttribute("src");
    }
  };

  const readableSize = (b: number) => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
    return `${(b / (1024 * 1024)).toFixed(2)} MB`;
  };

  // UI
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Attach Voice Note & Video</h3>

      {error && (
        <div className="rounded-md border border-red-600/40 bg-red-600/10 p-3 text-red-200">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Audio Card */}
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

              <button type="button" className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/80" onClick={() => audioRef.current?.play()} disabled={!audioBlob}>
                Play
              </button>

              <button type="button" className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/80" onClick={discardAudio} disabled={!audioBlob}>
                Discard
              </button>

              {audioBlob && (
                <div className="ml-auto text-xs text-white/60">{readableSize(audioBlob.size)} • {audioDuration ? `${formatTime(audioDuration)}` : 'Recorded'}</div>
              )}
            </div>

            {/* Recording indicator */}
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${isRecordingAudio ? "bg-red-500 animate-pulse" : "bg-white/20"}`} aria-hidden />
              <div className="text-xs text-white/60">{isRecordingAudio ? `Recording — ${formatTime(audioElapsed)}` : (audioBlob ? `Recorded • ${audioDuration ? formatTime(audioDuration) : '—'}` : 'Not recorded')}</div>
            </div>

            {/* progress bar */}
            <div className="w-full bg-white/10 h-2 rounded overflow-hidden mt-2">
              <div
                className="h-2 bg-red-500"
                style={{ width: `${Math.min(100, (isRecordingAudio ? (audioElapsed / maxAudioSec) * 100 : (audioDuration ? (audioDuration / maxAudioSec) * 100 : 0)))}%` }}
              />
            </div>

            <audio ref={audioRef} controls src={audioUrl ?? undefined} className="w-full" />
            {audioUrl && (
  <div className="mt-2 text-xs">
    <a href={audioUrl} download="recording_audio.webm" className="underline">
      Download audio
    </a>
  </div>
)}

          </div>
        </div>

        {/* Video Card */}
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

              <button type="button" className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/80" onClick={() => recordedVideoRef.current?.play()} disabled={!videoBlob}>
                Play
              </button>

              <button type="button" className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/80" onClick={discardVideo} disabled={!videoBlob}>
                Discard
              </button>

              {videoBlob && (
                <div className="ml-auto text-xs text-white/60">{readableSize(videoBlob.size)} • {videoDuration ? `${formatTime(videoDuration)}` : 'Recorded'}</div>
              )}
            </div>

            {/* Recording indicator */}
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${isRecordingVideo ? "bg-red-500 animate-pulse" : "bg-white/20"}`} aria-hidden />
              <div className="text-xs text-white/60">{isRecordingVideo ? `Recording — ${formatTime(videoElapsed)}` : (videoBlob ? `Recorded • ${videoDuration ? formatTime(videoDuration) : '—'}` : 'Not recorded')}</div>
            </div>

            {/* progress bar */}
            <div className="w-full bg-white/10 h-2 rounded overflow-hidden mt-2">
              <div
                className="h-2 bg-red-500"
                style={{ width: `${Math.min(100, (isRecordingVideo ? (videoElapsed / maxVideoSec) * 100 : (videoDuration ? (videoDuration / maxVideoSec) * 100 : 0)))}%` }}
              />
            </div>

            <div className="w-full overflow-hidden rounded-md bg-black/30">
              <video
                ref={cameraPreviewRef}
                className="h-[180px] w-full object-cover"
                playsInline
                // legacy iOS attribute
                webkit-playsinline="true"
                muted
                autoPlay
              />
            </div>

            <video
              ref={recordedVideoRef}
              controls
              src={videoUrl ?? undefined}
              className="w-full rounded-md"
              playsInline
              // legacy iOS attribute
              webkit-playsinline="true"
            />
            {videoUrl && (
  <div className="mt-2 text-xs">
    <a href={videoUrl} download="recording_video.webm" className="underline">
      Download video
    </a>
  </div>
)}

          </div>
        </div>
      </div>

      <div className="text-sm text-white/60">Tips: Keep clips short (under {maxAudioSec}s / {maxVideoSec}s). The component records in webm if supported; server should accept webm or transcode. If permissions are blocked, open Chrome → lock icon → Site settings → Allow Camera & Microphone for localhost.</div>
    </div>
  );
}
