'use client'

import { Button } from '@/components/ui/button'
import React from 'react'

interface VoiceRecorderSectionProps {
  type: string
  maxAudioSec: number
  isRecordingAudio: boolean
  isPreparingMic: boolean
  audioBlob: Blob | null
  audioUrl: string | null
  audioCloudUrl: string | null
  audioDuration: number | null
  audioElapsed: number
  uploadingAudio: boolean
  isBusy: boolean
  audioRef: React.MutableRefObject<HTMLAudioElement | null>
  startAudioRecording: () => void
  stopAudioRecording: () => void
  discardAudio: () => void
  handleUploadAudio: () => void
  copyToClipboard: (url: string) => void
  readableSize: (bytes: number) => string
  formatTime: (time: number) => string
}

const VoiceRecorderSection: React.FC<VoiceRecorderSectionProps> = ({
  type,
  maxAudioSec,
  isRecordingAudio,
  isPreparingMic,
  audioBlob,
  audioUrl,
  audioCloudUrl,
  audioDuration,
  audioElapsed,
  uploadingAudio,
  isBusy,
  audioRef,
  startAudioRecording,
  stopAudioRecording,
  discardAudio,
  handleUploadAudio,
  copyToClipboard,
  readableSize,
  formatTime
}) => {
  if (type !== 'voice') return null

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
            disabled={!audioBlob || isBusy}
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
              {readableSize(audioBlob.size)} •{' '}
              {audioDuration ? `${formatTime(audioDuration)}` : 'Recorded'}
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
              isRecordingAudio ? 'bg-red-500 animate-pulse' : 'bg-white/20'
            }`}
            aria-hidden
          />
          <div className="text-xs text-white/60">
            {isRecordingAudio
              ? `Recording — ${formatTime(audioElapsed)}`
              : audioBlob
              ? `Recorded • ${audioDuration ? formatTime(audioDuration) : '—'}`
              : 'Not recorded'}
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
              )}%`
            }}
          />
        </div>

        {/* Audio player */}
        <audio
          ref={audioRef}
          controls={!uploadingAudio}
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
              {uploadingAudio ? 'Uploading…' : 'Upload'}
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
  )
}

export default VoiceRecorderSection
