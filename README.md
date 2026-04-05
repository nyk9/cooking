# cooking

自炊のためのレシピ提案・相談Webアプリ。AIとチャットしてレシピを相談・提案してもらい、レシピ保存・買い物リスト作成まで一貫してできる個人用ツール。

## 主な機能

- **AIチャット**: チャット形式でレシピを相談・提案（Google Gemini）
- **レシピ管理**: AI提案 or 手動登録、1〜5の評価付け
- **買い物リスト**: 複数レシピから統合リストを生成、チェックボックスで管理
- **好み設定**: 好き・嫌い・アレルギーを登録、AIコンテキストに反映
- **調理ログ**: レシピごとに調理日・メモを記録
- **食材管理**: 冷蔵庫の食材を登録、賞味期限アラート付き
- **献立生成**: AIで1週間分の献立を自動生成

## 技術スタック

Next.js (App Router) / TypeScript / Shadcn UI / Tailwind CSS v4 / Vercel AI SDK / Google Gemini / Prisma / Neon (PostgreSQL) / Bun

## セットアップ

```bash
# 依存関係インストール
bun install

# 環境変数設定（.env を作成して以下を設定）
# DATABASE_URL=...          # Neon PostgreSQL 接続文字列
# GOOGLE_GENERATIVE_AI_API_KEY=...  # Google AI Studio APIキー

# DBマイグレーション
bunx prisma migrate dev --name init

# 開発サーバー起動
bun run dev
```

→ http://localhost:3000

## 詳細ドキュメント

[CLAUDE.md](./CLAUDE.md) を参照。
