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
│   │   ├── preferences/  # 好み設定（/preferences）
│   │   ├── cooking-log/  # 調理ログ（/cooking-log）
│   │   ├── ingredients/  # 食材管理（/ingredients）
│   │   └── meal-plan/    # 献立生成（/meal-plan）
│   └── api/
│       ├── chat/         # POST: streamText でAI応答
│       ├── conversations/ # GET: 一覧, GET/DELETE: [id]
│       ├── recipes/      # GET/POST: 一覧・作成, GET/PATCH/DELETE: [id]
│       ├── shopping/     # GET/POST: リスト, DELETE: [id], POST: [id]/items
│       ├── shopping/items/ # PATCH/DELETE: [id]
│       ├── preferences/  # GET/POST: 一覧・作成, DELETE: [id]
│       ├── cooking-log/  # GET/POST: 一覧・作成, DELETE: [id]
│       ├── ingredients/  # GET/POST: 一覧・作成, PATCH/DELETE: [id]
│       └── meal-plan/    # GET/POST: 生成・取得
├── components/
│   ├── ui/               # Shadcn コンポーネント
│   └── features/         # 機能別コンポーネント
│       ├── chat-interface.tsx   # チャットUI（useChat hook）
│       ├── recipe-rating.tsx    # 星評価コンポーネント
│       ├── shopping-list.tsx    # 買い物リストカード
│       └── log-cooking-button.tsx # 調理ログ記録ボタン
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
| モデル切り替え | チャット画面内でGemini 3.1 Flash Lite / 2.5 Flash / 2.0 Flashを切り替え可能 |
| 調理ログ | レシピごとに調理日・メモを記録。日付順に一覧表示 |
| 食材管理 | 冷蔵庫の食材を登録。賞味期限アラート付き。献立生成のコンテキストとしても使用 |
| 献立生成 | AI（`generateObject`）で1週間分の献立を自動生成。好み・食材・レシピ履歴を考慮 |

## DBスキーマ（概要）

- `Conversation` / `Message`: チャット履歴
- `Recipe`: レシピ（`source: AI_GENERATED | USER_CREATED`、`rating: 1-5`、`ingredients/steps: JSON`）
- `ShoppingList` / `ShoppingItem`: 買い物リスト（複数レシピを統合）
- `ShoppingListRecipe`: ShoppingList ↔ Recipe の中間テーブル
- `Preference`: 好み設定（`category: LIKE | DISLIKE | ALLERGY | OTHER`）
- `CookingLog`: 調理ログ（Recipe に紐づく、調理日・メモ）
- `Ingredient`: 食材管理（名前・数量・単位・カテゴリ・賞味期限）
- `MealPlan` / `MealPlanEntry`: 献立（週単位、朝昼夕の食事タイプ別）

## 環境変数

`.env` は gitignore 済み。

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
2. `.env` を作成し、`DATABASE_URL` と `GOOGLE_GENERATIVE_AI_API_KEY` を設定
3. `bunx prisma migrate dev --name init` でDB初期化
4. `bun run dev`

## AI設計方針

- Vercel AI SDK の `streamText` を使用
- システムプロンプトに以下を毎回注入:
  - ユーザーの好み設定（Preference テーブル）
  - 直近のレシピ履歴と評価（Recipe テーブル上位10件）
- モデルはチャット画面のセレクターで切り替え（デフォルト: gemini-3.1-flash-lite-preview）
- 会話履歴はDBに保存し、同一セッション内で文脈を維持

## コーディング規約

- Server Actions / API Routes は `src/app/api/` に配置
- Prisma client は `src/lib/db.ts` から import
- フォームは React Hook Form + Zod スキーマで型安全に
- コンポーネントは機能単位で `src/components/features/` に分割

## 認証・認可（将来対応予定）

- 現時点では個人利用のため認証機能は未実装（全APIが公開状態）
- 将来的にユーザー認証・データ分離を導入予定

## 未実装・今後の課題

- 認証・認可（上記参照）
- Error Boundary（`error.tsx`）によるエラーUI
- テスト（ユニットテスト・E2Eテスト）
- APIレスポンスのページネーション
