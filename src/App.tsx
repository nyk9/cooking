import { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import RecipeBrowser from './components/RecipeBrowser';
import RecipeDetail from './components/RecipeDetail';
import { type Recipe } from './data/recipes';
import './App.css';

type Tab = 'chat' | 'browse';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <h1 className="app-title">
            <span className="app-title-icon" aria-hidden="true">🍳</span>
            自炊レシピアシスタント
          </h1>
          <p className="app-subtitle">レシピの相談・提案をお手伝いします</p>
        </div>
        <nav className="app-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'chat'}
            className={`tab-btn ${activeTab === 'chat' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 相談する
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'browse'}
            className={`tab-btn ${activeTab === 'browse' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            📖 レシピ一覧
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'chat' ? (
          <ChatInterface onSelectRecipe={setSelectedRecipe} />
        ) : (
          <RecipeBrowser onSelectRecipe={setSelectedRecipe} />
        )}
      </main>

      {selectedRecipe && (
        <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
}
