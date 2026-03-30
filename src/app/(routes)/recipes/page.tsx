import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span className="text-xs text-amber-500">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export default async function RecipesPage() {
  const recipes = await db.recipe.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">レシピ</h1>
        <Link
          href="/recipes/new"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          手動登録
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <span className="text-5xl">📖</span>
          <p className="text-muted-foreground">まだレシピがありません</p>
          <p className="text-sm text-muted-foreground">
            AIチャットでレシピを提案してもらうか、手動で登録しましょう
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="flex flex-col gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-sm line-clamp-1">{recipe.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  recipe.source === "AI_GENERATED"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                }`}>
                  {recipe.source === "AI_GENERATED" ? "AI" : "手動"}
                </span>
              </div>
              {recipe.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{recipe.description}</p>
              )}
              <div className="flex items-center gap-3 mt-auto">
                <StarRating rating={recipe.rating} />
                {recipe.cookTime && (
                  <span className="text-xs text-muted-foreground">⏱ {recipe.cookTime}分</span>
                )}
                {recipe.tags.length > 0 && (
                  <span className="text-xs text-muted-foreground">{recipe.tags.join(", ")}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
