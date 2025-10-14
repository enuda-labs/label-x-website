"use client";

import React, { useEffect, useRef, useState } from "react";

type Segment = {
  id: string;
  start: number; // seconds
  end: number; // seconds
  text: string;
};



function pad(n: number, width = 2) {
  return n.toString().padStart(width, "0");
}

function formatHHMMSSms(time: number) {
  // returns HH:MM:SS,mmm (SRT friendly)
  const hrs = Math.floor(time / 3600);
  const mins = Math.floor((time % 3600) / 60);
  const secs = Math.floor(time % 60);
  const ms = Math.floor((time - Math.floor(time)) * 1000);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${ms.toString().padStart(3, "0")}`;
}

function formatHHMMSS(time: number) {
  const hrs = Math.floor(time / 3600);
  const mins = Math.floor((time % 3600) / 60);
  const secs = Math.floor(time % 60);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

// inside SubtitleAnnotator.tsx — update signature to include onSegmentsChange
export default function SubtitleAnnotator({
  videoSrc = "",
  videoStream = null,
  chunkSize = 5,
  initialSegments = [],
  liveText = "",
  onSegmentsChange, // <-- ADD
}: {
  videoSrc?: string;
  videoStream?: MediaStream | null;
  chunkSize?: number;
  initialSegments?: Segment[];
  liveText?: string;
  onSegmentsChange?: (segments: Segment[]) => void; // <-- ADD TYPE
}) {

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [autoMode, setAutoMode] = useState(true); // true = Auto, false = Manual

  const [segments, setSegments] = useState<Segment[]>(
    initialSegments.length
      ? initialSegments
      : [{ id: cryptoRandomId(), start: 0, end: Math.max(chunkSize, 5), text: "" }]
  );


  useEffect(() => {
  if (!initialSegments || initialSegments.length === 0) {
    // parent cleared segments — reset to a single empty chunk
    setSegments([{ id: cryptoRandomId(), start: 0, end: Math.max(chunkSize, 5), text: "" }]);
  } else {
    // replace current segments with parent's segments
    setSegments(initialSegments);
  }
}, [initialSegments, chunkSize]);

  const [isPreviewing, setIsPreviewing] = useState(false);
  const previewIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => setDuration(v.duration || 0);
    const onTime = () => setCurrentTime(v.currentTime || 0);
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("timeupdate", onTime);
    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
    };
  }, []);


  useEffect(() => {
    if (onSegmentsChange) onSegmentsChange(segments);
  }, [segments, onSegmentsChange]);



  useEffect(() => {
    if (!isPreviewing) {
      previewIndexRef.current = null;
    }
  }, [isPreviewing]);






  function cryptoRandomId() {
    return Math.random().toString(36).slice(2, 9);
  }

  function addSegment() {
    const last = segments[segments.length - 1];
    const newStart = last ? last.end : 0;
    const newEnd = Math.min((newStart || 0) + chunkSize, duration || newStart + chunkSize);
    const seg: Segment = { id: cryptoRandomId(), start: newStart, end: newEnd, text: "" };
    setSegments((s) => [...s, seg]);
  }

  function updateSegment(id: string, patch: Partial<Segment>) {
    setSegments((s) => s.map((seg) => (seg.id === id ? { ...seg, ...patch } : seg)));
  }

  function deleteSegment(id: string) {
    setSegments((s) => s.filter((seg) => seg.id !== id));
  }

  function playSegment(seg: Segment) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, seg.start);
    v.play();

    const onTime = () => {
      if (v.currentTime >= seg.end - 0.05) {
        v.pause();
        v.removeEventListener("timeupdate", onTime);
      }
    };

    v.addEventListener("timeupdate", onTime);
  }

  function seekTo(time: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(0, time), duration);
    v.play();
  }

  // Preview plays all segments sequentially (useful for quick review)
  async function previewAll() {
    const v = videoRef.current;
    if (!v) return;
    setIsPreviewing(true);
    for (let i = 0; i < segments.length; i++) {
      if (!isPreviewing) break; // user cancelled
      previewIndexRef.current = i;
      const seg = segments[i];
      v.currentTime = Math.max(0, seg.start);
      await v.play();
      await waitForSegmentEnd(v, seg.end);
      if (i < segments.length - 1) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }
    setIsPreviewing(false);
    previewIndexRef.current = null;
  }

  function stopPreview() {
    const v = videoRef.current;
    if (v) v.pause();
    setIsPreviewing(false);
  }

  function waitForSegmentEnd(v: HTMLVideoElement, end: number) {
    return new Promise<void>((resolve) => {
      const onTime = () => {
        if (v.currentTime >= end - 0.05 || v.ended) {
          v.pause();
          v.removeEventListener("timeupdate", onTime);
          resolve();
        }
      };
      v.addEventListener("timeupdate", onTime);
    });
  }

  function exportSRT() {
    // Build SRT string
    const lines: string[] = [];
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      lines.push((i + 1).toString());
      lines.push(`${formatHHMMSSms(s.start)} --> ${formatHHMMSSms(s.end)}`);
      lines.push(s.text || "");
      lines.push("");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subtitles.srt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }




  // timeline markers for chunked segments
  const markers = [];
  const totalMarkers = Math.max(1, Math.ceil((duration || 0) / chunkSize));
  for (let i = 0; i < totalMarkers; i++) {
    markers.push({ start: i * chunkSize, end: Math.min((i + 1) * chunkSize, duration || (i + 1) * chunkSize) });
  }


  useEffect(() => {
    if (!autoMode || !liveText?.trim()) return;

    const currentTime = videoRef.current?.currentTime || 0;

    setSegments((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: cryptoRandomId(),
            start: 0,
            end: chunkSize,
            text: liveText.trim(),
          },
        ];
      }

      const last = prev[prev.length - 1];

      if (currentTime < last.end) {
        // 🧩 Append instead of replacing — but avoid duplicate appends
        const updated = [...prev];
        const existing = last.text.trim();
        const addition = liveText.trim();

        if (!addition) return prev;

        // Only append if the new liveText isn't already included
        if (!existing.endsWith(addition)) {
          updated[updated.length - 1] = {
            ...last,
            text: existing ? `${existing} ${addition}` : addition,
          };
        }
        return updated;
      } else {
        // ⏱️ Segment time is up — start a new one
        const newStart = last.end;
        const newEnd = newStart + chunkSize;
        const newSeg: Segment = {
          id: cryptoRandomId(),
          start: newStart,
          end: newEnd,
          text: liveText.trim(),
        };
        return [...prev, newSeg];
      }
    });
  }, [liveText, autoMode, chunkSize]);



  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);



  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans p-6">
      <div className="max-w-5xl mx-auto shadow-sm rounded-lg border border-slate-100 overflow-hidden">
        {/* Header + CTA */}
        <div className="flex items-center justify-between px-6 py-4 bg-white">
          <div>
            <h1 className="text-lg font-semibold">Subtitle Annotation — Igbo</h1>
            <p className="text-xs text-slate-500 mt-0.5">Clean, focused interface for fast transcription.</p>
          </div>

          <div className="flex items-center gap-2">
          <div className="subtitle-toggle">
  <button
    onClick={() => setAutoMode((prev) => !prev)}
    className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
  >
    {autoMode ? "Switch to Manual Mode" : "Switch to Auto Mode"}
  </button>
</div>

            <button
              className="px-3 py-2 text-sm rounded-md border border-slate-200 bg-white hover:bg-slate-50"
              onClick={addSegment}
            >
              Add Segment
            </button>

            {!isPreviewing ? (
              <button
                className="px-3 py-2 text-sm rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                onClick={previewAll}
                disabled={segments.length === 0}
              >
                Preview
              </button>
            ) : (
              <button
                className="px-3 py-2 text-sm rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                onClick={stopPreview}
              >
                Stop Preview
              </button>
            )}

            <button
              className="px-3 py-2 text-sm rounded-md bg-slate-900 text-white hover:bg-slate-800"
              onClick={exportSRT}
            >
              Export as .SRT
            </button>


          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Video player */}
          {/* Video player */}
    <div className="relative w-full h-[420px] sm:h-[480px] md:h-[540px] rounded-xl border border-slate-200 bg-black flex items-center justify-center overflow-hidden">
  {videoStream ? (
    <>
      {/* 🔴 Live camera preview mode */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      />

      {/* 🎙️ Overlay for live subtitles or listening indicator */}
      <div className="absolute bottom-8 w-full text-center z-50">
        <p className="bg-black/60 text-white px-4 py-2 rounded-xl inline-block">
          {liveText?.trim() || "Listening..."}
        </p>
      </div>
    </>
  ) : videoSrc ? (
    // 🎥 Playback mode (after recording)
    <video
      ref={videoRef}
      src={videoSrc}
      className="w-full h-full object-cover"
      controls
      playsInline
    />
  ) : (
    // 🕳️ Placeholder before recording starts
    <p className="text-white/50 text-sm">Camera preview will appear here</p>
  )}
</div>



          {/* Timeline */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <div>{formatHHMMSS(Math.max(0, currentTime))}</div>
              <div>{formatHHMMSS(Math.max(0, duration || 0))}</div>
            </div>

            <div className="w-full h-12 rounded-md border border-slate-100 bg-white/50 flex items-center px-2">
              <div className="relative w-full h-4 flex gap-1 items-center">
                {markers.map((m, i) => {
                  const isActive = currentTime >= m.start && currentTime < m.end;
                  return (
                    <div
                      key={i}
                      role="button"
                      onClick={() => seekTo(m.start + 0.01)}
                      className={`flex-1 h-4 rounded-sm border ${isActive ? "bg-slate-900" : "bg-slate-100"} cursor-pointer transition-all`}
                      title={`${formatHHMMSS(m.start)} → ${formatHHMMSS(m.end)}`}
                    />
                  );
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

          {/* Subtitle segments list */}
          <div className="border border-slate-100 rounded-md overflow-hidden">
            <div className="divide-y divide-slate-100 max-h-96 overflow-auto">
              {segments.map((seg, idx) => (
                <div key={seg.id} className={`p-4 flex gap-4 items-start ${previewIndexRef.current === idx ? "bg-slate-50" : "bg-white"}`}>
                  <div className="w-40 text-xs text-slate-600">
                    <div className="font-mono text-xs text-slate-700">{formatHHMMSSms(seg.start)} → {formatHHMMSSms(seg.end)}</div>
                    <div className="text-[11px] text-slate-500 mt-1">#{idx + 1}</div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => playSegment(seg)}
                        className="px-2 py-1 text-sm rounded border border-slate-200 bg-white text-slate-700"
                      >
                        ▶ Play segment
                      </button>

                      <button
                        onClick={() => seekTo(seg.start)}
                        className="px-2 py-1 text-sm rounded border border-slate-200 bg-white text-slate-700"
                      >
                        Seek
                      </button>

                      <button
                        onClick={() => deleteSegment(seg.id)}
                        className="ml-auto px-2 py-1 text-sm rounded border border-transparent text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>

                    <textarea
                      value={seg.text}
                      onChange={(e) => updateSegment(seg.id, { text: e.target.value })}
                      placeholder="Type Igbo transcription here..."
                      className="w-full min-h-[56px] p-3 rounded border border-slate-100 text-sm resize-none"
                    />

                    <div className="mt-2 text-xs text-slate-500 flex items-center gap-3">
                      <div>Duration: <span className="font-mono">{(seg.end - seg.start).toFixed(2)}s</span></div>
                      <div>|</div>
                      <div>Words: <span className="font-mono">{(seg.text || "").trim().split(/\s+/).filter(Boolean).length}</span></div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min={0}
                        value={seg.start}
                        onChange={(e) => updateSegment(seg.id, { start: Math.max(0, Number(e.target.value)) })}
                        className="w-28 p-2 border rounded text-sm"
                      />
                      <input
                        type="number"
                        step="0.1"
                        min={0}
                        value={seg.end}
                        onChange={(e) => updateSegment(seg.id, { end: Math.max(0, Number(e.target.value)) })}
                        className="w-28 p-2 border rounded text-sm"
                      />
                      <button
                        className="px-3 py-1 text-sm rounded border border-slate-200 bg-white"
                        onClick={() => updateSegment(seg.id, { start: Math.max(0, currentTime) })}
                      >
                        Set start ←
                      </button>
                      <button
                        className="px-3 py-1 text-sm rounded border border-slate-200 bg-white"
                        onClick={() => updateSegment(seg.id, { end: Math.max(seg.start + 0.1, currentTime) })}
                      >
                        Set end ←
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-400">Tip: Keep each segment short (5–10s) for best readability. This UI is tuned for Igbo-language transcribers with minimal distractions.</div>
        </div>
      </div>
    </div>
  );
}





// export helper so parent can generate and upload SRT
export function generateSRTBlob(segments: Segment[]): Blob {
const lines: string[] = [];
for (let i = 0; i < segments.length; i++) {
  const s = segments[i];
  lines.push(String(i + 1));
  lines.push(`${formatHHMMSSms(s.start)} --> ${formatHHMMSSms(s.end)}`);
  lines.push(s.text || "");
  lines.push("");
}
return new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
}
