<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">
    <!-- エラー表示 -->
    <div v-if="hasError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
      <h3 class="font-bold">エラーが発生しました</h3>
      <p>{{ errorMessage }}</p>
      <button @click="clearError" class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
        閉じる
      </button>
    </div>

    <!-- ヘッダー（ランディングページ以外で表示） -->
    <header v-if="$route.name !== 'Landing'" class="bg-white shadow-lg border-b-4 border-gradient-to-r from-primary-500 to-accent-500">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div class="flex items-center justify-between h-12 sm:h-16">
          <router-link to="/app" class="flex items-center space-x-1 sm:space-x-2">
            <span class="text-lg sm:text-2xl">📚</span>
            <h1 class="text-sm sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              爆笑昔話ジェネレーター
            </h1>
          </router-link>
          
          <!-- ナビゲーション -->
          <nav class="flex space-x-2 sm:space-x-4">
            <router-link 
              to="/app" 
              class="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium text-xs sm:text-sm"
              :class="{ 'text-primary-600 font-bold': $route.path === '/app' }"
            >
              作成
            </router-link>
            <router-link 
              to="/history" 
              class="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium text-xs sm:text-sm"
              :class="{ 'text-primary-600 font-bold': $route.path === '/history' }"
            >
              履歴
            </router-link>
          </nav>
          
          <!-- ユーザー情報 & ログアウト -->
          <div class="ml-2 sm:ml-4">
            <div v-if="authStore.isAuthenticated" class="flex items-center gap-1 sm:gap-2">
              <img 
                v-if="authStore.user?.photoURL"
                :src="authStore.user.photoURL" 
                :alt="authStore.displayName"
                class="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-300"
              >
              <div v-else class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span class="text-xs sm:text-sm">👤</span>
              </div>
              <button 
                @click="handleLogout"
                class="btn-secondary text-xs px-2 py-1"
              >
                <span class="hidden sm:inline">ログアウト</span>
                <span class="sm:hidden">🚪</span>
              </button>
            </div>
            <div v-else class="text-xs sm:text-sm text-gray-600">
              ゲストモード
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <main class="flex-1">
      <Suspense>
        <router-view />
        <template #fallback>
          <div class="flex items-center justify-center min-h-64">
            <div class="text-center">
              <div class="text-4xl mb-4">🔄</div>
              <div class="text-lg text-gray-600">読み込み中...</div>
            </div>
          </div>
        </template>
      </Suspense>
    </main>

    <!-- フッター -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <p class="text-gray-600 text-sm">
            © 2025 爆笑昔話ジェネレーター
          </p>
          <p class="text-gray-500 text-xs mt-2">
            Powered by Gemini 2.5 Pro
          </p>
          <p class="text-gray-400 text-xs mt-1">
            Created by YUKI KONDO
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

// ルーター
const router = useRouter()

// 認証ストア
const authStore = useAuthStore()

// エラーハンドリング
const hasError = ref(false)
const errorMessage = ref('')

// ログアウト処理
const handleLogout = async () => {
  try {
    await authStore.logout()
    // ランディングページに戻る
    if (router.currentRoute.value.name !== 'Landing') {
      router.push('/')
    }
  } catch (error) {
    console.error('Logout error:', error)
    hasError.value = true
    errorMessage.value = 'ログアウトに失敗しました'
  }
}

// グローバルエラーハンドラー
onErrorCaptured((error, _instance, info) => {
  console.error('App level error:', error)
  console.error('Error info:', info)
  
  hasError.value = true
  errorMessage.value = error instanceof Error ? error.message : '予期しないエラーが発生しました'
  
  return false // エラーの伝播を停止
})

// エラーを閉じる
const clearError = () => {
  hasError.value = false
  errorMessage.value = ''
}

// 未処理の例外を捕捉
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error)
    hasError.value = true
    errorMessage.value = event.error?.message || 'JavaScriptエラーが発生しました'
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    hasError.value = true
    errorMessage.value = event.reason?.message || 'Promise拒否エラーが発生しました'
  })
}
</script>

<style scoped>
.router-link-active {
  color: #7c3aed;
  font-weight: bold;
}
</style>
