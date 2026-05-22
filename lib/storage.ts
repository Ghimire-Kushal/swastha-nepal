import { cloudinary } from './cloudinary'

export type UploadFolder = 'lab-reports' | 'prescriptions' | 'scans' | 'documents'

export interface UploadResult {
  url: string
  publicId: string
  format: string
  bytes: number
  width?: number
  height?: number
}

export async function uploadFile(
  buffer: Buffer,
  folder: UploadFolder,
  filename: string
): Promise<UploadResult> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
    // Dev fallback — return a mock URL so pages work without credentials
    return {
      url: `https://placehold.co/800x600?text=${encodeURIComponent(filename)}`,
      publicId: `${folder}/${Date.now()}-${filename}`,
      format: filename.split('.').pop() ?? 'bin',
      bytes: buffer.length,
    }
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `swastha-nepal/${folder}`,
        public_id: `${Date.now()}-${filename.replace(/\.[^.]+$/, '')}`,
        resource_type: 'auto',
        use_filename: false,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'))
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        })
      }
    )
    uploadStream.end(buffer)
  })
}

export async function deleteFile(publicId: string): Promise<void> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') return
  await cloudinary.uploader.destroy(publicId)
}

export function getTransformedUrl(
  publicId: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    quality: options.quality ?? 'auto',
    fetch_format: 'auto',
    secure: true,
  })
}
