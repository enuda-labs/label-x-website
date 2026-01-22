import React, { useRef, useEffect, useState } from 'react'

interface SubtitleSegment {
  id: string
  start: number
  end: number
  text: string
}

interface VideoRecorderSectionProps {
  type: string
  maxVideoSec: number
  isRecordingVideo: boolean
  isRecordingAudio: boolean
  videoBlob: Blob | null
  videoDuration: number
  videoUrl: string | null
  videoCloudUrl: string | null
  progress: number

  // new props
  subtitleSegments?: SubtitleSegment[]
  onSegmentsChange?: (segments: SubtitleSegment[]) => void

  audioOnly: boolean
  liveSubtitle?: string
  isBusy?: boolean
  uploadingVideo?: boolean
  setAudioOnly: (val: boolean) => void

  // these may be async in the parent, allow either
  startVideoRecording: () => Promise<void> | void
  stopVideoRecording: () => void
  discardVideo: () => void
  handleUploadVideo: () => Promise<void> | void

  copyToClipboard: (text: string) => void
  formatTime: (sec: number) => string
  readableSize: (size: number) => string

  SubtitleAnnotator: React.ComponentType<Record<string, unknown>>

  // allow nullable refs (matches `useRef<HTMLVideoElement | null>(null)` in parent)
  recordedVideoRef: React.RefObject<HTMLVideoElement | null>
  videoStreamRef: React.RefObject<MediaStream | null>

  language?: string // Language for subtitle annotation
}

