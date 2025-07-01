import type { TriggerInfo, StoryModes, StoryMode } from '../types'
import { weatherService } from './weather'
import { generateSimpleText } from './gemini'

// ==========================================
// 🎭 ジャンル別テンプレート定義
// ==========================================

interface GenreTemplate {
  name: string
  description: string
  elements: string[]
  situations: string[]
  tones: string[]
  endings: string[]
}

const genreTemplates: { [key: string]: GenreTemplate } = {
  comedy: {
    name: 'コメディ',
    description: '笑いと愉快さを重視した軽快な物語',
    elements: ['どたばた', 'ツッコミ', 'ボケ', 'すれ違いコメディ', 'パロディ', 'ギャグ', '勘違い'],
    situations: ['勘違いから始まる騒動', '身分違いのコメディ', 'ライバル同士の協力', '予想外の才能発覚'],
    tones: ['軽快', 'ユーモラス', '愉快', 'ほんわか', 'にぎやか'],
    endings: ['みんなで大笑い', 'ハッピーエンド', '意外な友情', '勘違い解決']
  },
  adventure: {
    name: 'アドベンチャー',
    description: '冒険と探索に満ちたスリリングな物語',
    elements: ['秘宝探し', '未知の世界', '危険な旅', '謎解き', '仲間との絆', '試練'],
    situations: ['古い地図を発見', '伝説の場所への旅', '仲間を救う冒険', '失われた記憶を求めて'],
    tones: ['スリリング', 'ワクワク', 'ドキドキ', 'エキサイティング'],
    endings: ['大冒険の成功', '新たな発見', '絆の深まり', '成長の証明']
  },
  fantasy: {
    name: 'ファンタジー',
    description: '魔法と不思議に満ちた幻想的な物語',
    elements: ['魔法', '妖精', 'ドラゴン', '魔法の道具', '異世界', '呪文', '魔法学校'],
    situations: ['魔法の力に目覚める', '異世界への召喚', '魔法の道具を発見', '妖精との出会い'],
    tones: ['幻想的', '神秘的', 'ロマンチック', 'エレガント'],
    endings: ['魔法による解決', '真の力の発見', '世界の平和', '愛の勝利']
  },
  scifi: {
    name: 'SF',
    description: '科学技術と未来的要素が中心の物語',
    elements: ['AI', 'ロボット', 'タイムマシン', '宇宙船', 'バーチャル世界', 'サイボーグ'],
    situations: ['未来への時間旅行', 'AIとの友情', '宇宙探索', 'バーチャル世界に閉じ込められる'],
    tones: ['未来的', 'ハイテク', 'クール', 'イノベーティブ'],
    endings: ['科学の勝利', '技術による解決', '未来への希望', '人工知能との共存']
  },
  romance: {
    name: 'ロマンス',
    description: '恋愛と心の交流を描いた温かい物語',
    elements: ['運命の出会い', '恋の駆け引き', 'プロポーズ', 'デート', '恋のライバル', '結婚式'],
    situations: ['偶然の出会い', '恋の三角関係', '遠距離恋愛', '結婚への道のり'],
    tones: ['ロマンチック', 'スイート', '温かい', 'ときめき'],
    endings: ['ハッピーエンド', '永遠の愛', '結ばれる運命', '愛の成就']
  },
  mystery: {
    name: 'ミステリー',
    description: '謎解きとサスペンスが魅力的な物語',
    elements: ['謎', '推理', '手がかり', '犯人', '探偵', '事件', '真相'],
    situations: ['不可解な事件発生', '失踪事件の調査', '古い謎の解明', '意外な犯人'],
    tones: ['ミステリアス', 'サスペンスフル', 'スリリング', '知的'],
    endings: ['真相解明', '意外な犯人', '謎の解決', '正義の勝利']
  }
}

// ==========================================
// 🌸 季節性強化システム
// ==========================================

