import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCTw0_CgOnhD9SBiRdU1fezQ-N1Ic6cCBc',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'segun-bangla-newspaper.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'segun-bangla-newspaper',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'segun-bangla-newspaper.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '365261076399',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:365261076399:web:d31c334f73814d2048e15a',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-LVZGLR3K3E',
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
