// Firebase設定ファイル
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'
import { getFirestore } from 'firebase/firestore'

// Firebase設定（環境変数から読み込み）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig)

// サービスを初期化
export const auth = getAuth(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)
export const db = getFirestore(app)

export default app
