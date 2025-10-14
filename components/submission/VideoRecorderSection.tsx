import React from "react";

interface SubtitleSegment {
  id: string;
  start: number;
  end: number;
  text: string;
}

interface VideoRecorderSectionProps {
  type: string;
  maxVideoSec: number;
  isRecordingVideo: boolean;
  isRecordingAudio: boolean;
  videoBlob: Blob | null;
  videoDuration: number;
  videoUrl: string | null;
  videoCloudUrl: string | null;
  progress: number;

  // new props
  subtitleSegments?: SubtitleSegment[];
  onSegmentsChange?: (segments: SubtitleSegment[]) => void;

  audioOnly: boolean;
  liveSubtitle?: string;
  isBusy?: boolean;
  uploadingVideo?: boolean;
  setAudioOnly: (val: boolean) => void;

  // these may be async in the parent, allow either
  startVideoRecording: () => Promise<void> | void;
  stopVideoRecording: () => void;
  discardVideo: () => void;
  handleUploadVideo: () => Promise<void> | void;

  copyToClipboard: (text: string) => void;
  formatTime: (sec: number) => string;
  readableSize: (size: number) => string;

  SubtitleAnnotator: React.ComponentType<Record<string, unknown>>;

  // allow nullable refs (matches `useRef<HTMLVideoElement | null>(null)` in parent)
  recordedVideoRef: React.RefObject<HTMLVideoElement | null>;
  videoStreamRef: React.RefObject<MediaStream | null>;


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
}) => {
  if (type !== "video") return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white/60">Video Recording</div>
          <div className="mt-2 text-sm text-white/80">
            Record a short video to show context to labelers.
          </div>
        </div>
        <div className="text-xs text-white/60">Max {maxVideoSec}s</div>
      </div>

      <div className="mt-4 space-y-3">
        {videoBlob && !isRecordingVideo && (
          <div className="flex items-center gap-2">
            <input
              id="audioOnly"
              type="checkbox"
              className="h-4 w-4 accent-primary"
              onChange={(e) => setAudioOnly(e.target.checked)}
              checked={audioOnly}
            />
            <label htmlFor="audioOnly" className="text-sm text-white/80">
              Extract audio only
            </label>
          </div>
        )}

        <div className="flex items-center gap-2">
          {!isRecordingVideo ? (
            <button
              type="button"
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white"
              onClick={startVideoRecording}
              disabled={isRecordingAudio || isRecordingVideo}
            >
              Record
            </button>
          ) : (
            <button
              type="button"
              className="rounded-md bg-zinc-700 px-3 py-2 text-sm font-medium text-white"
              onClick={stopVideoRecording}
            >
              Stop
            </button>
          )}

          <button
            type="button"
            className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/80"
            onClick={() => recordedVideoRef.current?.play()}
            disabled={!videoBlob || isBusy}
          >
            Play
          </button>

          <button
            type="button"
            className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/80"
            onClick={discardVideo}
            disabled={!videoBlob}
          >
            Discard
          </button>

          {videoBlob && (
            <div className="ml-auto text-xs text-white/60">
              {readableSize(videoBlob.size)} •{" "}
              {videoDuration ? `${formatTime(videoDuration)}` : "Recorded"}
            </div>
          )}
        </div>

        {/* ✅ Progress bar showing 40-min countdown */}
        <div className="w-full bg-gray-300 h-2 rounded">
          <div
            className="bg-red-600 h-2 rounded"
            style={{ width: `${progress}%`, transition: "width 1s linear" }}
          />
        </div>

        <div className="w-full overflow-hidden rounded-md bg-black/30 relative">
          {isRecordingVideo && (
            <div className="absolute bottom-8 w-full text-center z-50">
              <p className="bg-black/60 text-white px-4 py-2 rounded-xl inline-block">
                {liveSubtitle || "Listening..."}
              </p>
            </div>
          )}
        </div>

        {videoBlob && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleUploadVideo}
              disabled={!videoBlob || uploadingVideo}
              className="w-full cursor-pointer rounded-md bg-primary hover:bg-primary/90 px-4 py-2 text-sm font-medium text-white"
            >
              {uploadingVideo
                ? audioOnly
                  ? "Uploading audio…"
                  : "Uploading video…"
                : audioOnly
                ? "Upload Audio Only"
                : "Upload Video"}
            </button>
          </div>
        )}

        {videoUrl && (
          <div className="mt-2 text-xs">
            <a href={videoUrl} download="recording_video.webm" className="underline">
              Download video
            </a>
          </div>
        )}

        {videoCloudUrl && (
          <div className="mt-2 text-xs flex items-center gap-2">
            <a href={videoCloudUrl} target="_blank" rel="noreferrer" className="underline">
              Open uploaded {audioOnly ? "audio" : "video"}
            </a>
            <button
              onClick={() => copyToClipboard(videoCloudUrl)}
              className="text-xs underline"
            >
              Copy URL
            </button>
          </div>
        )}

        <SubtitleAnnotator
          videoSrc={videoUrl ?? videoCloudUrl ?? ""}
          chunkSize={5}
          videoStream={videoStreamRef?.current ?? null}
          initialSegments={subtitleSegments ?? []}
          onSegmentsChange={onSegmentsChange}
          liveText={liveSubtitle}
          onExport={async (srtText: string) => {
            const blob = new Blob([srtText], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "subtitles.srt";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }}
        />
      </div>
    </div>
  );
};

export default VideoRecorderSection;
