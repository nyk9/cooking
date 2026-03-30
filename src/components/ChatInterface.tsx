import { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { generateResponse } from '../utils/recipeSearch';
import { recipes } from '../data/recipes';
import type { Recipe } from '../data/recipes';
import RecipeCard from './RecipeCard';

interface Props {
  onSelectRecipe: (recipe: Recipe) => void;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'こんにちは！🍳 自炊レシピアシスタントです。\n冷蔵庫にある食材や食べたいものを教えてください。おすすめのレシピを提案します！\n\n例：「卵と豆腐がある」「簡単に作れるもの」「丼が食べたい」',
  timestamp: new Date(),
};

export default function ChatInterface({ onSelectRecipe }: Props) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [suggestedRecipeIds, setSuggestedRecipeIds] = useState<Record<string, string[]>>({});
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const { text: responseText, recipeIds } = generateResponse(text);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setSuggestedRecipeIds((prev) => ({ ...prev, [assistantMsg.id]: recipeIds }));
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    '今日のおすすめは？',
    '卵を使ったレシピ',
    '簡単に作れるもの',
    '10分以内で作れる',
    '作り置きできるもの',
  ];

  return (
    <div className="chat-container">
      <div className="chat-messages" role="log" aria-live="polite">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="chat-avatar" aria-hidden="true">
                🍳
              </div>
            )}
            <div className="chat-bubble">
              <p className="chat-bubble-text">{msg.content}</p>
              {msg.role === 'assistant' && suggestedRecipeIds[msg.id]?.length > 0 && (
                <div className="chat-recipe-suggestions">
                  {suggestedRecipeIds[msg.id].map((id) => {
                    const recipe = recipes.find((r) => r.id === id);
                    return recipe ? (
                      <RecipeCard key={id} recipe={recipe} onClick={onSelectRecipe} />
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-message chat-message--assistant">
            <div className="chat-avatar" aria-hidden="true">
              🍳
            </div>
            <div className="chat-bubble chat-bubble--typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="quick-prompts">
        {quickPrompts.map((p) => (
          <button
            key={p}
            className="quick-prompt-btn"
            onClick={() => {
              setInput(p);
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="食材や食べたいものを入力してください..."
          rows={2}
          aria-label="メッセージを入力"
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label="送信"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
