<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- ヘッダー -->
      <div class="text-center mb-8">
        <h1 class="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          📖 あなたの物語履歴
        </h1>
        <p class="text-gray-600">
          これまでに生成された爆笑昔話の一覧です
        </p>
      </div>

      <!-- 履歴がない場合 -->
      <div v-if="stories.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📚</div>
        <h3 class="text-xl font-bold mb-4 text-gray-800">まだ物語がありません</h3>
        <p class="text-gray-600 mb-6">
          写真をアップロードして、最初の爆笑昔話を生成してみましょう！
        </p>
        <router-link to="/" class="btn-primary">
          🏠 ホームに戻る
        </router-link>
      </div>

      <!-- 履歴一覧 -->
      <div v-else class="space-y-6">
        <!-- ソート・フィルター -->
        <div class="card flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-4">
            <label class="text-sm font-medium text-gray-700">並び順:</label>
            <select 
              v-model="sortBy" 
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="date">日付順</option>
              <option value="title">タイトル順</option>
            </select>
          </div>
          
          <div class="flex items-center gap-4">
            <button 
              @click="clearHistory"
              class="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              🗑️ 履歴をクリア
            </button>
          </div>
        </div>

        <!-- 物語カード一覧 -->
        <div class="grid gap-6">
          <div 
            v-for="story in sortedStories" 
            :key="story.id"
            class="card hover:shadow-xl transition-shadow duration-200 cursor-pointer"
            @click="viewStory(story.id)"
          >
            <div class="flex flex-col md:flex-row gap-4">
              <!-- 物語情報 -->
              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <span 
                    v-for="mode in [story.modes.modeA, story.modes.modeB]" 
                    :key="mode"
                    class="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium"
                  >
                    {{ getModeLabel(mode) }}
                  </span>
                </div>
                
                <h3 class="text-xl font-bold mb-2 text-gray-800 line-clamp-2">
                  {{ story.title }}
                </h3>
                
                <p class="text-gray-600 text-sm mb-3 line-clamp-3">
                  {{ story.summary }}
                </p>
                
                <div class="flex items-center gap-4 text-xs text-gray-500">
                  <span>📅 {{ formatDate(story.createdAt) }}</span>
                  <span v-if="story.triggerInfo.location">
                    📍 {{ story.triggerInfo.location.region }}
                  </span>
                  <span v-if="story.audioUrl">🔊 音声あり</span>
                </div>
              </div>
              
              <!-- アクション -->
              <div class="flex md:flex-col gap-2 md:w-32">
                <button 
                  @click.stop="viewStory(story.id)"
                  class="btn-primary text-sm px-4 py-2 flex-1 md:flex-none"
                >
                  👁️ 表示
                </button>
                <button 
                  @click.stop="shareStory(story)"
                  class="btn-secondary text-sm px-4 py-2 flex-1 md:flex-none"
                >
                  📱 シェア
                </button>
                <button 
                  @click.stop="deleteStory(story.id)"
                  class="text-red-600 hover:text-red-800 text-sm px-2 py-2"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { GeneratedStory, StoryMode } from '../types'

const router = useRouter()

// リアクティブな状態
const stories = ref<GeneratedStory[]>([])
const sortBy = ref<'date' | 'title'>('date')

// 計算されたプロパティ
const sortedStories = computed(() => {
  const sorted = [...stories.value]
  
  if (sortBy.value === 'date') {
    return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } else {
    return sorted.sort((a, b) => a.title.localeCompare(b.title))
  }
})

// モードのラベルを取得
const getModeLabel = (mode: StoryMode): string => {
  const labels = {
    'parallel': 'もしも昔話',
    'fusion': '昔話合体',
    'character-collapse': 'キャラ崩壊',
    'childlike': '子ども風'
  }
  return labels[mode] || mode
}

// 日付をフォーマット
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// サンプルデータを生成
const generateSampleStories = (): GeneratedStory[] => {
  const sampleStories = [
    {
      id: 'story_1',
      title: '令和の桃太郎とインスタ映えする鬼退治',
      content: '詳細な物語内容...',
      summary: '令和版桃太郎がインスタ映えを求めて鬼ヶ島へ。鬼とコラボしてバズってしまう現代風昔話。',
      modes: { modeA: 'parallel' as StoryMode, modeB: 'character-collapse' as StoryMode, reason: '現代的要素とキャラ崩壊' },
      triggerInfo: {
        location: { latitude: 35.6762, longitude: 139.6503, country: '日本', region: '東京都' },
        datetime: { date: '2025年6月28日', time: '14:30' }
      },
      audioUrl: '/audio/story1.mp3',
      createdAt: new Date('2025-06-28T14:30:00')
    },
    {
      id: 'story_2',
      title: 'シンデレラと浦島太郎の異世界転生ラブコメ',
      content: '詳細な物語内容...',
      summary: 'シンデレラが竜宮城に転生！浦島太郎との異世界ラブコメが展開する合体昔話。',
      modes: { modeA: 'fusion' as StoryMode, modeB: 'childlike' as StoryMode, reason: '物語合体と子ども風発想' },
      triggerInfo: {
        location: { latitude: 34.6937, longitude: 135.5023, country: '日本', region: '大阪府' },
        datetime: { date: '2025年6月27日', time: '10:15' }
      },
      audioUrl: '/audio/story2.mp3',
      createdAt: new Date('2025-06-27T10:15:00')
    },
    {
      id: 'story_3',
      title: 'かぐや姫のYouTuber活動記録',
      content: '詳細な物語内容...',
      summary: '月の世界からやってきたかぐや姫が現代でYouTuberデビュー。登録者数1000万人突破の物語。',
      modes: { modeA: 'parallel' as StoryMode, modeB: 'character-collapse' as StoryMode, reason: '現代パラレルとキャラ崩壊' },
      triggerInfo: {
        location: { latitude: 35.0116, longitude: 135.7681, country: '日本', region: '京都府' },
        datetime: { date: '2025年6月26日', time: '20:45' }
      },
      createdAt: new Date('2025-06-26T20:45:00')
    }
  ]
  
  return sampleStories
}

// 物語を表示
const viewStory = (storyId: string) => {
  router.push({ name: 'Result', params: { id: storyId } })
}

// 物語をシェア
const shareStory = async (story: GeneratedStory) => {
  const url = `${window.location.origin}/result/${story.id}`
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: story.title,
        text: story.summary,
        url: url
      })
    } catch (error) {
      navigator.clipboard.writeText(url)
      alert('リンクをクリップボードにコピーしました！')
    }
  } else {
    navigator.clipboard.writeText(url)
    alert('リンクをクリップボードにコピーしました！')
  }
}

// 物語を削除
const deleteStory = (storyId: string) => {
  if (confirm('この物語を削除しますか？')) {
    stories.value = stories.value.filter(story => story.id !== storyId)
    localStorage.setItem('savedStories', JSON.stringify(stories.value))
  }
}

// 履歴をクリア
const clearHistory = () => {
  if (confirm('すべての履歴を削除しますか？この操作は取り消せません。')) {
    stories.value = []
    localStorage.removeItem('savedStories')
  }
}

// ローカルストレージから履歴を読み込み
const loadStories = () => {
  try {
    const saved = localStorage.getItem('savedStories')
    if (saved) {
      stories.value = JSON.parse(saved)
    } else {
      // サンプルデータを使用
      stories.value = generateSampleStories()
      localStorage.setItem('savedStories', JSON.stringify(stories.value))
    }
  } catch (error) {
    console.error('Failed to load stories:', error)
    stories.value = generateSampleStories()
  }
}

onMounted(() => {
  loadStories()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
