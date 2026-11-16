import { GameMode, GameSessionResult, Badge, Operation } from '../types/game';
import { UserStats, UserSettings, PersonalBest, ThemeName } from '../types/stats';

const STATS_KEY = 'mathemagical_stats_v1';
const SETTINGS_KEY = 'mathemagical_settings_v1';

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Answer your first 10 questions correctly.',
    icon: '🌱',
    category: 'dedication',
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Score 20 or more correct answers in 60 seconds.',
    icon: '⚡',
    category: 'speed',
  },
  {
    id: 'lightning_fast',
    title: 'Sub-Second Thinker',
    description: 'Achieve an average response time under 1.2 seconds.',
    icon: '⏱️',
    category: 'speed',
  },
  {
    id: 'perfect_brain',
    title: 'Pure Perfection',
    description: 'Finish any timed game with 100% accuracy (min 15 questions).',
    icon: '💎',
    category: 'accuracy',
  },
  {
    id: 'hot_streak_15',
    title: 'On Fire!',
    description: 'Hit a consecutive streak of 15 correct answers.',
    icon: '🔥',
    category: 'streak',
  },
  {
    id: 'unstoppable_30',
    title: 'Unstoppable',
    description: 'Hit a consecutive streak of 30 correct answers.',
    icon: '🚀',
    category: 'streak',
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Solve 100 mathematical problems in total.',
    icon: '💯',
    category: 'dedication',
  },
  {
    id: 'times_table_titan',
    title: 'Table Titan',
    description: 'Master the Times Table Playground with 100% accuracy.',
    icon: '✖️',
    category: 'arcade',
  },
  {
    id: 'ninja_blackbelt',
    title: 'Ninja Survivor',
    description: 'Survive at least 25 questions in Number Ninja.',
    icon: '🥷',
    category: 'arcade',
  },
  {
    id: 'fraction_pro',
    title: 'Fraction Maestro',
    description: 'Complete Fraction Frenzy with a score of 15+.',
    icon: '🍰',
    category: 'arcade',
  },
  {
    id: 'target_100_hit',
    title: 'Bullseye 100',
    description: 'Hit the exact target number in Target 100.',
    icon: '🎯',
    category: 'arcade',
  },
  {
    id: 'exam_scholar',
    title: 'Admissions Ace',
    description: 'Complete an ESAT / TMUA exam drill with over 80% accuracy.',
    icon: '🎓',
    category: 'arcade',
  },
  {
    id: 'calculus_whiz',
    title: 'Calculus Newton',
    description: 'Score 10 or more in Mental Differentiation & Integration.',
    icon: '📈',
    category: 'arcade',
  },
  {
    id: 'algebra_ace',
    title: 'Algebra Alchemist',
    description: 'Score 10 or more in Mental Algebra & Equations.',
    icon: '📐',
    category: 'arcade',
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Train your brain after 9:00 PM.',
    icon: '🦉',
    category: 'dedication',
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Start your morning with a brain workout before 9:00 AM.',
    icon: '☀️',
    category: 'dedication',
  },
  {
    id: 'daily_habit',
    title: 'Calendar Streak',
    description: 'Complete 3 different Daily Challenges.',
    icon: '📅',
    category: 'dedication',
  }
];

const DEFAULT_STATS: UserStats = {
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  overallAccuracy: 100,
  totalPlayTimeSeconds: 0,
  sessionsCount: 0,
  highestOverallStreak: 0,
  operationStats: {
    '+': { attempts: 0, correct: 0 },
    '-': { attempts: 0, correct: 0 },
    '×': { attempts: 0, correct: 0 },
    '÷': { attempts: 0, correct: 0 },
  },
  bests: {},
  dailyCompletedDates: [],
  unlockedBadgeIds: [],
};

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: false,
  volume: 0.5,
  theme: 'cream',
  reducedMotion: false,
  instantAdvance: true,
  selectedMascotMood: 'happy',
  showOnScreenKeypad: false,
};

export class StorageService {
  public static getStats(): UserStats {
    try {
      const data = localStorage.getItem(STATS_KEY);
      if (!data) return DEFAULT_STATS;
      const parsed = JSON.parse(data);
      return { ...DEFAULT_STATS, ...parsed };
    } catch {
      return DEFAULT_STATS;
    }
  }

