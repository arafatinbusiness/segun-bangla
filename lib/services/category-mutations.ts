import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { Category, Subcategory } from '../types'

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

export async function updateCategory(categoryId: string, categoryData: Partial<Category>): Promise<boolean> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryId)
    await updateDoc(docRef, categoryData)
    console.log('[v0] Category updated successfully:', categoryId)
    return true
  } catch (error) {
    console.error('[v0] Error updating category:', error)
    throw error
  }
}

export async function deleteCategory(categoryId: string): Promise<boolean> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryId)
    await deleteDoc(docRef)
    console.log('[v0] Category deleted successfully:', categoryId)
    return true
  } catch (error) {
    console.error('[v0] Error deleting category:', error)
    throw error
  }
}

// Subcategory mutations
export async function createSubcategory(
  categoryId: string,
  subcategoryData: Partial<Subcategory>
): Promise<string | null> {
  try {
    const subRef = collection(db, CATEGORIES_COLLECTION, categoryId, 'subcategories')
    const docRef = await addDoc(subRef, {
      ...subcategoryData,
      categoryId,
      order: subcategoryData.order || 0,
    })
    console.log('[v0] Subcategory created successfully with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('[v0] Error creating subcategory:', error)
    throw error
  }
}

export async function updateSubcategory(
  categoryId: string,
  subcategoryId: string,
  subcategoryData: Partial<Subcategory>
): Promise<boolean> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryId, 'subcategories', subcategoryId)
    await updateDoc(docRef, subcategoryData)
    console.log('[v0] Subcategory updated successfully:', subcategoryId)
    return true
  } catch (error) {
    console.error('[v0] Error updating subcategory:', error)
    throw error
  }
}

export async function deleteSubcategory(
  categoryId: string,
  subcategoryId: string
): Promise<boolean> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryId, 'subcategories', subcategoryId)
    await deleteDoc(docRef)
    console.log('[v0] Subcategory deleted successfully:', subcategoryId)
    return true
  } catch (error) {
    console.error('[v0] Error deleting subcategory:', error)
    throw error
  }
}
