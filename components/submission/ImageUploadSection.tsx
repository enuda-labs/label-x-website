"use client";
import React from "react";
import Image from "next/image";
import { Button } from "../ui/button";

interface ImageUploadSectionProps {
  type: string;
  imagePreview: string | null;
  imageFile: File | null;
  imageCloudUrl: string | null;
  uploadingImage: boolean;
  setImageFile: (file: File | null) => void;
  setImagePreview: (url: string | null) => void;
  discardImage: () => void;
  handleUploadImage: () => void;
  copyToClipboard: (text: string) => void;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  type,
  imagePreview,
  imageFile,
  imageCloudUrl,
  uploadingImage,
  setImageFile,
  setImagePreview,
  discardImage,
  handleUploadImage,
  copyToClipboard,
}) => {
  if (type !== "image") return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white/60">Image Upload</div>
          <div className="mt-2 text-sm text-white/80">
            Select an image file to upload for this task.
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
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
          <label htmlFor="image-upload">
            <Button asChild variant="default" size="sm">
              <span>Choose Image</span>
            </Button>
          </label>
        </div>

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
              <Button
                variant="outline"
                size="sm"
                onClick={discardImage}
                className="text-xs"
              >
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
            <a
              href={imageCloudUrl}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Open uploaded image
            </a>
            <button
              onClick={() => copyToClipboard(imageCloudUrl)}
              className="text-xs underline"
            >
              Copy URL
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadSection;
