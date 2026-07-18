import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { getAuth, signInAnonymously, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

let app: FirebaseApp | undefined
let db: Firestore | undefined
let storage: FirebaseStorage | undefined
let auth: Auth | undefined

const hasFirebaseKeys = firebaseConfig.apiKey && firebaseConfig.projectId

if (typeof window !== 'undefined' && !getApps().length && hasFirebaseKeys) {
  try {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    storage = getStorage(app)
    console.log('Firebase initialized successfully')
  } catch (e) {
    console.error('Firebase init failed:', e)
  }
  try {
    auth = getAuth(app!)
    signInAnonymously(auth)
  } catch (e) {
    console.log('Anonymous auth not available (expected if not enabled in Firebase Console)')
  }
} else if (typeof window !== 'undefined' && !hasFirebaseKeys) {
  console.warn('Firebase keys not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.')
}

export { app, db, storage, auth }
