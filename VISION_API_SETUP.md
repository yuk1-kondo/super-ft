# Google Cloud Vision API 設定ガイド

## 🎯 手順概要

1. Google Cloud Console にアクセス
2. プロジェクトを選択/作成
3. Cloud Vision API を有効化
4. APIキーを作成
5. セキュリティ設定
6. APIキーをテスト

## 📋 詳細手順

### 1. Google Cloud Console にアクセス
- URL: https://console.cloud.google.com/
- Firebaseと同じGoogleアカウントでログイン

### 2. プロジェクトを選択
- 上部プロジェクト選択 → `super-ft-8e8f3` を選択
- または新規プロジェクトを作成

### 3. Cloud Vision API を有効化
```
左メニュー → APIとサービス → ライブラリ
↓
検索: "Cloud Vision API"
↓
"Cloud Vision API" を選択
↓
"有効にする" をクリック
```

### 4. APIキーを作成
```
左メニュー → APIとサービス → 認証情報
↓
"+ 認証情報を作成" → "APIキー"
↓
APIキー (AIza...) をコピー
```

### 5. セキュリティ設定（推奨）
```
作成されたAPIキーをクリック
↓
「API制限」→「キーを制限」
↓
「Cloud Vision API」のみチェック
↓
「保存」
```

## 🔐 セキュリティのベストプラクティス

### 開発環境
- HTTPリファラー制限: `http://localhost:3000/*`

### 本番環境
- HTTPリファラー制限: 実際のドメインを設定
- 定期的なキーローテーション

## 🧪 テスト方法

1. APIキーを `.env` ファイルに設定
2. 開発サーバー再起動
3. 「👁️ Vision APIテスト」ボタンをクリック

## 💰 料金について

### 無料枠（月間）
- 1,000 リクエスト/月まで無料
- LABEL_DETECTION: 1,000回まで無料
- IMAGE_PROPERTIES: 1,000回まで無料

### 有料プラン
- LABEL_DETECTION: $1.50 per 1,000 images
- IMAGE_PROPERTIES: $1.50 per 1,000 images

## ❗ よくあるエラー

### 1. API_KEY_INVALID
- APIキーが正しく設定されているか確認
- APIキーの制限設定を確認

### 2. PERMISSION_DENIED
- Cloud Vision API が有効化されているか確認
- APIキーの権限設定を確認

### 3. QUOTA_EXCEEDED
- 無料枠を超過した可能性
- Google Cloud Console で使用量を確認

## 🔗 参考リンク

- [Cloud Vision API ドキュメント](https://cloud.google.com/vision/docs)
- [料金表](https://cloud.google.com/vision/pricing)
- [クイックスタート](https://cloud.google.com/vision/docs/quickstart)
