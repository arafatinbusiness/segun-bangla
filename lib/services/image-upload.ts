import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'

/**
 * Upload an image file to Firebase Storage under articles/{articleId}/
 * Returns the download URL of the uploaded image
 */
export async function uploadArticleImage(
  file: File,
  articleId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Generate a unique filename to avoid collisions
      const timestamp = Date.now()
      const extension = file.name.split('.').pop() || 'jpg'
      const filename = `${timestamp}.${extension}`
      const storagePath = `articles/${articleId}/${filename}`
      const storageRef = ref(storage, storagePath)

      const uploadTask = uploadBytesResumable(storageRef, file)

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
 */
export function validateImageFile(file: File): string | null {
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'শুধুমাত্র JPEG, PNG, WebP, GIF এবং AVIF ফাইল অনুমোদিত'
  }

  if (file.size > MAX_SIZE) {
    return 'ফাইলের আকার ৫MB এর বেশি হতে পারবে না'
  }

  return null
}
