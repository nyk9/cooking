"use client";

import { useState } from "react";

interface Props {
  recipeId: string;
}

export function LogCookingButton({ recipeId }: Props) {
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLog = async () => {
    setLoading(true);
    const res = await fetch("/api/cooking-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId }),
    });
    if (res.ok) {
      setLogged(true);
    }
    setLoading(false);
  };

  if (logged) {
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        ✓ 調理ログに記録しました
      </span>
    );
  }

  return (
    <button
      onClick={handleLog}
      disabled={loading}
      className="px-4 py-2 rounded-md text-sm border hover:bg-accent transition-colors disabled:opacity-50"
    >
      {loading ? "記録中..." : "🍳 今日作った！"}
    </button>
  );
}
