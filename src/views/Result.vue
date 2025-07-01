<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- 戻るボタン -->
      <div class="mb-6">
        <button 
          @click="$router.push('/app')" 
          class="btn-secondary"
        >
          ← 新しい物語を生成
        </button>
      </div>

      <!-- 物語カード -->
      <div v-if="story" class="story-card mb-8">
        <!-- タイトル -->
        <div class="text-center mb-6">
          <h1 class="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            {{ story.title }}
          </h1>
          <div class="flex flex-wrap justify-center gap-2 mb-4">
            <span 
              v-for="mode in [story.modes?.modeA, story.modes?.modeB].filter(Boolean)" 
              :key="mode"
              class="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
            >
              {{ getModeLabel(mode) }}
            </span>
          </div>
        </div>

        <!-- 物語本文 -->
        <div class="prose prose-lg max-w-none mb-6">
          <div class="whitespace-pre-line text-gray-800 leading-relaxed">
            {{ story.content }}
          </div>
        </div>

        <!-- 要約 -->
        <div class="bg-accent-50 rounded-xl p-4 mb-6">
          <h3 class="font-bold text-accent-800 mb-2">📝 3行要約</h3>
          <p class="text-accent-700 text-sm">{{ story.summary }}</p>
        </div>
      </div>

      <!-- ローディング表示 -->
      <div v-else-if="!isLoaded" class="text-center py-12">
        <div class="text-6xl mb-4">🔄</div>
        <h2 class="text-2xl font-bold text-gray-600">物語を読み込み中...</h2>
        <p class="text-gray-500 mt-2">少々お待ちください</p>
      </div>

      <!-- エラー表示 -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">😅</div>
        <h2 class="text-2xl font-bold text-gray-600 mb-4">物語が見つかりません</h2>
        <p class="text-gray-500 mb-6">生成した物語を読み込めませんでした。サンプル物語を表示しています。</p>
        <button @click="$router.push('/app')" class="btn-primary">
          新しい物語を生成する
        </button>
      </div>

      <!-- 操作パネル -->
      <div v-if="story" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <!-- 音声再生 -->
        <div class="card text-center">
          <div class="text-3xl mb-3">🔊</div>
          <h3 class="font-bold mb-2">朗読を聞く</h3>
          <button 
            @click="toggleSpeech"
            :disabled="isSpeechLoading"
            class="btn-primary w-full"
            :class="{ 'opacity-50': isSpeechLoading }"
          >
            <span v-if="isSpeechLoading">🔄 準備中...</span>
            <span v-else-if="isSpeaking">⏸️ 停止</span>
            <span v-else">▶️ 再生</span>
          </button>
          <p v-if="!speechSupported" class="text-xs text-red-500 mt-2">
            お使いのブラウザでは音声機能がサポートされていません
          </p>
        </div>

        <!-- 物語をコピー -->
        <div class="card text-center">
          <div class="text-3xl mb-3">�</div>
          <h3 class="font-bold mb-2">物語をコピー</h3>
          <button @click="copyStoryText" class="btn-secondary w-full">
            {{ copyButtonText }}
          </button>
          <p class="text-xs text-gray-500 mt-2">
            物語のテキストをコピーしてSNSなどでシェアできます
          </p>
        </div>
      </div>

      <!-- トリガー情報表示 -->
      <div v-if="story" class="card">
        <h3 class="text-xl font-bold mb-4 text-gray-800">📊 この物語が生まれた理由</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-if="story.triggerInfo?.location" class="text-center">
            <div class="text-2xl mb-2">📍</div>
            <h4 class="font-bold text-sm mb-1">撮影地</h4>
            <p class="text-xs text-gray-600">{{ story.triggerInfo.location.region }}</p>
          </div>
          <div v-if="story.triggerInfo?.datetime" class="text-center">
            <div class="text-2xl mb-2">📅</div>
            <h4 class="font-bold text-sm mb-1">撮影日時</h4>
            <p class="text-xs text-gray-600">{{ story.triggerInfo.datetime.date }}</p>
          </div>
          <div v-if="story.triggerInfo?.colors?.dominant && story.triggerInfo.colors.dominant.length > 0" class="text-center">
            <div class="text-2xl mb-2">🎨</div>
            <h4 class="font-bold text-sm mb-1">主要色</h4>
            <div class="flex justify-center gap-1 mt-1">
              <div 
                v-for="color in story.triggerInfo.colors.dominant.slice(0, 3)" 
                :key="color"
                class="w-4 h-4 rounded-full border border-gray-300"
                :style="{ backgroundColor: color }"
              ></div>
            </div>
          </div>
          <div v-if="story.triggerInfo?.objects && story.triggerInfo.objects.length > 0" class="text-center">
            <div class="text-2xl mb-2">👁️</div>
            <h4 class="font-bold text-sm mb-1">検出物体</h4>
            <p class="text-xs text-gray-600">{{ story.triggerInfo.objects.slice(0, 2).join(', ') }}</p>
          </div>
        </div>
      </div>

      <!-- フィードバック -->
      <div class="card mt-8 text-center">
        <h3 class="text-xl font-bold mb-4">この物語はいかがでしたか？</h3>
        <div class="flex justify-center gap-4">
          <button 
            @click="submitFeedback('love')"
            class="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
          >
            ❤️ 最高！
          </button>
          <button 
            @click="submitFeedback('like')"
            class="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors"
          >
            😊 良い
          </button>
          <button 
            @click="submitFeedback('meh')"
            class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            😐 普通
          </button>
        </div>
      </div>

      <!-- Toast通知 -->
      <div 
        v-if="toastMessage" 
        class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300"
      >
        {{ toastMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStoryStore } from '../stores/story'
import { speechService } from '../utils/speech'
import type { GeneratedStory, StoryMode } from '../types'

const route = useRoute()
const storyStore = useStoryStore()

const props = defineProps<{
  id: string
}>()

// リアクティブな状態
const story = ref<GeneratedStory | null>(null)
const isLoaded = ref(false)
const isSpeaking = ref(false)
const isSpeechLoading = ref(false)
const speechSupported = ref(speechService.isAvailable())
const copyButtonText = ref('📋 物語をコピー')
const toastMessage = ref('')

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

// サンプル物語データを生成
const generateSampleStory = (): GeneratedStory => {
  const sampleStories = [
    {
      title: '令和の桃太郎とインスタ映えする鬼退治',
      content: `昔々、ある村にスマホを片手に持った桃太郎がいました。

「おばあさん、今日も鬼ヶ島に行ってインスタのフォロワーを増やすんだ！」
桃太郎はきびだんごの代わりに、話題のタピオカドリンクを持って出発しました。

道中で出会った犬は、「ワンワン！そのタピオカ、映え度が高いですね！一緒にTikTokを撮りませんか？」と提案。
猿は「ウキキ！僕のダンスも撮影してください！バズること間違いなしです！」
雉は「ケーン！空撮でドローン映像も撮りましょう！」

ついに鬼ヶ島に到着すると、鬼たちはなんとYouTuberをしていました。
「おっ、桃太郎さん！コラボしませんか？鬼退治系YouTuberって斬新ですよね！」

結局、桃太郎と鬼たちは一緒に「みんなで仲良くタピオカチャレンジ」の動画を撮影。
その動画は一晩で100万回再生を突破し、桃太郎は一躍インフルエンサーになりましたとさ。

めでたし、めでたし...って、これ本当に鬼退治だったの？？`,
      summary: '令和版桃太郎がインスタ映えを求めて鬼ヶ島へ。鬼とコラボしてバズってしまう現代風昔話。',
      modes: { modeA: 'parallel' as StoryMode, modeB: 'character-collapse' as StoryMode, reason: '現代的要素とキャラ崩壊' }
    },
    {
      title: 'シンデレラと浦島太郎の異世界転生ラブコメ',
      content: `むかしむかし、靴を落としたシンデレラが謎の光に包まれて、なぜか竜宮城に転生してしまいました。

「えっ？ここは...海の中？」
困惑するシンデレラの前に現れたのは、なんと浦島太郎でした。

「おや、見慣れない魚人さんですね。新しい住民の方ですか？」
「魚人じゃありません！私、シンデレラです！」

乙姫様は大慌て。「あら大変！異世界から来ちゃったのね！でも大丈夫、ここで一緒に住みましょう♪」

シンデレラは竜宮城で家事のスキルを活かし、あっという間に城の管理係に昇格。
浦島太郎は彼女の働きぶりに感動し、いつしか恋に落ちてしまいました。

「シンデレラさん、僕と一緒に地上に帰りませんか？」
「でも玉手箱を開けたらあなた、おじいさんになるのでは...」
「大丈夫！乙姫様が『恋人補正』をかけてくれたので、イケメンのままです！」

二人は結ばれ、地上で「異世界グルメレストラン」を開業。
シンデレラの料理と浦島太郎の不老不死パワーで大繁盛しましたとさ。`,
      summary: 'シンデレラが竜宮城に転生！浦島太郎との異世界ラブコメが展開する合体昔話。',
      modes: { modeA: 'fusion' as StoryMode, modeB: 'childlike' as StoryMode, reason: '物語合体と子ども風発想' }
    }
  ]
  
  const randomStory = sampleStories[Math.floor(Math.random() * sampleStories.length)]
  
  return {
    id: props.id,
    title: randomStory.title,
    content: randomStory.content,
    summary: randomStory.summary,
    modes: randomStory.modes,
    triggerInfo: {
      location: {
        latitude: 35.6762,
        longitude: 139.6503,
        country: '日本',
        region: '東京都'
      },
      datetime: {
        date: '2025年6月28日',
        time: '14:30',
        holiday: '平日'
      },
      colors: {
        dominant: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        palette: '鮮やか',
        saturation: 'high'
      },
      objects: ['人物', '建物', '空']
    },
    audioUrl: '', // 実際の実装では音声URLを設定
    createdAt: new Date()
  }
}

// 音声再生の切り替え
const toggleSpeech = async () => {
  if (!speechSupported.value || !story.value) return
  
  try {
    if (isSpeaking.value) {
      // 停止
      speechService.stop()
      isSpeaking.value = false
    } else {
      // 再生
      isSpeechLoading.value = true
      isSpeaking.value = true
      
      await speechService.speakStory(story.value.content)
      isSpeaking.value = false
    }
  } catch (error) {
    console.error('音声再生エラー:', error)
    isSpeaking.value = false
  } finally {
    isSpeechLoading.value = false
  }
}

// ストーリーデータの読み込み
const loadStory = () => {
  console.log('📖 物語を読み込み中... ID:', route.params.id)
  
  const foundStory = storyStore.getStory(route.params.id as string)
  console.log('🔍 ストアから取得した物語:', foundStory)
  
  if (foundStory) {
    story.value = foundStory
    console.log('✅ 物語を正常に読み込みました:', story.value.title)
    
    // デバッグ: トリガー情報の詳細を確認
    console.log('🎯 Result.vue - トリガー情報の確認:')
    console.log('  triggerInfo:', story.value.triggerInfo)
    console.log('  colors:', story.value.triggerInfo?.colors)
    console.log('  colors.dominant:', story.value.triggerInfo?.colors?.dominant)
    console.log('  objects:', story.value.triggerInfo?.objects)
    console.log('  colors存在確認:', !!story.value.triggerInfo?.colors)
    console.log('  objects存在確認:', !!story.value.triggerInfo?.objects)
  } else {
    console.log('⚠️ 物語が見つかりません。サンプルデータを使用します')
    // サンプルデータを使用
    story.value = generateSampleStory()
    console.log('📝 サンプル物語を生成:', story.value.title)
  }
  
  isLoaded.value = true
}

// 物語のテキストをコピー
const copyStoryText = async () => {
  if (!story.value) return
  
  const storyText = `${story.value.title}\n\n${story.value.content}\n\n📝 3行要約\n${story.value.summary}\n\n🤖 生成: 爆笑昔話ジェネレーター`
  
  try {
    await navigator.clipboard.writeText(storyText)
    copyButtonText.value = '✅ コピー完了！'
    showToast('物語をコピーしました')
    setTimeout(() => {
      copyButtonText.value = '📋 物語をコピー'
    }, 2000)
  } catch (error) {
    console.error('コピーエラー:', error)
    // フォールバック: テキスト選択
    const textArea = document.createElement('textarea')
    textArea.value = storyText
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    
    copyButtonText.value = '✅ コピー完了！'
    showToast('物語をコピーしました')
    setTimeout(() => {
      copyButtonText.value = '📋 物語をコピー'
    }, 2000)
  }
}

// フィードバック送信
const submitFeedback = (rating: string) => {
  // 実際の実装ではFirestoreに送信
  console.log('Feedback submitted:', rating)
  showToast('フィードバックありがとうございます！')
}

const showToast = (message: string) => {
  toastMessage.value = message
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

onMounted(() => {
  loadStory()
  
  // 音声合成の初期化
  if (speechSupported.value) {
    // 音声リストの読み込み（非同期で読み込まれる場合がある）
    if (speechService.getVoices().length === 0) {
      speechSynthesis.addEventListener('voiceschanged', () => {
        console.log('利用可能な音声:', speechService.getJapaneseVoices())
      })
    }
  }
})
</script>
