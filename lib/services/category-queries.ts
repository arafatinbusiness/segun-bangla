import {
  collection,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Category } from '../types'

const CATEGORIES_COLLECTION = 'categories'

export async function getAllCategories(): Promise<Category[]> {
  try {
    const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('order', 'asc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[]
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}
