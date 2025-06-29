# Firestore データベース リージョン設定ガイド

## 現在のリージョン確認

1. [Firebase Console](https://console.firebase.google.com/project/super-ft-8e8f3/firestore) にアクセス
2. Firestore Database セクションを確認
3. データベース名の下に表示されているリージョンを確認

## 理想的なリージョン設定

日本のユーザーを対象とする場合、以下のリージョンが推奨されます：

- **asia-northeast1** (Tokyo) - 推奨
- **asia-northeast2** (Osaka) - 代替案

## リージョンが間違っている場合の対処法

⚠️ **注意**: Firestoreデータベースのリージョンは作成後に変更できません。

### 方法1: データベース削除・再作成（データが失われます）

1. **データのバックアップ**（必要に応じて）:
   ```bash
   # データエクスポート（オプション）
   gcloud firestore export gs://super-ft-8e8f3.appspot.com/backups/$(date +%Y%m%d)
   ```

2. **Firebase Consoleでデータベース削除**:
   - Firebase Console → Firestore Database → Settings → Delete database

3. **新しいデータベース作成**:
   - Firebase Console → Firestore Database → Create database
   - Production mode を選択
   - リージョンで **asia-northeast1** を選択

4. **セキュリティルール再適用**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 方法2: 新しいプロジェクトでやり直し

現在のデータベースが `us-central1` など遠いリージョンの場合：

1. 新しいFirebaseプロジェクトを作成
2. 適切なリージョン（asia-northeast1）でFirestoreを作成
3. プロジェクト設定を更新

## リージョンによるパフォーマンス影響

### asia-northeast1 (Tokyo) の利点:
- **レイテンシ**: 日本からのアクセスで約10-20ms
- **データ転送**: 高速
- **コスト**: 標準料金

### us-central1 (Iowa) の場合:
- **レイテンシ**: 日本からのアクセスで約150-200ms
- **データ転送**: 遅い
- **コスト**: 若干安い

## 確認方法

現在のリージョンを確認：

```bash
# Firebase CLI（詳細情報は限定的）
firebase firestore:databases:list

# Firebase Console（推奨）
# https://console.firebase.google.com/project/super-ft-8e8f3/firestore
```

## リージョン設定後の確認事項

1. **機能テスト**:
   - 認証動作
   - データ保存・読み込み
   - パフォーマンス測定

2. **セキュリティルール**:
   - ルールの再適用確認
   - アクセス権限テスト

3. **モニタリング**:
   - Firebase Console でエラー監視
   - パフォーマンス測定

## 現在の状況での推奨アクション

1. まず現在のリージョンを確認
2. `us-central1` など遠いリージョンの場合は再作成を検討
3. `asia-northeast1` の場合はそのまま継続使用

## 関連ドキュメント

- [Firestore リージョン選択ガイド](https://firebase.google.com/docs/firestore/locations)
- [Firebase プロジェクト設定](https://console.firebase.google.com/project/super-ft-8e8f3/settings/general)
