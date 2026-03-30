"use client";

import { useEffect, useState } from "react";
import { ShoppingListCard } from "@/components/features/shopping-list";

interface Recipe {
  id: string;
  name: string;
}

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string | null;
  checked: boolean;
}

interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  recipes: { recipe: Recipe }[];
}

export default function ShoppingPage() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [listName, setListName] = useState("");
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/shopping").then((r) => r.json()),
      fetch("/api/recipes").then((r) => r.json()),
    ]).then(([l, r]) => {
      setLists(l);
      setRecipes(r);
    }).finally(() => setLoading(false));
  }, []);

  const createList = async () => {
    if (!listName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/shopping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: listName, recipeIds: selectedRecipeIds }),
    });
    if (res.ok) {
      const list = await res.json();
      setLists((prev) => [list, ...prev]);
      setListName("");
      setSelectedRecipeIds([]);
      setShowForm(false);
    }
    setCreating(false);
  };

  const deleteList = async (id: string) => {
    await fetch(`/api/shopping/${id}`, { method: "DELETE" });
    setLists((prev) => prev.filter((l) => l.id !== id));
  };

  const toggleRecipe = (id: string) => {
    setSelectedRecipeIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">買い物リスト</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          新しいリスト
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">リスト名</label>
            <input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="今週の買い物"
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            />
          </div>

          {recipes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">レシピから材料を取り込む（任意）</label>
              <div className="flex flex-wrap gap-2">
                {recipes.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleRecipe(r.id)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      selectedRecipeIds.includes(r.id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-accent"
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={createList}
              disabled={creating || !listName.trim()}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {creating ? "作成中..." : "作成"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="h-9 px-4 rounded-md border text-sm hover:bg-accent"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">読み込み中...</p>
      ) : lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <span className="text-5xl">🛒</span>
          <p className="text-muted-foreground">まだ買い物リストがありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lists.map((list) => (
            <ShoppingListCard key={list.id} list={list} onDelete={deleteList} />
          ))}
        </div>
      )}
    </div>
  );
}
