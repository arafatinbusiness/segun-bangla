import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

export interface AuthCredentials {
  email: string
  password: string
  displayName?: string
}

export interface AuthError {
  code: string
  message: string
}

export async function registerUser(credentials: AuthCredentials): Promise<{ uid: string } | null> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password)
    
    if (credentials.displayName && userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: credentials.displayName,
      })
    }
    
    return {
      uid: userCredential.user.uid,
    }
  } catch (error: any) {
    console.error('[v0] Registration error:', error)
    throw mapAuthError(error)
  }
}

export async function loginUser(email: string, password: string): Promise<{ uid: string; email: string } | null> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email || '',
    }
  } catch (error: any) {
    console.error('[v0] Login error:', error)
    throw mapAuthError(error)
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error: any) {
    console.error('[v0] Logout error:', error)
    throw mapAuthError(error)
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error: any) {
    console.error('[v0] Password reset error:', error)
    throw mapAuthError(error)
  }
}

export function getCurrentUser() {
  return auth.currentUser
}

function mapAuthError(error: any): AuthError {
  const errorCode = error.code || 'unknown_error'
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'এই ইমেইল ইতিমধ্যে নিবন্ধিত',
    'auth/invalid-email': 'অবৈধ ইমেইল ঠিকানা',
    'auth/weak-password': 'পাসওয়ার্ড কমপক্ষে 6 অক্ষরের হতে হবে',
    'auth/user-not-found': 'ব্যবহারকারী পাওয়া যায়নি',
    'auth/wrong-password': 'ভুল পাসওয়ার্ড',
    'auth/operation-not-allowed': 'অপারেশন অনুমোদিত নয়',
    'auth/configuration-not-found': 'Firebase Authentication সক্রিয় করা হয়নি। Firebase Console-এ গিয়ে Authentication সক্রিয় করুন।',
    'auth/invalid-credential': 'ভুল ইমেইল বা পাসওয়ার্ড। অথবা ব্যবহারকারী বিদ্যমান নেই।',
  }

  return {
    code: errorCode,
    message: errorMessages[errorCode] || 'একটি ত্রুটি ঘটেছে',
  }
}
