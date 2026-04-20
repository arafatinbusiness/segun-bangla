'use server'

import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  collectionGroup,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { Category, Subcategory } from '../types'

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

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const q = query(collection(db, CATEGORIES_COLLECTION), where('slug', '==', slug))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    } as Category
  } catch (error) {
    console.error('Error fetching category by slug:', error)
    return null
  }
}

export async function getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
  try {
    const q = query(
      collection(db, CATEGORIES_COLLECTION, categoryId, 'subcategories'),
      orderBy('order', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      categoryId,
      ...doc.data(),
    })) as Subcategory[]
  } catch (error) {
    console.error('Error fetching subcategories:', error)
    return []
  }
}

export async function getSubcategoryBySlug(
  categoryId: string,
  slug: string
): Promise<Subcategory | null> {
  try {
    const q = query(
      collection(db, CATEGORIES_COLLECTION, categoryId, 'subcategories'),
      where('slug', '==', slug)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      categoryId,
      ...doc.data(),
    } as Subcategory
  } catch (error) {
    console.error('Error fetching subcategory:', error)
    return null
  }
}