interface SeasonalElements {
  name: string
  themes: string[]
  events: string[]
  foods: string[]
  nature: string[]
  emotions: string[]
  activities: string[]
}

const seasonalElements: { [key: string]: SeasonalElements } = {
  spring: {
    name: '春',
    themes: ['新生活', '出会い', '希望', '成長', 'フレッシュ'],
    events: ['入学式', '花見', '新学期', '就職', '引っ越し', 'ゴールデンウィーク'],
    foods: ['桜餅', 'いちご', '竹の子', '菜の花', '春キャベツ'],
    nature: ['桜', '菜の花', 'つくし', 'チューリップ', '若葉', '蝶々', 'ウグイス'],
    emotions: ['希望', 'ワクワク', '恋心', '新鮮', 'ドキドキ'],
    activities: ['花見', 'ピクニック', 'ハイキング', '散歩', 'ガーデニング']
  },
  summer: {
    name: '夏',
    themes: ['青春', '冒険', '情熱', '開放感', 'エネルギッシュ'],
    events: ['夏祭り', '花火大会', 'お盆', '夏休み', '海水浴', 'キャンプ'],
    foods: ['かき氷', 'スイカ', 'そうめん', '冷やし中華', 'アイスクリーム'],
    nature: ['ひまわり', 'セミ', '入道雲', '海', '山', '星空', '朝顔'],
    emotions: ['情熱', '開放感', 'アクティブ', '爽快', '熱気'],
    activities: ['海水浴', 'バーベキュー', '夏祭り', '花火', 'キャンプ', '登山']
  },
  autumn: {
    name: '秋',
    themes: ['実り', '感謝', '落ち着き', '豊穣', '哲学的'],
    events: ['紅葉狩り', '収穫祭', '運動会', '文化祭', 'ハロウィン'],
    foods: ['栗', '柿', 'さんま', 'さつまいも', '新米', 'きのこ'],
    nature: ['紅葉', 'イチョウ', 'コスモス', 'とんぼ', '稲穂', '月'],
    emotions: ['落ち着き', '感慨深い', 'ノスタルジック', '豊か', '温かい'],
    activities: ['紅葉狩り', '読書', '芸術鑑賞', 'スポーツ', '収穫体験']
  },
  winter: {
    name: '冬',
    themes: ['静寂', '家族', '温かさ', '反省', '新年への準備'],
    events: ['クリスマス', '年末年始', '初詣', '節分', 'バレンタイン'],
    foods: ['鍋料理', 'おでん', 'みかん', 'お正月料理', 'ココア'],
    nature: ['雪', '氷', '椿', '水仙', 'イルミネーション', '星座'],
    emotions: ['温かさ', '家族愛', '静寂', '希望', '感謝'],
    activities: ['スキー', 'スノボ', 'こたつ', '温泉', '年末大掃除']
  }
}

// ==========================================
// 🌏 地域性強化システム  
// ==========================================

interface RegionalElements {
  name: string
  culture: string[]
  landmarks: string[]
  foods: string[]
  dialects: string[]
  traditions: string[]
  festivals: string[]
}

