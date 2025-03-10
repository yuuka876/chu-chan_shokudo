# Clerk から LINE 認証への移行手順

## 概要

このプロジェクトでは、Clerk認証機能からLINE認証への完全移行を行います。移行の目的は以下の通りです：

- LINE認証で一元化することによるユーザー体験の向上
- 依存ライブラリの削減
- 認証フローの簡素化

## 実装済みコンポーネント

1. **LineLoginButton**: LINE認証ページへのリダイレクトを行うボタンコンポーネント
2. **LineAuthProvider**: LINE認証のコンテキストを提供するプロバイダーコンポーネント
3. **LINE認証コールバック処理**: LINE認証後のコールバック処理
4. **ミドルウェア**: 認証状態に基づくルーティング制御

## 移行手順

### 1. 依存関係の更新

```bash
# Clerkパッケージの削除
pnpm remove @clerk/nextjs

# 必要なパッケージの追加
pnpm add cookies-next
```

### 2. 認証関連コンポーネントの実装

以下のファイルを作成・更新する：

- `src/components/LineLoginButton.tsx` - LINEログインボタン
- `src/lib/line-auth.tsx` - LINE認証コンテキストプロバイダー
- `src/app/api/auth/callback/line/route.ts` - LINE認証コールバック処理
- `src/app/api/auth/signout/route.ts` - サインアウト処理

### 3. ミドルウェアの更新

`src/middleware.ts` を更新し、Clerkの依存関係を削除して、クッキーベースの認証をチェックするように変更する。

### 4. UI関連コンポーネントの更新

以下のコンポーネントをLINE認証対応に更新：

- `src/app/layout.tsx` - ClerkProviderをLineAuthProviderに置き換え
- `src/components/UserMenu.tsx` - ユーザーメニューをLINE認証対応に
- `src/app/auth/sign-in/page.tsx` - サインインページを更新
- `src/app/profile/page.tsx` - プロフィールページを更新

### 5. 環境変数の更新

`.env.local` と `.env` ファイルを更新し、Clerk関連の環境変数を削除して、LINE認証に必要な環境変数を追加。

```
LINE_CHANNEL_SECRET=xxx
LINE_CHANNEL_ACCESS_TOKEN=xxx
LINE_USER_ID=xxx
LINE_CHANNEL_ID=xxx
NEXT_PUBLIC_LINE_CLIENT_ID=xxx
LINE_CLIENT_SECRET=xxx
LINE_REDIRECT_URI=http://localhost:3000/api/auth/callback/line
```

## エラー処理

1. LINE認証に失敗した場合、適切なエラーメッセージを表示
2. 認証エラーログを詳細に記録

## テスト手順

1. アプリケーションを起動し、LINEログインボタンを使ってログイン
2. 保護されたルートへのアクセス
3. プロフィール情報の取得/更新
4. ログアウト機能のテスト

## 注意事項

- 既存のユーザーデータは維持され、LINE認証情報と紐づけられます
- セッション管理は主にクッキーを使用して行われます
- 管理者権限の管理方法は変更されません

## リスク対策

- ロールバックのためにClerk関連のコードを一定期間保持
- 完全に切り替え後、問題なければClerk関連のコードを削除 