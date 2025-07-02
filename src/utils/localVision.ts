// 課金なしでテストするための簡易画像解析

// カラーコードを自然な色名に変換
const hexToColorName = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  
  // HSL変換で色相を判定
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min
  const lightness = (max + min) / 2
  
  // 明度による判定
  if (lightness < 30) return '黒系'
  if (lightness > 225) return '白系'
  if (diff < 30) return 'グレー系'
  
  // 色相による判定
  let hue = 0
  if (diff !== 0) {
    if (max === r) {
      hue = ((g - b) / diff) % 6
    } else if (max === g) {
      hue = (b - r) / diff + 2
    } else {
      hue = (r - g) / diff + 4
    }
    hue *= 60
    if (hue < 0) hue += 360
  }
  
  // 彩度チェック
  const saturation = lightness > 0.5 ? diff / (2 - max - min) : diff / (max + min)
  
  if (saturation < 0.3) {
    return lightness > 150 ? 'ベージュ系' : '茶系'
  }
  
  // 色相による分類
  if (hue < 30 || hue >= 330) return '赤系'
  if (hue < 60) return 'オレンジ系' 
  if (hue < 90) return '黄色系'
  if (hue < 150) return '緑系'
  if (hue < 210) return '青系'
  if (hue < 270) return '紫系'
  if (hue < 330) return 'ピンク系'
  
  return '暖色系'
}

// Vision APIの代替：ブラウザベースの簡易画像解析
export const analyzeImageLocal = async (imageFile: File): Promise<{
  labels: string[]
  colors: string[]
}> => {
  try {
    // ファイル名やタイプから簡易的なラベルを推測
    const labels = getLabelsFromFile(imageFile)
    
    // Canvas APIで主要色を抽出
    const colors = await extractColorsFromImage(imageFile)
    
    return { labels, colors }
  } catch (error) {
    console.warn('ローカル画像解析エラー:', error)
    return { 
      labels: ['写真', '画像'], 
      colors: ['グレー系'] 
    }
  }
}

// ファイル情報から簡易的なラベルを推測
const getLabelsFromFile = (file: File): string[] => {
  const labels: string[] = []
  
  // ファイル名から推測
  const fileName = file.name.toLowerCase()
  
  if (fileName.includes('selfie') || fileName.includes('self')) {
    labels.push('人物', 'セルフィー')
  }
  
  if (fileName.includes('cat') || fileName.includes('ねこ')) {
    labels.push('動物', '猫')
  }
  
  if (fileName.includes('dog') || fileName.includes('犬')) {
    labels.push('動物', '犬')
  }
  
  if (fileName.includes('food') || fileName.includes('料理')) {
    labels.push('食べ物', '料理')
  }
  
  if (fileName.includes('landscape') || fileName.includes('風景')) {
    labels.push('風景', '自然')
  }
  
  // ランダムなデフォルトラベルを生成
  if (labels.length === 0) {
    const randomLabels = [
      ['人物', '笑顔', '友達'],
      ['建物', '街並み', '都市'],
      ['自然', '空', '雲'],
      ['動物', 'ペット', '可愛い'],
      ['食べ物', '美味しそう', 'カフェ'],
      ['乗り物', '旅行', '移動'],
      ['花', '植物', '緑'],
      ['海', '水', '青'],
      ['山', '景色', '高い'],
      ['夜', '光', '明るい']
    ]
    
    const randomSet = randomLabels[Math.floor(Math.random() * randomLabels.length)]
    labels.push(...randomSet)
  }
  
  return labels
}

// Canvas APIで画像から色を抽出
const extractColorsFromImage = async (file: File): Promise<string[]> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // 小さなサイズで処理して高速化
      canvas.width = 50
      canvas.height = 50
      ctx?.drawImage(img, 0, 0, 50, 50)
      
      try {
        const imageData = ctx?.getImageData(0, 0, 50, 50)
        if (!imageData) {
          resolve(['グレー系'])
          return
        }
        
        const colorCounts: Record<string, number> = {}
        
        // ピクセルごとに色をカウント（サンプリング）
        for (let i = 0; i < imageData.data.length; i += 16) { // 4ピクセルおきにサンプリング
          const r = imageData.data[i]
          const g = imageData.data[i + 1]
          const b = imageData.data[i + 2]
          
          // 色を簡略化（8段階）
          const simplifiedR = Math.round(r / 32) * 32
          const simplifiedG = Math.round(g / 32) * 32
          const simplifiedB = Math.round(b / 32) * 32
          
          const hex = `#${((1 << 24) + (simplifiedR << 16) + (simplifiedG << 8) + simplifiedB).toString(16).slice(1)}`
          colorCounts[hex] = (colorCounts[hex] || 0) + 1
        }
        
        // 上位3色を取得して色名に変換
        const topColors = Object.entries(colorCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([color]) => hexToColorName(color))
        
        resolve(topColors.length > 0 ? topColors : ['グレー系'])
      } catch (error) {
        console.warn('色抽出エラー:', error)
        resolve(['グレー系'])
      }
    }
    
    img.onerror = () => resolve(['グレー系'])
    img.src = URL.createObjectURL(file)
  })
}

// EXIF情報から時間帯を判定
export const getTimeOfDay = (dateTime?: string): 'morning' | 'afternoon' | 'evening' | 'night' => {
  if (!dateTime) return 'afternoon'
  
  try {
    const time = dateTime.split(' ')[1] || dateTime
    const hour = parseInt(time.split(':')[0])
    
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 18) return 'afternoon'
    if (hour >= 18 && hour < 22) return 'evening'
    return 'night'
  } catch {
    return 'afternoon'
  }
}

// 彩度レベルを判定
export const getSaturationLevel = (colors: string[]): 'high' | 'medium' | 'low' => {
  if (colors.length === 0) return 'medium'
  
  let totalSaturation = 0
  
  colors.forEach(color => {
    const r = parseInt(color.substr(1, 2), 16)
    const g = parseInt(color.substr(3, 2), 16)
    const b = parseInt(color.substr(5, 2), 16)
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max
    totalSaturation += saturation
  })
  
  const avgSaturation = totalSaturation / colors.length
  
  if (avgSaturation > 0.6) return 'high'
  if (avgSaturation > 0.3) return 'medium'
  return 'low'
}
