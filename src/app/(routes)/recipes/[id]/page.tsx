import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { RecipeRating } from "@/components/features/recipe-rating";

interface Ingredient {
  name: string;
  amount: string;
}

interface Props {
  params: Promise<{ id: string }>;
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span className="text-amber-500">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;
  const recipe = await db.recipe.findUnique({ where: { id } });
  if (!recipe) notFound();

  const ingredients = recipe.ingredients as Ingredient[];
  const steps = recipe.steps as string[];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{recipe.name}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              recipe.source === "AI_GENERATED"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            }`}>
              {recipe.source === "AI_GENERATED" ? "AI生成" : "手動登録"}
            </span>
            {recipe.cookTime && <span>⏱ {recipe.cookTime}分</span>}
            {recipe.tags.length > 0 && <span>{recipe.tags.join(", ")}</span>}
          </div>
        </div>
        <Link
          href="/recipes"
          className="text-sm text-muted-foreground hover:text-foreground shrink-0"
        >
          ← 一覧
        </Link>
      </div>

      {recipe.description && (
        <p className="text-muted-foreground">{recipe.description}</p>
      )}

      <RecipeRating recipeId={recipe.id} initialRating={recipe.rating} />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">材料</h2>
        <ul className="space-y-1 rounded-lg border divide-y">
          {ingredients.map((ing, i) => (
            <li key={i} className="flex items-center justify-between px-4 py-2 text-sm">
              <span>{ing.name}</span>
              <span className="text-muted-foreground">{ing.amount}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">作り方</h2>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {recipe.memo && (
        <div className="rounded-lg border p-4 space-y-1">
          <h2 className="text-sm font-semibold">メモ</h2>
          <p className="text-sm text-muted-foreground">{recipe.memo}</p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <StarRating rating={recipe.rating} />
      </div>
    </div>
  );
}
