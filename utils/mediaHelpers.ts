// utils/mediaHelpers.ts

export const formatTime = (s: number) => {
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = Math.floor(s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

export const getSupportedMime = (candidates: string[]): string => {
  const isSupported = (MediaRecorder as unknown as {
    isTypeSupported?: (type: string) => boolean;
  }).isTypeSupported;

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

export const readableSize = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
};

export const isIOS =
  typeof navigator !== "undefined" && /iP(hone|od|ad)/.test(navigator.userAgent);

export const attachBlobToElement = async (
  el: HTMLMediaElement | null,
  blob: Blob,
  setDuration: (n: number | null) => void,
  setError?: (msg: string | null) => void // <-- make optional
) => {
  if (!el || !blob) return;

  const url = URL.createObjectURL(blob);

  try {
    if (el instanceof HTMLVideoElement) {
      el.setAttribute("playsinline", "");
      el.setAttribute("webkit-playsinline", "");
      el.controls = true;
      if ("srcObject" in el && el.srcObject) el.srcObject = null;
    }

    el.src = url;
    let canPlayHint = "";
    try {
      canPlayHint =
        typeof el.canPlayType === "function" ? el.canPlayType(blob.type || "") || "" : "";
    } catch {
      canPlayHint = "";
    }

    el.load();

    await new Promise<void>((resolve) => {
      let resolved = false;
      const onMeta = () => {
        if (resolved) return;
        resolved = true;
        el.removeEventListener("loadedmetadata", onMeta);
        resolve();
      };
      el.addEventListener("loadedmetadata", onMeta);
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          el.removeEventListener("loadedmetadata", onMeta);
          resolve();
        }
      }, 1500);
    });

    const dur = el.duration;
    if (!isFinite(dur) || isNaN(dur)) {
      setDuration(null);
    } else {
      setDuration(Math.round(dur));
    }

    try {
      await el.play();
      setError?.(null); // <-- safe call
    } catch {
      if (isIOS && (canPlayHint === "" || canPlayHint === "no")) {
        setError?.(
          "Playback failed on iOS. The format may not be supported. Try downloading or use a newer Safari / server-side transcoding."
        );
      } else {
        setError?.(
          "Preview couldn't autoplay — tap the play button. If that fails, download the file."
        );
      }
    }

    const onError = () => {
      setError?.(
        isIOS
          ? "This iOS/Safari version couldn't decode the file. Please download it or use server-side transcoding."
          : "Playback failed. Try downloading the file or another browser."
      );
    };
    el.removeEventListener("error", onError);
    el.addEventListener("error", onError);
  } catch {
    setDuration(null);
    setError?.("Unable to prepare preview for this recording.");
    try {
      el.src = url;
      el.load();
    } catch {}
  }
};
