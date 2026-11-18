import React from 'react';
import { Zap, Sigma, GraduationCap, Calendar, ArrowRight, Target, Flame, Divide, Sliders } from 'lucide-react';
import { GameMode, ClassicConfig } from '../../types/game';
import { StorageService } from '../../storage/storage';
import { Button } from '../common/Button';
import { Mascot } from '../mascot/Mascot';
import { sound } from '../../audio/soundEngine';
import SpotlightCard from '../reactbits/SpotlightCard';
import Magnet from '../reactbits/Magnet';

interface HomeScreenProps {
  onStartGame: (mode: GameMode, preset?: Partial<ClassicConfig>) => void;
  onOpenDaily: () => void;
  onOpenStats?: () => void;
  onOpenStickers?: () => void;
  isDark?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onOpenDaily,
  isDark = false,
}) => {
  const stats = StorageService.getStats();
  const todayStr = new Date().toISOString().split('T')[0];
  const isDailyDone = StorageService.isDailyCompleted(todayStr);

  const arenas: {
    id: GameMode;
    title: string;
    tag: string;
    glyph: React.ReactNode;
    description: string;
    topics: string[];
    best: number;
    bestLabel: string;
    accentClass: string;
    tagClass: string;
    spotColor: string;
    preset?: Partial<ClassicConfig>;
  }[] = [
    {
      id: 'classic',
      title: 'Zetamac Blitz',
      tag: 'ARITHMETIC & FLUENCY',
      glyph: <Zap size={24} className="text-amber-600 dark:text-amber-300" />,
      description: 'High-velocity mental arithmetic, configurable ranges, and instant keystroke advance.',
      topics: ['+ − × ÷', 'Custom Ranges', '30s / 60s / 120s', 'Negatives'],
      best: stats.bests['classic']?.highScore || 0,
      bestLabel: 'Best',
      accentClass: 'hover:border-amber-500 dark:hover:border-amber-400',
      tagClass: 'bg-butter-200 dark:bg-amber-950/70 text-midnight-950 dark:text-amber-300 border-midnight-900/20 dark:border-amber-500/30',
      spotColor: '#F59E0B',
    },
    {
      id: 'calculus',
      title: 'Mental Calculus',
      tag: 'A-LEVEL & FURTHER',
      glyph: <Sigma size={24} className="text-cobalt-600 dark:text-cobalt-300" />,
      description: 'Evaluate derivatives, definite integrals, and Maclaurin series coefficients mentally.',
      topics: ['Chain / Product / Quotient', 'Trig & eˣ / ln x', 'Parts & Arctan', 'Maclaurin'],
      best: stats.bests['calculus']?.highScore || 0,
      bestLabel: 'Best',
      accentClass: 'hover:border-cobalt-500 dark:hover:border-cobalt-400',
      tagClass: 'bg-cobalt-100 dark:bg-blue-950/70 text-cobalt-900 dark:text-blue-300 border-midnight-900/20 dark:border-blue-500/30',
      spotColor: '#3B82F6',
    },
    {
      id: 'algebra',
      title: 'Algebra',
      tag: 'PURE + FURTHER CORE',
      glyph: <span className="font-mono font-black text-lg text-purple-600 dark:text-purple-300">det</span>,
      description: 'Rapid algebraic manipulation across quadratics, logs, complex numbers, matrices, and vectors.',
      topics: ['Quadratics & Logs', 'Exact Trig', 'Complex (ℂ) & Cubics', '2×2 Matrices & Dot'],
      best: stats.bests['algebra']?.highScore || 0,
      bestLabel: 'Best',
      accentClass: 'hover:border-purple-500 dark:hover:border-purple-400',
      tagClass: 'bg-lavender-200 dark:bg-purple-950/70 text-midnight-950 dark:text-purple-300 border-midnight-900/20 dark:border-purple-500/30',
      spotColor: '#A855F7',
    },
    {
      id: 'exam',
      title: 'Admissions Blitz',
      tag: 'ESAT & TMUA PREP',
      glyph: <GraduationCap size={24} className="text-emerald-600 dark:text-emerald-300" />,
      description: 'ESAT (M1 & M2) and TMUA non-calculator speed traps: surds, bounds, logs, trig, and probability.',
      topics: ['SI, Surds & Bounds', 'Logs, Circles & S∞', 'Trig Roots & FTC', 'Similarity & E(X)'],
      best: stats.bests['exam']?.highScore || 0,
      bestLabel: 'Best',
      accentClass: 'hover:border-emerald-500 dark:hover:border-emerald-400',
      tagClass: 'bg-mint-200 dark:bg-emerald-950/70 text-midnight-950 dark:text-emerald-300 border-midnight-900/20 dark:border-emerald-500/30',
      spotColor: '#10B981',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 animate-pop">
      {/* -------------------------------------------------------------------- */}
      {/* 1. CLEAN EDITORIAL HERO */}
      {/* -------------------------------------------------------------------- */}
      <section className="text-center pt-4 pb-2 space-y-5">
        <div className="flex justify-center">
          <Mascot mood="happy" size="lg" streak={stats.highestOverallStreak} />
        </div>

        <div className="space-y-2">
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-midnight-900 dark:text-cream-100 tracking-tight leading-[1.08]">
            Sharp mind.{' '}
            <span className="text-cobalt-600 dark:text-cobalt-400">
              Zero friction.
            </span>
          </h1>

          <p className="text-sm sm:text-base font-medium text-midnight-900/65 dark:text-cream-200/65 max-w-xl mx-auto">
            Procedural mental fluency for <strong className="text-midnight-900 dark:text-cream-100">A-Level Maths</strong>,{' '}
            <strong className="text-midnight-900 dark:text-cream-100">Further Maths</strong>,{' '}
            <strong className="text-midnight-900 dark:text-cream-100">ESAT</strong> &amp;{' '}
            <strong className="text-midnight-900 dark:text-cream-100">TMUA</strong>.
          </p>
        </div>

        <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Magnet padding={55} magnetStrength={5} maxOffset={6} wrapperClassName="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="xl"
              onClick={() => onStartGame('classic', { duration: 60, difficulty: 'medium', autoStart: true })}
              icon={<Zap size={20} className="fill-midnight-950 text-midnight-950" />}
              className="w-full sm:w-auto px-8 py-3.5 shadow-retro-md"
            >
              LAUNCH ZETAMAC (60s)
            </Button>
          </Magnet>

          <Button
            variant="outline"
            size="xl"
            onClick={() => {
              sound.playClick();
              onOpenDaily();
            }}
            icon={<Calendar size={18} />}
            className="w-full sm:w-auto px-6 py-3.5"
          >
            {isDailyDone ? 'DAILY COMPLETED ✓' : 'DAILY CHALLENGE'}
          </Button>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 2. THE 4 CORE ARENAS (2x2 Bento Grid) */}
      {/* -------------------------------------------------------------------- */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-midnight-900 dark:text-cream-100 tracking-tight">
            Training Arenas
          </h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {arenas.map((arena) => (
            <SpotlightCard
              key={arena.id}
              theme={isDark ? 'dark' : 'light'}
              spotlightColor={arena.spotColor}
              intensity={isDark ? 0.2 : 0.12}
              borderGlow={0.5}
              spotlightSize={260}
              className={`bg-white dark:bg-slate-900/90 border-2 border-midnight-900 dark:border-slate-700/80 shadow-retro dark:shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 hover:shadow-retro-lg transition-all ${arena.accentClass}`}
            >
              <button
                onClick={() => {
                  sound.playClick();
                  onStartGame(arena.id, arena.preset);
                }}
                className="group w-full h-full p-6 text-left flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Top row: Icon + Tag + Best */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-cream-100 dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 flex items-center justify-center shrink-0">
                        {arena.glyph}
                      </div>
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold tracking-wider uppercase ${arena.tagClass}`}>
                          {arena.tag}
                        </span>
                        <h3 className="font-display font-extrabold text-xl text-midnight-900 dark:text-cream-100 mt-0.5">
                          {arena.title}
                        </h3>
                      </div>
                    </div>

                    {arena.best > 0 && (
                      <span className="px-2.5 py-1 rounded-xl bg-cream-100 dark:bg-slate-800 border border-midnight-900/20 dark:border-slate-700 font-mono text-xs font-bold text-midnight-900 dark:text-cream-200 shrink-0">
                        {arena.bestLabel}: {arena.best}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-midnight-900/70 dark:text-cream-200/70 leading-relaxed">
                    {arena.description}
                  </p>
                </div>

                {/* Topic Pills + Enter Arrow */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-midnight-900/10 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1.5">
                    {arena.topics.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-cream-100 dark:bg-slate-800 text-[11px] font-mono text-midnight-900/75 dark:text-cream-200/75"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-midnight-900/40 dark:text-cream-200/40 group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 group-hover:translate-x-1 transition-all shrink-0"
                  />
                </div>
              </button>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 3. COMPACT ARCADE STRIP */}
      {/* -------------------------------------------------------------------- */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-midnight-900/60 dark:text-cream-200/50">
            Quick Arcade
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              id: 'ninja' as GameMode,
              title: 'Number Ninja',
              sub: '3-life survival',
              spotColor: '#F43F5E',
              hoverBorder: 'hover:border-cherry-500',
              iconBg: 'bg-cherry-100 dark:bg-rose-950/60 border-midnight-900/20 dark:border-rose-500/30',
              icon: <Flame size={18} className="text-cherry-600 dark:text-rose-400" />,
            },
            {
              id: 'target100' as GameMode,
              title: 'Target 100',
              sub: 'Countdown puzzle',
              spotColor: '#F59E0B',
              hoverBorder: 'hover:border-amber-500',
              iconBg: 'bg-butter-200 dark:bg-amber-950/60 border-midnight-900/20 dark:border-amber-500/30',
              icon: <Target size={18} className="text-amber-700 dark:text-amber-300" />,
            },
            {
              id: 'fractions' as GameMode,
              title: 'Fraction Frenzy',
              sub: 'Rapid simplification',
              spotColor: '#A855F7',
              hoverBorder: 'hover:border-purple-500',
              iconBg: 'bg-lavender-200 dark:bg-purple-950/60 border-midnight-900/20 dark:border-purple-500/30',
              icon: <Divide size={18} className="text-purple-700 dark:text-purple-300" />,
            },
            {
              id: 'operators' as GameMode,
              title: 'Operator Blitz',
              sub: 'Reverse BIDMAS',
              spotColor: '#3B82F6',
              hoverBorder: 'hover:border-cobalt-500',
              iconBg: 'bg-cobalt-100 dark:bg-blue-950/60 border-midnight-900/20 dark:border-blue-500/30',
              icon: <Sliders size={18} className="text-cobalt-600 dark:text-blue-400" />,
            },
          ].map((item) => (
            <SpotlightCard
              key={item.id}
              theme={isDark ? 'dark' : 'light'}
              spotlightColor={item.spotColor}
              intensity={isDark ? 0.22 : 0.14}
              borderGlow={0.5}
              spotlightSize={180}
              className={`rounded-2xl bg-white dark:bg-slate-900/90 border-2 border-midnight-900 dark:border-slate-700/80 shadow-retro-sm hover:-translate-y-0.5 transition-all ${item.hoverBorder}`}
            >
              <button
                onClick={() => {
                  sound.playClick();
                  onStartGame(item.id);
                }}
                className="w-full h-full p-4 text-left flex items-center gap-3"
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  {item.icon}
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-midnight-900 dark:text-cream-100">{item.title}</p>
                  <p className="text-[11px] font-mono text-midnight-900/60 dark:text-cream-200/50">{item.sub}</p>
                </div>
              </button>
            </SpotlightCard>
          ))}
        </div>
      </section>
    </div>
  );
};