  public static saveStats(stats: UserStats): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }

  public static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public static saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }

  public static recordSession(session: GameSessionResult): { isNewPersonalBest: boolean; newlyUnlockedBadges: Badge[] } {
    const stats = this.getStats();
    const modeKey = session.mode;
    const currentBest = stats.bests[modeKey];
    
    let isNewPersonalBest = false;
    if (!currentBest || session.score > currentBest.highScore) {
      isNewPersonalBest = true;
    }

    const updatedBest: PersonalBest = {
      mode: session.mode,
      highScore: currentBest ? Math.max(currentBest.highScore, session.score) : session.score,
      bestAccuracy: currentBest ? Math.max(currentBest.bestAccuracy, session.accuracy) : session.accuracy,
      longestStreak: currentBest ? Math.max(currentBest.longestStreak, session.longestStreak) : session.longestStreak,
      fastestAvgResponseMs: currentBest && currentBest.fastestAvgResponseMs > 0
        ? Math.min(currentBest.fastestAvgResponseMs, session.avgResponseTimeMs)
        : session.avgResponseTimeMs,
      totalGamesPlayed: (currentBest?.totalGamesPlayed || 0) + 1,
      lastPlayed: Date.now(),
    };

    // Update overall totals
    stats.totalQuestionsAnswered += session.totalAttempts;
    stats.totalCorrect += session.correctCount;
    stats.totalPlayTimeSeconds += session.duration;
    stats.sessionsCount += 1;
    stats.highestOverallStreak = Math.max(stats.highestOverallStreak, session.longestStreak);
    stats.overallAccuracy = stats.totalQuestionsAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestionsAnswered) * 100)
      : 100;

    stats.bests[modeKey] = updatedBest;

    // Track operation performance
    session.records.forEach(r => {
      let op: Operation | null = null;
      if (r.question.includes('+')) op = '+';
      else if (r.question.includes('-')) op = '-';
      else if (r.question.includes('×') || r.question.includes('*')) op = '×';
      else if (r.question.includes('÷') || r.question.includes('/')) op = '÷';

      if (op && stats.operationStats[op]) {
        stats.operationStats[op].attempts += 1;
        if (r.isCorrect) {
          stats.operationStats[op].correct += 1;
        }
      }
    });

    // Check newly unlocked badges
    const currentUnlocked = new Set(stats.unlockedBadgeIds);
    const newlyUnlocked: Badge[] = [];
    const now = new Date();
    const hour = now.getHours();

    ALL_BADGES.forEach(badge => {
      if (currentUnlocked.has(badge.id)) return;

      let earned = false;
      switch (badge.id) {
        case 'first_steps':
          earned = stats.totalCorrect >= 10;
          break;
        case 'speed_demon':
          earned = session.duration <= 65 && session.correctCount >= 20;
          break;
        case 'lightning_fast':
          earned = session.totalAttempts >= 10 && session.avgResponseTimeMs < 1200;
          break;
        case 'perfect_brain':
          earned = session.totalAttempts >= 15 && session.accuracy === 100;
          break;
        case 'hot_streak_15':
          earned = session.longestStreak >= 15;
          break;
        case 'unstoppable_30':
          earned = session.longestStreak >= 30;
          break;
        case 'centurion':
          earned = stats.totalCorrect >= 100;
          break;
        case 'times_table_titan':
          earned = session.mode === 'timestables' && session.accuracy === 100 && session.totalAttempts >= 15;
          break;
        case 'ninja_blackbelt':
          earned = session.mode === 'ninja' && session.correctCount >= 25;
          break;
        case 'fraction_pro':
          earned = session.mode === 'fractions' && session.correctCount >= 15;
          break;
        case 'target_100_hit':
          earned = session.mode === 'target100' && session.score >= 100;
          break;
        case 'exam_scholar':
          earned = session.mode === 'exam' && session.accuracy >= 80 && session.totalAttempts >= 10;
          break;
        case 'calculus_whiz':
          earned = session.mode === 'calculus' && session.correctCount >= 10;
          break;
        case 'algebra_ace':
          earned = session.mode === 'algebra' && session.correctCount >= 10;
          break;
        case 'night_owl':
          earned = hour >= 21 || hour < 4;
          break;
        case 'early_bird':
          earned = hour >= 5 && hour < 9;
          break;
        case 'daily_habit':
          earned = stats.dailyCompletedDates.length >= 3;
          break;
      }

      if (earned) {
        newlyUnlocked.push(badge);
        currentUnlocked.add(badge.id);
      }
    });

    stats.unlockedBadgeIds = Array.from(currentUnlocked);
    this.saveStats(stats);

    return { isNewPersonalBest, newlyUnlockedBadges: newlyUnlocked };
  }

  public static isDailyCompleted(dateStr: string): boolean {
    const stats = this.getStats();
    return stats.dailyCompletedDates.includes(dateStr);
  }

  public static markDailyCompleted(dateStr: string): void {
    const stats = this.getStats();
    if (!stats.dailyCompletedDates.includes(dateStr)) {
      stats.dailyCompletedDates.push(dateStr);
      this.saveStats(stats);
    }
  }

  public static resetAllData(): void {
    try {
      localStorage.removeItem(STATS_KEY);
      localStorage.removeItem(SETTINGS_KEY);
    } catch {}
  }
}
