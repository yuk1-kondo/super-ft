// 物語生成の4つの要素
export type StoryMode = 'parallel' | 'fusion' | 'character-collapse' | 'childlike'

// トリガー情報の型
export interface TriggerInfo {
  location?: {
    latitude: number
    longitude: number
    country: string
    region: string
  }
  datetime?: {
    date: string
    time: string
    holiday?: string
  }
  weather?: {
    condition: string
    temperature: number
    description: string
    context?: string
  }
  colors?: {
    dominant: string[]
    palette: string
    saturation: 'high' | 'medium' | 'low'
  }
  objects?: string[]
}

// 組み合わせルールの結果
export interface StoryModes {
  modeA: StoryMode
  modeB: StoryMode
  reason: string
}

// 生成された物語
export interface GeneratedStory {
  id: string
  title: string
  content: string
  summary: string
  modes: StoryModes
  triggerInfo: TriggerInfo
  userName?: string
  userComment?: string
  audioUrl?: string
  createdAt: Date
}

// EXIF情報
export interface ExifData {
  latitude?: number
  longitude?: number
  dateTime?: string
  make?: string
  model?: string
}

// Vision API結果
export interface VisionResult {
  labels: Array<{
    description: string
    score: number
  }>
  colors: Array<{
    color: {
      red: number
      green: number
      blue: number
    }
    score: number
    pixelFraction: number
  }>
}
