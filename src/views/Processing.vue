<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto text-center">
      <!-- 進行状況表示 -->
      <div class="mb-8">
        <div class="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
          <span class="text-6xl loading-animation">{{ currentEmoji }}</span>
        </div>
        <h2 class="text-3xl font-bold mb-4 text-gray-800">
          {{ currentStep.title }}
        </h2>
        <p class="text-lg text-gray-600 mb-6">
          {{ currentStep.description }}
        </p>
      </div>

      <!-- プログレスバー -->
      <div class="bg-gray-200 rounded-full h-4 mb-8 overflow-hidden">
        <div 
          class="bg-gradient-to-r from-primary-500 to-accent-500 h-full rounded-full transition-all duration-500 ease-out"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>

      <!-- ステップ表示 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="card text-center p-4"
          :class="{ 
            'bg-primary-100 border-primary-300': index === currentStepIndex,
            'bg-green-100 border-green-300': index < currentStepIndex,
            'bg-gray-50 border-gray-200': index > currentStepIndex
          }"
        >
          <div class="text-2xl mb-2">
            {{ index < currentStepIndex ? '✅' : index === currentStepIndex ? step.emoji : '⏳' }}
          </div>
          <h4 class="font-bold text-sm">{{ step.title }}</h4>
        </div>
      </div>

      <!-- エラー表示 -->
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p class="font-bold">エラーが発生しました</p>
        <p>{{ error }}</p>
        <button @click="retryGeneration" class="btn-primary mt-2">
          再試行
        </button>
      </div>

      <!-- 豆知識 -->
      <div v-if="!error" class="card bg-blue-50 border-blue-200">
        <h4 class="font-bold mb-2 text-blue-800">💡 豆知識</h4>
        <p class="text-sm text-blue-700">
          {{ currentTip }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStoryStore } from '../stores/story'

const router = useRouter()
const storyStore = useStoryStore()

// 処理ステップの定義
const steps = [
  {
    title: '画像解析',
    description: '写真からEXIF情報と色味、写っているものを解析中...',
    emoji: '🔍'
  },
  {
    title: 'トリガー抽出',
    description: '位置情報、天気、撮影日から物語の要素を決定中...',
    emoji: '🎯'
  },
  {
    title: '物語生成',
    description: 'AIが爆笑必至の昔話を創作中...',
    emoji: '✍️'
  },
  {
    title: '音声合成',
    description: '物語を読み上げる音声を生成中...',
    emoji: '🔊'
  }
]

const tips = [
  '位置情報が関西圏だと、キャラクターが関西弁を話すことがあります！',
  '撮影日が祝日だと、その日にちなんだ特別な物語要素が追加されます！',
  '写真の色味が鮮やかだと、より派手でカオスな物語になります！',
  '動物が写っていると、その動物がキャラクターとして登場することがあります！',
  '天気が悪い日に撮った写真だと、ちょっとダークな展開になることも...？',
  'AIは毎回違う物語を生成するので、同じ写真でも結果が変わります！'
]

// リアクティブな状態
const currentTip = ref('')
const error = ref('')
const currentStepIndex = computed(() => storyStore.processingStep - 1)

// 計算されたプロパティ
const currentStep = computed(() => steps[currentStepIndex.value] || steps[0])
const currentEmoji = computed(() => currentStep.value.emoji)
const progress = computed(() => (storyStore.processingStep / steps.length) * 100)

// 豆知識をランダムに表示
const updateTip = () => {
  currentTip.value = tips[Math.floor(Math.random() * tips.length)]
}

// 実際の物語生成処理を開始
const startGeneration = async () => {
  try {
    if (!storyStore.currentFile) {
      error.value = 'ファイルが選択されていません'
      return
    }
    
    // 実際の物語生成処理を実行
    const storyId = await storyStore.generateStory(
      storyStore.currentFile,
      storyStore.userSettings.userName,
      storyStore.userSettings.userComment
    )
    
    // 完了したら結果画面に遷移
    await router.push({ name: 'Result', params: { id: storyId } })
    
  } catch (err) {
    console.error('❌ 物語生成エラー:', err)
    error.value = storyStore.error || '物語の生成中にエラーが発生しました。もう一度お試しください。'
  }
}

const retryGeneration = () => {
  error.value = ''
  storyStore.error = null
  startGeneration()
}

onMounted(() => {
  // 初期の豆知識を設定
  updateTip()
  
  // 処理を開始
  startGeneration()
})
</script>

<style scoped>
.loading-animation {
  animation: bounce 1s infinite alternate;
}
</style>
