# しゅうちゃん食堂アプリケーション

## 概要
しゅうちゃん食堂の予約管理システムです。ユーザーはメニューを閲覧し、予約を行うことができます。

## 技術スタック
- Next.js 15.2.1
- React 19.0.0
- PostgreSQL
- Prisma ORM
- LINE認証

## 環境構築

### 前提条件
- Node.js (v18以上)
- PostgreSQL
- npm または pnpm

### インストール手順

1. リポジトリをクローン
```bash
git clone <リポジトリURL>
cd shu-chan_dinning_hall
```

2. 依存関係のインストール
```bash
pnpm install
# または
npm install
```

3. 環境変数の設定
`.env`ファイルを作成し、以下の内容を設定します：
```
DATABASE_URL="postgresql://ユーザー名:パスワード@localhost:5432/shu-chan_dinning?schema=public"
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_USER_ID=your_line_user_id
LINE_CHANNEL_ID=your_line_channel_id
NEXT_PUBLIC_LINE_CLIENT_ID=your_line_channel_id
LINE_CLIENT_SECRET=your_line_channel_secret
LINE_REDIRECT_URI=http://localhost:3000/api/auth/callback/line
```

4. データベースのセットアップ
```bash
npx prisma migrate dev --name init
```

5. シードデータの投入
```bash
npx prisma db seed
```

## データベース接続テスト

データベース接続が正常に機能しているか確認するには、以下のコマンドを実行します：

```bash
npx ts-node tests/testConnection.ts
```

このテストスクリプトは以下の項目を確認します：
1. 基本的なデータベース接続
2. ユーザーテーブルからのデータ取得
3. メニューテーブルからのデータ取得
4. 予約テーブルからのデータ取得（リレーション含む）
5. トランザクション処理

## 開発サーバーの起動

```bash
npm run dev
# または
pnpm dev
```

ブラウザで http://localhost:3000 にアクセスして、アプリケーションを確認できます。

## 本番環境へのデプロイ

```bash
npm run build
npm run start
# または
pnpm build
pnpm start
```

## ライセンス
[ライセンス情報]

## 認証方法

このアプリケーションはLINE認証を使用しています。以下の環境変数を設定する必要があります：

```
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_USER_ID=your_line_user_id
LINE_CHANNEL_ID=your_line_channel_id
NEXT_PUBLIC_LINE_CLIENT_ID=your_line_channel_id
LINE_CLIENT_SECRET=your_line_channel_secret
LINE_REDIRECT_URI=http://localhost:3000/api/auth/callback/line
```

LINEデベロッパーコンソールで必要な情報を取得してください。
