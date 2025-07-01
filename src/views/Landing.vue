<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center px-4">
    <div class="max-w-4xl mx-auto text-center">
      <!-- メインタイトル -->
      <div class="mb-12">
        <div class="text-6xl sm:text-8xl mb-6">📚✨</div>
        <h1 class="text-3xl sm:text-5xl md:text-6xl font-bold mb-6">
          <span class="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            爆笑昔話ジェネレーター
          </span>
        </h1>
        <p class="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
          あなたの写真が、AIによって<br class="sm:hidden">
          <strong class="text-primary-600">毎回違う爆笑昔話</strong>に大変身！
        </p>
        <p class="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
          写真の位置情報・色味・写ってるものから、まさかのストーリーが誕生。<br>
          桃太郎が現代でウーバーイーツ？シンデレラがYouTuber？<br>
          予想不可能な展開をお楽しみください！
        </p>
      </div>

      <!-- 特徴説明 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div class="card p-6">
          <div class="text-4xl mb-4">🤖</div>
          <h3 class="text-lg font-bold mb-2 text-primary-600">AI自動生成</h3>
          <p class="text-sm text-gray-600">Gemini 2.5 Pro AIが写真を解析して、毎回違うオリジナル昔話を生成</p>
        </div>
        <div class="card p-6">
          <div class="text-4xl mb-4">😂</div>
          <h3 class="text-lg font-bold mb-2 text-accent-600">爆笑必至</h3>
          <p class="text-sm text-gray-600">昔話キャラが現代で大暴走！予想できない展開で笑いが止まらない</p>
        </div>
        <div class="card p-6">
          <div class="text-4xl mb-4">☁️</div>
          <h3 class="text-lg font-bold mb-2 text-primary-600">簡単シェア</h3>
          <p class="text-sm text-gray-600">生成した物語をSNSでシェア！テキストコピーで簡単投稿</p>
        </div>
      </div>

      <!-- ログイン選択 -->
      <div class="max-w-md mx-auto space-y-4">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
          さっそく始めましょう！
        </h2>
        
        <!-- Googleログインボタン -->
        <button 
          @click="handleGoogleLogin"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          <div class="flex items-center justify-center gap-3">
            <span v-if="isLoading">🔄</span>
            <span v-else>🔐</span>
            <span class="text-lg">{{ isLoading ? 'ログイン中...' : 'Googleでログイン' }}</span>
          </div>
          <p class="text-sm opacity-90 mt-1">すぐに始められます</p>
        </button>

        <!-- ゲストログインボタン -->
        <button 
          @click="handleGuestLogin"
          class="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
        >
          <div class="flex items-center justify-center gap-3">
            <span>👤</span>
            <span class="text-lg">ゲストとして使用</span>
          </div>
          <p class="text-sm opacity-90 mt-1">ログインなしですぐに体験</p>
        </button>

        <p class="text-xs text-gray-500 mt-4">
          物語はその場で楽しめます・テキストコピーでシェア可能
        </p>
      </div>

      <!-- デモ画像・動画 -->
      <div class="mt-12 p-6 bg-white rounded-xl shadow-lg">
        <h3 class="text-lg font-bold mb-4 text-gray-800">こんな物語が生成されます</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div class="p-4 bg-purple-50 rounded-lg">
            <h4 class="font-bold text-purple-700 mb-2">📸 猫の写真から...</h4>
            <p class="text-sm text-gray-700">
              「昔々、東京の片隅で、たまという名の猫がYouTubeチャンネルを運営していました。
              チャンネル登録者数100万人を目指して、今日も桃太郎とコラボ企画を...」
            </p>
          </div>
          <div class="p-4 bg-orange-50 rounded-lg">
            <h4 class="font-bold text-orange-700 mb-2">🍕 料理の写真から...</h4>
            <p class="text-sm text-gray-700">
              「むかしむかし、シンデレラがピザ屋で働いていました。
              魔法の代わりにUber Eatsアプリを使って、12時までに配達を...」
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)

// 認証状態を確認して自動リダイレクト
onMounted(async () => {
  await authStore.initAuth()
  if (authStore.isLoggedIn) {
    router.push('/app')
  }
})

// Googleログイン
const handleGoogleLogin = async () => {
  isLoading.value = true
  try {
    await authStore.signInWithGoogle()
    router.push('/app')
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

// ゲストログイン
const handleGuestLogin = () => {
  // ゲストモードを設定（認証なし）
  router.push('/app')
}
</script>

<style scoped>
.card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #e5e7eb;
}
</style>
