<template>
  <div class="container mx-auto px-3 py-4 sm:px-4 sm:py-8">
    <!-- ヒーローセクション -->
    <div class="text-center mb-8 sm:mb-12">
      <h2 class="text-2xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-4">
        <span class="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          写真から生まれる
        </span>
      </h2>
      <h3 class="text-xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-800">
        爆笑必至の昔話✨
      </h3>
      <p class="text-sm sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
        あなたの写真を送るだけで、AIが毎回違う超カオスな昔話を自動生成！<br class="hidden sm:block">
        <span class="sm:hidden">位置情報・色味・写ってるものから、まさかのストーリーが誕生します。</span>
        <span class="hidden sm:inline">位置情報・色味・写ってるものから、まさかのストーリーが誕生します。</span>
      </p>
    </div>

    <!-- アップロードエリア -->
    <div class="max-w-2xl mx-auto mb-8 sm:mb-12">
      <div 
        class="card border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors duration-300 text-center p-4 sm:p-8 cursor-pointer"
        :class="{ 'border-primary-500 bg-primary-50': isDragging }"
        @dragover.prevent
        @dragenter.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="fileInput?.click()"
      >
        <div class="mb-3 sm:mb-4">
          <span class="text-4xl sm:text-6xl">📸</span>
        </div>
        <h4 class="text-lg sm:text-xl font-bold mb-2 text-gray-800">
          <span class="hidden sm:inline">写真をドラッグ&ドロップ または クリックして選択</span>
          <span class="sm:hidden">写真を選択してください</span>
        </h4>
        <p class="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
          JPG, PNG, HEIC対応<span class="hidden sm:inline"> / 最大10MB</span>
        </p>
        <button class="btn-primary text-sm sm:text-base">
          📁 ファイルを選択
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          class="hidden"
        >
      </div>
    </div>

    <!-- オプション設定 -->
    <div class="max-w-2xl mx-auto mb-6 sm:mb-8">
      <div class="card">
        <h4 class="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-800">オプション設定</h4>
        <div class="space-y-4 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4 sm:space-y-0">
          <div>
            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              あなたのお名前（主人公になります）
            </label>
            <input
              v-model="userName"
              type="text"
              placeholder="例: 太郎"
              class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
          </div>
          <div>
            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              一言メッセージ（物語に反映されます）
            </label>
            <input
              v-model="userComment"
              type="text"
              placeholder="例: 今日は良い天気！"
              class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 生成ボタン -->
    <div class="text-center mb-8 sm:mb-12">
      <button 
        @click="generateStory"
        :disabled="!selectedFile || isGenerating"
        class="btn-primary text-base sm:text-xl px-6 sm:px-8 py-3 sm:py-4 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
      >
        <span v-if="isGenerating">
          🔄 物語を生成中...
        </span>
        <span v-else>
          ✨ 爆笑昔話を生成する
        </span>
      </button>
    </div>

    <!-- 使い方説明 -->
    <div class="max-w-4xl mx-auto">
      <h4 class="text-lg sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-gray-800">🎯 どんな昔話が生まれる？</h4>
      <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div class="card text-center p-3 sm:p-4">
          <div class="text-2xl sm:text-3xl mb-2 sm:mb-3">🌍</div>
          <h5 class="font-bold mb-1 sm:mb-2 text-primary-600 text-xs sm:text-sm">もしも昔話</h5>
          <p class="text-xs sm:text-sm text-gray-600">もし桃太郎が現代にいたら...？<span class="hidden sm:inline">パラレルワールドの物語</span></p>
        </div>
        <div class="card text-center p-3 sm:p-4">
          <div class="text-2xl sm:text-3xl mb-2 sm:mb-3">🔄</div>
          <h5 class="font-bold mb-1 sm:mb-2 text-accent-600 text-xs sm:text-sm">昔話合体</h5>
          <p class="text-xs sm:text-sm text-gray-600">浦島太郎×シンデレラ！？<span class="hidden sm:inline">異なる物語が融合</span></p>
        </div>
        <div class="card text-center p-3 sm:p-4">
          <div class="text-2xl sm:text-3xl mb-2 sm:mb-3">😂</div>
          <h5 class="font-bold mb-1 sm:mb-2 text-primary-600 text-xs sm:text-sm">キャラ崩壊</h5>
          <p class="text-xs sm:text-sm text-gray-600">鬼ヶ島でウーバーイーツ！？<span class="hidden sm:inline">キャラが大暴走</span></p>
        </div>
        <div class="card text-center p-3 sm:p-4">
          <div class="text-2xl sm:text-3xl mb-2 sm:mb-3">👶</div>
          <h5 class="font-bold mb-1 sm:mb-2 text-accent-600 text-xs sm:text-sm">子ども風</h5>
          <p class="text-xs sm:text-sm text-gray-600">ぶっ飛んだ発想で大人も爆笑<span class="hidden sm:inline">のストーリー</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStoryStore } from '../stores/story'

const router = useRouter()
const storyStore = useStoryStore()

// リアクティブな状態
const selectedFile = ref<File | null>(null)
const userName = ref('')
const userComment = ref('')
const isDragging = ref(false)
const isGenerating = ref(false)

// ファイル選択関連
const fileInput = ref<HTMLInputElement>()

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    selectedFile.value = event.dataTransfer.files[0]
  }
}

const generateStory = async () => {
  if (!selectedFile.value) return
  
  isGenerating.value = true
  
  try {
    // ファイルをストアに保存
    storyStore.setCurrentFile(selectedFile.value)
    storyStore.setUserSettings({
      userName: userName.value,
      userComment: userComment.value
    })
    
    // 処理画面に遷移
    router.push({ name: 'Processing' })
  } catch (error) {
    console.error('Error starting story generation:', error)
    isGenerating.value = false
  }
}
</script>
