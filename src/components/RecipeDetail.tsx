import { type Recipe } from '../data/recipes';

interface Props {
  recipe: Recipe;
  onClose: () => void;
}

const difficultyLabel: Record<Recipe['difficulty'], string> = {
  easy: '簡単',
  medium: '普通',
  hard: '難しい',
};

export default function RecipeDetail({ recipe, onClose }: Props) {
  return (
    <div className="recipe-detail-overlay" role="dialog" aria-modal="true" aria-label={recipe.name}>
      <div className="recipe-detail">
        <div className="recipe-detail-header">
          <div>
            <h2 className="recipe-detail-title">{recipe.name}</h2>
            <p className="recipe-detail-name-en">{recipe.nameEn}</p>
          </div>
          <button className="recipe-detail-close" onClick={onClose} aria-label="閉じる">
            ✕
          </button>
        </div>

        <p className="recipe-detail-description">{recipe.description}</p>

        <div className="recipe-detail-meta">
          <div className="recipe-detail-meta-item">
            <span className="recipe-detail-meta-label">時間</span>
            <span className="recipe-detail-meta-value">⏱ {recipe.time}分</span>
          </div>
          <div className="recipe-detail-meta-item">
            <span className="recipe-detail-meta-label">難易度</span>
            <span className="recipe-detail-meta-value">{difficultyLabel[recipe.difficulty]}</span>
          </div>
          <div className="recipe-detail-meta-item">
            <span className="recipe-detail-meta-label">カテゴリ</span>
            <span className="recipe-detail-meta-value">{recipe.category}</span>
          </div>
        </div>

        <section className="recipe-detail-section">
          <h3>🥕 材料</h3>
          <ul className="recipe-ingredients">
            {recipe.ingredients.map((ing) => (
              <li key={ing}>{ing}</li>
            ))}
          </ul>
        </section>

        <section className="recipe-detail-section">
          <h3>👨‍🍳 作り方</h3>
          <ol className="recipe-steps">
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <div className="recipe-detail-tags">
          {recipe.tags.map((tag) => (
            <span key={tag} className="recipe-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
