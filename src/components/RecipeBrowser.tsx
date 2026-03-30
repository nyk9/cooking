import { useState } from 'react';
import { recipes } from '../data/recipes';
import { findRecipesByIngredients, findRecipesByKeyword } from '../utils/recipeSearch';
import RecipeCard from './RecipeCard';
import { type Recipe } from '../data/recipes';

interface Props {
  onSelectRecipe: (recipe: Recipe) => void;
}

export default function RecipeBrowser({ onSelectRecipe }: Props) {
  const [searchText, setSearchText] = useState('');
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [maxTime, setMaxTime] = useState<number>(0);

  const getFilteredRecipes = () => {
    let results = searchText.trim()
      ? findRecipesByKeyword(searchText) || findRecipesByIngredients([searchText])
      : recipes;

    if (difficulty !== 'all') {
      results = results.filter((r) => r.difficulty === difficulty);
    }
    if (maxTime > 0) {
      results = results.filter((r) => r.time <= maxTime);
    }
    return results;
  };

  const filtered = getFilteredRecipes();

  return (
    <div className="recipe-browser">
      <div className="recipe-browser-filters">
        <input
          type="search"
          className="recipe-search-input"
          placeholder="レシピ名・食材で検索..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          aria-label="レシピを検索"
        />

        <div className="filter-group">
          <label className="filter-label">難易度</label>
          <div className="filter-buttons">
            {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                className={`filter-btn ${difficulty === d ? 'filter-btn--active' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                {d === 'all' ? 'すべて' : d === 'easy' ? '簡単' : d === 'medium' ? '普通' : '難しい'}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">調理時間</label>
          <div className="filter-buttons">
            {[
              { value: 0, label: 'すべて' },
              { value: 15, label: '15分以内' },
              { value: 30, label: '30分以内' },
              { value: 60, label: '60分以内' },
            ].map(({ value, label }) => (
              <button
                key={value}
                className={`filter-btn ${maxTime === value ? 'filter-btn--active' : ''}`}
                onClick={() => setMaxTime(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="recipe-count">{filtered.length}件のレシピ</p>

      <div className="recipe-grid">
        {filtered.length > 0 ? (
          filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onClick={onSelectRecipe} />
          ))
        ) : (
          <p className="no-results">条件に合うレシピが見つかりませんでした。</p>
        )}
      </div>
    </div>
  );
}
