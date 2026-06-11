"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface MealPlanEntry {
  id: string;
  date: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  recipeName: string;
  note: string | null;
  recipe: { id: string; name: string } | null;
}

interface MealPlan {
  id: string;
  weekStart: string;
  entries: MealPlanEntry[];
  createdAt: string;
}

const MEAL_TYPE_LABEL: Record<MealPlanEntry["mealType"], string> = {
  BREAKFAST: "朝食",
  LUNCH: "昼食",
  DINNER: "夕食",
};

const MEAL_TYPE_ORDER: MealPlanEntry["mealType"][] = ["BREAKFAST", "LUNCH", "DINNER"];

const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}〜${end.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}`;
}

export default function MealPlanPage() {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);
  const [weekStart, setWeekStart] = useState(() => {
    const monday = getMonday(new Date());
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
  });

  const fetchPlans = useCallback(async () => {
    const res = await fetch("/api/meal-plan");
    const data = await res.json();
    setPlans(data);
    setSelectedPlanIdx(0);
  }, []);

  useEffect(() => {
    fetchPlans().finally(() => setLoading(false));
  }, [fetchPlans]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart }),
      });
      if (res.ok) {
        fetchPlans();
      }
    } finally {
      setGenerating(false);
    }
  };

  const currentPlan = plans[selectedPlanIdx];

  // 日付 × 食事タイプのグリッドを構築
  const buildGrid = (plan: MealPlan) => {
    const start = new Date(plan.weekStart);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });

    return days.map((dateStr) => ({
      dateStr,
      meals: MEAL_TYPE_ORDER.map((mealType) => {
        const entry = plan.entries.find(
          (e) =>
            new Date(e.date).toISOString().split("T")[0] === dateStr &&
            e.mealType === mealType
        );
        return { mealType, entry };
      }),
    }));
  };

  if (loading) {
    return <div className="text-muted-foreground text-sm">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">週間献立</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">週の開始日（月曜日）</label>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mt-5"
          >
            {generating ? "AIが献立を考えています..." : "✨ AIで献立を生成"}
          </button>
        </div>
      </div>

      {generating && (
        <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm space-y-2">
          <p className="text-2xl animate-pulse">🤖</p>
          <p>AIが1週間の献立を考えています...</p>
          <p className="text-xs">食材の在庫・好み設定・保存レシピを参考にしています</p>
        </div>
      )}

      {plans.length === 0 && !generating ? (
        <div className="text-center py-16 text-muted-foreground space-y-2">
          <p className="text-4xl">📅</p>
          <p>献立がまだ作成されていません</p>
          <p className="text-sm">「AIで献立を生成」ボタンで1週間の献立を作りましょう</p>
        </div>
      ) : currentPlan ? (
        <div className="space-y-4">
          {plans.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {plans.map((plan, idx) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanIdx(idx)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    idx === selectedPlanIdx
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  {formatWeekRange(plan.weekStart)}
                </button>
              ))}
            </div>
          )}

          <div className="rounded-lg border overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 text-sm font-medium">
              {formatWeekRange(currentPlan.weekStart)}
            </div>
            <div className="divide-y">
              {buildGrid(currentPlan).map(({ dateStr, meals }, dayIdx) => (
                <div key={dateStr} className="grid grid-cols-[80px_1fr] text-sm">
                  <div className="flex flex-col items-center justify-center p-3 border-r bg-muted/20">
                    <span className="font-semibold">{DAY_LABELS[dayIdx]}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(dateStr).toLocaleDateString("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="divide-y">
                    {meals.map(({ mealType, entry }) => (
                      <div key={mealType} className="flex items-start gap-2 p-2.5">
                        <span className="text-xs text-muted-foreground w-8 shrink-0 pt-0.5">
                          {MEAL_TYPE_LABEL[mealType]}
                        </span>
                        {entry ? (
                          <div>
                            {entry.recipe ? (
                              <Link
                                href={`/recipes/${entry.recipe.id}`}
                                className="font-medium hover:underline"
                              >
                                {entry.recipeName}
                              </Link>
                            ) : (
                              <span className="font-medium">{entry.recipeName}</span>
                            )}
                            {entry.note && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {entry.note}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-right">
            生成日時:{" "}
            {new Date(currentPlan.createdAt).toLocaleString("ja-JP")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
