"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <span className="text-5xl">🍳💦</span>
      <h2 className="text-lg font-semibold">エラーが発生しました</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        ページの表示中に問題が発生しました。再試行しても解決しない場合は、時間をおいてもう一度お試しください。
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        再試行
      </button>
    </div>
  );
}
