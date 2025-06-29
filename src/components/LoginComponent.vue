<template>
  <div class="login-component">
    <!-- ログイン前の表示 -->
    <div v-if="!authStore.isAuthenticated" class="text-center">
      <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6 max-w-md mx-auto">
        <div class="text-2xl sm:text-4xl mb-3 sm:mb-4">🔐</div>
        <h3 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4">ログインして物語を保存</h3>
        <p class="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
          Googleアカウントでログインすると、生成した物語を保存・管理できます
        </p>
        
        <button 
          @click="handleLogin"
          :disabled="isLoading"
          class="btn-primary w-full flex items-center justify-center gap-2 text-sm sm:text-base py-2 sm:py-3"
          :class="{ 'opacity-50': isLoading }"
        >
          <span v-if="isLoading">🔄</span>
          <span v-else>🔐</span>
          {{ isLoading ? 'ログイン中...' : 'Googleでログイン' }}
        </button>
        
        <p class="text-xs text-gray-500 mt-3 sm:mt-4">
          ログインせずに使用することも可能です<span class="hidden sm:inline">（物語はブラウザに一時保存）</span>
        </p>
      </div>
    </div>

    <!-- ログイン後の表示 -->
    <div v-else class="flex items-center gap-2 sm:gap-3">
      <!-- ユーザー情報 -->
      <div class="flex items-center gap-1 sm:gap-2">
        <img 
          v-if="authStore.user?.photoURL"
          :src="authStore.user.photoURL" 
          :alt="authStore.displayName"
          class="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-300"
        >
        <div v-else class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <span class="text-xs sm:text-sm">👤</span>
        </div>
        <span class="font-medium text-xs sm:text-sm hidden sm:inline">{{ authStore.displayName }}</span>
      </div>
      
      <!-- 統計情報（オプション） -->
      <div v-if="showStats" class="hidden lg:flex items-center gap-4 text-xs text-gray-600">
        <span>📚 {{ stats.totalStories }}話</span>
        <span>❤️ {{ stats.favoriteStories }}個</span>
      </div>
      
      <!-- ログアウトボタン -->
      <button 
        @click="handleLogout"
        class="btn-secondary text-xs px-2 sm:px-3 py-1"
      >
        <span class="hidden sm:inline">ログアウト</span>
        <span class="sm:hidden">🚪</span>
      </button>
    </div>

    <!-- エラー表示 -->
    <div v-if="authStore.error" class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
      {{ authStore.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUserStoryStore } from '../stores/userStory'

const { showStats } = defineProps<{
  showStats?: boolean
}>()

const authStore = useAuthStore()
const userStoryStore = useUserStoryStore()

const isLoading = ref(false)

// 統計情報
const stats = computed(() => userStoryStore.getStats())

// ログイン処理
const handleLogin = async () => {
  try {
    isLoading.value = true
    await authStore.loginWithGoogle()
    
    // ログイン成功後にユーザーの物語を読み込み
    await userStoryStore.loadUserStories()
    
  } catch (error) {
    console.error('ログインエラー:', error)
  } finally {
    isLoading.value = false
  }
}

// ログアウト処理
const handleLogout = async () => {
  try {
    await authStore.logout()
    
    // ログアウト後にローカルデータをクリア
    userStoryStore.userStories = []
    
  } catch (error) {
    console.error('ログアウトエラー:', error)
  }
}

onMounted(() => {
  // 認証状態の監視を開始
  authStore.initializeAuth()
})
</script>
