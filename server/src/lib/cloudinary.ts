import { v2 as cloudinary } from 'cloudinary'
import { UploadApiResponse } from 'cloudinary'

// Initialize Cloudinary from env vars (set once at module load)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
})

/**
 * Upload a Base64-encoded image string (data URI or raw base64) to Cloudinary.
 *
 * @param base64   - A data URI like `data:image/png;base64,…` or a raw base64 string
 * @param folder   - Cloudinary folder to place the asset into (default: 'flash_growth')
 * @param publicId - Optional deterministic public ID (e.g. 'portfolio/acme-rebrand')
 */
export async function uploadImageBase64(
  base64: string,
  folder = 'flash_growth',
  publicId?: string,
): Promise<UploadApiResponse> {
  return cloudinary.uploader.upload(base64, {
    folder,
    resource_type: 'image',
    public_id: publicId,
    overwrite: !!publicId, // only overwrite when a specific ID is given
  })
}

/**
 * Delete an asset from Cloudinary by its full secure URL.
 * Extracts the public_id from the URL automatically.
 */
export async function deleteImageByUrl(secureUrl: string): Promise<void> {
  // secureUrl looks like:
  // https://res.cloudinary.com/<cloud>/image/upload/v1234567/flash_growth/portfolio/xyz.png
  try {
    const urlObj = new URL(secureUrl)
    // Path: /image/upload/v.../folder/.../name.ext
    const pathParts = urlObj.pathname.split('/')
    // Find the 'upload' segment and slice everything after it (skipping the version segment)
    const uploadIdx = pathParts.indexOf('upload')
    if (uploadIdx === -1) throw new Error('Not a Cloudinary upload URL')

    // Next segment may be a version (v12345) – skip it
    let startIdx = uploadIdx + 1
    if (/^v\d+$/.test(pathParts[startIdx])) startIdx++

    // Remaining path without the file extension is the public_id
    const rawPublicId = pathParts.slice(startIdx).join('/')
    const publicId = rawPublicId.replace(/\.[^.]+$/, '')

    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
  } catch (err) {
    console.error('[Cloudinary Delete Error]:', err)
    // Non-fatal: log but don't throw – DB deletion should still proceed
  }
}
