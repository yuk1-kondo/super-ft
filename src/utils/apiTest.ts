// APIキー接続テスト用スクリプト
import { initializeApp } from 'firebase/app'
import { GoogleGenerativeAI } from '@google/generative-ai'

// 環境変数の確認
export const checkEnvironmentVariables = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_GEMINI_API_KEY',
    'VITE_GOOGLE_CLOUD_API_KEY'
  ]
  
  const missing = requiredVars.filter(varName => !import.meta.env[varName])
  
  if (missing.length > 0) {
    console.error('❌ 不足している環境変数:', missing)
    return false
  }
  
  console.log('✅ 環境変数の設定OK')
  return true
}

// Firebase接続テスト
export const testFirebaseConnection = () => {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    }
    
    const app = initializeApp(firebaseConfig)
    console.log('✅ Firebase接続成功:', app.name)
    return true
  } catch (error) {
    console.error('❌ Firebase接続エラー:', error)
    return false
  }
}

// Gemini API接続テスト
export const testGeminiConnection = async () => {
  try {
    console.log('� Gemini 2.5 Pro 接続テスト開始...')
    
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    })
    
    // シンプルなテストプロンプト
    const result = await model.generateContent('こんにちは！簡潔に挨拶をお願いします。')
    const response = await result.response
    
    console.log('✅ Gemini 2.5 Pro API接続成功')
    console.log('テスト応答:', response.text().substring(0, 100) + '...')
    return true
  } catch (error) {
    console.error('❌ Gemini 2.5 Pro API接続エラー:', error)
    return false
  }
}

// Vision API接続テスト
export const testVisionConnection = async () => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { source: { imageUri: 'https://via.placeholder.com/300' } },
            features: [{ type: 'LABEL_DETECTION', maxResults: 1 }]
          }]
        })
      }
    )
    
    if (response.ok) {
      console.log('✅ Vision API接続成功')
      return true
    } else {
      console.error('❌ Vision API接続エラー:', response.status)
      return false
    }
  } catch (error) {
    console.error('❌ Vision API接続エラー:', error)
    return false
  }
}

// 全体テスト実行
export const runAllTests = async () => {
  console.log('🧪 API接続テストを開始...')
  
  const envTest = checkEnvironmentVariables()
  if (!envTest) return false
  
  const firebaseTest = testFirebaseConnection()
  const geminiTest = await testGeminiConnection()
  const visionTest = await testVisionConnection()
  
  const allPassed = firebaseTest && geminiTest && visionTest
  
  if (allPassed) {
    console.log('🎉 すべてのAPIテストが成功しました！')
  } else {
    console.log('⚠️ 一部のAPIで問題があります。設定を確認してください。')
  }
  
  return allPassed
}
