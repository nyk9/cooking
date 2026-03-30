"use client";

import { useState } from "react";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string | null;
  checked: boolean;
}

interface Recipe {
  id: string;
  name: string;
}

interface ShoppingListData {
  id: string;
  name: string;
  items: ShoppingItem[];
  recipes: { recipe: Recipe }[];
}

interface Props {
  list: ShoppingListData;
  onDelete: (id: string) => void;
}

export function ShoppingListCard({ list, onDelete }: Props) {
  const [items, setItems] = useState<ShoppingItem[]>(list.items);
  const [newItem, setNewItem] = useState("");
  const [adding, setAdding] = useState(false);

  const toggleItem = async (item: ShoppingItem) => {
    const res = await fetch(`/api/shopping/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: !item.checked }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i))
      );
    }
  };

  const deleteItem = async (id: string) => {
    await fetch(`/api/shopping/items/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    setAdding(true);
    const res = await fetch(`/api/shopping/${list.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newItem.trim() }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [...prev, item]);
      setNewItem("");
    }
    setAdding(false);
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const progress = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50">
        <div className="space-y-0.5">
          <h3 className="font-medium text-sm">{list.name}</h3>
          {list.recipes.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {list.recipes.map((r) => r.recipe.name).join(", ")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{checkedCount}/{items.length}</span>
          <button
            onClick={() => onDelete(list.id)}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            削除
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="divide-y">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItem(item)}
              className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
            />
            <span className={`flex-1 text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}>
              {item.name}
              {item.quantity && (
                <span className="ml-2 text-xs text-muted-foreground">{item.quantity}</span>
              )}
            </span>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 px-4 py-3 border-t">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="アイテムを追加..."
          className="flex-1 h-8 rounded-md border bg-background px-3 text-sm"
        />
        <button
          onClick={addItem}
          disabled={adding || !newItem.trim()}
          className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50 hover:bg-primary/90"
        >
          追加
        </button>
      </div>
    </div>
  );
}