const regionalElements: { [key: string]: RegionalElements } = {
  hokkaido: {
    name: '北海道',
    culture: ['開拓精神', '自然愛', '大らかさ'],
    landmarks: ['札幌時計台', '函館夜景', '知床', '富良野', '小樽運河'],
    foods: ['ジンギスカン', '海鮮丼', 'スープカレー', 'ラーメン', 'じゃがいも'],
    dialects: ['だべ', 'しばれる', 'なまら', 'わや'],
    traditions: ['雪まつり', 'アイヌ文化', '開拓史'],
    festivals: ['さっぽろ雪まつり', 'よさこいソーラン']
  },
  kansai: {
    name: '関西',
    culture: ['お笑い文化', '商人気質', 'ノリの良さ', 'ツッコミ'],
    landmarks: ['大阪城', '清水寺', '金閣寺', '通天閣', 'USJ'],
    foods: ['たこ焼き', 'お好み焼き', '串カツ', '関西うどん', '551の豚まん'],
    dialects: ['なんでやねん', 'ほんま', 'めっちゃ', 'あかん', 'おおきに'],
    traditions: ['漫才', '落語', '歌舞伎', '商人文化'],
    festivals: ['天神祭', '岸和田だんじり祭']
  },
  kyushu: {
    name: '九州',
    culture: ['情熱的', '男気', '温泉文化', '焼酎文化'],
    landmarks: ['阿蘇山', '桜島', '太宰府', '長崎平和公園'],
    foods: ['ラーメン', 'もつ鍋', '辛子明太子', '薩摩芋', '焼酎'],
    dialects: ['ばい', 'たい', 'そげん', 'よか'],
    traditions: ['焼き物', '温泉', '祭り'],
    festivals: ['博多祇園山笠', '阿波踊り']
  },
  okinawa: {
    name: '沖縄',
    culture: ['ゆいまーる', 'のんびり', '音楽愛', '長寿'],
    landmarks: ['首里城', '美ら海水族館', '石垣島', '宮古島'],
    foods: ['ゴーヤチャンプルー', '沖縄そば', 'ちんすこう', '泡盛'],
    dialects: ['はいさい', 'ちゅらさん', 'なんくるないさ'],
    traditions: ['琉球文化', '三線', 'エイサー'],
    festivals: ['エイサー祭り', '那覇ハーリー']
  }
}

// ==========================================
// 🤖 動的要素生成システム
// ==========================================

// Gemini APIを使用した動的要素生成
const generateDynamicElements = async (type: 'genre' | 'seasonal' | 'regional', context: TriggerInfo): Promise<string[]> => {
  try {
    const location = context.location?.region || '不明'
    const season = getCurrentSeason(context.datetime?.date)
    const weather = context.weather?.description || '晴れ'
    const objects = context.objects?.join(', ') || ''
    
    let prompt = ''
    
    switch (type) {
      case 'genre':
        prompt = `以下の情報から最適なジャンル要素を5個提案してください。場所:${location}, 季節:${season}, 天気:${weather}, 物体:${objects}。コメディ、アドベンチャー、ファンタジー、SF、ロマンス、ミステリーのいずれかに適した要素をカンマ区切りで。`
        break
      case 'seasonal':
        prompt = `季節:${season}、場所:${location}、天気:${weather}に基づいて、季節感あふれる要素を5個提案してください。その季節特有のイベント、食べ物、自然現象、感情を含めてカンマ区切りで。`
        break
      case 'regional':
        prompt = `地域:${location}の文化的特徴、方言、名物、祭りなど地域らしい要素を5個提案してください。その地域の個性を表現する要素をカンマ区切りで。`
        break
    }
    
    const response = await generateSimpleText(prompt)
    const elements = response.split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 5)
    
    console.log(`🎨 動的生成された${type}要素:`, elements)
    return elements
    
  } catch (error) {
    console.warn(`動的要素生成エラー (${type}):`, error)
    return []
  }
}

