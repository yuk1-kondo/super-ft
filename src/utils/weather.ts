import axios from 'axios'

interface WeatherData {
  location: {
    city: string
    country: string
  }
  current: {
    temperature: number
    description: string
    icon: string
    humidity: number
    windSpeed: number
  }
  forecast?: {
    date: string
    temperature: {
      min: number
      max: number
    }
    description: string
    icon: string
  }[]
}

interface OpenWeatherResponse {
  main: {
    temp: number
    humidity: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
  }
  name: string
  sys: {
    country: string
  }
}

class WeatherService {
  private apiKey: string
  private baseUrl = 'https://api.openweathermap.org/data/2.5'

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
    if (!this.apiKey || this.apiKey === 'your_openweather_api_key') {
      console.warn('OpenWeather API key not configured')
    }
  }

  /**
   * 座標から天気情報を取得
   */
  async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      if (!this.apiKey || this.apiKey === 'your_openweather_api_key') {
        console.warn('OpenWeather API key not configured')
        return null
      }

      const response = await axios.get<OpenWeatherResponse>(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=ja`
      )

      return this.formatWeatherData(response.data)
    } catch (error) {
      console.error('天気情報の取得に失敗しました:', error)
      return null
    }
  }

  /**
   * 都市名から天気情報を取得
   */
  async getWeatherByCity(city: string): Promise<WeatherData | null> {
    try {
      if (!this.apiKey || this.apiKey === 'your_openweather_api_key') {
        console.warn('OpenWeather API key not configured')
        return null
      }

      const response = await axios.get<OpenWeatherResponse>(
        `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=ja`
      )

      return this.formatWeatherData(response.data)
    } catch (error) {
      console.error('天気情報の取得に失敗しました:', error)
      return null
    }
  }

  /**
   * APIレスポンスを標準形式に変換
   */
  private formatWeatherData(data: OpenWeatherResponse): WeatherData {
    return {
      location: {
        city: data.name,
        country: data.sys.country
      },
      current: {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed
      }
    }
  }

  /**
   * 天気情報から物語生成用のコンテキストを作成
   */
  generateStoryContext(weather: WeatherData | null): string {
    if (!weather) {
      return '穏やかな晴れた日'
    }

    const { current, location } = weather
    const temp = current.temperature
    const desc = current.description

    let context = `${location.city}の`

    // 温度による表現
    if (temp < 0) {
      context += '氷点下の厳しい寒さで'
    } else if (temp < 10) {
      context += '肌寒い'
    } else if (temp < 20) {
      context += '涼しい'
    } else if (temp < 25) {
      context += '心地よい'
    } else if (temp < 30) {
      context += '暖かい'
    } else {
      context += '暑い'
    }

    // 天気による表現
    if (desc.includes('雨')) {
      context += '雨の日'
    } else if (desc.includes('雪')) {
      context += '雪の日'
    } else if (desc.includes('曇')) {
      context += '曇り空の日'
    } else if (desc.includes('晴')) {
      context += '晴れた日'
    } else {
      context += `${desc}の日`
    }

    return context
  }

  /**
   * API接続テスト
   */
  async testApi(): Promise<{success: boolean, message: string, data?: any}> {
    try {
      console.log('🌤️ OpenWeather API テスト開始...')
      console.log('API Key:', this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'なし')
      
      if (!this.apiKey || this.apiKey === 'your_openweather_api_key') {
        return {
          success: false,
          message: 'OpenWeather API キーが設定されていません。.env ファイルを確認してください。'
        }
      }

      // 東京の天気を取得してテスト
      console.log('東京の天気を取得中...')
      const url = `${this.baseUrl}/weather?q=Tokyo&appid=${this.apiKey}&units=metric&lang=ja`
      console.log('Request URL:', url.replace(this.apiKey, 'API_KEY'))
      
      const response = await axios.get<OpenWeatherResponse>(url)
      console.log('API Response:', response.data)
      
      const weather = this.formatWeatherData(response.data)
      
      return {
        success: true,
        message: 'OpenWeather API の接続に成功しました！',
        data: weather
      }
      
    } catch (error: any) {
      console.error('OpenWeather API エラー詳細:', error)
      
      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
        
        if (error.response.status === 401) {
          return {
            success: false,
            message: 'API キーが無効です。正しいキーを確認してください。'
          }
        } else if (error.response.status === 429) {
          return {
            success: false,
            message: 'API の利用制限に達しました。しばらく待ってから再試行してください。'
          }
        } else {
          return {
            success: false,
            message: `OpenWeather API エラー (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`
          }
        }
      } else {
        return {
          success: false,
          message: `ネットワークエラー: ${error.message}`
        }
      }
    }
  }
}

export const weatherService = new WeatherService()

/**
 * 天気情報から物語用のコンテキストを生成
 */
export const generateWeatherStoryContext = (weather: any, _region: string): string => {
  const temp = weather.temperature
  const desc = weather.description.toLowerCase()
  
  let context = ''
  
  // 温度による表現
  if (temp < 5) {
    context += '寒い'
  } else if (temp < 15) {
    context += '肌寒い'
  } else if (temp < 25) {
    context += '涼しい'
  } else if (temp < 30) {
    context += '暖かい'
  } else {
    context += '暑い'
  }

  // 天気による表現
  if (desc.includes('雨')) {
    context += '雨の日'
  } else if (desc.includes('雪')) {
    context += '雪の日'
  } else if (desc.includes('曇')) {
    context += '曇り空の日'
  } else if (desc.includes('晴')) {
    context += '晴れた日'
  } else {
    context += `${desc}の日`
  }

  return context
}

/**
 * 地域と日付からフォールバック天気を生成
 */
export const generateFallbackWeather = (region: string, _date?: string): any => {
  const weatherTypes = [
    { condition: 'sunny', temperature: 20, description: '晴れ' },
    { condition: 'cloudy', temperature: 18, description: '曇り' },
    { condition: 'rainy', temperature: 15, description: '雨' },
    { condition: 'partly-cloudy', temperature: 22, description: '曇りのち晴れ' }
  ]
  
  // ランダムに天気を選択
  const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)]
  
  // 地域による温度調整
  let tempAdjustment = 0
  if (region.includes('北海道') || region.includes('東北')) {
    tempAdjustment = -5
  } else if (region.includes('沖縄') || region.includes('九州')) {
    tempAdjustment = 5
  }
  
  return {
    condition: randomWeather.condition,
    temperature: randomWeather.temperature + tempAdjustment,
    description: randomWeather.description,
    context: generateWeatherStoryContext({
      temperature: randomWeather.temperature + tempAdjustment,
      description: randomWeather.description
    }, region)
  }
}

export type { WeatherData }
