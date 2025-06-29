# セキュリティガイド

## APIキーのセキュリティ対策

### 1. フロントエンド用APIキーの制限
- **Firebase**: 自動的にドメイン制限が適用される
- **Gemini API**: リファラー制限を設定
- **Vision API**: HTTPリファラー制限を必ず設定
- **OpenWeather**: IPアドレスまたはリファラー制限

### 2. 本番環境での注意事項
```bash
# 本番用環境変数ファイル
# 絶対にGitにコミットしない！
.env.production
```

### 3. Firebase Security Rules
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 読み取り専用
    match /stories/{document} {
      allow read: if true;
      allow write: if false;
    }
  }
}

// Storage Rules  
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{imageId} {
      allow read, write: if request.time < resource.timeCreated + duration.make(24, 'h');
    }
  }
}
```

### 4. 使用量モニタリング
- Google Cloud Console で使用量を定期的にチェック
- 予算アラートの設定
- API制限の適切な設定

## トラブルシューティング

### よくあるエラーと解決方法

1. **CORS エラー**
   - APIキーの制限設定を確認
   - ドメイン/リファラーの設定

2. **認証エラー**
   - APIキーの有効性を確認
   - サービスの有効化状態をチェック

3. **クォータ超過**
   - 使用量の確認
   - レート制限の実装

4. **Firebase接続エラー**
   - プロジェクトIDの確認
   - サービスの有効化状態
