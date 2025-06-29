# 🔧 Firebase Console 設定詳細ガイド

## 📍 設定箇所チェックリスト

### ✅ Authentication 設定

1. **Firebase Console**: https://console.firebase.google.com/project/super-ft-8e8f3/authentication
2. **設定項目**:
   - [ ] Google認証プロバイダーを有効化
   - [ ] サポートメールアドレスを設定
   - [ ] 承認済みドメインに `super-ft-8e8f3.web.app` を追加
   - [ ] 承認済みドメインに `localhost` があることを確認（開発用）

### ✅ Firestore Database 設定

1. **Firebase Console**: https://console.firebase.google.com/project/super-ft-8e8f3/firestore
2. **設定項目**:
   - [ ] データベースを作成（テストモード）
   - [ ] リージョン: asia-northeast1 (Tokyo)
   - [ ] セキュリティルールを更新（`firestore.rules` の内容）

### ✅ セキュリティルール内容

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーコレクション: 自分のドキュメントのみ読み書き可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 物語コレクション: 自分の物語のみ読み書き可能
    match /stories/{storyId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // 公開物語コレクション（将来の拡張用）
    match /public_stories/{storyId} {
      allow read: if true; // 全員が読み取り可能
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 🧪 設定完了後のテスト手順

### 1. 認証テスト
1. https://super-ft-8e8f3.web.app にアクセス
2. ヘッダー右上の「Googleでログイン」をクリック
3. Googleアカウントでログイン
4. ユーザー名とアイコンが表示されることを確認

### 2. 物語生成＆保存テスト
1. 写真をアップロード
2. 物語を生成
3. Result画面で「☁️ クラウドに保存」をクリック
4. 成功メッセージが表示されることを確認

### 3. お気に入り機能テスト
1. Result画面で「🤍 お気に入りに追加」をクリック
2. ボタンが「❤️ お気に入り済み」に変わることを確認

### 4. Firestore データ確認
1. Firebase Console → Firestore Database → データタブ
2. `users` コレクションに自分のユーザーデータが作成されることを確認
3. `stories` コレクションに物語データが保存されることを確認

## 🚨 トラブルシューティング

### 認証エラーが出る場合
- 承認済みドメインに `super-ft-8e8f3.web.app` が正しく追加されているか確認
- ブラウザのキャッシュをクリア
- プライベートブラウジングモードで試す

### データ保存エラーが出る場合
- Firestoreのセキュリティルールが正しく設定されているか確認
- 認証が正常に完了しているか確認
- ブラウザの開発者ツールでコンソールエラーを確認

### Google認証プロバイダーの設定で困った場合
- プロジェクトのサポートメールが設定されているか確認
- Google Cloud Console でOAuth設定が正しいか確認

## 📞 サポート

設定で困った場合は、以下の情報と一緒にお知らせください：
- 設定しようとしている箇所
- 表示されているエラーメッセージ
- ブラウザの開発者ツールのコンソールログ

## 🎉 設定完了後

すべての設定が完了すると、以下の機能が使用可能になります：
- ✅ Google認証ログイン
- ✅ 物語のクラウド保存
- ✅ お気に入り機能
- ✅ 個人の物語管理
- ✅ 統計情報表示

完全版の「爆笑昔話ジェネレーター」の完成です！🎊
