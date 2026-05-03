import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
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

export async function updateArticle(articleId: string, articleData: Partial<Article>): Promise<boolean> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId)
    await updateDoc(docRef, {
      ...articleData,
      updatedAt: Date.now(),
    })
    console.log('[v0] Article updated successfully:', articleId)
    return true
  } catch (error) {
    console.error('[v0] Error updating article:', error)
    throw error
  }
}

export async function deleteArticle(articleId: string): Promise<boolean> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId)
    await deleteDoc(docRef)
    console.log('[v0] Article deleted successfully:', articleId)
    return true
  } catch (error) {
    console.error('[v0] Error deleting article:', error)
    throw error
  }
}
