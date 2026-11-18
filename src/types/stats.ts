import { GameMode, Operation } from './game';

export interface PersonalBest {
  mode: GameMode;
  highScore: number;
  bestAccuracy: number;
  longestStreak: number;
  fastestAvgResponseMs: number;
  totalGamesPlayed: number;
  lastPlayed: number;
}

export interface UserStats {
  totalQuestionsAnswered: number;
  totalCorrect: number;
  overallAccuracy: number;
  totalPlayTimeSeconds: number;
  sessionsCount: number;
  highestOverallStreak: number;
  operationStats: Record<Operation, { attempts: number; correct: number }>;
  bests: Record<string, PersonalBest>;
  dailyCompletedDates: string[]; // 'YYYY-MM-DD'
  unlockedBadgeIds: string[];
}

export type ThemeName = 'cream' | 'mint' | 'midnight' | 'blueprint';

export interface UserSettings {
  soundEnabled: boolean;
  volume: number;
  theme: ThemeName;
  reducedMotion: boolean;
  instantAdvance: boolean;
  selectedMascotMood: 'happy' | 'glasses' | 'crown' | 'wizard';
  showOnScreenKeypad: boolean; // Useful for mobile or tablets
}
