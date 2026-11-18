export type GameMode = 
  | 'classic'
  | 'calculus'
  | 'algebra'
  | 'ninja'
  | 'timestables'
  | 'fractions'
  | 'numbersense'
  | 'target100'
  | 'operators'
  | 'exam'
  | 'daily';

export type Operation = '+' | '-' | '×' | '÷';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'insane' | 'custom';

export interface ClassicConfig {
  duration: number; // 30, 60, 120, 300 seconds
  operations: Operation[];
  difficulty: Difficulty;
  allowNegatives: boolean;
  minNumber: number;
  maxNumber: number;
  instantAdvance: boolean; // Auto-submits on exact match
  autoStart?: boolean;
}

export interface Question {
  id: string;
  prompt: string;
  promptSubtitle?: string;
  answer: number | string;
  options?: (number | string)[]; // Multiple choice fallback for some modes
  operation: Operation | 'misc';
  hint?: string;
  explanation?: string; // Rich explanation for exam mode review
  operatorPuzzle?: {
    nums: [number, number, number];
    target: number;
  };
}

export interface AnswerRecord {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeMs: number;
  explanation?: string;
}

export interface GameSessionResult {
  mode: GameMode;
  modeTitle: string;
  score: number;
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  duration: number;
  avgResponseTimeMs: number;
  longestStreak: number;
  records: AnswerRecord[];
  timestamp: number;
  isPersonalBest?: boolean;
  previousBestScore?: number;
  unlockedBadges?: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  category: 'speed' | 'accuracy' | 'streak' | 'dedication' | 'arcade';
}
