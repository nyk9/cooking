"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type PreferenceCategory = "LIKE" | "DISLIKE" | "ALLERGY" | "OTHER";

interface Preference {
  id: string;
  category: PreferenceCategory;
  value: string;
  createdAt: string;
}

const schema = z.object({
  category: z.enum(["LIKE", "DISLIKE", "ALLERGY", "OTHER"]),
  value: z.string().min(1, "入力してください").max(100),
});
type FormValues = z.infer<typeof schema>;

const CATEGORY_LABELS: Record<PreferenceCategory, string> = {
  LIKE: "好き",
  DISLIKE: "嫌い",
  ALLERGY: "アレルギー",
  OTHER: "その他",
};

const CATEGORY_COLORS: Record<PreferenceCategory, string> = {
  LIKE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  DISLIKE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  ALLERGY: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: "LIKE", value: "" },
  });

  useEffect(() => {
    fetch("/api/preferences")
      .then((r) => r.json())
      .then(setPreferences)
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: FormValues) => {
    const res = await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      setPreferences((prev) => [...prev, created]);
      reset({ category: "LIKE", value: "" });
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/preferences/${id}`, { method: "DELETE" });
    setPreferences((prev) => prev.filter((p) => p.id !== id));
  };

  const grouped = (Object.keys(CATEGORY_LABELS) as PreferenceCategory[]).map((cat) => ({
    category: cat,
    items: preferences.filter((p) => p.category === cat),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">好み設定</h1>
        <p className="text-muted-foreground text-sm mt-1">
          登録した内容はAIチャットのコンテキストとして使用されます
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 items-start">
        <div className="flex flex-col gap-1">
          <select
            {...register("category")}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            {(Object.keys(CATEGORY_LABELS) as PreferenceCategory[]).map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <input
            {...register("value")}
            placeholder="例: 鶏肉、辛いもの、卵..."
            className="h-9 rounded-md border bg-background px-3 text-sm flex-1"
          />
          {errors.value && (
            <p className="text-xs text-destructive">{errors.value.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          追加
        </button>
      </form>

      {loading ? (
        <p className="text-muted-foreground text-sm">読み込み中...</p>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ category, items }) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                {CATEGORY_LABELS[category]}
              </h2>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">未登録</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {items.map((p) => (
                    <span
                      key={p.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${CATEGORY_COLORS[category]}`}
                    >
                      {p.value}
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="ml-0.5 hover:opacity-70 transition-opacity"
                        aria-label="削除"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
