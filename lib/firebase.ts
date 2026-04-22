import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAHRITS5jkpb__sa3VSz0N_uMI109F0Wxg',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'segun-bangla.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'segun-bangla',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'segun-bangla.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '256398946324',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:256398946324:web:b5f366b69f8bb8ebc73701',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-YRLG743G5K',
}

let app: any = null
let db: any = null
let auth: any = null
let storage: any = null

try {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)
  storage = getStorage(app)

  // Optional: Connect to emulator in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099')
      } catch (e) {
        // Already connected
      }
      try {
        connectFirestoreEmulator(db, 'localhost', 8080)
      } catch (e) {
        // Already connected
      }
      try {
        connectStorageEmulator(storage, 'localhost', 9199)
      } catch (e) {
        // Already connected
      }
    }
  }
} catch (error) {
  console.warn('[v0] Firebase initialization failed - using demo mode for build')
}

export { app, db, auth, storage }
