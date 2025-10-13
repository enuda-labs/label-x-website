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
import SubtitleAnnotator from "@/components/SubtitleAnnotator/SubtitleAnnotator";
import VideoRecorderSection from "@/components/submission/VideoRecorderSection";
import ImageUploadSection from "@/components/submission/ImageUploadSection";
import VoiceRecorderSection from '@/components/submission/VoiceRecorderSection'


type Props = {
  type: "voice" | "video" | "image";
  taskId: string;
  setUploading?: (value: boolean) => void;
};


async function extractAudioFromVideo(videoBlob: Blob): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(videoBlob);

      video.addEventListener("loadedmetadata", () => {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaElementSource(video);
        const dest = audioContext.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioContext.destination);

        const recorder = new MediaRecorder(dest.stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: "audio/webm" });
          resolve(audioBlob);
          URL.revokeObjectURL(video.src);
        };

        recorder.start();
        video.play();

        video.onended = () => {
          recorder.stop();
        };
      });
    } catch (err) {
      reject(err);
    }
  });
}


export default function VoiceVideoSubmission({ type, taskId }: Props) {
  const maxAudioSec = 60; // seconds
  const maxVideoSec = 30;
  const [audioOnly, setAudioOnly] = useState(false);

  // audio/video state
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [liveSubtitle, setLiveSubtitle] = useState('');
  const [progress, setProgress] = useState(0);
  const [isBusy, setIsBusy] = useState(false);

  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [isPreparingMic, setIsPreparingMic] = useState(false);

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
  // --- Speech Recognition refs ---
  const recognitionRef = useRef<any>(null);
  const recognitionActiveRef = useRef(false);

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
     setUploading?.(true);
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
   setUploading?.(true);
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
     setUploading?.(true);
    setVideoCloudUrl(null);

    try {
      let blobToUpload = videoBlob;
      let uploadType = "video";

      if (audioOnly) {
        // ✅ Extract audio track
        const audioBlob = await extractAudioFromVideo(videoBlob);
        if (!audioBlob) throw new Error("Failed to extract audio track.");
        blobToUpload = audioBlob;
        uploadType = "audio";
      }

      const url = await uploadToCloudinary(blobToUpload, uploadType);
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

  useEffect(() => {
    if (audioOnly) {
      if (!(window as any).AudioContext && !(window as any).webkitAudioContext) {
        setError("AudioContext not supported in this browser.");
      } else {
        // clear previous error if support detected
        setError((err) => (err === "AudioContext not supported in this browser." ? null : err));
      }
    }
  }, [audioOnly]);


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
          setProgress(0); // reset progress bar
        }
      };

      mr.start();
      videoRecorderRef.current = mr;
      setIsRecordingVideo(true);
      startVideoTimer();

      // 🕒 Set countdown for 40 minutes
      const MAX_RECORDING_MINUTES = 40;
      const MAX_RECORDING_MS = MAX_RECORDING_MINUTES * 60 * 1000;
      const INTERVAL_MS = 1000; // update every second
      const startTime = Date.now();

      // Progress bar update interval
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const percentage = Math.min((elapsed / MAX_RECORDING_MS) * 100, 100);
        setProgress(percentage);

        if (percentage >= 100) {
          clearInterval(interval);
        }
      }, INTERVAL_MS);

      // Automatically stop recording after 40 minutes
      setTimeout(() => {
        clearInterval(interval);
        if (mr.state === "recording") {
          mr.stop();
          setIsRecordingVideo(false);
          console.log(`Recording stopped automatically after ${MAX_RECORDING_MINUTES} minutes.`);
        }
      }, MAX_RECORDING_MS);

    } catch (err) {
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
      // 🛑 Stop the media recorder if it’s currently recording
      if (
        videoRecorderRef.current &&
        videoRecorderRef.current.state === "recording"
      ) {
        videoRecorderRef.current.stop();
      }
    } catch (err) {
      console.warn(err);
    } finally {
      // 🧩 Mark recording as stopped
      setIsRecordingVideo(false);
      stopVideoTimer();

      // 🧹 Clean up camera stream so SubtitleAnnotator switches to playback
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
        videoStreamRef.current = null; // 👈 This line triggers SubtitleAnnotator to switch from live → playback
      }
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

  useEffect(() => {
     const SpeechRecognition =
       window.SpeechRecognition || window.webkitSpeechRecognition;
     if (!SpeechRecognition) {
       console.warn("Speech recognition not supported in this browser.");
       return;
     }
 
     const recognition = new SpeechRecognition();
     recognition.continuous = true;
     recognition.interimResults = true;
     recognition.lang = "en-US";
 
     recognition.onresult = (event: SpeechRecognitionEvent) => {
       let transcript = "";
       for (let i = event.resultIndex; i < event.results.length; i++) {
         transcript += event.results[i][0].transcript;
       }
       setLiveSubtitle(transcript);
     };
 
     // ✅ Only start when video recording is active
     if (isRecordingVideo) {
       recognition.start();
     } else {
       recognition.stop();
     }
 
     return () => recognition.stop();
   }, [isRecordingVideo]);
 
 


  // ===== UI =====
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">
        {type === "voice" ? "Attach Voice Note" : type === "video" ? "Attach Video" : "Upload Image"}
      </h3>

      {error && <div className="rounded-md border border-red-600/40 bg-red-600/10 p-3 text-red-200">{error}</div>}

      <div className="grid gap-4 md:grid-cols-1">
      <VoiceRecorderSection
    type={type}
    maxAudioSec={40 * 60}
    isRecordingAudio={isRecordingAudio}
    isPreparingMic={isPreparingMic}
    audioBlob={audioBlob}
    audioUrl={audioUrl}
    audioCloudUrl={audioCloudUrl}
    audioDuration={audioDuration}
    audioElapsed={audioElapsed}
    uploadingAudio={uploadingAudio}
    isBusy={isBusy}
    audioRef={audioRef}
    startAudioRecording={startAudioRecording}
    stopAudioRecording={stopAudioRecording}
    discardAudio={discardAudio}
    handleUploadAudio={handleUploadAudio}
    copyToClipboard={copyToClipboard}
    readableSize={readableSize}
    formatTime={formatTime}
  />

  <ImageUploadSection
    type={type}
    imagePreview={imagePreview}
    imageFile={imageFile}
    imageCloudUrl={imageCloudUrl}
    uploadingImage={uploadingImage}
    setImageFile={setImageFile}
    setImagePreview={setImagePreview}
    discardImage={discardImage}
    handleUploadImage={handleUploadImage}
    copyToClipboard={copyToClipboard}
  />

  <VideoRecorderSection
    type={type}
    maxVideoSec={40 * 60}
    isRecordingVideo={isRecordingVideo}
    isRecordingAudio={isRecordingAudio}
    videoBlob={videoBlob}
    videoDuration={videoDuration}
    videoUrl={videoUrl}
    videoCloudUrl={videoCloudUrl}
    videoElapsed={videoElapsed}
    progress={progress}
    audioOnly={audioOnly}
    liveSubtitle={liveSubtitle}
    isBusy={isBusy}
    uploadingVideo={uploadingVideo}
    setAudioOnly={setAudioOnly}
    startVideoRecording={startVideoRecording}
    stopVideoRecording={stopVideoRecording}
    discardVideo={discardVideo}
    handleUploadVideo={handleUploadVideo}
    copyToClipboard={copyToClipboard}
    formatTime={formatTime}
    readableSize={readableSize}
    SubtitleAnnotator={SubtitleAnnotator}
    cameraPreviewRef={cameraPreviewRef}
    recordedVideoRef={recordedVideoRef}
    videoStreamRef={videoStreamRef}
  />


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
