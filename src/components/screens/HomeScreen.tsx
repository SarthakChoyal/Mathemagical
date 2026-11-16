import React, { useState } from 'react';
import { Play, Sparkles, Flame, Clock, Trophy, Target, Zap, ArrowRight, Shield, Award, Calendar, BookOpen, Layers, GraduationCap, Sigma, Calculator, Grid } from 'lucide-react';
import { GameMode, ClassicConfig } from '../../types/game';
import { StorageService } from '../../storage/storage';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Mascot } from '../mascot/Mascot';
import { sound } from '../../audio/soundEngine';

interface HomeScreenProps {
  onStartGame: (mode: GameMode, preset?: Partial<ClassicConfig>) => void;
  onOpenDaily: () => void;
  onOpenStats: () => void;
  onOpenStickers: () => void;
}

type CategoryFilter = 'all' | 'zetamac' | 'calculus' | 'algebra' | 'arcade' | 'exam';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onOpenDaily,
  onOpenStats,
  onOpenStickers,
}) => {
  const stats = StorageService.getStats();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  const categories = [
    { id: 'all', label: 'All Modes', icon: '✨' },
    { id: 'zetamac', label: 'Zetamac Blitz', icon: '⚡' },
    { id: 'calculus', label: 'Mental Calculus', icon: '📈' },
    { id: 'algebra', label: 'Algebra & Equations', icon: '📐' },
    { id: 'arcade', label: 'Arcade Mini-Games', icon: '🕹️' },
    { id: 'exam', label: 'Admissions Prep', icon: '🎓' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12 animate-pop">
      {/* -------------------------------------------------------------------- */}
      {/* 1. HERO SECTION */}
      {/* -------------------------------------------------------------------- */}
      <section className="relative text-center pt-6 pb-4">
        {/* Playful Floating Doodles / Math Badges */}
        <div className="hidden sm:block absolute left-4 top-8 -rotate-12 bg-butter-200 dark:bg-amber-400 text-midnight-950 border-2 border-midnight-900 dark:border-amber-300 rounded-2xl px-3 py-1 font-mono font-bold text-sm shadow-retro-sm">
          7 × 8 = 56
        </div>
        <div className="hidden sm:block absolute right-8 top-12 rotate-12 bg-mint-200 dark:bg-emerald-400 text-midnight-950 border-2 border-midnight-900 dark:border-emerald-300 rounded-2xl px-3 py-1 font-mono font-bold text-sm shadow-retro-sm">
          d/dx (x³) = 3x²
        </div>
        <div className="hidden md:block absolute left-12 bottom-4 rotate-6 bg-lavender-200 dark:bg-purple-400 text-midnight-950 border-2 border-midnight-900 dark:border-purple-300 rounded-2xl px-3 py-1 font-mono font-bold text-xs shadow-retro-sm">
          ∫ 2x dx = x²
        </div>

        <div className="flex justify-center mb-4">
          <Mascot mood="happy" size="lg" streak={stats.highestOverallStreak} />
        </div>

        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-midnight-900 dark:text-cream-100 tracking-tight max-w-2xl mx-auto leading-[1.1]">
          Give your brain a{' '}
          <span className="text-cobalt-600 dark:text-cobalt-400 underline decoration-butter-400 dark:decoration-amber-300 decoration-wavy decoration-2">
            little workout
          </span>
          .
        </h1>

        <p className="text-base sm:text-lg font-medium text-midnight-900/70 dark:text-cream-200/70 mt-3 max-w-md mx-auto">
          Quick-fire mental maths. Satisfying streaks. A sharper mind.
        </p>

        {/* Primary Giant Action Buttons */}
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="xl"
            onClick={() => onStartGame('classic', { duration: 60, difficulty: 'medium', autoStart: true })}
            icon={<Zap size={22} className="fill-midnight-950 text-midnight-950" />}
            className="w-full sm:w-auto text-lg px-8 py-4 shadow-retro-lg hover:shadow-retro-xl"
          >
            PLAY ZETAMAC (60s SPRINT)
          </Button>

          <Button
            variant="primary"
            size="xl"
            onClick={() => onStartGame('calculus')}
            icon={<Sigma size={20} className="fill-white" />}
            className="w-full sm:w-auto text-lg px-8 py-4 shadow-retro-md"
          >
            MENTAL CALCULUS
          </Button>
        </div>
        </section>

      {/* -------------------------------------------------------------------- */}
      {/* 2. QUICK PLAY PRESETS */}
      {/* -------------------------------------------------------------------- */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <h2 className="font-display font-bold text-xl text-midnight-900 dark:text-cream-100">
              Quick Launch
            </h2>
          </div>
          <span className="text-xs font-mono text-midnight-900/50 dark:text-cream-200/40">
            One-click instant start
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              title: '30s Blitz',
              subtitle: 'Rapid arithmetic sprint',
              action: () => onStartGame('classic', { duration: 30, difficulty: 'easy', autoStart: true }),
              color: 'bg-butter-200 dark:bg-amber-950/40 text-midnight-950 dark:text-butter-200 border-midnight-900 dark:border-amber-500/40',
              icon: '⚡',
            },
            {
              title: '60s Zetamac',
              subtitle: 'Standard medium drill',
              action: () => onStartGame('classic', { duration: 60, difficulty: 'medium', autoStart: true }),
              color: 'bg-cobalt-100 dark:bg-blue-950/40 text-midnight-950 dark:text-cobalt-200 border-midnight-900 dark:border-blue-500/40',
              icon: '🎯',
            },
            {
              title: 'Mental d/dx',
              subtitle: 'Derivatives power drill',
              action: () => onStartGame('calculus'),
              color: 'bg-lavender-200 dark:bg-purple-950/40 text-midnight-950 dark:text-purple-200 border-midnight-900 dark:border-purple-500/40',
              icon: '📈',
            },
            {
              title: 'Algebra Speed',
              subtitle: 'Linear & quadratics',
              action: () => onStartGame('algebra'),
              color: 'bg-mint-200 dark:bg-emerald-950/40 text-midnight-950 dark:text-emerald-200 border-midnight-900 dark:border-emerald-500/40',
              icon: '📐',
            },
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                sound.playClick();
                preset.action();
              }}
              className={`p-4 rounded-2xl border-2 ${preset.color} text-left shadow-retro-sm dark:shadow-[2px_2px_0px_#000] hover:shadow-retro hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex flex-col justify-between h-28`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{preset.icon}</span>
                <Play size={14} className="opacity-50" />
              </div>
              <div>
                <p className="font-display font-bold text-sm">
                  {preset.title}
                </p>
                <p className="text-[11px] font-mono opacity-70">
                  {preset.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 3. THE ARCADE (Bento Categorized Grid) */}
      {/* -------------------------------------------------------------------- */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕹️</span>
            <h2 className="font-display font-extrabold text-2xl text-midnight-900 dark:text-cream-100">
              The Arcade
            </h2>
          </div>

          {/* Category Filter Pills (ReactBits inspired clean tabs) */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-cream-200/60 dark:bg-slate-900/80 border border-midnight-900/10 dark:border-slate-800">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat.id as CategoryFilter);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-display font-bold transition-all flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? 'bg-cobalt-600 text-white shadow-retro-sm dark:shadow-[2px_2px_0px_#000]'
                    : 'text-midnight-900/70 dark:text-cream-200/70 hover:bg-white/40 dark:hover:bg-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Game Cards Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* 1. Classic Zetamac Arithmetic */}
          {(selectedCategory === 'all' || selectedCategory === 'zetamac') && (
            <div
              onClick={() => onStartGame('classic')}
              className="group cursor-pointer p-5 rounded-3xl bg-white dark:bg-slate-900/90 border-3 border-midnight-900 dark:border-slate-700 shadow-retro dark:shadow-[3px_3px_0px_#000] hover:shadow-retro-md hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 rounded-2xl bg-cobalt-500 text-white border-2 border-midnight-900 dark:border-cobalt-300 flex items-center justify-center font-mono font-black text-xl shadow-retro-sm">
                    ⚡
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-butter-200 dark:bg-amber-400 text-midnight-950 border border-midnight-900 dark:border-amber-300 text-[10px] font-mono font-black">
                    ZETAMAC
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-midnight-900 dark:text-cream-100 group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors">
                  Zetamac Arithmetic
                </h3>
                <p className="text-xs text-midnight-900/70 dark:text-cream-200/70 mt-1 leading-relaxed">
                  Pure rapid-fire mental arithmetic. Type exact answers with zero lag. Custom operations (+, −, ×, ÷) and time limits.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-midnight-900/10 dark:border-slate-800 flex items-center justify-between text-xs font-display font-bold text-cobalt-600 dark:text-cobalt-400">
                <span>Play Zetamac</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* 2. Mental Calculus (NEW!) */}
          {(selectedCategory === 'all' || selectedCategory === 'calculus') && (
            <div
              onClick={() => onStartGame('calculus')}
              className="group cursor-pointer p-5 rounded-3xl bg-white dark:bg-slate-900/90 border-3 border-midnight-900 dark:border-slate-700 shadow-retro dark:shadow-[3px_3px_0px_#000] hover:shadow-retro-md hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 rounded-2xl bg-lavender-500 text-white border-2 border-midnight-900 dark:border-purple-300 flex items-center justify-center text-2xl shadow-retro-sm">
                    📈
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-lavender-100 dark:bg-purple-900/60 text-lavender-800 dark:text-purple-200 border border-midnight-900 dark:border-purple-500 text-[10px] font-mono font-bold">
                    CALCULUS
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-midnight-900 dark:text-cream-100 group-hover:text-lavender-600 dark:group-hover:text-purple-400 transition-colors">
                  Mental Calculus
                </h3>
                <p className="text-xs text-midnight-900/70 dark:text-cream-200/70 mt-1 leading-relaxed">
                  Rapid mental differentiation (power, chain, trig & exponential) and mental definite integrals in the Goldilocks zone.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-midnight-900/10 dark:border-slate-800 flex items-center justify-between text-xs font-display font-bold text-lavender-600 dark:text-purple-400">
                <span>Solve Derivatives & Integrals</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* 3. Mental Algebra (NEW!) */}
          {(selectedCategory === 'all' || selectedCategory === 'algebra') && (
            <div
              onClick={() => onStartGame('algebra')}
              className="group cursor-pointer p-5 rounded-3xl bg-white dark:bg-slate-900/90 border-3 border-midnight-900 dark:border-slate-700 shadow-retro dark:shadow-[3px_3px_0px_#000] hover:shadow-retro-md hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 rounded-2xl bg-mint-400 text-midnight-950 border-2 border-midnight-900 dark:border-emerald-300 flex items-center justify-center text-2xl shadow-retro-sm">
                    📐
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-mint-100 dark:bg-emerald-900/60 text-mint-800 dark:text-emerald-200 border border-midnight-900 dark:border-emerald-500 text-[10px] font-mono font-bold">
                    ALGEBRA
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-midnight-900 dark:text-cream-100 group-hover:text-mint-600 dark:group-hover:text-emerald-400 transition-colors">
                  Mental Algebra
                </h3>
                <p className="text-xs text-midnight-900/70 dark:text-cream-200/70 mt-1 leading-relaxed">
                  Solve linear equations in seconds, factor mental quadratic roots, and master exponent power laws without pencil and paper.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-midnight-900/10 dark:border-slate-800 flex items-center justify-between text-xs font-display font-bold text-mint-700 dark:text-emerald-400">
                <span>Play Mental Algebra</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* 4. Number Ninja */}
          {(selectedCategory === 'all' || selectedCategory === 'arcade') && (
            <div
              onClick={() => onStartGame('ninja')}
              className="group cursor-pointer p-5 rounded-3xl bg-white dark:bg-slate-900/90 border-3 border-midnight-900 dark:border-slate-700 shadow-retro dark:shadow-[3px_3px_0px_#000] hover:shadow-retro-md hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 rounded-2xl bg-cherry-400 text-white border-2 border-midnight-900 dark:border-cherry-300 flex items-center justify-center text-2xl shadow-retro-sm">
                    🥷
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cherry-100 dark:bg-rose-900/60 text-cherry-700 dark:text-rose-200 border border-midnight-900 dark:border-cherry-500 text-[10px] font-mono font-bold">
                    SURVIVAL
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-midnight-900 dark:text-cream-100 group-hover:text-cherry-600 dark:group-hover:text-cherry-400 transition-colors">
                  Number Ninja
                </h3>
                <p className="text-xs text-midnight-900/70 dark:text-cream-200/70 mt-1 leading-relaxed">
                  Survive escalating waves! 3 lives, shrinking countdown timers, and compounding score multipliers.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-midnight-900/10 dark:border-slate-800 flex items-center justify-between text-xs font-display font-bold text-cherry-600 dark:text-cherry-400">
                <span>Enter Dojo</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* 5. Times Table Playground */}
          {(selectedCategory === 'all' || selectedCategory === 'arcade') && (
            <div
              onClick={() => onStartGame('timestables')}
              className="group cursor-pointer p-5 rounded-3xl bg-white dark:bg-slate-900/90 border-3 border-midnight-900 dark:border-slate-700 shadow-retro dark:shadow-[3px_3px_0px_#000] hover:shadow-retro-md hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 rounded-2xl bg-butter-300 text-midnight-950 border-2 border-midnight-900 dark:border-amber-300 flex items-center justify-center font-mono font-black text-xl shadow-retro-sm">
                    ✖️
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-butter-100 dark:bg-amber-900/60 text-midnight-950 dark:text-amber-200 border border-midnight-900 dark:border-amber-400 text-[10px] font-mono font-bold">
                    TABLES
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-midnight-900 dark:text-cream-100 group-hover:text-butter-600 dark:group-hover:text-amber-300 transition-colors">
                  Table Playground
                </h3>
                <p className="text-xs text-midnight-900/70 dark:text-cream-200/70 mt-1 leading-relaxed">
                  Target specific multiplication tables (1-12), missing factors (7 × ? = 56), and reverse divisions.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-midnight-900/10 dark:border-slate-800 flex items-center justify-between text-xs font-display font-bold text-butter-700 dark:text-amber-300">
                <span>Practise Tables</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* 6. Fraction Frenzy */}
          {(selectedCategory === 'all' || selectedCategory === 'arcade') && (
            <div
              onClick={() => onStartGame('fractions')}
              className="group cursor-pointer p-5 rounded-3xl bg-white dark:bg-slate-900/90 border-3 border-midnight-900 dark:border-slate-700 shadow-retro dark:shadow-[3px_3px_0px_#000] hover:shadow-retro-md hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 rounded-2xl bg-lavender-400 text-midnight-950 border-2 border-midnight-900 dark:border-purple-300 flex items-center justify-center text-2xl shadow-retro-sm">
                    🍰
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-lavender-100 dark:bg-purple-900/60 text-midnight-950 dark:text-purple-200 border border-midnight-900 dark:border-purple-400 text-[10px] font-mono font-bold">
                    FRACTIONS
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-midnight-900 dark:text-cream-100 group-hover:text-lavender-600 dark:group-hover:text-purple-400 transition-colors">
                  Fraction Frenzy
                </h3>
                <p className="text-xs text-midnight-900/70 dark:text-cream-200/70 mt-1 leading-relaxed">
                  Simplification, addition, multiplication and decimal conversions. Solve mental fractions with ease.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-midnight-900/10 dark:border-slate-800 flex items-center justify-between text-xs font-display font-bold text-lavender-700 dark:text-purple-400">
                <span>Master Fractions</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* 7. Target 100 */}
          {(selectedCategory === 'all' || selectedCategory === 'arcade') && (
            <div
              onClick={() => onStartGame('target100')}
              className="group cursor-pointer p-5 rounded-3xl bg-white dark:bg-slate-900/90 border-3 border-midnight-900 dark:border-slate-700 shadow-retro dark:shadow-[3px_3px_0px_#000] hover:shadow-retro-md hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 rounded-2xl bg-peach-400 text-midnight-950 border-2 border-midnight-900 dark:border-orange-300 flex items-center justify-center text-2xl shadow-retro-sm">
                    🎯
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-peach-100 dark:bg-orange-950/60 text-midnight-950 dark:text-orange-200 border border-midnight-900 dark:border-orange-400 text-[10px] font-mono font-bold">
                    COUNTDOWN
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-midnight-900 dark:text-cream-100 group-hover:text-peach-600 dark:group-hover:text-orange-400 transition-colors">
                  Target 100
                </h3>
                <p className="text-xs text-midnight-900/70 dark:text-cream-200/70 mt-1 leading-relaxed">
                  Combine number tiles using +, −, ×, ÷ to reach exactly 100. Tactile number puzzle.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-midnight-900/10 dark:border-slate-800 flex items-center justify-between text-xs font-display font-bold text-peach-700 dark:text-orange-400">
                <span>Hit Bullseye</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* 8. Admissions Exam Prep */}
          {(selectedCategory === 'all' || selectedCategory === 'exam') && (
            <div
              onClick={() => onStartGame('exam')}
              className="group cursor-pointer p-5 rounded-3xl bg-white dark:bg-slate-900/90 border-3 border-midnight-900 dark:border-slate-700 shadow-retro dark:shadow-[3px_3px_0px_#000] hover:shadow-retro-md hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 rounded-2xl bg-butter-300 text-midnight-950 border-2 border-midnight-900 dark:border-amber-300 flex items-center justify-center text-2xl shadow-retro-sm">
                    🎓
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-butter-100 dark:bg-amber-900/60 text-midnight-950 dark:text-amber-200 border border-midnight-900 dark:border-amber-400 text-[10px] font-mono font-bold">
                    ESAT & TMUA
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-midnight-900 dark:text-cream-100 group-hover:text-butter-600 dark:group-hover:text-amber-300 transition-colors">
                  ESAT & TMUA Fluency
                </h3>
                <p className="text-xs text-midnight-900/70 dark:text-cream-200/70 mt-1 leading-relaxed">
                  Calculator-free mental calculations: fractional powers, percentages, compound ratios, and scientific powers.
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-midnight-900/10 dark:border-slate-800 flex items-center justify-between text-xs font-display font-bold text-butter-700 dark:text-amber-300">
                <span>Start Admissions Drill</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 4. PROGRESS & PERSONAL BESTS SUMMARY */}
      {/* -------------------------------------------------------------------- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={onOpenStickers}
          className="group cursor-pointer p-5 rounded-3xl bg-cream-50 dark:bg-slate-900/90 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm dark:shadow-[2px_2px_0px_#000] hover:shadow-retro hover:-translate-y-0.5 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-butter-300 dark:bg-amber-400 border-2 border-midnight-900 dark:border-amber-300 flex items-center justify-center text-2xl shadow-retro-sm">
              🏆
            </div>
            <div>
              <p className="font-display font-bold text-base text-midnight-900 dark:text-cream-100">
                Sticker Album
              </p>
              <p className="text-xs text-midnight-900/60 dark:text-cream-200/60 font-mono">
                {stats.unlockedBadgeIds.length} stickers collected
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-midnight-900/50 dark:text-cream-200/50 group-hover:translate-x-1 transition-transform" />
        </div>

        <div
          onClick={onOpenStats}
          className="group cursor-pointer p-5 rounded-3xl bg-cream-50 dark:bg-slate-900/90 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm dark:shadow-[2px_2px_0px_#000] hover:shadow-retro hover:-translate-y-0.5 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-mint-300 dark:bg-emerald-400 border-2 border-midnight-900 dark:border-emerald-300 flex items-center justify-center text-2xl shadow-retro-sm">
              📊
            </div>
            <div>
              <p className="font-display font-bold text-base text-midnight-900 dark:text-cream-100">
                Brain Statistics
              </p>
              <p className="text-xs text-midnight-900/60 dark:text-cream-200/60 font-mono">
                {stats.totalQuestionsAnswered} answered • {stats.overallAccuracy}% accuracy
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-midnight-900/50 dark:text-cream-200/50 group-hover:translate-x-1 transition-transform" />
        </div>
      </section>
    </div>
  );
};
