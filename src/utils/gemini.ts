import { GoogleGenerativeAI } from '@google/generative-ai'

// Gemini API クライアントを初期化
const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API key is not configured')
  }
  return new GoogleGenerativeAI(apiKey)
}

// 物語を生成
export const generateStoryWithGemini = async (prompt: string): Promise<{
  title: string
  content: string
  summary: string
}> => {
  try {
    console.log('� Gemini 2.5 Pro API 物語生成開始...')
    console.log('📋 受信したプロンプト情報:')
    console.log('  - プロンプト長:', prompt.length, '文字')
    console.log('  - プロンプト内容（最初の500文字）:', prompt.substring(0, 500))
    console.log('  - プロンプト内容（最後の300文字）:', prompt.substring(Math.max(0, prompt.length - 300)))
    
    const genAI = getGeminiClient()
    // Gemini 2.5 Pro を使用（シンプル設定）
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
    
    // Gemini 2.5 Pro 最適化設定
    const generationConfig = {
      temperature: 0.8, // 創造性とコントロールのバランス
      topK: 32,
      topP: 0.9,
      maxOutputTokens: 4000, // 2.5では更に多めに設定可能
    }

    console.log('� Gemini 2.5 Pro API 物語生成開始...')
    
    console.log('📤 Gemini 2.5 Pro APIにリクエスト送信中...')
    
    // Gemini 2.5でのシンプルな生成
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig,
    })
    
    const response = await result.response
    const text = response.text()
    
    console.log('📥 Gemini 2.5 Pro APIからレスポンス受信')
    console.log('📝 生成されたテキスト:', text.substring(0, 200) + '...')
    
    // 2.5 Proの高度な推論能力により、より一貫性のある出力が期待される
    console.log('✅ Gemini 2.5 Pro により高品質な物語を生成')
    
    // レスポンスを解析
    const parsed = parseGeminiResponse(text)
    console.log('✅ 物語解析完了:', { title: parsed.title, contentLength: parsed.content.length })
    
    return parsed
  } catch (error) {
    console.error('❌ Gemini API エラー:', error)
    
    // フォールバック: サンプル物語を返す
    console.log('🔄 フォールバック物語を使用')
    return generateFallbackStory()
  }
}

// Geminiのレスポンスを解析
const parseGeminiResponse = (text: string): {
  title: string
  content: string
  summary: string
} => {
  try {
    // タイトルを抽出
    const titleMatch = text.match(/タイトル[:：]\s*(.+?)[\n\r]/i)
    const title = titleMatch ? titleMatch[1].trim() : '爆笑昔話'
    
    // 3行要約を抽出
    const summaryMatch = text.match(/【3行要約】([\s\S]*?)(?:$|\n\n)/i)
    let summary = ''
    if (summaryMatch) {
      summary = summaryMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('・'))
        .map(line => line.replace(/^・\s*/, '').trim())
        .join(' ')
    }
    
    // 本文を抽出（タイトルと要約以外の部分）
    let content = text
      .replace(/タイトル[:：].*?[\n\r]/i, '')
      .replace(/【3行要約】[\s\S]*$/i, '')
      .trim()
    
    // 空の場合はフォールバック
    if (!content) {
      content = text
    }
    
    return {
      title: title || '爆笑昔話',
      content: content || 'エラーが発生しましたが、きっと面白い物語があったはずです！',
      summary: summary || '技術的な問題で要約を生成できませんでした。'
    }
  } catch (error) {
    console.warn('Failed to parse Gemini response:', error)
    return generateFallbackStory()
  }
}

