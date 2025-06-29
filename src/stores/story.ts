import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GeneratedStory, TriggerInfo } from '../types'
import { extractExifData, getLocationName, getHolidayInfo } from '../utils/exif'
import { determineStoryModes, generatePrompt, getWeatherInfo } from '../utils/storyGeneration'
import { generateStoryWithGemini, analyzeImageWithVision } from '../utils/gemini'
import { analyzeImageLocal, getSaturationLevel } from '../utils/localVision'
import { generateWeatherStoryContext, generateFallbackWeather } from '../utils/weather'

export const useStoryStore = defineStore('story', () => {
  // 状態
  const currentStory = ref<GeneratedStory | null>(null)
  const stories = ref<GeneratedStory[]>([])
  const isProcessing = ref(false)
  const processingStep = ref(0)
  const error = ref<string | null>(null)
  
  // ファイル処理用の状態
  const currentFile = ref<File | null>(null)
  const userSettings = ref<{
    userName?: string
    userComment?: string
  }>({})

  // ファイル設定
  const setCurrentFile = (file: File) => {
    currentFile.value = file
  }

  const setUserSettings = (settings: { userName?: string; userComment?: string }) => {
    userSettings.value = settings
  }

  // ストーリー生成の主要な処理
  const generateStory = async (
    file: File,
    userName?: string,
    userComment?: string
  ): Promise<string> => {
    isProcessing.value = true
    error.value = null
    processingStep.value = 0

    try {
      // ステップ1: 画像解析とトリガー情報の抽出
      processingStep.value = 1
      console.log('🔍 ステップ1: 画像解析開始...')
      const triggerInfo = await extractTriggerInfo(file)
      console.log('📊 抽出されたトリガー情報:', triggerInfo)

      // ステップ2: 物語モードの決定
      processingStep.value = 2
      console.log('🎯 ステップ2: 物語モード決定...')
      const storyModes = determineStoryModes(triggerInfo)
      console.log('🎭 決定された物語モード:', storyModes)

      // ステップ3: プロンプト生成と物語作成
      processingStep.value = 3
      console.log('✍️ ステップ3: プロンプト生成...')
      const prompt = generatePrompt(triggerInfo, storyModes, userName, userComment)
      console.log('📝 生成されたプロンプト:')
      console.log('='.repeat(50))
      console.log(prompt)
      console.log('='.repeat(50))
      
      console.log('🤖 Gemini API 呼び出し開始...')
      const generatedContent = await generateStoryWithGemini(prompt)

      // ステップ4: 音声生成（この段階では省略）
      processingStep.value = 4

      // 物語オブジェクトを作成
      const story: GeneratedStory = {
        id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: generatedContent.title,
        content: generatedContent.content,
        summary: generatedContent.summary,
        modes: storyModes,
        triggerInfo,
        userName,
        userComment,
        audioUrl: undefined, // 後で音声生成機能を実装
        createdAt: new Date()
      }

      // 状態を更新
      currentStory.value = story
      stories.value.unshift(story)

      // ローカルストレージに保存
      saveToLocalStorage()

      return story.id
    } catch (err) {
      error.value = err instanceof Error ? err.message : '物語の生成に失敗しました'
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  // トリガー情報を抽出
  const extractTriggerInfo = async (file: File): Promise<TriggerInfo> => {
    const triggerInfo: TriggerInfo = {}

    try {
      // EXIF情報の抽出
      const exifData = await extractExifData(file)
      
      if (exifData.latitude && exifData.longitude) {
        console.log('📍 GPS座標を発見:', exifData.latitude, exifData.longitude)
        const region = await getLocationName(exifData.latitude, exifData.longitude)
        triggerInfo.location = {
          latitude: exifData.latitude,
          longitude: exifData.longitude,
          country: region === '海外' ? '海外' : '日本',
          region
        }

        // 天気情報の取得（実際の座標から）
        try {
          console.log('🌤️ 実際の座標から天気情報を取得中...')
          const weather = await getWeatherInfo(exifData.latitude, exifData.longitude)
          if (weather) {
            triggerInfo.weather = weather
            console.log('✅ 天気情報取得成功:', weather)
            
            // 物語生成用の天気コンテキストを追加
            const weatherContext = generateWeatherStoryContext(weather, region)
            triggerInfo.weather.context = weatherContext
            console.log('🎭 天気コンテキスト:', weatherContext)
          }
        } catch (weatherError) {
          console.warn('❌ 天気情報取得失敗:', weatherError)
          // フォールバック：地域と季節から推測天気を設定
          const fallbackWeather = generateFallbackWeather(region, triggerInfo.datetime?.date)
          if (fallbackWeather) {
            triggerInfo.weather = fallbackWeather
            console.log('🌡️ フォールバック天気:', fallbackWeather)
          }
        }
      } else {
        // GPS情報がない場合のデフォルト設定
        console.log('🌍 GPS情報がないため、ランダムな地域を設定')
        const randomLocations = [
          { region: '東京都', country: '日本' },
          { region: '大阪府', country: '日本' },
          { region: '京都府', country: '日本' },
          { region: '神奈川県', country: '日本' },
          { region: '北海道', country: '日本' },
          { region: '沖縄県', country: '日本' },
          { region: 'アメリカ', country: '海外' },
          { region: 'フランス', country: '海外' },
          { region: 'イタリア', country: '海外' }
        ]
        
        const randomLocation = randomLocations[Math.floor(Math.random() * randomLocations.length)]
        triggerInfo.location = {
          ...randomLocation,
          latitude: 35.6762 + (Math.random() - 0.5) * 10, // 東京周辺のランダム座標
          longitude: 139.6503 + (Math.random() - 0.5) * 10
        }
        console.log('📍 設定された地域:', triggerInfo.location)
      }

      // 撮影日時の処理
      if (exifData.dateTime) {
        const holiday = getHolidayInfo(exifData.dateTime)
        triggerInfo.datetime = {
          date: exifData.dateTime.split(' ')[0] || exifData.dateTime,
          time: exifData.dateTime.split(' ')[1] || '',
          holiday
        }
      } else {
        // 撮影日時がない場合のデフォルト設定
        console.log('📅 撮影日時がないため、ランダムな日時を設定')
        const now = new Date()
        const randomDays = Math.floor(Math.random() * 30) // 過去30日以内
        const randomDate = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000)
        const randomHour = Math.floor(Math.random() * 24)
        const randomMinute = Math.floor(Math.random() * 60)
        
        const dateStr = randomDate.toISOString().split('T')[0]
        const timeStr = `${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}:00`
        
        triggerInfo.datetime = {
          date: dateStr,
          time: timeStr,
          holiday: getHolidayInfo(`${dateStr} ${timeStr}`)
        }
        console.log('📅 設定された日時:', triggerInfo.datetime)
      }

      // 画像解析（Google Cloud Vision API → ローカル解析フォールバック）
      try {
        console.log('🔍 Vision API で画像解析を試行中...')
        const visionResult = await analyzeImageWithVision(file)
        console.log('📊 Vision API 結果:', visionResult)
        
        if (visionResult.labels.length > 0) {
          triggerInfo.objects = visionResult.labels
          console.log('🏷️ 検出されたラベル:', visionResult.labels)
        }
        if (visionResult.colors.length > 0) {
          triggerInfo.colors = {
            dominant: visionResult.colors,
            palette: '鮮やか',
            saturation: 'high'
          }
          console.log('🎨 検出された色:', visionResult.colors)
        }
        console.log('✅ Vision API 解析成功')
        
      } catch (visionError) {
        console.warn('❌ Vision API 解析失敗、ローカル解析に切り替え:', visionError)
        
        try {
          // フォールバック: ローカル画像解析
          console.log('🎨 ローカル画像解析を実行中...')
          const localResult = await analyzeImageLocal(file)
          console.log('📊 ローカル解析結果:', localResult)
          
          triggerInfo.objects = localResult.labels
          console.log('🏷️ ローカル検出ラベル:', localResult.labels)
          
          if (localResult.colors.length > 0) {
            triggerInfo.colors = {
              dominant: localResult.colors,
              palette: '標準',
              saturation: getSaturationLevel(localResult.colors)
            }
            console.log('🎨 ローカル検出色:', localResult.colors)
          }
          console.log('✅ ローカル解析成功')
          
        } catch (localError) {
          console.warn('❌ ローカル解析も失敗、デフォルト値を使用:', localError)
          
          // 最終フォールバック: デフォルト値
          console.log('⚠️ 両方の解析が失敗、確実なデフォルト値を設定')
          triggerInfo.objects = ['写真', '画像', '被写体']
          triggerInfo.colors = {
            dominant: ['#8B4513', '#D2B48C', '#F5DEB3'], // 茶色系の色を設定
            palette: '標準',
            saturation: 'medium'
          }
          console.log('⚠️ デフォルト値を設定:', { objects: triggerInfo.objects, colors: triggerInfo.colors })
        }
      }

    } catch (error) {
      console.warn('Trigger info extraction failed:', error)
    }

    // 最終的なトリガー情報をログ出力
    console.log('🎯 最終的なトリガー情報:')
    console.log('  📍 location:', triggerInfo.location)
    console.log('  📅 datetime:', triggerInfo.datetime)
    console.log('  🌤️ weather:', triggerInfo.weather)
    console.log('  🎨 colors:', triggerInfo.colors)
    console.log('  🏷️ objects:', triggerInfo.objects)

    // デバッグ: 色情報と物体情報の有無を明確に確認
    console.log('🔍 デバッグ - 色情報の有無:', {
      exists: !!triggerInfo.colors,
      dominant: triggerInfo.colors?.dominant,
      dominantLength: triggerInfo.colors?.dominant?.length || 0
    })
    console.log('🔍 デバッグ - 物体情報の有無:', {
      exists: !!triggerInfo.objects,
      objects: triggerInfo.objects,
      objectsLength: triggerInfo.objects?.length || 0
    })

    // 確実にデータが存在するように最終チェック
    if (!triggerInfo.colors || !triggerInfo.colors.dominant || triggerInfo.colors.dominant.length === 0) {
      console.warn('⚠️ 色情報が不完全、強制設定')
      triggerInfo.colors = {
        dominant: ['#FF6B6B', '#4ECDC4', '#45B7D1'], // 明るい色
        palette: '標準',
        saturation: 'medium'
      }
    }
    
    if (!triggerInfo.objects || triggerInfo.objects.length === 0) {
      console.warn('⚠️ 物体情報が不完全、強制設定')
      triggerInfo.objects = ['写真', '画像', '被写体', '風景']
    }

    console.log('✅ 最終確認後のトリガー情報:')
    console.log('  🎨 colors (final):', triggerInfo.colors)
    console.log('  🏷️ objects (final):', triggerInfo.objects)

    return triggerInfo
  }

  // 特定の物語を取得
  const getStory = (id: string): GeneratedStory | undefined => {
    console.log('🔍 物語を検索中... ID:', id)
    console.log('📚 現在保存されている物語数:', stories.value.length)
    console.log('📚 保存されている物語ID一覧:', stories.value.map(s => s.id))
    
    const found = stories.value.find(story => story.id === id)
    console.log('🎯 検索結果:', found ? '見つかりました' : '見つかりません')
    
    return found
  }

  // 物語を削除
  const deleteStory = (id: string) => {
    stories.value = stories.value.filter(story => story.id !== id)
    if (currentStory.value?.id === id) {
      currentStory.value = null
    }
    saveToLocalStorage()
  }

  // すべての履歴をクリア
  const clearAllStories = () => {
    stories.value = []
    currentStory.value = null
    localStorage.removeItem('savedStories')
  }

  // ローカルストレージに保存
  const saveToLocalStorage = () => {
    try {
      const limitedStories = stories.value.slice(0, 20) // 最新20件まで保存
      localStorage.setItem('savedStories', JSON.stringify(limitedStories))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  // ローカルストレージから読み込み
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('savedStories')
      if (saved) {
        const parsedStories = JSON.parse(saved)
        stories.value = parsedStories.map((story: any) => ({
          ...story,
          createdAt: new Date(story.createdAt)
        }))
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error)
    }
  }

  // 初期化時にローカルストレージから読み込み
  loadFromLocalStorage()

  return {
    // 状態
    currentStory,
    stories,
    isProcessing,
    processingStep,
    error,
    currentFile,
    userSettings,
    
    // アクション
    generateStory,
    getStory,
    deleteStory,
    clearAllStories,
    loadFromLocalStorage,
    setCurrentFile,
    setUserSettings
  }
})
