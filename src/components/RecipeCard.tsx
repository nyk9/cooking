import { type Recipe } from '../data/recipes';

interface Props {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
}

const difficultyLabel: Record<Recipe['difficulty'], string> = {
  easy: '簡単',
  medium: '普通',
  hard: '難しい',
};

const difficultyColor: Record<Recipe['difficulty'], string> = {
  easy: '#4caf50',
  medium: '#ff9800',
  hard: '#f44336',
};

export default function RecipeCard({ recipe, onClick }: Props) {
  return (
    <button
      className="recipe-card"
      onClick={() => onClick(recipe)}
      aria-label={`${recipe.name}のレシピを見る`}
    >
      <div className="recipe-card-header">
        <h3 className="recipe-card-title">{recipe.name}</h3>
        <span className="recipe-card-category">{recipe.category}</span>
      </div>
      <p className="recipe-card-description">{recipe.description}</p>
      <div className="recipe-card-meta">
        <span className="recipe-card-time">⏱ {recipe.time}分</span>
        <span
          className="recipe-card-difficulty"
          style={{ color: difficultyColor[recipe.difficulty] }}
        >
          ● {difficultyLabel[recipe.difficulty]}
        </span>
      </div>
      <div className="recipe-card-tags">
        {recipe.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="recipe-tag">
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}
