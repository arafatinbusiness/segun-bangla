import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  role: 'user' | 'author' | 'admin'
  createdAt: number
  lastLogin?: number
  photoURL?: string
}

const USERS_COLLECTION = 'users'

export async function createUserProfile(uid: string, email: string, displayName?: string): Promise<UserProfile> {
  const now = Date.now()
  const userProfile: UserProfile = {
    uid,
    email,
    displayName: displayName || email.split('@')[0],
    role: 'user',
    createdAt: now,
    lastLogin: now,
  }

  try {
    await setDoc(doc(db, USERS_COLLECTION, uid), userProfile)
    return userProfile
  } catch (error) {
    console.error('[v0] Error creating user profile:', error)
    throw error
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error('[v0] Error fetching user profile:', error)
    return null
  }
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), {
      ...updates,
      lastLogin: Date.now(),
    })
  } catch (error) {
    console.error('[v0] Error updating user profile:', error)
    throw error
  }
}

export async function updateUserLastLogin(uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), {
      lastLogin: Date.now(),
    })
  } catch (error) {
    console.error('[v0] Error updating last login:', error)
    // Don't throw - lastLogin is not critical, only log the error
  }
}

export async function setAdminRole(uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), {
      role: 'admin',
    })
  } catch (error) {
    console.error('[v0] Error setting admin role:', error)
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  try {
    const q = query(collection(db, USERS_COLLECTION), where('email', '==', email))
    const snapshot = await getDocs(q)
    if (snapshot.empty) {
      return null
    }
    return snapshot.docs[0].data() as UserProfile
  } catch (error) {
    console.error('[v0] Error fetching user by email:', error)
    return null
  }
}
