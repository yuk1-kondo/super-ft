import ExifReader from 'exifreader'
import type { ExifData } from '../types'

export const extractExifData = async (file: File): Promise<ExifData> => {
  try {
    console.log('📷 EXIF抽出開始:', file.name, '(', file.size, 'bytes)')
    const arrayBuffer = await file.arrayBuffer()
    const tags = ExifReader.load(arrayBuffer)
    
    console.log('🔍 抽出されたEXIFタグ数:', Object.keys(tags).length)
    console.log('📍 GPS情報:')
    console.log('- GPSLatitude:', tags.GPSLatitude?.description)
    console.log('- GPSLongitude:', tags.GPSLongitude?.description)
    console.log('📅 日時情報:')
    console.log('- DateTime:', tags.DateTime?.description)
    console.log('- DateTimeOriginal:', tags.DateTimeOriginal?.description)
    
    const exifData: ExifData = {}
    
    // 位置情報の抽出
    if (tags.GPSLatitude && tags.GPSLongitude) {
      exifData.latitude = convertDMSToDD(
        tags.GPSLatitude.description || '', 
        tags.GPSLatitudeRef?.description || 'N'
      )
      exifData.longitude = convertDMSToDD(
        tags.GPSLongitude.description || '', 
        tags.GPSLongitudeRef?.description || 'E'
      )
      console.log('📍 変換後の座標:', exifData.latitude, exifData.longitude)
    } else {
      console.log('⚠️ GPS情報が見つかりません')
    }
    
    // 撮影日時の抽出
    if (tags.DateTime || tags.DateTimeOriginal) {
      const dateTimeTag = tags.DateTimeOriginal || tags.DateTime
      exifData.dateTime = dateTimeTag.description
      console.log('📅 撮影日時:', exifData.dateTime)
    } else {
      console.log('⚠️ 撮影日時が見つかりません')
    }
    
    // カメラ情報
    if (tags.Make) {
      exifData.make = tags.Make.description
    }
    
    if (tags.Model) {
      exifData.model = tags.Model.description
    }
    
    console.log('✅ EXIF抽出完了:', exifData)
    return exifData
  } catch (error) {
    console.warn('❌ EXIF data extraction failed:', error)
    return {}
  }
}

// DMS（度分秒）形式をDD（十進度）形式に変換
const convertDMSToDD = (dmsString: string, ref: string): number => {
  try {
    const dmsPattern = /(\d+)°\s*(\d+)'\s*([\d.]+)"/
    const match = dmsString.match(dmsPattern)
    
    if (!match) {
      // 既に十進度形式の場合
      const decimal = parseFloat(dmsString)
      return (ref === 'S' || ref === 'W') ? -decimal : decimal
    }
    
    const degrees = parseInt(match[1])
    const minutes = parseInt(match[2])
    const seconds = parseFloat(match[3])
    
    let decimal = degrees + (minutes / 60) + (seconds / 3600)
    
    // 南緯・西経の場合は負の値
    if (ref === 'S' || ref === 'W') {
      decimal = -decimal
    }
    
    return decimal
  } catch (error) {
    console.warn('DMS to DD conversion failed:', error)
    return 0
  }
}

// 位置情報から地域名を取得（簡易版）
export const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // 日本の主要地域の判定（簡易版）
    if (latitude >= 24 && latitude <= 46 && longitude >= 123 && longitude <= 146) {
      // 関西圏の判定
      if (latitude >= 34.0 && latitude <= 35.5 && longitude >= 135.0 && longitude <= 136.5) {
        return '関西圏'
      }
      // 関東圏の判定
      if (latitude >= 35.0 && latitude <= 36.5 && longitude >= 138.5 && longitude <= 140.5) {
        return '関東圏'
      }
      // その他の日本国内
      return '日本国内'
    }
    
    return '海外'
  } catch (error) {
    console.warn('Location name detection failed:', error)
    return '不明'
  }
}

// 撮影日が祝日かどうかを判定
export const getHolidayInfo = (dateString: string): string | undefined => {
  try {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    // 主要な祝日を簡易判定
    const holidays: Record<string, string> = {
      '1/1': '元日',
      '2/11': '建国記念の日',
      '3/21': '春分の日', // 近似値
      '4/29': '昭和の日',
      '5/3': '憲法記念日',
      '5/4': 'みどりの日',
      '5/5': 'こどもの日',
      '7/15': '海の日', // 近似値
      '8/11': '山の日',
      '9/23': '秋分の日', // 近似値
      '10/14': 'スポーツの日', // 近似値
      '11/3': '文化の日',
      '11/23': '勤労感謝の日',
      '12/25': 'クリスマス'
    }
    
    const key = `${month}/${day}`
    return holidays[key]
  } catch (error) {
    console.warn('Holiday detection failed:', error)
    return undefined
  }
}

// 画像の主要色を抽出（簡易版）
export const extractDominantColors = async (file: File): Promise<string[]> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // 画像をキャンバスに描画（小さくリサイズして処理速度向上）
      canvas.width = 100
      canvas.height = 100
      ctx?.drawImage(img, 0, 0, 100, 100)
      
      try {
        const imageData = ctx?.getImageData(0, 0, 100, 100)
        if (!imageData) {
          resolve(['#808080']) // デフォルト色
          return
        }
        
        const colors: Record<string, number> = {}
        
        // ピクセルごとに色をカウント
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i]
          const g = imageData.data[i + 1]
          const b = imageData.data[i + 2]
          
          // RGBを16進数に変換
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
          colors[hex] = (colors[hex] || 0) + 1
        }
        
        // 頻度順にソートして上位3色を返す
        const sortedColors = Object.entries(colors)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([color]) => color)
        
        resolve(sortedColors.length > 0 ? sortedColors : ['#808080'])
      } catch (error) {
        console.warn('Color extraction failed:', error)
        resolve(['#808080'])
      }
    }
    
    img.onerror = () => {
      resolve(['#808080'])
    }
    
    img.src = URL.createObjectURL(file)
  })
}
