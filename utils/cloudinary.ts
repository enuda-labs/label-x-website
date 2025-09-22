// Cloudinary upload utility
export async function uploadToCloudinary(file: File | Blob): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', '_tasks')

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!res.ok) throw new Error('Failed to upload file to Cloudinary')
  const data = await res.json()
  return data.secure_url
}
