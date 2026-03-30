import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipeCard from '../components/RecipeCard';
import { recipes } from '../data/recipes';

const testRecipe = recipes[0];

describe('RecipeCard', () => {
  it('renders recipe name', () => {
    render(<RecipeCard recipe={testRecipe} onClick={() => {}} />);
    expect(screen.getByText(testRecipe.name)).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<RecipeCard recipe={testRecipe} onClick={() => {}} />);
    expect(screen.getByText(testRecipe.category)).toBeInTheDocument();
  });

  it('renders cooking time', () => {
    render(<RecipeCard recipe={testRecipe} onClick={() => {}} />);
    expect(screen.getByText(new RegExp(`${testRecipe.time}分`))).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<RecipeCard recipe={testRecipe} onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith(testRecipe);
  });
});
