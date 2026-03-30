import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">🍳 料理アシスタント</h1>
        <p className="text-muted-foreground text-lg">
          AIと一緒にレシピを考えて、買い物まで管理できる自炊サポートアプリ
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <Link
          href="/chat"
          className="flex flex-col items-center gap-2 p-6 rounded-xl border hover:bg-accent transition-colors"
        >
          <span className="text-3xl">💬</span>
          <span className="font-medium">AIチャット</span>
          <span className="text-xs text-muted-foreground">レシピを相談する</span>
        </Link>
        <Link
          href="/recipes"
          className="flex flex-col items-center gap-2 p-6 rounded-xl border hover:bg-accent transition-colors"
        >
          <span className="text-3xl">📖</span>
          <span className="font-medium">レシピ</span>
          <span className="text-xs text-muted-foreground">保存したレシピを見る</span>
        </Link>
        <Link
          href="/shopping"
          className="flex flex-col items-center gap-2 p-6 rounded-xl border hover:bg-accent transition-colors"
        >
          <span className="text-3xl">🛒</span>
          <span className="font-medium">買い物リスト</span>
          <span className="text-xs text-muted-foreground">食材をまとめる</span>
        </Link>
        <Link
          href="/preferences"
          className="flex flex-col items-center gap-2 p-6 rounded-xl border hover:bg-accent transition-colors"
        >
          <span className="text-3xl">❤️</span>
          <span className="font-medium">好み設定</span>
          <span className="text-xs text-muted-foreground">好き嫌い・アレルギー</span>
        </Link>
      </div>
    </div>
  );
}
