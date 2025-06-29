# OpenWeather API セットアップガイド

## OpenWeather API キーの取得方法

### 1. OpenWeatherMap アカウント作成
1. [OpenWeatherMap](https://openweathermap.org/api) にアクセス
2. 右上の「Sign Up」をクリック
3. メールアドレス、ユーザー名、パスワードを入力
4. アカウントを作成

### 2. API キーの取得
1. ログイン後、「API keys」タブをクリック
2. デフォルトのAPI キーが表示される（または「Generate」で新規作成）
3. API キーをコピー

### 3. 環境変数の設定
`.env` ファイルの `VITE_OPENWEATHER_API_KEY` に取得したキーを設定：

```bash
VITE_OPENWEATHER_API_KEY=your_actual_api_key_here
```

## OpenWeather API の特徴

### 料金プラン
- **Free Plan**: 1日1,000回まで無料
- **Starter Plan**: 月$40で10万回まで
- 個人プロジェクトなら Free Plan で十分

### 主な機能
- 現在の天気情報
- 5日間の天気予報
- 地理座標から天気取得
- 都市名から天気取得

### 使用目的
爆笑昔話ジェネレーターでは以下の用途で使用：
- 写真のEXIF位置情報から天気を取得
- 物語生成時に季節感・天候を反映
- 「雨の日なので、登場人物が屋内で...」のような展開

## API テスト方法

プロジェクトの `ApiTestButton.vue` にテストボタンが含まれています：
1. 開発サーバーを起動: `npm run dev`
2. ブラウザで http://localhost:5173 にアクセス
3. 「OpenWeather API テスト」ボタンをクリック
4. コンソールで結果を確認

## 注意事項

### セキュリティ
- API キーは `.env` ファイルに保存
- `.env` ファイルは Git にコミットしない
- 本番環境では環境変数で設定

### エラー対処
- API キーが無効: 正しいキーを再確認
- 401 Unauthorized: API キーの形式をチェック
- 429 Too Many Requests: 無料プランの制限に到達

### 代替案
OpenWeather API が利用できない場合：
- デフォルトの季節情報を使用
- EXIF の撮影日時から季節を推測
- 固定の天候パターンを使用

## 関連ファイル
- `src/utils/weather.ts` - 天気情報取得ロジック
- `src/utils/storyGeneration.ts` - 物語生成時の天気データ活用
- `src/components/ApiTestButton.vue` - API テスト機能
