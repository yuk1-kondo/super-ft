import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore'
import { db } from '../utils/firebase'
import type { GeneratedStory } from '../types'
import { useAuthStore } from './auth'

export const useUserStoryStore = defineStore('userStory', () => {
  const authStore = useAuthStore()
  
  // 状態
  const userStories = ref<GeneratedStory[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ユーザーの物語を保存
  const saveStoryToFirestore = async (story: GeneratedStory): Promise<string> => {
    if (!authStore.isAuthenticated || !authStore.user) {
      throw new Error('ログインが必要です')
    }

    try {
      isLoading.value = true
      error.value = null

      // ユーザーIDを追加して保存
      const storyData = {
        ...story,
        userId: authStore.user.uid,
        createdAt: new Date()
      }

      const docRef = await addDoc(collection(db, 'stories'), storyData)
      
      // ローカルの配列にも追加
      userStories.value.unshift({ ...storyData, id: docRef.id })
      
      // ユーザープロファイルの物語数を増やす
      await authStore.incrementStoryCount()
      
      console.log('✅ 物語をFirestoreに保存完了:', docRef.id)
      return docRef.id

    } catch (err) {
      console.error('❌ 物語保存エラー:', err)
      error.value = err instanceof Error ? err.message : '物語の保存に失敗しました'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ユーザーの物語一覧を取得
  const loadUserStories = async () => {
    if (!authStore.isAuthenticated || !authStore.user) {
      userStories.value = []
      return
    }

    try {
      isLoading.value = true
      error.value = null

      const q = query(
        collection(db, 'stories'),
        where('userId', '==', authStore.user.uid),
        orderBy('createdAt', 'desc'),
        limit(50) // 最新50件まで
      )

      const querySnapshot = await getDocs(q)
      const stories: GeneratedStory[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        stories.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as GeneratedStory)
      })

      userStories.value = stories
      console.log('✅ ユーザー物語を読み込み完了:', stories.length, '件')

    } catch (err) {
      console.error('❌ 物語読み込みエラー:', err)
      error.value = err instanceof Error ? err.message : '物語の読み込みに失敗しました'
    } finally {
      isLoading.value = false
    }
  }

  // 物語を削除
  const deleteStory = async (storyId: string) => {
    if (!authStore.isAuthenticated) {
      throw new Error('ログインが必要です')
    }

    try {
      await deleteDoc(doc(db, 'stories', storyId))
      
      // ローカルの配列からも削除
      userStories.value = userStories.value.filter(story => story.id !== storyId)
      
      console.log('✅ 物語を削除完了:', storyId)

    } catch (err) {
      console.error('❌ 物語削除エラー:', err)
      error.value = err instanceof Error ? err.message : '物語の削除に失敗しました'
      throw err
    }
  }

  // 特定の物語を取得
  const getStory = (storyId: string): GeneratedStory | undefined => {
    return userStories.value.find(story => story.id === storyId)
  }

  // お気に入りの物語一覧を取得
  const getFavoriteStories = async (): Promise<GeneratedStory[]> => {
    if (!authStore.userProfile?.favoriteStories.length) {
      return []
    }

    try {
      const favoriteIds = authStore.userProfile.favoriteStories
      const favorites: GeneratedStory[] = []

      // 複数のドキュメントを取得（バッチ処理）
      for (const id of favoriteIds) {
        const story = userStories.value.find(s => s.id === id)
        if (story) {
          favorites.push(story)
        }
      }

      return favorites.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    } catch (err) {
      console.error('❌ お気に入り物語取得エラー:', err)
      return []
    }
  }

  // 統計情報を取得
  const getStats = () => {
    const total = userStories.value.length
    const thisMonth = userStories.value.filter(story => {
      const storyDate = story.createdAt
      const now = new Date()
      return storyDate.getMonth() === now.getMonth() && 
             storyDate.getFullYear() === now.getFullYear()
    }).length

    const favoriteCount = authStore.userProfile?.favoriteStories.length || 0

    return {
      totalStories: total,
      thisMonthStories: thisMonth,
      favoriteStories: favoriteCount
    }
  }

  return {
    // 状態
    userStories,
    isLoading,
    error,
    
    // アクション
    saveStoryToFirestore,
    loadUserStories,
    deleteStory,
    getStory,
    getFavoriteStories,
    getStats
  }
})
