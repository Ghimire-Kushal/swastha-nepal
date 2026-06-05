import { v2 as cloudinary } from 'cloudinary'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (
  !cloudName || cloudName === 'your_cloud_name' ||
  !apiKey || apiKey === 'your_api_key' ||
  !apiSecret || apiSecret === 'your_api_secret'
) {
  console.warn('[cloudinary] Credentials not configured — file uploads will fail. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local.')
}

cloudinary.config({
  cloud_name: cloudName,
  api_key:    apiKey,
  api_secret: apiSecret,
  secure: true,
})

export { cloudinary }
