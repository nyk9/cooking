# CLAUDE.md

## プロジェクト概要

自炊のためのレシピ提案・相談Webアプリ。個人利用。AIとのチャット形式でレシピを相談・提案してもらい、レシピ保存・買い物リスト作成までできる。

## 技術スタック

- **Framework**: Next.js (App Router) + TypeScript
- **UI**: Shadcn UI + Tailwind CSS v4
- **AI**: Vercel AI SDK + @ai-sdk/google（Google Gemini）
- **DB**: Prisma + Neon (PostgreSQL)
- **Form**: React Hook Form + Zod
- **Package manager**: Bun

## ディレクトリ構成

```
src/
├── app/                  # Next.js App Router
│   ├── (routes)/
│   │   ├── chat/         # チャット一覧・詳細（/chat, /chat/new, /chat/[id]）
│   │   ├── recipes/      # レシピ一覧・詳細・登録（/recipes, /recipes/new, /recipes/[id]）
│   │   ├── shopping/     # 買い物リスト（/shopping）
│   │   └── preferences/  # 好み設定（/preferences）
│   └── api/
│       ├── chat/         # POST: streamText でAI応答
│       ├── conversations/ # GET: 一覧, GET/DELETE: [id]
│       ├── recipes/      # GET/POST: 一覧・作成, GET/PATCH/DELETE: [id]
│       ├── shopping/     # GET/POST: リスト, DELETE: [id], POST: [id]/items
│       ├── shopping/items/ # PATCH/DELETE: [id]
│       └── preferences/  # GET/POST: 一覧・作成, DELETE: [id]
├── components/
│   ├── ui/               # Shadcn コンポーネント
│   └── features/         # 機能別コンポーネント
│       ├── chat-interface.tsx   # チャットUI（useChat hook）
│       ├── recipe-rating.tsx    # 星評価コンポーネント
│       └── shopping-list.tsx    # 買い物リストカード
├── lib/
│   ├── db.ts             # Prisma client（PrismaNeon adapter）
│   ├── ai.ts             # AI SDK設定（ModelId, MODELS, getModel）
│   └── utils.ts          # cn() ユーティリティ
└── generated/prisma/     # Prisma 生成ファイル（編集不可）
prisma/
└── schema.prisma         # DBスキーマ
```

## 主要機能

| 機能 | 概要 |
|------|------|
| AIチャット | チャット形式でレシピを相談・提案。ユーザーの好み・過去レシピをシステムプロンプトに注入 |
| レシピ保存 | AI提案 or 手動登録。1〜5の評価付け可能 |
| 買い物リスト | 複数レシピを選択して統合リストを生成。チェックボックスで管理 |
| 好み設定 | 好き・嫌い・アレルギーを登録。AIのコンテキストとして使用 |
| モデル切り替え | チャット画面内でGemini 2.0 Flash / 2.5 Flashを切り替え可能 |

## DBスキーマ（概要）

- `Conversation` / `Message`: チャット履歴
- `Recipe`: レシピ（`source: AI_GENERATED | USER_CREATED`、`rating: 1-5`、`ingredients/steps: JSON`）
- `ShoppingList` / `ShoppingItem`: 買い物リスト（複数レシピを統合）
- `ShoppingListRecipe`: ShoppingList ↔ Recipe の中間テーブル
- `Preference`: 好み設定（`category: LIKE | DISLIKE | ALLERGY | OTHER`）

## 環境変数

`.env.example` を参照。`.env` は gitignore 済み。

```
DATABASE_URL                  # Neon接続文字列
GOOGLE_GENERATIVE_AI_API_KEY  # Google AI Studio APIキー
```

## 開発コマンド

```bash
bun run dev                                    # 開発サーバー起動
bunx prisma migrate dev --name <name>          # マイグレーション作成・適用
bunx prisma studio                             # DB GUI
bunx prisma generate                           # クライアント再生成
```

## セットアップ手順

1. `bun install`
2. `.env.example` をコピーして `.env` を作成し、各値を設定
3. `bunx prisma migrate dev --name init` でDB初期化
4. `bun run dev`

## AI設計方針

- Vercel AI SDK の `streamText` を使用
- システムプロンプトに以下を毎回注入:
  - ユーザーの好み設定（Preference テーブル）
  - 直近のレシピ履歴と評価（Recipe テーブル上位10件）
- モデルはチャット画面のセレクターで切り替え（デフォルト: gemini-2.0-flash）
- 会話履歴はDBに保存し、同一セッション内で文脈を維持

## コーディング規約

- Server Actions / API Routes は `src/app/api/` に配置
- Prisma client は `src/lib/db.ts` から import
- フォームは React Hook Form + Zod スキーマで型安全に
- コンポーネントは機能単位で `src/components/features/` に分割
