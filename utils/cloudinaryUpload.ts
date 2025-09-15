// utils/cloudinaryUpload.ts

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (
  file: Blob,
  resourceType: "video" | "raw" | "auto" = "auto"
): Promise<string | null> => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary config missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("resource_type", resourceType);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
  const res = await fetch(url, { method: "POST", body: fd });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Upload failed: ${res.status} ${res.statusText} — ${txt}`);
  }

  const json = await res.json();
  return json.secure_url || json.url || null;
};

export const copyToClipboard = async (text: string | null) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    window.open(text, "_blank");
  }
};
