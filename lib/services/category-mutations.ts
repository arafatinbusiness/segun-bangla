import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { Category } from '../types'

const CATEGORIES_COLLECTION = 'categories'

export async function createCategory(categoryData: Partial<Category>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
      ...categoryData,
      order: categoryData.order || 0,
    })
    console.log('[v0] Category created successfully with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('[v0] Error creating category:', error)
    throw error
  }
}
