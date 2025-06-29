<template>
  <div class="fixed bottom-4 right-2 sm:right-4 z-50 space-y-1 sm:space-y-2">
    <!-- Gemini APIテスト -->
    <button 
      @click="testGeminiAPI"
      :disabled="testing"
      class="block w-full bg-green-500 hover:bg-green-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg transition-colors duration-200 text-xs sm:text-sm"
    >
      {{ testing ? '🔄 テスト中...' : '🧪 Gemini APIテスト' }}
    </button>
    
    <!-- Firebase接続テスト -->
    <button 
      @click="testFirebaseConnection"
      :disabled="testing"
      class="block w-full bg-orange-500 hover:bg-orange-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg transition-colors duration-200 text-xs sm:text-sm"
    >
      🔥 Firebase接続テスト
    </button>
    
    <!-- Vision API接続テスト -->
    <button 
      @click="testVisionAPI"
      :disabled="testing"
      class="block w-full bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg transition-colors duration-200 text-xs sm:text-sm"
    >
      👁️ Vision APIテスト
    </button>
    
    <!-- OpenWeather API接続テスト -->
    <button 
      @click="testOpenWeatherAPI"
      :disabled="testing"
      class="block w-full bg-cyan-500 hover:bg-cyan-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg transition-colors duration-200 text-xs sm:text-sm"
    >
      🌤️ 天気APIテスト
    </button>
    
    <!-- テスト結果表示 -->
    <div 
      v-if="testResult" 
      class="mt-1 sm:mt-2 p-2 sm:p-3 bg-white rounded-lg shadow-lg max-w-xs"
      :class="testResult.success ? 'border-green-500' : 'border-red-500'"
    >
      <div class="flex items-center mb-1 sm:mb-2">
        <span :class="testResult.success ? 'text-green-600' : 'text-red-600'">
          {{ testResult.success ? '✅' : '❌' }}
        </span>
        <span class="ml-2 font-bold text-xs sm:text-sm">
          {{ testResult.success ? 'API接続成功！' : 'API接続失敗' }}
        </span>
      </div>
      <p class="text-xs text-gray-600">
        {{ testResult.message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { generateStoryWithGemini } from '../utils/gemini'
import { weatherService } from '../utils/weather'
import { initializeApp } from 'firebase/app'

const testing = ref(false)
const testResult = ref<{
  success: boolean
  message: string
} | null>(null)

const testGeminiAPI = async () => {
  testing.value = true
  testResult.value = null
  
  try {
    console.log('🧪 Gemini API テストを開始...')
    
    const testPrompt = `
    <system>
    あなたは爆笑昔話クリエイターです。短いテスト用の昔話を作ってください。
    </system>
    
    <user>
    APIテスト用に、桃太郎の超短いパロディー昔話を作ってください。
    
    【要件】
    1. 200文字以内で完結
    2. 現代風にアレンジ
    3. 面白いオチを入れる
    
    【出力形式】
    タイトル: （面白いタイトル）
    
    （物語本文）
    
    【3行要約】
    ・（要約1）
    ・（要約2） 
    ・（要約3）
    </user>
    `
    
    const result = await generateStoryWithGemini(testPrompt)
    
    console.log('✅ Gemini API テスト成功！')
    console.log('生成されたタイトル:', result.title)
    console.log('生成された内容:', result.content.substring(0, 100) + '...')
    
    testResult.value = {
      success: true,
      message: `Gemini API: ${result.title}`
    }
    
  } catch (error) {
    console.error('❌ Gemini API テスト失敗:', error)
    
    testResult.value = {
      success: false,
      message: `Gemini API: ${error instanceof Error ? error.message : 'API接続エラー'}`
    }
  } finally {
    testing.value = false
    
    // 5秒後に結果を非表示
    setTimeout(() => {
      testResult.value = null
    }, 5000)
  }
}

const testFirebaseConnection = async () => {
  testing.value = true
  testResult.value = null
  
  try {
    console.log('🔥 Firebase 接続テストを開始...')
    
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    }
    
    const app = initializeApp(firebaseConfig)
    
    console.log('✅ Firebase 接続テスト成功！')
    console.log('プロジェクトID:', firebaseConfig.projectId)
    
    testResult.value = {
      success: true,
      message: `Firebase: ${firebaseConfig.projectId} 接続成功`
    }
    
  } catch (error) {
    console.error('❌ Firebase 接続テスト失敗:', error)
    
    testResult.value = {
      success: false,
      message: `Firebase: ${error instanceof Error ? error.message : '接続エラー'}`
    }
  } finally {
    testing.value = false
    
    // 5秒後に結果を非表示
    setTimeout(() => {
      testResult.value = null
    }, 5000)
  }
}

const testVisionAPI = async () => {
  testing.value = true
  testResult.value = null
  
  try {
    console.log('�️ Vision API 接続テストを開始...')
    
    const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY
    
    if (!apiKey) {
      throw new Error('Vision API キーが設定されていません')
    }
    
    // テスト用の画像URL（Googleの公開画像）
    const testImageUrl = 'https://cloud.google.com/vision/docs/images/faulkner.jpg'
    
    const requestBody = {
      requests: [{
        image: {
          source: { imageUri: testImageUrl }
        },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 3 },
          { type: 'IMAGE_PROPERTIES', maxResults: 1 }
        ]
      }]
    }
    
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error ${response.status}: ${errorText}`)
    }
    
    const data = await response.json()
    const result = data.responses[0]
    
    if (result.error) {
      throw new Error(`Vision API Error: ${result.error.message}`)
    }
    
    console.log('✅ Vision API 接続テスト成功！')
    console.log('検出されたラベル:', result.labelAnnotations?.map((label: any) => label.description))
    
    const labels = result.labelAnnotations?.map((label: any) => label.description) || []
    
    testResult.value = {
      success: true,
      message: `Vision API: 検出されたラベル: ${labels.slice(0, 2).join(', ')}`
    }
    
  } catch (error) {
    console.error('❌ Vision API 接続テスト失敗:', error)
    
    testResult.value = {
      success: false,
      message: `Vision API: ${error instanceof Error ? error.message : '接続エラー'}`
    }
  } finally {
    testing.value = false
    
    // 5秒後に結果を非表示
    setTimeout(() => {
      testResult.value = null
    }, 5000)
  }
}

const testOpenWeatherAPI = async () => {
  testing.value = true
  testResult.value = null
  
  try {
    console.log('🌤️ OpenWeather API 接続テストを開始...')
    
    const result = await weatherService.testApi()
    
    if (result.success) {
      console.log('✅ OpenWeather API 接続テスト成功！')
      console.log('天気データ:', result.data)
      
      testResult.value = {
        success: true,
        message: `天気API: ${result.data?.location.city} ${result.data?.current.temperature}℃ ${result.data?.current.description}`
      }
    } else {
      console.log('❌ OpenWeather API 接続テスト失敗:', result.message)
      
      testResult.value = {
        success: false,
        message: result.message
      }
    }
    
  } catch (error) {
    console.error('❌ OpenWeather API 接続テスト失敗:', error)
    
    testResult.value = {
      success: false,
      message: `天気API: ${error instanceof Error ? error.message : '接続エラー'}`
    }
  } finally {
    testing.value = false
    
    // 5秒後に結果を非表示
    setTimeout(() => {
      testResult.value = null
    }, 5000)
  }
}
</script>
