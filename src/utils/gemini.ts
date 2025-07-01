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

// プロンプト承諾文を除去する関数
const removePromptAcknowledgments = (text: string): string => {
  // よくある承諾文のパターン
  const acknowledgmentPatterns = [
    /^(分かりました|承知いたしました|了解しました|かしこまりました)[。！]*\s*/i,
    /^(はい|はーい)[、。！]*\s*/i,
    /^(それでは|では)[、。！]*\s*/i,
    /^(お任せください|お任せ下さい)[。！]*\s*/i,
    /^(喜んで|よろこんで)[。！]*\s*/i,
    /^(素晴らしい|すばらしい)[。！]*\s*/i,
    /^(面白そう|おもしろそう)[。！]*\s*/i,
    /^(楽しそう|たのしそう)[。！]*\s*/i,
    /^(いいですね|良いですね)[。！]*\s*/i,
    /^(頑張ります|がんばります)[。！]*\s*/i,
    /^(作ります|つくります)[。！]*\s*/i,
    /^(書きます|かきます)[。！]*\s*/i,
    /^(生成します|せいせいします)[。！]*\s*/i,
    /^(創作します|そうさくします)[。！]*\s*/i,
    /^(物語を|ものがたりを)[。！]*\s*/i,
    /^(昔話を|むかしばなしを)[。！]*\s*/i,
    /^OK[。！]*\s*/i,
    /^(ご要望|ごようぼう).{0,20}[。！]*\s*/i,
    /^(リクエスト|りくえすと).{0,20}[。！]*\s*/i,
    /^(指示|しじ).{0,20}[。！]*\s*/i,
    /^(お題|おだい).{0,20}[。！]*\s*/i,
    /^(ありがとう|ありがとうございます)[。！]*\s*/i,
    /^(thank you|thanks)[。！]*\s*/i,
    // 複数行にわたる承諾文
    /^[\s\S]*?(以下|いか).{0,10}(物語|ものがたり|昔話|むかしばなし).{0,20}[。！]*\s*/i,
  ]
  
  let cleanedText = text.trim()
  
  // 各パターンをチェックして除去
  for (const pattern of acknowledgmentPatterns) {
    cleanedText = cleanedText.replace(pattern, '').trim()
  }
  
  // 最初の段落が承諾文の可能性がある場合（100文字以下で物語らしくない）
  const firstParagraph = cleanedText.split('\n')[0]
  if (firstParagraph && firstParagraph.length < 100) {
    // 物語の開始っぽいキーワードがない場合は除去
    const storyStartKeywords = [
      '昔々', 'むかしむかし', 'ある日', 'あるひ', 'ある時', 'あるとき',
      'ある村', 'あるむら', 'ある町', 'あるまち', 'ある国', 'あるくに',
      'ある所', 'あるところ', 'その昔', 'そのむかし', '昔', 'むかし',
      'タイトル', 'たいとる'
    ]
    
    const hasStoryStart = storyStartKeywords.some(keyword => 
      firstParagraph.includes(keyword)
    )
    
    if (!hasStoryStart) {
      // 承諾文の可能性が高いので除去
      const lines = cleanedText.split('\n')
      cleanedText = lines.slice(1).join('\n').trim()
    }
  }
  
  return cleanedText
}

// Geminiのレスポンスを解析
const parseGeminiResponse = (text: string): {
  title: string
  content: string
  summary: string
} => {
  try {
    // まず承諾文を除去
    const cleanedText = removePromptAcknowledgments(text)
    console.log('🧹 承諾文除去後のテキスト（最初の200文字）:', cleanedText.substring(0, 200))
    
    // タイトルを抽出
    const titleMatch = cleanedText.match(/タイトル[:：]\s*(.+?)[\n\r]/i)
    const title = titleMatch ? titleMatch[1].trim() : '爆笑昔話'
    
    // 3行要約を抽出
    const summaryMatch = cleanedText.match(/【3行要約】([\s\S]*?)(?:$|\n\n)/i)
    let summary = ''
    if (summaryMatch) {
      summary = summaryMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('・'))
        .map(line => line.replace(/^・\s*/, '').trim())
        .join(' ')
    }
    
    // 本文を抽出（タイトルと要約以外の部分）
    let content = cleanedText
      .replace(/タイトル[:：].*?[\n\r]/i, '')
      .replace(/【3行要約】[\s\S]*$/i, '')
      .replace(/【物語の特徴】[\s\S]*$/i, '')  // 物語の特徴も除去
      .trim()
    
    // 空の場合はフォールバック
    if (!content) {
      content = cleanedText
    }
    
    console.log('📖 抽出された物語本文（最初の100文字）:', content.substring(0, 100))
    
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
    
    // ラベルを抽出・日本語化
    const rawLabels = result.labelAnnotations?.map((label: any) => label.description) || []
    const labels = translateLabelsToJapanese(rawLabels)
    console.log('🏷️ 抽出されたラベル（英語）:', rawLabels)
    console.log('🏷️ 変換されたラベル（日本語）:', labels)
    
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

// シンプルなテキスト生成（要素生成用）
export const generateSimpleText = async (prompt: string): Promise<string> => {
  try {
    console.log('🤖 Gemini API シンプルテキスト生成:', prompt.substring(0, 100) + '...')
    
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
    
    const generationConfig = {
      temperature: 0.7,
      topK: 16,
      topP: 0.8,
      maxOutputTokens: 500,
    }

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig,
    })
    
    const response = await result.response
    const text = response.text().trim()
    
    console.log('✅ シンプルテキスト生成完了:', text)
    return text
    
  } catch (error) {
    console.warn('⚠️ シンプルテキスト生成エラー:', error)
    return ''
  }
}

