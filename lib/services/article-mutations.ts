import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { Article } from '../types'

const ARTICLES_COLLECTION = 'articles'

export async function createArticle(articleData: Partial<Article>): Promise<string | null> {
  try {
    const now = Date.now()
    const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), {
      ...articleData,
      status: articleData.status || 'draft',
      publishedAt: now,
      updatedAt: now,
      viewCount: 0,
      isFeatured: false,
    })
    console.log('[v0] Article created successfully with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('[v0] Error creating article:', error)
    throw error
  }
}
