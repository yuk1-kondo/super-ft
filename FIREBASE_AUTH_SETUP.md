# Firebase Authentication セットアップガイド

## 🔐 Firebase Authentication の設定

### 1. Firebase Console での設定

1. **Firebase Console にアクセス**
   - https://console.firebase.google.com/
   - プロジェクト `super-ft-8e8f3` を選択

2. **Authentication を有効化**
   - 左メニューから「Authentication」を選択
   - 「始める」をクリック

3. **Google認証を有効化**
   - 「Sign-in method」タブを選択
   - 「Google」を選択して有効化
   - プロジェクトのサポートメールを設定

4. **承認済みドメインを追加**
   - 「Settings」→「Authorized domains」
   - `localhost` (開発用)
   - `super-ft-8e8f3.web.app` (本番用)

### 2. Firestore データベースの設定

1. **Firestore を有効化**
   - 左メニューから「Firestore Database」を選択
   - 「データベースを作成」をクリック
   - 「テストモードで開始」を選択（後でルールを設定）

2. **セキュリティルール設定**
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
  }
}
```

### 3. 環境変数の確認

`.env` ファイルに以下の設定があることを確認：

```
# Firebase設定
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=super-ft-8e8f3.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=super-ft-8e8f3
VITE_FIREBASE_STORAGE_BUCKET=super-ft-8e8f3.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. テスト手順

1. **開発サーバー起動**
   ```bash
   npm run dev
   ```

2. **ログイン機能テスト**
   - ブラウザで http://localhost:3000 にアクセス
   - ヘッダーのログインボタンをクリック
   - Googleアカウントでログイン

3. **データ保存テスト**
   - 物語を生成
   - 「クラウドに保存」ボタンをクリック
   - Firestore Console でデータを確認

### 5. 追加機能

✅ **実装済み機能**
- Google認証ログイン/ログアウト
- ユーザープロファイル管理
- 物語のクラウド保存
- お気に入り機能
- 物語数統計

🔄 **今後の拡張**
- 他のユーザーの物語を閲覧
- 物語の公開/非公開設定
- いいね・コメント機能
- ソーシャル機能

### 6. セキュリティ考慮事項

- ✅ 認証済みユーザーのみデータアクセス可能
- ✅ ユーザーは自分のデータのみ操作可能
- ✅ Firestoreセキュリティルールで保護
- ✅ APIキーは環境変数で管理