// フォールバック用のサンプル物語
const generateFallbackStory = (): {
  title: string
  content: string
  summary: string
} => {
  const fallbackStories = [
    {
      title: '令和の桃太郎とAI鬼退治',
      content: `昔々、ある村にスマートフォンを持った桃太郎がいました。

「おばあさん、今日はAIを使って効率的に鬼退治をしてきます！」
桃太郎はChatGPTできびだんごのレシピを調べ、3Dプリンターで大量生産しました。

道中で出会った犬は、「ワンワン！僕もプログラミングができるんです！」と言ってPythonでゲームを作り始めました。
猿は「ウキキ！僕は動画編集が得意です！バズる動画を作りましょう！」
雉は「ケーン！ドローンで偵察もお任せください！」

鬼ヶ島に到着すると、鬼たちはなんとテック企業を経営していました。
「桃太郎さん！一緒にスタートアップを立ち上げませんか？『鬼退治as a Service』というサービスを考えているんです！」

結局、桃太郎は鬼たちと共同でアプリ開発会社を設立。
「OniKiller Pro」という鬼退治シミュレーションゲームが大ヒットし、みんなでハッピーエンドを迎えましたとさ。

めでたし、めでたし...でも、これって本当に鬼退治？🤔`,
      summary: '令和の桃太郎がAI技術を駆使して鬼退治に挑むが、最終的に鬼とコラボしてアプリ開発企業を設立する現代風昔話。'
    },
    {
      title: 'シンデレラの宅配代行サービス',
      content: `むかしむかし、シンデレラは継母と義姉たちに家事を押し付けられていました。

「もう限界...効率化を図らなければ！」
シンデレラは魔法の力でウーバーイーツのような宅配サービス「シンデリバリー」を立ち上げました。

「お客様、ご注文のきびだんごをお届けに参りました♪」
シンデレラはかぼちゃの馬車で村中を駆け回り、12時までに全ての配達を完了する必要がありました。

ある日、王子様から「舞踏会の料理を全て宅配してほしい」という大量注文が！
「これは大チャンス！でも12時までに間に合うかしら...」

シンデレラは魔法のGPSとAIルート最適化システムを駆使し、なんと11時59分に最後の配達を完了！

王子様は配達に来たシンデレラに一目惚れ。
「君のようなビジネスセンスのある女性と結婚したい！」

二人は結ばれ、シンデリバリーは王国最大の物流企業に成長しましたとさ。📦✨`,
      summary: 'シンデレラが宅配サービスを立ち上げ、効率的な配達で王子様の心を掴む現代的ビジネス昔話。'
    }
  ]
  
  const randomStory = fallbackStories[Math.floor(Math.random() * fallbackStories.length)]
  return randomStory
}

// 画像解析（Google Cloud Vision API）
export const analyzeImageWithVision = async (imageFile: File): Promise<{
  labels: string[]
  colors: string[]
}> => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY
    console.log('🔑 Vision API Key 確認:', apiKey ? 'APIキーあり' : 'APIキーなし')
    
    if (!apiKey) {
      console.warn('Google Cloud API key not configured')
      return { labels: [], colors: [] }
    }
    
    console.log('📷 Vision API 呼び出し開始 - ファイル名:', imageFile.name, 'サイズ:', imageFile.size)
    
    // 画像をBase64に変換
    const base64Image = await fileToBase64(imageFile)
    console.log('📊 Base64変換済み - 長さ:', base64Image.length)
    
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image.split(',')[1] // データURLのプレフィックスを除去
          },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 10 },
            { type: 'IMAGE_PROPERTIES', maxResults: 5 }
          ]
        }
      ]
    }
    
    console.log('🌐 Vision API リクエスト送信中...')
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
    
    console.log('📡 Vision API レスポンス受信:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Vision API エラー:', response.status, errorText)
      throw new Error(`Vision API error: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log('📊 Vision API レスポンスデータ:', data)
    
    const result = data.responses[0]
    console.log('🔍 Vision API 解析結果:', result)
    
    // ラベルを抽出
    const labels = result.labelAnnotations?.map((label: any) => label.description) || []
    console.log('🏷️ 抽出されたラベル:', labels)
    
    // 色情報を抽出
    const colors = result.imagePropertiesAnnotation?.dominantColors?.colors?.map((color: any) => {
      const { red = 0, green = 0, blue = 0 } = color.color
      return `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`
    }) || []
    console.log('🎨 抽出された色:', colors)
    
    console.log('✅ Vision API 解析完了 - ラベル数:', labels.length, '色数:', colors.length)
    return { labels, colors }
  } catch (error) {
    console.error('❌ Vision API 呼び出しエラー:', error)
    return { labels: [], colors: [] }
  }
}

// ファイルをBase64に変換
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}
