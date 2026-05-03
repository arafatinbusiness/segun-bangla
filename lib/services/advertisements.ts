import {
  collection,
  query,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Advertisement, AdSlot } from '../types'

const ADS_COLLECTION = 'advertisements'
const SLOTS_COLLECTION = 'adSlots'

// ====== Advertisement CRUD ======

export async function getAllAdvertisements(): Promise<Advertisement[]> {
  try {
    const q = query(collection(db, ADS_COLLECTION), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      docId: doc.id,
    })) as Advertisement[]
  } catch (error) {
    console.error('Error fetching advertisements:', error)
    return []
  }
}

export async function getAdvertisementById(id: string): Promise<Advertisement | null> {
  try {
    const docRef = doc(db, ADS_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return { ...docSnap.data(), docId: docSnap.id } as Advertisement
  } catch (error) {
    console.error('Error fetching advertisement:', error)
    return null
  }
}

export async function getAdvertisementsBySlot(slotName: string): Promise<Advertisement[]> {
  try {
    const q = query(
      collection(db, ADS_COLLECTION),
      where('slotName', '==', slotName),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      docId: doc.id,
    })) as Advertisement[]
  } catch (error) {
    console.error('Error fetching ads by slot:', error)
    return []
  }
}

export async function createAdvertisement(data: Omit<Advertisement, 'docId' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const now = Date.now()
    const docRef = await addDoc(collection(db, ADS_COLLECTION), {
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating advertisement:', error)
    return null
  }
}

export async function updateAdvertisement(id: string, data: Partial<Advertisement>): Promise<void> {
  try {
    const docRef = doc(db, ADS_COLLECTION, id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Date.now(),
    })
  } catch (error) {
    console.error('Error updating advertisement:', error)
    throw error
  }
}

export async function deleteAdvertisement(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ADS_COLLECTION, id))
  } catch (error) {
    console.error('Error deleting advertisement:', error)
    throw error
  }
}

// ====== Ad Slot CRUD ======

export async function getAllAdSlots(): Promise<AdSlot[]> {
  try {
    const q = query(collection(db, SLOTS_COLLECTION), orderBy('createdAt', 'asc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      docId: doc.id,
    })) as AdSlot[]
  } catch (error) {
    console.error('Error fetching ad slots:', error)
    return []
  }
}

export async function createAdSlot(name: string, description?: string): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, SLOTS_COLLECTION), {
      name,
      description: description || '',
      createdAt: Date.now(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating ad slot:', error)
    return null
  }
}

export async function deleteAdSlot(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, SLOTS_COLLECTION, id))
  } catch (error) {
    console.error('Error deleting ad slot:', error)
    throw error
  }
}
