import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <span className="text-5xl">🔍</span>
      <h2 className="text-lg font-semibold">ページが見つかりません</h2>
      <p className="text-sm text-muted-foreground">
        お探しのページは存在しないか、削除された可能性があります。
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        ホームに戻る
      </Link>
    </div>
  );
}
