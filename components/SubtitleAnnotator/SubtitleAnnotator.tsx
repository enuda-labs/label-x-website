'use client'

import React, { useEffect, useRef, useState } from 'react'

type Segment = {
  id: string
  start: number // seconds
  end: number // seconds
  text: string
}

function pad(n: number, width = 2) {
  return n.toString().padStart(width, '0')
}

function formatHHMMSSms(time: number) {
  // returns HH:MM:SS,mmm (SRT friendly)
  const hrs = Math.floor(time / 3600)
  const mins = Math.floor((time % 3600) / 60)
  const secs = Math.floor(time % 60)
  const ms = Math.floor((time - Math.floor(time)) * 1000)
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${ms.toString().padStart(3, '0')}`
}

function formatHHMMSS(time: number) {
  const hrs = Math.floor(time / 3600)
  const mins = Math.floor((time % 3600) / 60)
  const secs = Math.floor(time % 60)
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
}

// inside SubtitleAnnotator.tsx — update signature to include onSegmentsChange
export default function SubtitleAnnotator({
  videoSrc = '',
  videoStream = null,
  chunkSize = 5,
  initialSegments = [],
  liveText = '',
  onSegmentsChange, // <-- ADD
  language = 'Language', // <-- ADD language prop
}: {
  videoSrc?: string
  videoStream?: MediaStream | null
  chunkSize?: number
  initialSegments?: Segment[]
  liveText?: string
  onSegmentsChange?: (segments: Segment[]) => void // <-- ADD TYPE
  language?: string // <-- ADD language type
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [autoMode, setAutoMode] = useState(true) // true = Auto, false = Manual

  const [segments, setSegments] = useState<Segment[]>(
    initialSegments.length
      ? initialSegments
      : [
          {
            id: cryptoRandomId(),
            start: 0,
            end: Math.max(chunkSize, 5),
            text: '',
          },
        ]
  )
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    initialSegments?.[0]?.id ?? null
  )

  useEffect(() => {
    if (!initialSegments || initialSegments.length === 0) {
      setSegments((cur) => {
        const defaultSeg = [
          {
            id: cryptoRandomId(),
            start: 0,
            end: Math.max(chunkSize, 5),
            text: '',
          },
        ]
        return areSegmentsEqual(cur, defaultSeg) ? cur : defaultSeg
      })
      return
    }

    setSegments((cur) => {
      if (areSegmentsEqual(cur, initialSegments)) return cur
      isApplyingInitialRef.current = true
      return initialSegments
    })
  }, [initialSegments, chunkSize])

  // Ensure a valid selection as segments change
  useEffect(() => {
    if (segments.length === 0) {
      setSelectedSegmentId(null)
      return
    }
    if (
      !selectedSegmentId ||
      !segments.some((s) => s.id === selectedSegmentId)
    ) {
      setSelectedSegmentId(segments[0].id)
    }
  }, [segments, selectedSegmentId])

  // Add near other refs at top of component
  const isApplyingInitialRef = useRef(false)
  const lastLiveRef = useRef<string>('')

  const [isPreviewing, setIsPreviewing] = useState(false)
  const previewIndexRef = useRef<number | null>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onLoaded = () => setDuration(v.duration || 0)
    const onTime = () => setCurrentTime(v.currentTime || 0)
    v.addEventListener('loadedmetadata', onLoaded)
    v.addEventListener('timeupdate', onTime)
    return () => {
      v.removeEventListener('loadedmetadata', onLoaded)
      v.removeEventListener('timeupdate', onTime)
    }
  }, [])

  useEffect(() => {
    if (!onSegmentsChange) return
    if (isApplyingInitialRef.current) {
      isApplyingInitialRef.current = false
      return
    }
    onSegmentsChange(segments)
  }, [segments, onSegmentsChange])

  function areSegmentsEqual(a: Segment[] = [], b: Segment[] = []) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      const A = a[i],
        B = b[i]
      if (!A || !B) return false
      if (A.id !== B.id) return false
      if (Number(A.start).toFixed(3) !== Number(B.start).toFixed(3))
        return false
      if (Number(A.end).toFixed(3) !== Number(B.end).toFixed(3)) return false
      if ((A.text || '').trim() !== (B.text || '').trim()) return false
    }
    return true
  }

  useEffect(() => {
    if (!isPreviewing) {
      previewIndexRef.current = null
    }
  }, [isPreviewing])

  function cryptoRandomId() {
    return Math.random().toString(36).slice(2, 9)
  }

  function addSegment() {
    const last = segments[segments.length - 1]
    const newStart = last ? last.end : 0
    const newEnd = Math.min(
      (newStart || 0) + chunkSize,
      duration || newStart + chunkSize
    )
    const seg: Segment = {
      id: cryptoRandomId(),
      start: newStart,
      end: newEnd,
      text: '',
    }
    setSegments((s) => [...s, seg])
    setSelectedSegmentId(seg.id)
  }

  function updateSegment(id: string, patch: Partial<Segment>) {
    setSegments((s) =>
      s.map((seg) => (seg.id === id ? { ...seg, ...patch } : seg))
    )
  }

  function deleteSegment(id: string) {
    setSegments((s) => s.filter((seg) => seg.id !== id))
  }

  function splitSegmentAt(id: string, atTime: number) {
    setSegments((cur) => {
      const idx = cur.findIndex((s) => s.id === id)
      if (idx === -1) return cur
      const seg = cur[idx]
      const t = Math.max(seg.start + 0.1, Math.min(seg.end - 0.1, atTime))
      if (!(t > seg.start && t < seg.end)) return cur

      const first: Segment = { ...seg, end: t }
      const second: Segment = {
        id: cryptoRandomId(),
        start: t,
        end: seg.end,
        text: '',
      }

      const next = [...cur]
      next[idx] = first
      next.splice(idx + 1, 0, second)
      return next
    })
  }

  function playSegment(seg: Segment) {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, seg.start)
    v.play()

    const onTime = () => {
      if (v.currentTime >= seg.end - 0.05) {
        v.pause()
        v.removeEventListener('timeupdate', onTime)
      }
    }

    v.addEventListener('timeupdate', onTime)
  }

  function seekTo(time: number) {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.min(Math.max(0, time), duration)
    v.play()
  }

  // Preview plays all segments sequentially (useful for quick review)
  async function previewAll() {
    const v = videoRef.current
    if (!v) return
    setIsPreviewing(true)
    for (let i = 0; i < segments.length; i++) {
      if (!isPreviewing) break // user cancelled
      previewIndexRef.current = i
      const seg = segments[i]
      v.currentTime = Math.max(0, seg.start)
      await v.play()
      await waitForSegmentEnd(v, seg.end)
      if (i < segments.length - 1) {
        await new Promise((r) => setTimeout(r, 200))
      }
    }
    setIsPreviewing(false)
    previewIndexRef.current = null
  }

  function stopPreview() {
    const v = videoRef.current
    if (v) v.pause()
    setIsPreviewing(false)
  }

  function waitForSegmentEnd(v: HTMLVideoElement, end: number) {
    return new Promise<void>((resolve) => {
      const onTime = () => {
        if (v.currentTime >= end - 0.05 || v.ended) {
          v.pause()
          v.removeEventListener('timeupdate', onTime)
          resolve()
        }
      }
      v.addEventListener('timeupdate', onTime)
    })
  }

  function exportSRT() {
    // Build SRT string
    const lines: string[] = []
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i]
      lines.push((i + 1).toString())
      lines.push(`${formatHHMMSSms(s.start)} --> ${formatHHMMSSms(s.end)}`)
      lines.push(s.text || '')
      lines.push('')
    }
    const blob = new Blob([lines.join('\n')], {
      type: 'text/plain;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subtitles.srt'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  // timeline markers for chunked segments
  const markers = []
  const totalMarkers = Math.max(1, Math.ceil((duration || 0) / chunkSize))
  for (let i = 0; i < totalMarkers; i++) {
    markers.push({
      start: i * chunkSize,
      end: Math.min((i + 1) * chunkSize, duration || (i + 1) * chunkSize),
    })
  }

  useEffect(() => {
    if (!autoMode) return
    const addition = (liveText || '').trim()
    if (!addition) return
    if (addition === lastLiveRef.current) return
    lastLiveRef.current = addition

    setSegments((prev) => {
      if (prev.length === 0) {
        return [
          { id: cryptoRandomId(), start: 0, end: chunkSize, text: addition },
        ]
      }
      const last = prev[prev.length - 1]
      const currentTime = videoRef.current?.currentTime || 0

      if (currentTime < last.end) {
        const existing = (last.text || '').trim()
        if (!existing.endsWith(addition)) {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...last,
            text: existing ? `${existing} ${addition}` : addition,
          }
          return updated
        }
        return prev
      } else {
        const newStart = last.end
        const newEnd = newStart + chunkSize
        return [
          ...prev,
          {
            id: cryptoRandomId(),
            start: newStart,
            end: newEnd,
            text: addition,
          },
        ]
      }
    })
  }, [liveText, autoMode, chunkSize])

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream
    }
  }, [videoStream])

  return (
    <div className="min-h-screen bg-white p-6 font-sans text-slate-800">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-slate-100 shadow-sm">
        {/* Header */}
        <div className="bg-white px-6 py-4">
          <h1 className="text-lg font-semibold">
            Subtitle Annotation — {language}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Clean, focused interface for fast transcription.
          </p>
        </div>

        {/* Buttons */}
        <div className="border-t border-slate-100 bg-white px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="subtitle-toggle">
              <button
                onClick={() => setAutoMode((prev) => !prev)}
                className="bg-primary rounded px-3 py-1 text-white hover:bg-blue-600"
              >
                {autoMode ? 'Switch to Manual Mode' : 'Switch to Auto Mode'}
              </button>
            </div>

            <button
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              onClick={addSegment}
            >
              Add Segment
            </button>

            {!isPreviewing ? (
              <button
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                onClick={previewAll}
                disabled={segments.length === 0}
              >
                Preview
              </button>
            ) : (
              <button
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                onClick={stopPreview}
              >
                Stop Preview
              </button>
            )}

            <button
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
              onClick={exportSRT}
            >
              Export as .SRT
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Video player - Only show when there's a recorded video, not during live recording */}
          {videoSrc && !videoStream && (
            <div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-black sm:h-[480px] md:h-[540px]">
              {/* 🎥 Playback mode (after recording) */}
              <video
                ref={videoRef}
                src={videoSrc}
                className="h-full w-full object-cover"
                controls
                playsInline
              />
            </div>
          )}

          {/* Timeline */}
          <div className="mt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <div>{formatHHMMSS(Math.max(0, currentTime))}</div>
              <div>{formatHHMMSS(Math.max(0, duration || 0))}</div>
            </div>

            <div className="flex h-12 w-full items-center rounded-md border border-slate-100 bg-white/50 px-2">
              <div className="relative flex h-4 w-full items-center gap-1">
                {markers.map((m, i) => {
                  const isActive = currentTime >= m.start && currentTime < m.end
                  return (
                    <div
                      key={i}
                      role="button"
                      onClick={() => seekTo(m.start + 0.01)}
                      className={`h-4 flex-1 rounded-sm border ${isActive ? 'bg-slate-900' : 'bg-slate-100'} cursor-pointer transition-all`}
                      title={`${formatHHMMSS(m.start)} → ${formatHHMMSS(m.end)}`}
                    />
                  )
                })}

                {/* playhead */}
                {duration > 0 && (
                  <div
                    className="absolute top-0 h-4 w-px bg-slate-500"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Segments + Editor */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Left: Segments list */}
            <div className="overflow-hidden rounded-md border border-slate-100 bg-white">
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      Segments
                    </div>
                    <div className="text-xs text-slate-500">
                      Click a segment to edit its transcript.
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {segments.length}
                  </div>
                </div>
              </div>

              <div className="max-h-[420px] overflow-auto">
                {segments.map((seg, idx) => {
                  const isSelected = seg.id === selectedSegmentId
                  const isPreviewingThis = previewIndexRef.current === idx
                  const snippet =
                    (seg.text || '').trim().slice(0, 64) ||
                    `Type ${language} transcript…`
                  return (
                    <button
                      key={seg.id}
                      type="button"
                      onClick={() => {
                        setSelectedSegmentId(seg.id)
                        seekTo(seg.start + 0.01)
                      }}
                      className={`w-full border-b border-slate-100 px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-slate-50'
                          : isPreviewingThis
                            ? 'bg-slate-50'
                            : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-600">
                              #{idx + 1}
                            </span>
                            <span className="font-mono text-xs text-slate-500">
                              {formatHHMMSSms(seg.start)} →{' '}
                              {formatHHMMSSms(seg.end)}
                            </span>
                          </div>
                          <div className="mt-1 truncate text-sm text-slate-800">
                            {snippet}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">
                            {(seg.end - seg.start).toFixed(1)}s •{' '}
                            {
                              (seg.text || '')
                                .trim()
                                .split(/\s+/)
                                .filter(Boolean).length
                            }{' '}
                            words
                          </div>
                        </div>
                        {isSelected && (
                          <span className="mt-1 inline-flex rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-white">
                            Editing
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right: Selected segment editor */}
            <div className="md:col-span-2">
              {(() => {
                const seg =
                  segments.find((s) => s.id === selectedSegmentId) ||
                  segments[0]
                if (!seg) return null
                const words = (seg.text || '')
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean).length
                const durationSec = Math.max(0, seg.end - seg.start)
                const playheadInside =
                  currentTime >= seg.start && currentTime <= seg.end

                return (
                  <div className="rounded-md border border-slate-100 bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          Segment editor
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-slate-500">
                          {formatHHMMSSms(seg.start)} →{' '}
                          {formatHHMMSSms(seg.end)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {durationSec.toFixed(1)}s • {words} words •{' '}
                          {playheadInside
                            ? 'Playhead inside segment'
                            : 'Playhead outside'}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => playSegment(seg)}
                          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                        >
                          Play
                        </button>
                        <button
                          type="button"
                          onClick={() => seekTo(seg.start + 0.01)}
                          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                        >
                          Seek
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            splitSegmentAt(seg.id, currentTime)
                            // selection will move to the newly created segment (next index)
                            // after state update, select the segment whose start equals the split time
                            setTimeout(() => {
                              const t = Math.max(
                                seg.start + 0.1,
                                Math.min(seg.end - 0.1, currentTime)
                              )
                              const next = segments.find(
                                (s) =>
                                  Number(s.start).toFixed(3) ===
                                  Number(t).toFixed(3)
                              )
                              if (next) setSelectedSegmentId(next.id)
                            }, 0)
                          }}
                          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                          title="Split this segment at the current playhead position"
                        >
                          Split at playhead
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteSegment(seg.id)
                          }}
                          className="rounded-md border border-transparent px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <label className="text-xs font-medium text-slate-600">
                        Transcript ({language})
                      </label>
                      <textarea
                        value={seg.text}
                        onChange={(e) =>
                          updateSegment(seg.id, { text: e.target.value })
                        }
                        placeholder={`Type the ${language} transcript for this segment…`}
                        className="min-h-[140px] w-full resize-y rounded-md border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      />
                      <div className="text-xs text-slate-500">
                        Tip: Keep it to 1–2 sentences for this time range. Use
                        the “Split at playhead” button if the segment contains
                        multiple sentences.
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
                        <div className="text-xs font-medium text-slate-600">
                          Start time (seconds)
                        </div>
                        <div className="mt-2 flex flex-col gap-2">
                          <input
                            type="number"
                            step="0.1"
                            min={0}
                            value={seg.start}
                            onChange={(e) =>
                              updateSegment(seg.id, {
                                start: Math.max(0, Number(e.target.value)),
                              })
                            }
                            className="w-full rounded border border-slate-200 bg-white p-2 text-sm"
                          />
                          <button
                            type="button"
                            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-100"
                            onClick={() =>
                              updateSegment(seg.id, {
                                start: Math.max(0, currentTime),
                              })
                            }
                          >
                            Use playhead
                          </button>
                        </div>
                      </div>

                      <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
                        <div className="text-xs font-medium text-slate-600">
                          End time (seconds)
                        </div>
                        <div className="mt-2 flex flex-col gap-2">
                          <input
                            type="number"
                            step="0.1"
                            min={0}
                            value={seg.end}
                            onChange={(e) =>
                              updateSegment(seg.id, {
                                end: Math.max(
                                  seg.start + 0.1,
                                  Number(e.target.value)
                                ),
                              })
                            }
                            className="w-full rounded border border-slate-200 bg-white p-2 text-sm"
                          />
                          <button
                            type="button"
                            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-100"
                            onClick={() =>
                              updateSegment(seg.id, {
                                end: Math.max(seg.start + 0.1, currentTime),
                              })
                            }
                          >
                            Use playhead
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          <div className="rounded-md border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
            <div className="font-medium text-slate-700">How to use</div>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Select a segment on the left to edit its transcript.</li>
              <li>
                Use “Split at playhead” when a segment covers too much speech.
              </li>
              <li>Aim for short segments (5–10s) for easy reading.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// export helper so parent can generate and upload SRT
export function generateSRTBlob(segments: Segment[]): Blob {
  const lines: string[] = []
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]
    lines.push(String(i + 1))
    lines.push(`${formatHHMMSSms(s.start)} --> ${formatHHMMSSms(s.end)}`)
    lines.push(s.text || '')
    lines.push('')
  }
  return new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
}