// 現在の季節を判定
const getCurrentSeason = (dateString?: string): string => {
  if (!dateString) return '春'
  
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'  
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

// ジャンルを動的選択
const selectOptimalGenre = (triggerInfo: TriggerInfo): string => {
  const time = triggerInfo.datetime?.time
  const weather = triggerInfo.weather?.condition
  const objects = triggerInfo.objects || []
  const colors = triggerInfo.colors?.dominant || []
  
  // 時間帯による判定
  if (time) {
    const hour = parseInt(time.split(':')[0])
    if (hour >= 18 || hour <= 6) {
      return Math.random() > 0.5 ? 'mystery' : 'fantasy'
    }
  }
  
  // 天気による判定
  if (weather?.includes('雨') || weather?.includes('曇り')) {
    return Math.random() > 0.5 ? 'mystery' : 'romance'
  }
  
  // 物体による判定
  if (objects.some(obj => obj.includes('動物') || obj.includes('ペット'))) {
    return 'comedy'
  }
  
  if (objects.some(obj => obj.includes('建物') || obj.includes('風景'))) {
    return 'adventure'
  }
  
  // 色による判定
  if (colors.some(color => color.includes('赤') || color.includes('オレンジ'))) {
    return 'adventure'
  }
  
  if (colors.some(color => color.includes('青') || color.includes('紫'))) {
    return 'fantasy'
  }
  
  // デフォルトはランダム選択
  const genres = Object.keys(genreTemplates)
  return genres[Math.floor(Math.random() * genres.length)]
}

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

// Geminiプロンプトを生成（非同期に変更）
export const generatePrompt = async (
  triggerInfo: TriggerInfo, 
  modes: StoryModes, 
  userName?: string, 
  userComment?: string
): Promise<string> => {
  const modeDescriptions = {
    parallel: 'もしも昔話（パラレルワールド版）- 現代や異世界に昔話キャラクターが登場',
    fusion: '昔話合体（フュージョン）- 異なる昔話のキャラクターや要素が合体・融合',
    'character-collapse': 'キャラ崩壊 - 昔話キャラクターが予想外の行動や現代的な言動を取る',
    childlike: '子ども風ぶっ飛びストーリー - 子どもの自由な発想による予測不可能な展開'
  }
  
  // 🎭 動的ジャンル選択と要素生成
  const selectedGenre = selectOptimalGenre(triggerInfo)
  const genreTemplate = genreTemplates[selectedGenre]
  const dynamicGenreElements = await generateDynamicElements('genre', triggerInfo)
  
  // 🌸 季節性要素の生成
  const currentSeason = getCurrentSeason(triggerInfo.datetime?.date)
  const seasonalTemplate = seasonalElements[currentSeason]
  const dynamicSeasonalElements = await generateDynamicElements('seasonal', triggerInfo)
  
  // 🌏 地域性要素の生成
  const region = triggerInfo.location?.region || '日本'
  const regionKey = getRegionKey(region)
  const regionalTemplate = regionalElements[regionKey]
  const dynamicRegionalElements = await generateDynamicElements('regional', triggerInfo)
  
  // 基本ランダム要素の拡張
  const baseModernElements = [
    'SNS', 'YouTuber', 'AI', 'VR', 'ゲーム', 'アニメ', 'コスプレ',
    'キャンプ', 'カフェ', '宇宙', 'タイムトラベル', 'ロボット', 'マンガ', 'アイドル',
    'eスポーツ', 'サブスク', 'メタバース', 'NFT', 'TikTok', 'インフルエンサー',
    'ドローン配達', 'バーチャルアイドル', 'AR体験', '量子コンピュータ', 'サステナブル'
  ]
  
  const modernElements = [...baseModernElements, ...dynamicGenreElements]
  
  // ランダム要素の選択（より多様化）
  const randomElement = modernElements[Math.floor(Math.random() * modernElements.length)]
  const genreElement = genreTemplate.elements[Math.floor(Math.random() * genreTemplate.elements.length)]
  const seasonalElement = seasonalTemplate?.themes[Math.floor(Math.random() * (seasonalTemplate?.themes.length || 1))] || '季節感'
  const regionalElement = regionalTemplate?.culture[Math.floor(Math.random() * (regionalTemplate?.culture.length || 1))] || '地域色'
  
  // ランダム展開の拡張
  const baseRandomSituations = [
    '転生', '異世界召喚', '記憶喪失', '身体が入れ替わった', '時代錯誤',
    '突然の能力覚醒', 'バーチャル世界に閉じ込められた', '未来から来た',
    'パラレルワールドに迷い込んだ', '魔法が使えるようになった'
  ]
  
  const genreSituations = genreTemplate.situations
  const allSituations = [...baseRandomSituations, ...genreSituations]
  const randomSituation = allSituations[Math.floor(Math.random() * allSituations.length)]
  
  const uniqueId = Math.random().toString(36).substring(2, 8)
  
  // デバッグ: 生成された要素の詳細ログ
  console.log('🎭 選択されたジャンル:', selectedGenre, genreTemplate.name)
  console.log('🌸 現在の季節:', currentSeason, seasonalTemplate?.name)
  console.log('🌏 地域:', region, regionalTemplate?.name)
  console.log('🎨 動的要素:')
  console.log('  - ジャンル要素:', dynamicGenreElements)
  console.log('  - 季節要素:', dynamicSeasonalElements)
  console.log('  - 地域要素:', dynamicRegionalElements)
  console.log('  - 選択要素:', { randomElement, genreElement, seasonalElement, regionalElement })
  
  // 色情報を色名に変換
  const formatColors = (colors?: string[]): string => {
    if (!colors || colors.length === 0) return '不明'
    
    const colorNames = colors.map(color => {
      if (color.startsWith('#')) {
        const colorMap: { [key: string]: string } = {
          '#FF0000': '赤', '#00FF00': '緑', '#0000FF': '青', '#FFFF00': '黄色',
          '#FF00FF': 'マゼンタ', '#00FFFF': 'シアン', '#000000': '黒', '#FFFFFF': '白',
          '#FFA500': 'オレンジ', '#800080': '紫', '#FFC0CB': 'ピンク', 
          '#A52A2A': '茶色', '#808080': 'グレー'
        }
        
        const hex = color.toUpperCase()
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
今回は【${genreTemplate.name}】ジャンルで、【${seasonalTemplate?.name || '四季'}】の季節感と【${regionalTemplate?.name || region}】の地域性を活かした物語を作成してください。
</system>

<user>
【物語ID】: ${uniqueId}
【ジャンル】: ${genreTemplate.name} - ${genreTemplate.description}
【ジャンル要素】: ${genreElement}を中心に、${genreTemplate.tones.join('、')}な雰囲気で
【季節テーマ】: ${seasonalElement}（${seasonalTemplate?.name || '四季'}の特色）
【地域性】: ${regionalElement}（${regionalTemplate?.name || region}らしさ）
【現代要素】: ${randomElement}を物語に取り入れてください
【展開パターン】: ${randomSituation}という状況を盛り込んでください

【動的生成要素】
- ジャンル特化要素: ${dynamicGenreElements.length > 0 ? dynamicGenreElements.join('、') : '基本要素'}
- 季節限定要素: ${dynamicSeasonalElements.length > 0 ? dynamicSeasonalElements.join('、') : '季節感'}
- 地域文化要素: ${dynamicRegionalElements.length > 0 ? dynamicRegionalElements.join('、') : '地域色'}

【トリガー情報】
- 撮影場所: ${triggerInfo.location?.region || '不明'}（${triggerInfo.location?.country || '日本'}）
- 撮影日時: ${triggerInfo.datetime?.date || '不明'} ${triggerInfo.datetime?.time || ''}
${triggerInfo.datetime?.holiday ? `- 特別な日: ${triggerInfo.datetime.holiday}` : ''}
- 天気: ${triggerInfo.weather?.description || '晴れ'}
- 主要色: ${formatColors(triggerInfo.colors?.dominant)}
- 検出された物体: ${triggerInfo.objects?.join(', ') || '人物, 建物'}

【物語モード】
- モードA: ${modeDescriptions[modes.modeA]}
- モードB: ${modeDescriptions[modes.modeB]}
- 選択理由: ${modes.reason}

【キャラクター設定】
${userName ? `- 主人公名: ${userName}` : '- 主人公: 適当な名前をつけてください'}
${userComment ? `- ユーザーからの一言: "${userComment}"` : ''}

【創作要件】
1. 【ジャンル】の特徴を活かし、${genreTemplate.name}らしい${genreTemplate.tones.join('・')}な雰囲気を演出
2. 【季節テーマ】を活用し、${seasonalTemplate?.name || '季節'}の風物詩や行事を自然に組み込む
3. 【地域性】を表現し、${regionalTemplate?.name || region}の文化や方言、名物を盛り込む
4. 必ず${modeDescriptions[modes.modeA]}と${modeDescriptions[modes.modeB]}の特徴を融合
5. 【現代要素】と【展開パターン】を巧妙に織り込む
6. 800〜1200文字程度、5段構成（起承転結+オチ）で構成
7. ${genreTemplate.endings.join('または')}的な結末を目指す
8. 毎回異なる昔話キャラクターを使用（推奨：一寸法師、鶴の恩返し、かぐや姫、舌切り雀、猿蟹合戦、赤ずきん、ヘンゼルとグレーテル、アラジン、孫悟空、イカロスなど）
9. トリガー情報の要素を自然に物語に織り込む
10. 絵文字を適度に使用して親しみやすさを演出

【季節限定要素】（適用可能な場合）
${seasonalTemplate ? `
- 自然: ${seasonalTemplate.nature.join('、')}
- イベント: ${seasonalTemplate.events.join('、')}
- 食べ物: ${seasonalTemplate.foods.join('、')}
- 感情: ${seasonalTemplate.emotions.join('、')}
- 活動: ${seasonalTemplate.activities.join('、')}
` : ''}

【地域文化要素】（適用可能な場合）
${regionalTemplate ? `
- 文化: ${regionalTemplate.culture.join('、')}
- 名所: ${regionalTemplate.landmarks.join('、')}
- 名物: ${regionalTemplate.foods.join('、')}
- 方言: ${regionalTemplate.dialects.join('、')}
- 祭り: ${regionalTemplate.festivals.join('、')}
` : ''}

【厳禁事項】
- 桃太郎、浦島太郎、金太郎、花咲か爺さんの過度使用
- 似たような展開やオチの使い回し
- ジャンルや季節、地域性を無視した展開
- 技術的用語や数値の直接記載
- カラーコード（#）の使用

【出力形式】
タイトル: （${genreTemplate.name}らしく${seasonalTemplate?.name || '季節'}感あふれるキャッチーなタイトル）

（物語本文）

【3行要約】
・（${genreTemplate.name}的な1行目の要約）
・（季節・地域性を含む2行目の要約）  
・（オチを含む3行目の要約）

【物語の特徴】
・ジャンル: ${genreTemplate.name}
・季節: ${seasonalTemplate?.name || '四季'}
・地域: ${regionalTemplate?.name || region}
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

// 地域キーを判定する関数
const getRegionKey = (region: string): string => {
  const regionMappings: { [key: string]: string } = {
    '北海道': 'hokkaido',
    '札幌': 'hokkaido',
    '函館': 'hokkaido',
    '旭川': 'hokkaido',
    '大阪': 'kansai',
    '京都': 'kansai', 
    '神戸': 'kansai',
    '奈良': 'kansai',
    '和歌山': 'kansai',
    '兵庫': 'kansai',
    '滋賀': 'kansai',
    '関西': 'kansai',
    '福岡': 'kyushu',
    '熊本': 'kyushu',
    '鹿児島': 'kyushu',
    '長崎': 'kyushu',
    '大分': 'kyushu',
    '宮崎': 'kyushu',
    '佐賀': 'kyushu',
    '九州': 'kyushu',
    '沖縄': 'okinawa',
    '那覇': 'okinawa',
    '石垣': 'okinawa',
    '宮古': 'okinawa'
  }
  
  // 部分マッチング検索
  for (const [key, value] of Object.entries(regionMappings)) {
    if (region.includes(key)) {
      return value
    }
  }
  
  // デフォルトは汎用的な地域性
  return 'general'
}
