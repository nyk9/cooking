import { describe, it, expect } from 'vitest';
import {
  findRecipesByIngredients,
  findRecipesByKeyword,
  generateResponse,
} from '../utils/recipeSearch';
import { recipes } from '../data/recipes';

describe('findRecipesByIngredients', () => {
  it('returns all recipes when no ingredients provided', () => {
    expect(findRecipesByIngredients([])).toHaveLength(recipes.length);
  });

  it('finds recipes containing the specified ingredient', () => {
    const results = findRecipesByIngredients(['卵']);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r.ingredients.some((i) => i.includes('卵'))).toBe(true);
    });
  });

  it('finds recipes with partial ingredient match', () => {
    const results = findRecipesByIngredients(['豆腐']);
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns empty array when no matching ingredient', () => {
    const results = findRecipesByIngredients(['存在しない食材xyz']);
    expect(results).toHaveLength(0);
  });
});

describe('findRecipesByKeyword', () => {
  it('returns all recipes when keyword is empty', () => {
    expect(findRecipesByKeyword('')).toHaveLength(recipes.length);
  });

  it('finds recipes by name keyword', () => {
    const results = findRecipesByKeyword('炒飯');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name.includes('炒飯'))).toBe(true);
  });

  it('finds recipes by category', () => {
    const results = findRecipesByKeyword('丼');
    expect(results.length).toBeGreaterThan(0);
  });

  it('finds recipes by tag', () => {
    const results = findRecipesByKeyword('朝食');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r.tags.some((t) => t.includes('朝食'))).toBe(true);
    });
  });

  it('returns empty array for non-matching keyword', () => {
    const results = findRecipesByKeyword('zzz存在しないzzz');
    expect(results).toHaveLength(0);
  });
});

describe('generateResponse', () => {
  it('responds to greeting with welcome message', () => {
    const { text, recipeIds } = generateResponse('こんにちは');
    expect(text).toContain('今日は何を作りましょうか');
    expect(recipeIds).toHaveLength(0);
  });

  it('responds to easy request with easy recipes', () => {
    const { text, recipeIds } = generateResponse('簡単なレシピが知りたい');
    expect(text).toBeTruthy();
    expect(recipeIds.length).toBeGreaterThan(0);
    const suggestedRecipes = recipes.filter((r) => recipeIds.includes(r.id));
    suggestedRecipes.forEach((r) => {
      expect(r.difficulty).toBe('easy');
      expect(r.time).toBeLessThanOrEqual(15);
    });
  });

  it('responds to recommendation request with suggestions', () => {
    const { text, recipeIds } = generateResponse('何かおすすめを教えて');
    expect(text).toContain('おすすめ');
    expect(recipeIds.length).toBeGreaterThan(0);
  });

  it('responds with relevant recipes when ingredient is mentioned', () => {
    const { recipeIds } = generateResponse('卵を使ったレシピ');
    expect(recipeIds.length).toBeGreaterThan(0);
  });

  it('returns fallback message for unknown query', () => {
    const { text } = generateResponse('zzz存在しないzzz');
    expect(text).toContain('見つかりませんでした');
  });
});
