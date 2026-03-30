# cooking

自炊のためのレシピ提案・相談Webアプリ。AIとチャットしてレシピを相談・提案してもらい、レシピ保存・買い物リスト作成まで一貫してできる個人用ツール。

## セットアップ

```bash
# 依存関係インストール
bun install

# 環境変数設定
cp .env.example .env
# .env を編集して DATABASE_URL, ANTHROPIC_API_KEY 等を設定

# DBマイグレーション
bunx prisma migrate dev --name init

# 開発サーバー起動
bun run dev
```

→ http://localhost:3000

## 詳細ドキュメント

[CLAUDE.md](./CLAUDE.md) を参照。
