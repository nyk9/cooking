"use client";

import { useEffect, useState, useCallback } from "react";
import { apiErrorMessage } from "@/lib/api-error";
import { getExpiryStatus, isExpiringSoon } from "@/lib/expiry";

interface Ingredient {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  category: string | null;
  expiresAt: string | null;
  purchasedAt: string | null;
  createdAt: string;
}

const CATEGORIES = ["野菜", "肉・魚", "乳製品", "調味料", "冷凍食品", "その他"];

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    unit: "",
    category: "",
    expiresAt: "",
    purchasedAt: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // render中にDate.now()を呼ばないよう、期限判定の基準時刻はフェッチ時に確定させる
  const [now, setNow] = useState(0);

  const fetchIngredients = useCallback(() => {
    return fetch("/api/ingredients")
      .then((res) => res.json())
      .then((data) => {
        setNow(Date.now());
        setIngredients(data);
      });
  }, []);

  useEffect(() => {
    fetchIngredients().finally(() => setLoading(false));
  }, [fetchIngredients]);

  const resetForm = () => {
    setForm({
      name: "",
      quantity: "",
      unit: "",
      category: "",
      expiresAt: "",
      purchasedAt: "",
    });
    setEditId(null);
    setShowForm(false);
    setFormError(null);
  };

  const startEdit = (ing: Ingredient) => {
    setForm({
      name: ing.name,
      quantity: ing.quantity ?? "",
      unit: ing.unit ?? "",
      category: ing.category ?? "",
      expiresAt: ing.expiresAt
        ? new Date(ing.expiresAt).toISOString().split("T")[0]
        : "",
      purchasedAt: ing.purchasedAt
        ? new Date(ing.purchasedAt).toISOString().split("T")[0]
        : "",
    });
    setEditId(ing.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setFormError(null);

    const payload = {
      name: form.name.trim(),
      quantity: form.quantity || undefined,
      unit: form.unit || undefined,
      category: form.category || undefined,
      expiresAt: form.expiresAt
        ? new Date(form.expiresAt).toISOString()
        : null,
      purchasedAt: form.purchasedAt
        ? new Date(form.purchasedAt).toISOString()
        : null,
    };

    try {
      const res = await fetch(
        editId ? `/api/ingredients/${editId}` : "/api/ingredients",
        {
          method: editId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        setFormError(
          await apiErrorMessage(res, "保存に失敗しました。もう一度お試しください。")
        );
        return;
      }
      resetForm();
      fetchIngredients();
    } catch {
      setFormError("通信に失敗しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この食材を削除しますか？")) return;
    try {
      const res = await fetch(`/api/ingredients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setIngredients((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert("削除に失敗しました。もう一度お試しください。");
    }
  };

  // 消費期限でグループ分け
  const expiringSoon = ingredients.filter((i) => isExpiringSoon(i.expiresAt, now));
  const others = ingredients.filter((i) => !expiringSoon.includes(i));

  if (loading) {
    return <div className="text-muted-foreground text-sm">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">食材管理</h1>
        <button
          onClick={() => {
            if (showForm && !editId) {
              resetForm();
            } else {
              setEditId(null);
              setShowForm(true);
            }
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition-opacity"
        >
          {showForm && !editId ? "キャンセル" : "+ 食材を追加"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border p-4 space-y-3 bg-muted/30"
        >
          <h2 className="font-semibold text-sm">
            {editId ? "食材を編集" : "食材を追加"}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <label className="text-xs text-muted-foreground">食材名 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder="例: 卵"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">数量</label>
              <input
                type="text"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                placeholder="例: 6"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">単位</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                placeholder="例: 個、g、ml"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">カテゴリ</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">未分類</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="ingredient-purchased-at"
                className="text-xs text-muted-foreground"
              >
                購入日
              </label>
              <input
                id="ingredient-purchased-at"
                type="date"
                value={form.purchasedAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, purchasedAt: e.target.value }))
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="ingredient-expires-at"
                className="text-xs text-muted-foreground"
              >
                消費期限
              </label>
              <input
                id="ingredient-expires-at"
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          {formError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || !form.name.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
            >
              {submitting ? "保存中..." : editId ? "更新する" : "追加する"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-md text-sm border hover:bg-muted"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}

      {ingredients.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground space-y-2">
          <p className="text-4xl">🥦</p>
          <p>食材が登録されていません</p>
          <p className="text-sm">冷蔵庫にある食材を追加しましょう</p>
        </div>
      ) : (
        <div className="space-y-6">
          {expiringSoon.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                ⚠️ 消費期限が近い食材
              </h2>
              <IngredientList
                items={expiringSoon}
                now={now}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
          {others.length > 0 && (
            <div className="space-y-2">
              {expiringSoon.length > 0 && (
                <h2 className="text-sm font-semibold text-muted-foreground">
                  その他の食材
                </h2>
              )}
              <IngredientList
                items={others}
                now={now}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IngredientList({
  items,
  now,
  onEdit,
  onDelete,
}: {
  items: Ingredient[];
  now: number;
  onEdit: (i: Ingredient) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <ul className="rounded-lg border divide-y">
      {items.map((ing) => {
        const expiry = getExpiryStatus(ing.expiresAt, now);
        return (
          <li
            key={ing.id}
            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/30 group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{ing.name}</span>
                {ing.quantity && (
                  <span className="text-muted-foreground">
                    {ing.quantity}
                    {ing.unit}
                  </span>
                )}
                {ing.category && (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                    {ing.category}
                  </span>
                )}
                {expiry && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-medium ${expiry.className}`}
                  >
                    {expiry.label}
                  </span>
                )}
              </div>
              <div className="flex gap-3 flex-wrap">
                {ing.purchasedAt && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    購入:{" "}
                    {new Date(ing.purchasedAt).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
                {ing.expiresAt && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    期限:{" "}
                    {new Date(ing.expiresAt).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => onEdit(ing)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                編集
              </button>
              <button
                onClick={() => onDelete(ing.id)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                削除
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
