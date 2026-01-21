// Cloudinary upload utility
export async function uploadToCloudinary(file: File | Blob): Promise<string> {
  if (!file) {
    throw new Error('No file provided for upload')
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) {
    throw new Error(
      'Cloudinary cloud name is not configured. Please check your environment variables.'
    )
  }

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  if (!uploadPreset) {
    throw new Error(
      'Cloudinary upload preset is not configured. Please set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your environment variables.'
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message ||
          `Failed to upload file to Cloudinary: ${res.status} ${res.statusText}`
      )
    }

    const data = await res.json()
    if (!data.secure_url) {
      throw new Error('Upload succeeded but no URL returned from Cloudinary')
    }

    return data.secure_url
  } catch (err) {
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Unknown error occurred during file upload')
  }
}
