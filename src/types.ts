export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';
export type TimeFilter = 'all' | '15' | '30' | '60';
