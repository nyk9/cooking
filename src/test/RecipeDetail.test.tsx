import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipeDetail from '../components/RecipeDetail';
import { recipes } from '../data/recipes';

const testRecipe = recipes[0];

describe('RecipeDetail', () => {
  it('renders recipe name', () => {
    render(<RecipeDetail recipe={testRecipe} onClose={() => {}} />);
    expect(screen.getByText(testRecipe.name)).toBeInTheDocument();
  });

  it('renders English name', () => {
    render(<RecipeDetail recipe={testRecipe} onClose={() => {}} />);
    expect(screen.getByText(testRecipe.nameEn)).toBeInTheDocument();
  });

  it('renders all ingredients', () => {
    render(<RecipeDetail recipe={testRecipe} onClose={() => {}} />);
    testRecipe.ingredients.forEach((ing) => {
      expect(screen.getAllByText(ing).length).toBeGreaterThan(0);
    });
  });

  it('renders all steps', () => {
    render(<RecipeDetail recipe={testRecipe} onClose={() => {}} />);
    testRecipe.steps.forEach((step) => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<RecipeDetail recipe={testRecipe} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: '閉じる' }));
    expect(onClose).toHaveBeenCalled();
  });
});
