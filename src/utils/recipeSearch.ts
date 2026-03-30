import { recipes, type Recipe } from '../data/recipes';

export function findRecipesByIngredients(ingredients: string[]): Recipe[] {
  if (ingredients.length === 0) return recipes;
  const lower = ingredients.map((i) => i.toLowerCase().trim());
  return recipes.filter((recipe) =>
    lower.some((ing) =>
      recipe.ingredients.some((ri) => ri.toLowerCase().includes(ing) || ing.includes(ri.toLowerCase()))
    )
  );
}

export function findRecipesByKeyword(keyword: string): Recipe[] {
  const kw = keyword.toLowerCase().trim();
  if (!kw) return recipes;
  return recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(kw) ||
      recipe.nameEn.toLowerCase().includes(kw) ||
      recipe.description.toLowerCase().includes(kw) ||
      recipe.tags.some((t) => t.toLowerCase().includes(kw)) ||
      recipe.category.toLowerCase().includes(kw) ||
      recipe.ingredients.some((i) => i.toLowerCase().includes(kw))
  );
}

export function suggestFromMessage(message: string): Recipe[] {
  const lower = message.toLowerCase();

  // Extract ingredient mentions
  const foundByIngredient = recipes.filter((recipe) =>
    recipe.ingredients.some((ing) => lower.includes(ing.toLowerCase()))
  );
  if (foundByIngredient.length > 0) return foundByIngredient;

  // Category / tag keywords
  return findRecipesByKeyword(message).slice(0, 5);
}

export function generateResponse(message: string): { text: string; recipeIds: string[] } {
  const lower = message.toLowerCase();

  // Greetings
  if (/こんにち|おはよう|こんばん|はじめ|hello|hi\b/i.test(lower)) {
    return {
      text: 'こんにちは！🍳 今日は何を作りましょうか？冷蔵庫にある食材や、食べたいものを教えてください！',
      recipeIds: [],
    };
  }

  // Easy / quick request
  if (/簡単|手軽|すぐ|急い|時間がな|5分|10分|さっと/.test(lower)) {
    const easy = recipes.filter((r) => r.difficulty === 'easy' && r.time <= 15);
    return {
      text: `すぐ作れる簡単レシピを${easy.length}品ご提案します！`,
      recipeIds: easy.map((r) => r.id),
    };
  }

  // "What can I make?" type questions
  if (/何.*作|おすすめ|提案|教えて|どれ|迷っ/.test(lower)) {
    const suggestions = recipes.slice(0, 5);
    return {
      text: 'おすすめのレシピをご紹介します！お好みや食材があれば教えてください 😊',
      recipeIds: suggestions.map((r) => r.id),
    };
  }

  // Ingredient-based search
  const matched = suggestFromMessage(message);
  if (matched.length > 0) {
    return {
      text: `「${message}」に関連するレシピを見つけました！`,
      recipeIds: matched.slice(0, 5).map((r) => r.id),
    };
  }

  return {
    text: `「${message}」についての情報は見つかりませんでした。食材名やカテゴリ（例：卵、肉、丼、パスタ）で検索してみてください！`,
    recipeIds: [],
  };
}
