import type { TriggerInfo, StoryModes, StoryMode } from '../types'
import { weatherService } from './weather'

// 物語の4つの要素
const storyModes: StoryMode[] = ['parallel', 'fusion', 'character-collapse', 'childlike']

// 組み合わせルールエンジン
export const determineStoryModes = (triggerInfo: TriggerInfo): StoryModes => {
  const selectedModes: StoryMode[] = []
  let reason = ''
  
  // ランダム要素を追加して多様性を確保
  const randomFactor = Math.random()
  
  // 優先度配列: [3>5>1>4>6>2] + ランダム要素
  // 3: 撮影日が記念日 → 子ども風固定 + ランダムもう1つ
  if (triggerInfo.datetime?.holiday) {
    selectedModes.push('childlike')
    reason = `撮影日が${triggerInfo.datetime.holiday}のため、子ども風要素を追加`
  }
  
  // 5: 物体: 動物検出 → キャラ崩壊 + 子ども風
  else if (triggerInfo.objects?.some(obj => 
    obj.includes('動物') || obj.includes('犬') || obj.includes('猫') || 
    obj.includes('鳥') || obj.includes('ペット')
  )) {
    if (randomFactor > 0.5) {
      selectedModes.push('character-collapse', 'childlike')
      reason = '動物が検出されたため、キャラ崩壊と子ども風要素を組み合わせ'
    } else {
      selectedModes.push('fusion', 'character-collapse')
      reason = '動物が検出されたため、フュージョンとキャラ崩壊を組み合わせ'
    }
  }
  
  // 1: 位置(関西圏) → キャラ崩壊 or ボケ重視
  else if (triggerInfo.location?.region?.includes('関西')) {
    selectedModes.push('character-collapse')
    reason = '関西圏で撮影されたため、キャラ崩壊要素を追加'
  }
  
  // 4: 色味: 彩度高 → フュージョン / 暗色 → シュールパラレル
  else if (triggerInfo.colors?.saturation === 'high') {
    if (randomFactor > 0.6) {
      selectedModes.push('fusion', 'childlike')
      reason = '鮮やかな色味のため、フュージョンと子ども風を組み合わせ'
    } else {
      selectedModes.push('fusion')
      reason = '鮮やかな色味のため、フュージョン要素を追加'
    }
  }
  
  // 6: 天気: 雨 or 夜 → パラレル + キャラ崩壊 (ダーク)
  else if (triggerInfo.weather?.condition?.includes('雨') || 
           triggerInfo.weather?.condition?.includes('Rain') ||
           triggerInfo.datetime?.time && parseInt(triggerInfo.datetime.time.split(':')[0]) >= 18) {
    selectedModes.push('parallel', 'character-collapse')
    reason = '夜間または雨天のため、パラレルとキャラ崩壊を組み合わせ'
  }
  
  // 2: 位置(海外) → フュージョン or パラレル
  else if (triggerInfo.location?.country !== '日本') {
    selectedModes.push('fusion')
    reason = '海外で撮影されたため、フュージョン要素を追加'
  }
  
  // 完全ランダムケース（30%の確率）
  else if (randomFactor > 0.7) {
    const allModes = [...storyModes]
    const mode1 = allModes[Math.floor(Math.random() * allModes.length)]
    allModes.splice(allModes.indexOf(mode1), 1)
    const mode2 = allModes[Math.floor(Math.random() * allModes.length)]
    selectedModes.push(mode1, mode2)
    reason = '完全ランダム組み合わせで新しい発想を生成'
  }
  
  // まだ2つ選ばれていない場合は、ランダムで追加
  while (selectedModes.length < 2) {
    const availableModes = storyModes.filter(mode => !selectedModes.includes(mode))
    const randomMode = availableModes[Math.floor(Math.random() * availableModes.length)]
    selectedModes.push(randomMode)
  }
  
  // 2つを超えた場合は最初の2つを使用
  const finalModes = selectedModes.slice(0, 2)
  
  return {
    modeA: finalModes[0],
    modeB: finalModes[1],
    reason: reason || 'ランダムな組み合わせ'
  }
}

