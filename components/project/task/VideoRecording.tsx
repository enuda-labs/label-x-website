import React, { useEffect, useRef, useState } from 'react'
import { Video, Square, Play, Trash2 } from 'lucide-react'
import {
  formatTime,
  getSupportedMime,
  readableSize,
  attachBlobToElement,
} from '@/utils/mediaHelpers'

interface VideoRecordingProps {
  maxDurationSec?: number
  onRecordingComplete?: (blob: Blob, url: string) => void
  onRecordingDiscard?: () => void
  disabled?: boolean
}

const VideoRecording: React.FC<VideoRecordingProps> = ({
  maxDurationSec = 30,
  onRecordingComplete,
  onRecordingDiscard,
  disabled = false,
}) => {
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const cameraPreviewRef = useRef<HTMLVideoElement | null>(null)
  const recordedVideoRef = useRef<HTMLVideoElement | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      if (recorderRef.current && recorderRef.current.state === 'recording') {
        recorderRef.current.stop()
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [videoUrl])

  useEffect(() => {
    let localStream: MediaStream | null = null
    const cameraPreviewNode = cameraPreviewRef.current

    const cameraPreview = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      streamRef.current = stream
      localStream = stream

      if (cameraPreviewNode) {
        cameraPreviewNode.srcObject = stream
        cameraPreviewNode.muted = true
        cameraPreviewNode.play().catch(() => {})
      }
    }
    cameraPreview()

    return () => {
      if (cameraPreviewNode) {
        cameraPreviewNode.srcObject = null
      }

      // Stop all tracks when component unmounts
      if (localStream) {
        localStream
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop())
      }
    }
  }, [])

  const startTimer = () => {
    setElapsed(0)
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      streamRef.current = stream

      if (cameraPreviewRef.current) {
        cameraPreviewRef.current.srcObject = stream
        cameraPreviewRef.current.muted = true
        cameraPreviewRef.current.play().catch(() => {})
      }

      const videoMime = getSupportedMime([
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ])

      const recorder = videoMime
        ? new MediaRecorder(stream, { mimeType: videoMime })
        : new MediaRecorder(stream)

      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, {
            type: videoMime || 'video/webm',
          })

          if (!blob || blob.size === 0) {
            setError('Recording failed — no video captured.')
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop())
              streamRef.current = null
            }
            stopTimer()
            return
          }

          if (videoUrl) URL.revokeObjectURL(videoUrl)
          setVideoBlob(blob)
          const url = URL.createObjectURL(blob)
          setVideoUrl(url)

          await attachBlobToElement(recordedVideoRef.current, blob, (d) =>
            setDuration(d)
          )
          onRecordingComplete?.(blob, url)
        } finally {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop())
            streamRef.current = null
          }
          if (cameraPreviewRef.current) {
            cameraPreviewRef.current.srcObject = null
          }
          stopTimer()
        }
      }

      recorder.start()
      recorderRef.current = recorder
      setIsRecording(true)
      startTimer()

      // Auto-stop after max duration
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop()
          setIsRecording(false)
        }
      }, maxDurationSec * 1000)
    } catch (err: unknown) {
      console.error(err)
      if ((err as DOMException)?.name === 'NotAllowedError') {
        setError(
          'Permission denied: please allow camera and microphone access.'
        )
      } else if ((err as DOMException)?.name === 'NotFoundError') {
        setError('No camera found on this device.')
      } else if ((err as DOMException)?.name === 'NotReadableError') {
        setError('Camera is already in use by another app or browser tab.')
      } else {
        setError(`Failed to start video recording: ${(err as Error).message}`)
      }
    }
  }

  const stopRecording = () => {
    try {
      if (recorderRef.current && recorderRef.current.state === 'recording') {
        recorderRef.current.stop()
      }
    } catch (err) {
      console.warn(err)
    } finally {
      setIsRecording(false)
      stopTimer()
    }
  }

  const playVideo = () => {
    if (recordedVideoRef.current) {
      recordedVideoRef.current.play()
      setIsPlaying(true)
    }
  }

  const discardRecording = () => {
    setVideoBlob(null)
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
      setVideoUrl(null)
    }
    setDuration(null)
    setElapsed(0)
    setIsPlaying(false)
    if (recordedVideoRef.current) {
      recordedVideoRef.current.pause()
      recordedVideoRef.current.removeAttribute('src')
    }
    onRecordingDiscard?.()
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:bg-gray-400"
          >
            <Video className="h-4 w-4" />
            Record
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            <Square className="h-4 w-4" />
            Stop
          </button>
        )}

        <button
          type="button"
          onClick={playVideo}
          disabled={!videoBlob || isPlaying}
          className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-white/80 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          Play
        </button>

        <button
          type="button"
          onClick={discardRecording}
          disabled={!videoBlob}
          className="flex cursor-pointer items-center gap-2 rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Discard
        </button>

        {videoBlob && (
          <div className="ml-auto text-xs text-gray-500">
            {readableSize(videoBlob.size)} •{' '}
            {duration ? formatTime(duration) : 'Recorded'}
          </div>
        )}
      </div>

      {/* Recording indicator and progress */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              isRecording ? 'animate-pulse bg-red-500' : 'bg-gray-300'
            }`}
          />
          <div className="text-xs text-gray-600">
            {isRecording
              ? `Recording — ${formatTime(elapsed)}`
              : videoBlob
                ? `Recorded • ${duration ? formatTime(duration) : '—'}`
                : 'Ready to record'}
          </div>
          <div className="ml-auto text-xs text-gray-500">
            Max {maxDurationSec}s
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
          <div
            className="h-2 bg-red-500 transition-all duration-300"
            style={{
              width: `${Math.min(
                100,
                isRecording
                  ? (elapsed / maxDurationSec) * 100
                  : duration
                    ? (duration / maxDurationSec) * 100
                    : 0
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Camera preview while recording */}
      {/* {isRecording && ( */}
      {!videoUrl && (
        <div className="w-full overflow-hidden rounded-md bg-black">
          <video
            ref={cameraPreviewRef}
            className="h-full w-full object-cover"
            playsInline
            webkit-playsinline="true"
            muted
            autoPlay
          />
        </div>
      )}
      {/* )} */}

      {/* Recorded video playback */}
      {videoUrl && (
        <video
          ref={recordedVideoRef}
          controls
          src={videoUrl}
          className="w-full rounded-md"
          playsInline
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {videoUrl && (
        <div className="text-xs text-gray-600">
          <a
            href={videoUrl}
            download="recording_video.webm"
            className="underline hover:text-gray-800"
          >
            Download video
          </a>
        </div>
      )}
    </div>
  )
}

export default VideoRecording
