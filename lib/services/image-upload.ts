import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'

/**
 * Compress an image to fit within the target size (100KB)
 * Uses Canvas API to resize and adjust quality
 */
export async function compressImage(file: File, maxSizeKB: number = 100): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let width = img.width
      let height = img.height
      const MAX_DIMENSION = 1200 // Max width/height for news images

      // Resize if too large
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      // Determine output format
      const isPng = file.type === 'image/png'
      const isGif = file.type === 'image/gif'
      const isAvif = file.type === 'image/avif'
      const mimeType = isPng ? 'image/webp' : isGif ? 'image/webp' : isAvif ? 'image/webp' : 'image/jpeg'

      // Try compression with decreasing quality until size fits
      let quality = isPng ? 0.9 : 0.85 // PNG starts higher, JPEG starts at 85%
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image compression failed'))
              return
            }

            if (blob.size > maxSizeKB * 1024 && quality > 0.1) {
              quality -= 0.1
              tryCompress()
            } else {
              resolve(blob)
            }
          },
          mimeType,
          quality
        )
      }

      tryCompress()
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Upload an image file to Firebase Storage under articles/{articleId}/
 * Automatically compresses the image before upload
 * Returns the download URL of the uploaded image
 */
export async function uploadArticleImage(
  file: File,
  articleId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Compress the image first (target 100KB)
  const compressedBlob = await compressImage(file, 100)

  // Determine extension based on compressed blob type
  const extension = compressedBlob.type === 'image/webp'
    ? 'webp'
    : file.name.split('.').pop() || 'jpg'

  // Create a File from the compressed Blob (keep original name for context)
  const compressedFile = new File([compressedBlob], file.name.replace(/\.[^.]+$/, `.${extension}`), {
    type: compressedBlob.type,
  })

  return new Promise((resolve, reject) => {
    try {
      // Generate a unique filename to avoid collisions
      const timestamp = Date.now()
      const filename = `${timestamp}.${extension}`
      const storagePath = `articles/${articleId}/${filename}`
      const storageRef = ref(storage, storagePath)

      console.log(`[v0] Uploading compressed image: original=${(file.size / 1024).toFixed(1)}KB → compressed=${(compressedFile.size / 1024).toFixed(1)}KB`)

      const uploadTask = uploadBytesResumable(storageRef, compressedFile)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          if (onProgress) {
            onProgress(Math.round(progress))
          }
        },
        (error) => {
          console.error('[v0] Image upload error:', error)
          reject(error)
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          } catch (error) {
            console.error('[v0] Error getting download URL:', error)
            reject(error)
          }
        }
      )
    } catch (error) {
      console.error('[v0] Error starting upload:', error)
      reject(error)
    }
  })
}

/**
 * Delete an image from Firebase Storage
 */
export async function deleteArticleImage(imageUrl: string): Promise<void> {
  try {
    // Extract the storage path from the download URL
    const storageRef = ref(storage, imageUrl)
    await deleteObject(storageRef)
  } catch (error) {
    console.error('[v0] Error deleting image:', error)
    throw error
  }
}

/**
 * Validate file before upload
 * Only checks file type now. Size check is handled by auto-compression
 */
export function validateImageFile(file: File): string | null {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'শুধুমাত্র JPEG, PNG, WebP, GIF এবং AVIF ফাইল অনুমোদিত'
  }

  return null
}