// Geminiプロンプトを生成
export const generatePrompt = (
  triggerInfo: TriggerInfo, 
  modes: StoryModes, 
  userName?: string, 
  userComment?: string
): string => {
  const modeDescriptions = {
    parallel: 'もしも昔話（パラレルワールド版）- 現代や異世界に昔話キャラクターが登場',
    fusion: '昔話合体（フュージョン）- 異なる昔話のキャラクターや要素が合体・融合',
    'character-collapse': 'キャラ崩壊 - 昔話キャラクターが予想外の行動や現代的な言動を取る',
    childlike: '子ども風ぶっ飛びストーリー - 子どもの自由な発想による予測不可能な展開'
  }
  
  // ランダム要素を追加
  const randomElements = [
    'SNS', 'YouTuber', 'AI', 'ドローン', 'VR', 'ゲーム', 'アニメ', 'コスプレ',
    'キャンプ', 'カフェ', '宇宙', 'タイムトラベル', 'ロボット', 'マンガ', 'アイドル',
    'eスポーツ', 'サブスク', 'メタバース', 'NFT', 'TikTok', 'インフルエンサー'
  ]
  
  const randomSituations = [
    '転生', '異世界召喚', '記憶喪失', '身体が入れ替わった', '時代錯誤',
    '突然の能力覚醒', 'バーチャル世界に閉じ込められた', '未来から来た',
    'パラレルワールドに迷い込んだ', '魔法が使えるようになった'
  ]
  
  const randomElement = randomElements[Math.floor(Math.random() * randomElements.length)]
  const randomSituation = randomSituations[Math.floor(Math.random() * randomSituations.length)]
  const uniqueId = Math.random().toString(36).substring(2, 8)
  
  // デバッグ: トリガー情報の詳細ログ
  console.log('🔍 物語生成プロンプト作成中...')
  console.log('📍 トリガー情報の詳細:')
  console.log('  - 位置情報:', triggerInfo.location)
  console.log('  - 日時情報:', triggerInfo.datetime)
  console.log('  - 天気情報:', triggerInfo.weather)
  console.log('  - 色情報:', triggerInfo.colors)
  console.log('  - 物体情報:', triggerInfo.objects)
  console.log('  - 組み合わせモード:', modes)
  console.log('  - ランダム要素:', randomElement)
  console.log('  - ランダム展開:', randomSituation)
  
  // 色情報を色名に変換
  const formatColors = (colors?: string[]): string => {
    if (!colors || colors.length === 0) return '不明'
    
    // カラーコードを色名に変換
    const colorNames = colors.map(color => {
      // カラーコードの場合は一般的な色名に変換
      if (color.startsWith('#')) {
        const colorMap: { [key: string]: string } = {
          '#FF0000': '赤',
          '#00FF00': '緑', 
          '#0000FF': '青',
          '#FFFF00': '黄色',
          '#FF00FF': 'マゼンタ',
          '#00FFFF': 'シアン',
          '#000000': '黒',
          '#FFFFFF': '白',
          '#FFA500': 'オレンジ',
          '#800080': '紫',
          '#FFC0CB': 'ピンク',
          '#A52A2A': '茶色',
          '#808080': 'グレー'
        }
        
        // 近似色判定のための簡易関数
        const hex = color.toUpperCase()
        
        // 赤系
        if (hex.includes('FF') && hex[1] === 'F') return '赤系'
        if (hex.includes('A1') || hex.includes('C5') || hex.includes('8B')) return '茶系'
        if (hex.includes('E2') || hex.includes('DE') || hex.includes('F5')) return 'ベージュ系'
        if (hex.includes('6B') || hex.includes('7A')) return 'グレー系'
        
        return colorMap[hex] || '暖色系'
      }
      return color
    })
    
    return colorNames.slice(0, 3).join('、')
  }

  const prompt = `<system>
あなたは爆笑昔話クリエイターです。写真から抽出された情報を基に、毎回違う超カオスで爆笑必至の昔話を創作してください。
必ず新しい発想で、前回とは全く違う物語を作成してください。
</system>

<user>
【物語ID】: ${uniqueId}
【ランダム要素】: ${randomElement}を物語に取り入れてください
【ランダム展開】: ${randomSituation}という状況を盛り込んでください

【トリガー情報】
- 撮影場所: ${triggerInfo.location?.region || '不明'}
- 撮影日時: ${triggerInfo.datetime?.date || '不明'} ${triggerInfo.datetime?.time || ''}
${triggerInfo.datetime?.holiday ? `- 特別な日: ${triggerInfo.datetime.holiday}` : ''}
- 天気: ${triggerInfo.weather?.description || '晴れ'}
- 主要色: ${formatColors(triggerInfo.colors?.dominant)}
- 検出された物体: ${triggerInfo.objects?.join(', ') || '人物, 建物'}

【組み合わせモード】
- モードA: ${modeDescriptions[modes.modeA]}
- モードB: ${modeDescriptions[modes.modeB]}
- 選択理由: ${modes.reason}

【キャラクター設定】
${userName ? `- 主人公名: ${userName}` : '- 主人公: 適当な名前をつけてください'}
${userComment ? `- ユーザーからの一言: "${userComment}"` : ''}

【要件】
1. 必ず${modeDescriptions[modes.modeA]}と${modeDescriptions[modes.modeB]}の特徴を盛り込んでください
2. 必ず【ランダム要素】と【ランダム展開】を物語に組み込んでください
3. 800〜1000文字程度、5段構成（起承転結+オチ）で構成してください
4. 子どもでも読めるが大人も笑える、家族で楽しめるテイストにしてください
5. 最後に必ず予想外のオチを入れてください
6. トリガー情報の要素を自然に物語に織り込んでください（色は「茶色い」「ベージュの」など自然な表現で）
7. 絵文字を適度に使って親しみやすさを演出してください
8. 毎回全く異なる昔話キャラクターを使ってください。
　日本の昔話（例：一寸法師、鶴の恩返し、かぐや姫、舌切り雀、猿蟹合戦、こぶとり爺、三年寝太郎、竹取物語など）、
　世界の童話・神話（グリム童話：赤ずきん、ヘンゼルとグレーテル、ラプンツェル、白雪姫、ブレーメンの音楽隊、アンデルセン童話：人魚姫、マッチ売りの少女、イソップ寓話：ウサギとカメ、北風と太陽、ギリシャ神話、アラビアンナイト、西遊記など）
　幅広い作品から自由に選んでください。桃太郎・浦島太郎・金太郎・花咲か爺さんばかり使わないこと。
9. 現代的な要素を必ず3つ以上含めてください
10. 登場人物の口調や性格を毎回変えて、新鮮味を演出してください

【禁止事項】
- 似たような展開やオチの使い回し
- 同じ昔話キャラクターの連続使用
- 平凡すぎる現代要素（スマホ、インターネットなど基本的なもの）
- カラーコード（#で始まる文字列）を物語本文に含めること
- 技術的な用語や数値を直接物語に書くこと

【創作指針】
- 予測不可能な組み合わせを心がける
- 現代の最新トレンドを積極的に取り入れる
- キャラクター同士の掛け合いを重視する
- 読者が「まさか！」と思うような展開を入れる

【出力形式】
タイトル: （キャッチーで面白いタイトル）

（物語本文）

【3行要約】
・（1行目の要約）
・（2行目の要約）  
・（3行目の要約）
</user>`

  return prompt
}

// 物語の種類ラベルを取得
export const getStoreModeLabel = (mode: StoryMode): string => {
  const labels = {
    parallel: 'もしも昔話',
    fusion: '昔話合体',
    'character-collapse': 'キャラ崩壊',
    childlike: '子ども風'
  }
  return labels[mode]
}

// 天気情報を取得（OpenWeather API）
export const getWeatherInfo = async (latitude: number, longitude: number) => {
  try {
    const weatherData = await weatherService.getWeatherByCoordinates(latitude, longitude)
    
    if (weatherData) {
      return {
        condition: weatherData.current.description,
        description: weatherData.current.description,
        temperature: weatherData.current.temperature,
        context: weatherService.generateStoryContext(weatherData)
      }
    }
    
    return null
  } catch (error) {
    console.warn('Weather API call failed:', error)
    return null
  }
}
