import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../utils/firebase'

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: Date
  lastLoginAt: Date
  storyCount: number
  favoriteStories: string[]
}

export const useAuthStore = defineStore('auth', () => {
  // 状態
  const user = ref<FirebaseUser | null>(null)
  const userProfile = ref<UserProfile | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  // 計算されたプロパティ
  const isAuthenticated = computed(() => !!user.value)
  const displayName = computed(() => 
    userProfile.value?.displayName || user.value?.displayName || 'ゲスト'
  )

  // Google認証でログイン
  const loginWithGoogle = async () => {
    try {
      error.value = null
      const provider = new GoogleAuthProvider()
      
      // 追加のスコープを要求（オプション）
      provider.addScope('profile')
      provider.addScope('email')
      
      const result = await signInWithPopup(auth, provider)
      
      // ユーザープロファイルを作成/更新
      await createOrUpdateUserProfile(result.user)
      
      console.log('✅ Google認証成功:', result.user.email)
      
    } catch (err) {
      console.error('❌ Google認証エラー:', err)
      error.value = err instanceof Error ? err.message : 'ログインに失敗しました'
      throw err
    }
  }

  // ログアウト
  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
      userProfile.value = null
      console.log('✅ ログアウト成功')
    } catch (err) {
      console.error('❌ ログアウトエラー:', err)
      error.value = err instanceof Error ? err.message : 'ログアウトに失敗しました'
      throw err
    }
  }

  // ユーザープロファイルの作成/更新
  const createOrUpdateUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid)
      const userSnap = await getDoc(userRef)
      
      const now = new Date()
      
      if (userSnap.exists()) {
        // 既存ユーザーの最終ログイン日時を更新
        const existingData = userSnap.data() as UserProfile
        const updatedProfile: UserProfile = {
          ...existingData,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          lastLoginAt: now
        }
        
        await setDoc(userRef, updatedProfile)
        userProfile.value = updatedProfile
        
      } else {
        // 新規ユーザーの作成
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: now,
          lastLoginAt: now,
          storyCount: 0,
          favoriteStories: []
        }
        
        await setDoc(userRef, newProfile)
        userProfile.value = newProfile
        
        console.log('🎉 新規ユーザー作成:', firebaseUser.email)
      }
      
    } catch (err) {
      console.error('❌ ユーザープロファイル作成エラー:', err)
      throw err
    }
  }

  // ユーザープロファイルの読み込み
  const loadUserProfile = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        userProfile.value = userSnap.data() as UserProfile
      }
    } catch (err) {
      console.error('❌ ユーザープロファイル読み込みエラー:', err)
    }
  }

  // 物語数を増やす
  const incrementStoryCount = async () => {
    if (!userProfile.value) return
    
    try {
      const userRef = doc(db, 'users', userProfile.value.uid)
      const updatedProfile = {
        ...userProfile.value,
        storyCount: userProfile.value.storyCount + 1
      }
      
      await setDoc(userRef, updatedProfile)
      userProfile.value = updatedProfile
      
    } catch (err) {
      console.error('❌ 物語数更新エラー:', err)
    }
  }

  // お気に入りに追加
  const addToFavorites = async (storyId: string) => {
    if (!userProfile.value) return
    
    try {
      const updatedFavorites = [...userProfile.value.favoriteStories]
      if (!updatedFavorites.includes(storyId)) {
        updatedFavorites.push(storyId)
        
        const userRef = doc(db, 'users', userProfile.value.uid)
        const updatedProfile = {
          ...userProfile.value,
          favoriteStories: updatedFavorites
        }
        
        await setDoc(userRef, updatedProfile)
        userProfile.value = updatedProfile
        
        return true
      }
      return false
    } catch (err) {
      console.error('❌ お気に入り追加エラー:', err)
      throw err
    }
  }

  // お気に入りから削除
  const removeFromFavorites = async (storyId: string) => {
    if (!userProfile.value) return
    
    try {
      const updatedFavorites = userProfile.value.favoriteStories.filter(id => id !== storyId)
      
      const userRef = doc(db, 'users', userProfile.value.uid)
      const updatedProfile = {
        ...userProfile.value,
        favoriteStories: updatedFavorites
      }
      
      await setDoc(userRef, updatedProfile)
      userProfile.value = updatedProfile
      
    } catch (err) {
      console.error('❌ お気に入り削除エラー:', err)
      throw err
    }
  }

  // 認証状態の監視を初期化
  const initializeAuth = () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser
      
      if (firebaseUser) {
        await loadUserProfile(firebaseUser.uid)
      } else {
        userProfile.value = null
      }
      
      isLoading.value = false
    })
  }

  return {
    // 状態
    user,
    userProfile,
    isLoading,
    error,
    
    // 計算されたプロパティ
    isAuthenticated,
    displayName,
    
    // アクション
    loginWithGoogle,
    logout,
    incrementStoryCount,
    addToFavorites,
    removeFromFavorites,
    initializeAuth
  }
})
