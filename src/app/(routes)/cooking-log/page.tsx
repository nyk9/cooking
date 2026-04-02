"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Recipe {
  id: string;
  name: string;
  cookTime: number | null;
  tags: string[];
}

interface CookingLog {
  id: string;
  recipeId: string;
  cookedAt: string;
  note: string | null;
  recipe: Recipe;
}

interface SavedRecipe {
  id: string;
  name: string;
}

export default function CookingLogPage() {
  const [logs, setLogs] = useState<CookingLog[]>([]);
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ recipeId: "", cookedAt: "", note: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchLogs = useCallback(async () => {
    const res = await fetch("/api/cooking-log");
    const data = await res.json();
    setLogs(data);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/cooking-log").then((r) => r.json()),
      fetch("/api/recipes").then((r) => r.json()),
    ]).then(([logsData, recipesData]) => {
      setLogs(logsData);
      setRecipes(recipesData);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipeId) return;
    setSubmitting(true);
    const res = await fetch("/api/cooking-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipeId: form.recipeId,
        cookedAt: form.cookedAt ? new Date(form.cookedAt).toISOString() : undefined,
        note: form.note || undefined,
      }),
    });
    if (res.ok) {
      setForm({ recipeId: "", cookedAt: "", note: "" });
      setShowForm(false);
      fetchLogs();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この記録を削除しますか？")) return;
    await fetch(`/api/cooking-log/${id}`, { method: "DELETE" });
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  // 日付ごとにグループ化
  const grouped = logs.reduce<Record<string, CookingLog[]>>((acc, log) => {
    const key = new Date(log.cookedAt).toLocaleDateString("ja-JP");
    (acc[key] ??= []).push(log);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-muted-foreground text-sm">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">調理ログ</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition-opacity"
        >
          {showForm ? "キャンセル" : "+ 記録を追加"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border p-4 space-y-3 bg-muted/30"
        >
          <h2 className="font-semibold text-sm">作った料理を記録</h2>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">レシピ *</label>
            <select
              value={form.recipeId}
              onChange={(e) => setForm((f) => ({ ...f, recipeId: e.target.value }))}
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">レシピを選択...</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">調理日（省略すると今日）</label>
            <input
              type="datetime-local"
              value={form.cookedAt}
              onChange={(e) => setForm((f) => ({ ...f, cookedAt: e.target.value }))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">メモ（任意）</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              rows={2}
              placeholder="味付けのメモなど..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !form.recipeId}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
          >
            {submitting ? "保存中..." : "記録する"}
          </button>
        </form>
      )}

      {logs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground space-y-2">
          <p className="text-4xl">📒</p>
          <p>まだ調理記録がありません</p>
          <p className="text-sm">作った料理を記録してみましょう</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dateLogs]) => (
            <div key={date} className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground border-b pb-1">
                {date}
              </h2>
              <div className="space-y-2">
                {dateLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors group"
                  >
                    <span className="text-2xl mt-0.5">🍽️</span>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/recipes/${log.recipe.id}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {log.recipe.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>
                          {new Date(log.cookedAt).toLocaleTimeString("ja-JP", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {log.recipe.cookTime && (
                          <span>⏱ {log.recipe.cookTime}分</span>
                        )}
                        {log.recipe.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {log.note && (
                        <p className="text-xs text-muted-foreground mt-1">{log.note}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="text-muted-foreground hover:text-destructive text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
