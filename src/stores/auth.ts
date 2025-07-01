import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider,
  type User 
} from 'firebase/auth'
import { auth } from '@/utils/firebase'

export const useAuthStore = defineStore('auth', () => {
  // 状態
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // 計算プロパティ
  const isLoggedIn = computed(() => user.value !== null)
  const userName = computed(() => user.value?.displayName || 'ゲスト')
  const userEmail = computed(() => user.value?.email || '')
  const userPhoto = computed(() => user.value?.photoURL || '')
  const userId = computed(() => user.value?.uid || '')

  // 認証状態の初期化
  const initAuth = () => {
    return new Promise<void>((resolve) => {
      onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser
        if (!isInitialized.value) {
          isInitialized.value = true
          resolve()
        }
      })
    })
  }

  // Googleログイン
  const signInWithGoogle = async () => {
    console.log('Googleログイン開始...')
    try {
      isLoading.value = true
      const provider = new GoogleAuthProvider()
      
      // 追加スコープを明示的に設定
      provider.addScope('email')
      provider.addScope('profile')
      
      // カスタムパラメータを設定してCORSエラーを軽減
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      console.log('認証ポップアップを開いています...')
      const result = await signInWithPopup(auth, provider)
      user.value = result.user
      console.log('ログイン成功:', {
        displayName: result.user.displayName,
        email: result.user.email,
        uid: result.user.uid
      })
    } catch (error: any) {
      console.error('ログインエラー詳細:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // ログアウト
  const logout = async () => {
    try {
      isLoading.value = true
      await signOut(auth)
      user.value = null
      console.log('ログアウト成功')
    } catch (error) {
      console.error('ログアウトエラー:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状態
    user,
    isLoading,
    isInitialized,
    
    // 計算プロパティ
    isLoggedIn,
    userName,
    userEmail,
    userPhoto,
    userId,
    
    // アクション
    initAuth,
    signInWithGoogle,
    logout
  }
})
