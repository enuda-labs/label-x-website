"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { uploadToCloudinary, copyToClipboard } from "@/utils/cloudinaryUpload";
import { annotateTask } from "@/services/apis/clusters";
import { AxiosError } from "axios";

type Props = {
  taskId: string;
  onSuccess: () => void; // ✅ new prop from parent
};

export default function ImageSubmission({ taskId, onSuccess }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageCloudUrl, setImageCloudUrl] = useState<string | null>(null);

  // cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const discardImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setImageCloudUrl(null);
  };

  const handleUploadImage = async () => {
    if (!imageFile) {
      setError("No image selected.");
      return;
    }
    setError(null);
    setUploadingImage(true);
    setImageCloudUrl(null);

    try {
      const url = await uploadToCloudinary(imageFile, "image");
      setImageCloudUrl(url);

      const payload = {
        task_id: Number(taskId),
        labels: url ? [url] : [],
      };

      await annotateTask(payload);
      discardImage();

      // ✅ trigger parent modal
      onSuccess();
    } catch (err: unknown) {
      const error = err as AxiosError<{ detail?: string }>;
      console.error(error);
      setError(error.response?.data?.detail || error.message || "Upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Upload Image</h3>

      {error && (
        <div className="rounded-md border border-red-600/40 bg-red-600/10 p-3 text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-white/60">Image Upload</div>
            <div className="mt-2 text-sm text-white/80">
              Select an image file to upload for this task.
            </div>
          </div>
        </div>

        {/* File picker */}
        <div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (file) {
                if (imagePreview) URL.revokeObjectURL(imagePreview);
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              } else {
                discardImage();
              }
            }}
          />
          <label htmlFor="image-upload" className="inline-block">
            <Button asChild variant="default" size="sm">
              <span>Choose Image</span>
            </Button>
          </label>
        </div>

        {/* Preview */}
        {imagePreview && (
          <div className="mt-3">
            <Image
              src={imagePreview}
              alt="Selected preview"
              width={400}
              height={400}
              unoptimized
              className="max-h-64 rounded-md border border-white/10 object-contain"
            />

            <div className="mt-2 flex gap-2">
              <Button variant="outline" size="sm" onClick={discardImage} className="text-xs">
                Discard
              </Button>
            </div>

            <div className="mt-4">
              <Button
                onClick={handleUploadImage}
                disabled={!imageFile || uploadingImage}
                size="sm"
                className="w-full cursor-pointer bg-primary hover:bg-primary/90 text-white font-medium rounded-md"
              >
                {uploadingImage ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </div>
        )}

        {imageCloudUrl && (
          <div className="mt-2 text-xs flex items-center gap-2">
            <a href={imageCloudUrl} target="_blank" rel="noreferrer" className="underline">
              Open uploaded image
            </a>
            <button onClick={() => copyToClipboard(imageCloudUrl)} className="text-xs underline">
              Copy URL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