// Vision APIラベルを日本語に変換
const translateLabelsToJapanese = (labels: string[]): string[] => {
  const labelTranslations: { [key: string]: string } = {
    // 動物
    'Dog': '犬',
    'Cat': '猫',
    'Bird': '鳥',
    'Horse': '馬',
    'Fish': '魚',
    'Rabbit': 'うさぎ',
    'Bear': 'クマ',
    'Lion': 'ライオン',
    'Tiger': 'トラ',
    'Elephant': 'ゾウ',
    'Monkey': 'サル',
    'Panda': 'パンダ',
    'Deer': 'シカ',
    'Cow': '牛',
    'Pig': '豚',
    'Sheep': '羊',
    'Goat': 'ヤギ',
    'Duck': 'アヒル',
    'Chicken': 'ニワトリ',
    'Owl': 'フクロウ',
    'Eagle': 'ワシ',
    'Butterfly': '蝶',
    'Bee': 'ハチ',
    'Insect': '昆虫',
    'Animal': '動物',
    'Pet': 'ペット',
    'Wildlife': '野生動物',
    
    // 人物・身体部位
    'Person': '人物',
    'People': '人々',
    'Man': '男性',
    'Woman': '女性',
    'Child': '子ども',
    'Baby': '赤ちゃん',
    'Face': '顔',
    'Eye': '目',
    'Hand': '手',
    'Smile': '笑顔',
    'Family': '家族',
    'Group': 'グループ',
    'Crowd': '群衆',
    'Human': '人間',
    
    // 建物・場所
    'Building': '建物',
    'House': '家',
    'Home': '家',
    'City': '街',
    'Street': '道路',
    'Road': '道',
    'Bridge': '橋',
    'Church': '教会',
    'Temple': '寺院',
    'School': '学校',
    'Hospital': '病院',
    'Store': '店',
    'Restaurant': 'レストラン',
    'Hotel': 'ホテル',
    'Office': 'オフィス',
    'Tower': 'タワー',
    'Castle': '城',
    'Palace': '宮殿',
    'Museum': '博物館',
    'Library': '図書館',
    'Park': '公園',
    'Garden': '庭',
    'Stadium': 'スタジアム',
    'Airport': '空港',
    'Station': '駅',
    'Architecture': '建築物',
    
    // 自然・風景
    'Sky': '空',
    'Cloud': '雲',
    'Sun': '太陽',
    'Moon': '月',
    'Star': '星',
    'Mountain': '山',
    'Hill': '丘',
    'Forest': '森',
    'Tree': '木',
    'Flower': '花',
    'Grass': '草',
    'Leaf': '葉',
    'River': '川',
    'Lake': '湖',
    'Ocean': '海',
    'Beach': 'ビーチ',
    'Sand': '砂',
    'Rock': '岩',
    'Stone': '石',
    'Water': '水',
    'Rain': '雨',
    'Snow': '雪',
    'Ice': '氷',
    'Fire': '火',
    'Sunset': '夕日',
    'Sunrise': '日の出',
    'Rainbow': '虹',
    'Lightning': '雷',
    'Nature': '自然',
    'Landscape': '風景',
    'Scenery': '景色',
    
    // 乗り物
    'Car': '車',
    'Bus': 'バス',
    'Train': '電車',
    'Bicycle': '自転車',
    'Motorcycle': 'バイク',
    'Airplane': '飛行機',
    'Boat': '船',
    'Ship': '船',
    'Truck': 'トラック',
    'Taxi': 'タクシー',
    'Vehicle': '乗り物',
    'Transportation': '交通機関',
    
    // 食べ物・飲み物
    'Food': '食べ物',
    'Fruit': '果物',
    'Vegetable': '野菜',
    'Bread': 'パン',
    'Cake': 'ケーキ',
    'Pizza': 'ピザ',
    'Rice': 'ご飯',
    'Noodle': '麺',
    'Meat': '肉',
    'Seafood': '魚介類',
    'Egg': '卵',
    'Milk': '牛乳',
    'Coffee': 'コーヒー',
    'Tea': '茶',
    'Beverage': '飲み物',
    'Juice': 'ジュース',
    'Beer': 'ビール',
    'Wine': 'ワイン',
    'Drink': '飲み物',
    'Meal': '食事',
    'Dining': '食事',
    
    // 物・道具
    'Phone': '電話',
    'Computer': 'コンピュータ',
    'Camera': 'カメラ',
    'Book': '本',
    'Pen': 'ペン',
    'Paper': '紙',
    'Bag': 'バッグ',
    'Clock': '時計',
    'Chair': '椅子',
    'Table': 'テーブル',
    'Bed': 'ベッド',
    'Door': 'ドア',
    'Window': '窓',
    'Mirror': '鏡',
    'Light': '光',
    'Lamp': 'ランプ',
    'Candle': 'ろうそく',
    'Toy': 'おもちゃ',
    'Ball': 'ボール',
    'Gaming': 'ゲーム',
    'Musical': '音楽',
    'Instrument': '楽器',
    'Art': '芸術',
    'Painting': '絵画',
    'Sculpture': '彫刻',
    'Tool': '道具',
    'Machine': '機械',
    'Equipment': '装置',
    'Technology': '技術',
    
    // 服・アクセサリー
    'Clothing': '服',
    'Shirt': 'シャツ',
    'Dress': 'ドレス',
    'Shoes': '靴',
    'Hat': '帽子',
    'Glasses': 'メガネ',
    'Watch': '腕時計',
    'Jewelry': '宝石',
    'Ring': '指輪',
    'Necklace': 'ネックレス',
    'Fashion': 'ファッション',
    
    // 色・形
    'Red': '赤',
    'Blue': '青',
    'Green': '緑',
    'Yellow': '黄色',
    'Orange': 'オレンジ',
    'Purple': '紫',
    'Pink': 'ピンク',
    'Brown': '茶色',
    'Black': '黒',
    'White': '白',
    'Gray': 'グレー',
    'Color': '色',
    'Colorful': 'カラフル',
    'Bright': '明るい',
    'Dark': '暗い',
    'Pale': '薄い',
    'Circle': '円',
    'Square': '四角',
    'Triangle': '三角',
    'Rectangle': '長方形',
    'Round': '丸い',
    'Straight': '直線',
    'Curved': '曲線',
    
    // イベント・活動
    'Party': 'パーティー',
    'Wedding': '結婚式',
    'Birthday': '誕生日',
    'Festival': 'お祭り',
    'Concert': 'コンサート',
    'Sports': 'スポーツ',
    'Competition': '競技',
    'Dance': 'ダンス',
    'Musical Performance': '音楽',
    'Performance': 'パフォーマンス',
    'Show': 'ショー',
    'Exhibition': '展示',
    'Meeting': '会議',
    'Class': '授業',
    'Work': '仕事',
    'Shopping': '買い物',
    'Travel': '旅行',
    'Vacation': '休暇',
    'Holiday': '休日',
    'Christmas': 'クリスマス',
    'Halloween': 'ハロウィン',
    'New Year': '新年',
    
    // その他
    'Text': 'テキスト',
    'Sign': '看板',
    'Symbol': 'シンボル',
    'Number': '数字',
    'Letter': '文字',
    'Logo': 'ロゴ',
    'Pattern': '模様',
    'Design': 'デザイン',
    'Style': 'スタイル',
    'Beauty': '美しさ',
    'Cute': 'かわいい',
    'Cool': 'かっこいい',
    'Fun': '楽しい',
    'Happy': '幸せ',
    'Sad': '悲しい',
    'Angry': '怒っている',
    'Surprised': '驚いた',
    'Love': '愛',
    'Peace': '平和',
    'Hope': '希望',
    'Dream': '夢',
    'Memory': '思い出',
    'Time': '時間',
    'Space': '空間',
    'Life': '人生',
    'World': '世界',
    'Earth': '地球',
    'Universe': '宇宙',
    'Energy': 'エネルギー',
    'Power': '力',
    'Magic': '魔法',
    'Mystery': '謎',
    'Adventure': '冒険',
    'Journey': '旅',
    'Story': '物語',
    'Tale': '話',
    'Legend': '伝説',
    'Myth': '神話',
    'Fantasy': 'ファンタジー',
    'Reality': '現実',
    'Future': '未来',
    'Past': '過去',
    'Present': '現在'
  }

  return labels.map(label => {
    // 完全一致を試行
    if (labelTranslations[label]) {
      return labelTranslations[label]
    }
    
    // 部分一致を試行（大文字小文字を無視）
    const lowerLabel = label.toLowerCase()
    for (const [english, japanese] of Object.entries(labelTranslations)) {
      if (english.toLowerCase() === lowerLabel) {
        return japanese
      }
    }
    
    // 単語の一部が含まれているかチェック
    for (const [english, japanese] of Object.entries(labelTranslations)) {
      if (lowerLabel.includes(english.toLowerCase()) || english.toLowerCase().includes(lowerLabel)) {
        return japanese
      }
    }
    
    // 翻訳できない場合はそのまま返す
    return label
  })
}

// Vision APIを使用した画像解析
