# 🎭 爆笑昔話ジェネレーター

写真から爆笑必至・超カオスな昔話を自動生成するWebサービスです！

## ✨ 特徴

- 📸 **写真アップロード**: ドラッグ&ドロップまたはカメラで簡単撮影
- 🎯 **トリガー抽出**: EXIF情報、色味、物体検出で物語の要素を決定
- 🤖 **AI物語生成**: Gemini APIで毎回違う爆笑昔話を生成
- 🎨 **4つの要素**: もしも昔話・昔話合体・キャラ崩壊・子ども風の組み合わせ
- 🔊 **音声読み上げ**: Text-to-Speech APIで朗読音声を生成
- 📱 **シェア機能**: SNS投稿・リンク共有・QR共有
- 📖 **履歴保存**: Firestoreで過去の物語をクラウド保存・同期
- 🌐 **多言語対応**: Vision APIラベルの日本語化
- 🔒 **ユーザー認証**: Google認証でアカウント管理

## 🛠️ 技術スタック

- **フロントエンド**: Vue.js 3, TypeScript, TailwindCSS
- **バックエンド**: Firebase (Functions, Firestore, Storage)
- **AI/API**: 
  - Google Gemini API (物語生成)
  - Google Cloud Vision API (画像解析)
  - Text-to-Speech API (音声合成)
  - OpenWeather API (天気情報)

## 🚀 セットアップ

### 1. リポジトリのクローン

\`\`\`bash
git clone https://github.com/yuk1-kondo/super-ft.git
cd super-ft
\`\`\`

### 2. 依存関係のインストール

\`\`\`bash
npm install
\`\`\`

### 3. 環境変数の設定

\`.env.example\`を\`.env\`にコピーして、各APIキーを設定：

\`\`\`bash
cp .env.example .env
\`\`\`

必要なAPIキー：
- Firebase設定（プロジェクト作成後）
- Google Gemini API Key
- Google Cloud Vision API Key
- OpenWeather API Key（オプション）

### 4. 開発サーバーの起動

\`\`\`bash
npm run dev
\`\`\`

ブラウザで \`http://localhost:3000\` にアクセス

## 📋 API設定方法

### Firebase設定
1. [Firebase Console](https://console.firebase.google.com/) でプロジェクト作成
2. Authentication, Firestore, Storage, Functions を有効化
3. 設定から API キーを取得

### Gemini API
1. [Google AI Studio](https://aistudio.google.com/) でAPIキー取得
2. \`.env\`に\`VITE_GEMINI_API_KEY\`として設定

### Google Cloud Vision API
1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. Vision API を有効化
3. APIキーを作成して\`.env\`に設定

### OpenWeather API（オプション）
1. [OpenWeatherMap](https://openweathermap.org/api) でアカウント作成
2. 無料プランでAPIキー取得

## 🏗️ プロジェクト構造

\`\`\`
src/
├── components/          # Vue コンポーネント
├── views/              # ページコンポーネント
│   ├── Home.vue        # メインページ
│   ├── Processing.vue  # 処理中画面
│   ├── Result.vue      # 結果表示
│   └── History.vue     # 履歴画面
├── stores/             # Pinia ストア
├── utils/              # ユーティリティ関数
│   ├── firebase.ts     # Firebase設定
│   ├── gemini.ts       # Gemini API
│   ├── exif.ts         # EXIF解析
│   └── storyGeneration.ts # 物語生成ロジック
├── types/              # TypeScript型定義
└── App.vue             # ルートコンポーネント
\`\`\`

## 🎮 使い方

1. **写真アップロード**: メインページで写真を選択
2. **オプション設定**: 名前やコメントを入力（任意）
3. **生成開始**: 「爆笑昔話を生成」ボタンをクリック
4. **処理待ち**: AI が画像解析・物語生成を実行
5. **結果確認**: 生成された物語を読んで楽しむ
6. **シェア**: SNS でシェアしたり音声で聞いたり

## 🔄 デプロイ

### Firebase Hosting

\`\`\`bash
# ビルド
npm run build

# Firebase にデプロイ
npm run deploy
\`\`\`

## 🤝 コントリビューション

1. フォークしてブランチ作成
2. 機能開発・バグ修正
3. テスト実行
4. プルリクエスト作成

## 📄 ライセンス

MIT License

## 👨‍💻 作成者

- **Yuki Kondo** - プロジェクトオーナー
- **ChatGPT (o3)** - 設計・開発支援

---

**楽しい物語をお楽しみください！** 🎉

## 📈 開発履歴・最新状況

### ✅ 実装済み機能
- **基本機能**: 写真アップロード、EXIF解析、物体検出、AI物語生成、音声合成
- **認証システム**: Google認証、Firebase Authentication
- **履歴管理**: Firestoreでの物語履歴保存・取得・削除
- **ユーザビリティ改善**: 
  - Vision APIラベルの日本語化
  - Gemini応答からプロンプト承諾文の自動除去
  - GPS/日時情報がない場合のブラウザ位置情報API活用
  - エラーハンドリング・ローディング表示の強化
- **プロンプト改善**: 
  - ジャンル別テンプレート（もしも昔話、昔話合体、キャラ崩壊、子ども風）
  - 季節・地域性の動的要素生成
  - キャラクター偏り防止・禁止事項明示
- **UI/UX**: TailwindCSSでレスポンシブデザイン、モーダル・フォーム最適化
- **デプロイ**: Firebase Hostingで本番環境運用中

### 🔧 技術的改善
- Null安全性の徹底、TypeScript型定義の強化
- Piniaストアでの状態管理統一
- Vision API・Gemini API・Firestore・EXIF解析の安定化
- 不要なコード・テスト用ファイルの削除
- ビルド・デプロイプロセスの自動化

### 📊 API統合状況
- **Google Gemini 2.5 Pro**: 物語生成 ✅
- **Firebase Firestore**: ユーザーデータ・履歴保存 ✅
- **Google Cloud Vision API**: 画像解析・物体検出 ✅
- **OpenWeather API**: 天気情報取得 ✅
- **Web Speech API**: 音声合成 ✅

### 🚀 デプロイ状況
- **本番環境**: Firebase Hosting稼働中
- **最終デプロイ**: 2024年最新版（履歴機能・多言語化・認証完備）
