import React, { useEffect, useRef, useState } from 'react'
import { Mic, Square, Play, Trash2 } from 'lucide-react'
import {
  formatTime,
  getSupportedMime,
  readableSize,
  attachBlobToElement,
} from '@/utils/mediaHelpers'

interface AudioRecordingProps {
  maxDurationSec?: number
  onRecordingComplete?: (blob: Blob, url: string) => void
  onRecordingDiscard?: () => void
  disabled?: boolean
}

const AudioRecording: React.FC<AudioRecordingProps> = ({
  maxDurationSec = 60,
  onRecordingComplete,
  onRecordingDiscard,
  disabled = false,
}) => {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state === 'recording') {
        recorderRef.current.stop()
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

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
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported in this browser.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []

      const audioMime = getSupportedMime([
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
      ])

      if (!audioMime) {
        throw new Error(
          'No supported audio format available for recording on this device.'
        )
      }

      const recorder = new MediaRecorder(stream, { mimeType: audioMime })

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: audioMime })
          if (!blob || blob.size === 0) {
            setError('Recording failed — no audio captured.')
            stream.getTracks().forEach((t) => t.stop())
            stopTimer()
            return
          }

          if (audioUrl) URL.revokeObjectURL(audioUrl)
          setAudioBlob(blob)
          const url = URL.createObjectURL(blob)
          setAudioUrl(url)

          await attachBlobToElement(
            audioRef.current,
            blob,
            (d) => setDuration(d),
            setError
          )
          onRecordingComplete?.(blob, url)
        } finally {
          stream.getTracks().forEach((t) => t.stop())
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
        setError('Permission denied: please allow microphone access.')
      } else if ((err as DOMException)?.name === 'NotFoundError') {
        setError('No microphone found on this device.')
      } else if ((err as DOMException)?.name === 'NotReadableError') {
        setError('Microphone is already in use by another app or browser tab.')
      } else {
        setError(`Failed to start audio recording: ${(err as Error).message}`)
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

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const discardRecording = () => {
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setDuration(null)
    setElapsed(0)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
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
            className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:bg-gray-400"
          >
            <Mic className="h-4 w-4" />
            Record
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            <Square className="h-4 w-4" />
            Stop
          </button>
        )}

        <button
          type="button"
          onClick={playAudio}
          disabled={!audioBlob || isPlaying}
          className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          Play
        </button>

        <button
          type="button"
          onClick={discardRecording}
          disabled={!audioBlob}
          className="flex items-center gap-2 rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Discard
        </button>

        {audioBlob && (
          <div className="ml-auto text-xs text-gray-500">
            {readableSize(audioBlob.size)} •{' '}
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
              : audioBlob
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

      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        src={audioUrl ?? undefined}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />

      {audioUrl && (
        <div className="text-xs text-gray-600">
          <a
            href={audioUrl}
            download="recording_audio.webm"
            className="underline hover:text-gray-800"
          >
            Download audio
          </a>
        </div>
      )}
    </div>
  )
}

export default AudioRecording
