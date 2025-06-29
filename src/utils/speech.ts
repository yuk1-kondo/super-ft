// Web Speech API を使った音声合成機能
export class SpeechService {
  private synthesis: SpeechSynthesis
  private isSupported: boolean

  constructor() {
    this.synthesis = window.speechSynthesis
    this.isSupported = 'speechSynthesis' in window
  }

  /**
   * ブラウザが音声合成をサポートしているかチェック
   */
  isAvailable(): boolean {
    return this.isSupported
  }

  /**
   * 利用可能な音声一覧を取得
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices()
  }

  /**
   * 日本語の音声を取得
   */
  getJapaneseVoices(): SpeechSynthesisVoice[] {
    return this.getVoices().filter(voice => voice.lang.startsWith('ja'))
  }

  /**
   * テキストを音声で読み上げ
   */
  speak(text: string, options: {
    voice?: SpeechSynthesisVoice | null
    rate?: number
    pitch?: number
    volume?: number
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('音声合成がサポートされていません'))
        return
      }

      // 既存の音声を停止
      this.synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // 音声設定
      const japaneseVoices = this.getJapaneseVoices()
      utterance.voice = options.voice || japaneseVoices[0] || null
      utterance.rate = options.rate || 0.9 // 少しゆっくり
      utterance.pitch = options.pitch || 1.0
      utterance.volume = options.volume || 0.8

      // イベントリスナー
      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(new Error(`音声合成エラー: ${event.error}`))

      // 音声を開始
      this.synthesis.speak(utterance)
    })
  }

  /**
   * 音声を停止
   */
  stop(): void {
    this.synthesis.cancel()
  }

  /**
   * 音声を一時停止
   */
  pause(): void {
    this.synthesis.pause()
  }

  /**
   * 音声を再開
   */
  resume(): void {
    this.synthesis.resume()
  }

  /**
   * 現在話しているかチェック
   */
  isSpeaking(): boolean {
    return this.synthesis.speaking
  }

  /**
   * 物語用に最適化された音声読み上げ
   */
  async speakStory(story: string): Promise<void> {
    try {
      console.log('🔊 音声合成開始...')
      
      // 物語を段落に分割
      const paragraphs = story.split('\n').filter(p => p.trim().length > 0)
      
      for (const paragraph of paragraphs) {
        if (paragraph.trim()) {
          await this.speak(paragraph, {
            rate: 0.85, // ストーリー用にゆっくり
            pitch: 1.1, // 少し高めで親しみやすく
            volume: 0.9
          })
          
          // 段落間に少し間を空ける
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      console.log('✅ 音声合成完了')
    } catch (error) {
      console.error('❌ 音声合成エラー:', error)
      throw error
    }
  }
}

export const speechService = new SpeechService()