const VideoRecorderSection: React.FC<VideoRecorderSectionProps> = ({
  type,
  maxVideoSec,
  isRecordingVideo,
  isRecordingAudio,
  videoBlob,
  videoDuration,
  videoUrl,
  videoCloudUrl,
  progress,
  subtitleSegments,
  onSegmentsChange,

  audioOnly,
  liveSubtitle,
  isBusy,
  uploadingVideo,
  setAudioOnly,
  startVideoRecording,
  stopVideoRecording,
  discardVideo,
  handleUploadVideo,
  copyToClipboard,
  formatTime,
  readableSize,
  SubtitleAnnotator,
  recordedVideoRef,
  videoStreamRef,
  language = 'Language',
}) => {
  const cameraPreviewRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Update camera preview when stream changes
  useEffect(() => {
    if (cameraPreviewRef.current && videoStreamRef?.current) {
      cameraPreviewRef.current.srcObject = videoStreamRef.current
      cameraPreviewRef.current.play().catch(() => {})
    } else if (cameraPreviewRef.current && !videoStreamRef?.current) {
      cameraPreviewRef.current.srcObject = null
    }
  }, [videoStreamRef?.current, isRecordingVideo])

  // Track video play/pause state
  useEffect(() => {
    const video = recordedVideoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [videoBlob])

  const togglePlayPause = () => {
    const video = recordedVideoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  if (type !== 'video') return null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Video Recording</h3>
          <p className="text-sm text-white/60">
            Record a video response in {language}
          </p>
        </div>
        <div className="text-xs text-white/40">
          Max {formatTime(maxVideoSec)}
        </div>
      </div>

      {/* Video Preview Area with Controls Overlay */}
      <div className="relative w-full overflow-hidden rounded-lg border border-white/10 bg-black/50">
        {/* Video/Camera Preview */}
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          {isRecordingVideo && videoStreamRef?.current ? (
            <>
              {/* Live camera preview */}
              <video
                ref={cameraPreviewRef}
                className="h-full w-full object-cover"
                autoPlay
                muted
                playsInline
              />

              {/* Recording indicator overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1.5 backdrop-blur-sm">
                <div className="relative flex h-3 w-3 items-center justify-center">
                  <div className="absolute h-3 w-3 animate-ping rounded-full bg-red-600 opacity-75"></div>
                  <div className="h-2 w-2 rounded-full bg-red-600"></div>
                </div>
                <span className="text-sm font-medium text-white">
                  Recording
                </span>
              </div>

              {/* Live subtitle overlay */}
              {liveSubtitle && (
                <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
                  <p className="inline-block rounded-lg bg-black/80 px-4 py-2 text-sm text-white backdrop-blur-sm">
                    {liveSubtitle.trim() || 'Listening...'}
                  </p>
                </div>
              )}
            </>
          ) : videoUrl || videoCloudUrl ? (
            // Playback mode
            <video
              ref={recordedVideoRef}
              src={videoUrl || videoCloudUrl || ''}
              className="h-full w-full object-cover"
              controls
              playsInline
            />
          ) : (
            // Placeholder
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <svg
                    className="h-6 w-6 text-white/60"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-white/60">
                  Camera preview will appear here
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls positioned below video */}
        <div className="border-t border-white/10 bg-white/5 p-4">
          {/* Progress bar (only show when recording) */}
          {isRecordingVideo && (
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-xs text-white/60">
                <span>Recording...</span>
                <span>
                  {formatTime(Math.floor((progress / 100) * maxVideoSec))}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-red-600 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Main Control Buttons */}
          <div className="flex items-center justify-center gap-3">
            {!isRecordingVideo ? (
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={startVideoRecording}
                disabled={isRecordingAudio}
              >
                <div className="h-3 w-3 rounded-full bg-white"></div>
                Record
              </button>
            ) : (
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-zinc-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-600"
                onClick={stopVideoRecording}
              >
                <div className="h-3 w-3 rounded-full bg-white"></div>
                Stop Recording
              </button>
            )}

            {videoBlob && !isRecordingVideo && (
              <>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={togglePlayPause}
                  disabled={isBusy}
                >
                  {isPlaying ? (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      Play
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 transition-all hover:bg-white/20"
                  onClick={discardVideo}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Discard
                </button>
              </>
            )}
          </div>

          {/* Video info and options */}
          {videoBlob && !isRecordingVideo && (
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center gap-4 text-xs text-white/60">
                <span>{readableSize(videoBlob.size)}</span>
                {videoDuration > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatTime(videoDuration)}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="audioOnly"
                  type="checkbox"
                  className="accent-primary h-4 w-4"
                  onChange={(e) => setAudioOnly(e.target.checked)}
                  checked={audioOnly}
                />
                <label htmlFor="audioOnly" className="text-xs text-white/80">
                  Extract audio only
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      {videoBlob && !isRecordingVideo && (
        <button
          type="button"
          onClick={handleUploadVideo}
          disabled={uploadingVideo}
          className="bg-primary hover:bg-primary/90 w-full cursor-pointer rounded-lg px-4 py-3 text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploadingVideo
            ? audioOnly
              ? 'Uploading audio…'
              : 'Uploading video…'
            : audioOnly
              ? 'Upload Audio Only'
              : 'Upload Video'}
        </button>
      )}

      {/* Download/URL Links */}
      {(videoUrl || videoCloudUrl) && (
        <div className="flex items-center gap-4 text-xs text-white/60">
          {videoUrl && (
            <a
              href={videoUrl}
              download="recording_video.webm"
              className="underline transition-colors hover:text-white/80"
            >
              Download video
            </a>
          )}
          {videoCloudUrl && (
            <>
              <a
                href={videoCloudUrl}
                target="_blank"
                rel="noreferrer"
                className="underline transition-colors hover:text-white/80"
              >
                Open uploaded {audioOnly ? 'audio' : 'video'}
              </a>
              <button
                onClick={() => copyToClipboard(videoCloudUrl)}
                className="underline transition-colors hover:text-white/80"
              >
                Copy URL
              </button>
            </>
          )}
        </div>
      )}

      {/* Subtitle Annotator */}
      <SubtitleAnnotator
        videoSrc={videoUrl ?? videoCloudUrl ?? ''}
        chunkSize={5}
        videoStream={videoStreamRef?.current ?? null}
        initialSegments={subtitleSegments ?? []}
        onSegmentsChange={onSegmentsChange}
        liveText={liveSubtitle}
        language={language}
        onExport={async (srtText: string) => {
          const blob = new Blob([srtText], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'subtitles.srt'
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
        }}
      />
    </div>
  )
}

export default VideoRecorderSection
