import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Flame, Clock, Target, XCircle, Award, Sparkles, Share2, Check } from 'lucide-react';
import { GameSessionResult } from '../../types/game';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Mascot } from '../mascot/Mascot';
import { MathText } from '../common/MathText';
import { sound } from '../../audio/soundEngine';

interface ResultsScreenProps {
  result: GameSessionResult;
  onPlayAgain: () => void;
  onBackToArcade: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  onPlayAgain,
  onBackToArcade,
}) => {
  const hasTriggeredRef = useRef(false);
  const [copied, setCopied] = useState(false);

  // Keyboard shortcut: Space or Enter to Play Again, Escape to Back to Arcade
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onPlayAgain();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onBackToArcade();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayAgain, onBackToArcade]);

  useEffect(() => {
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      sound.playFanfare();

      // Confetti burst for high achievement
      if (result.isPersonalBest || result.accuracy >= 90 || result.score >= 20) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#FDE047', '#10B981', '#F43F5E', '#8B5CF6'],
        });
      }
    }
  }, [result]);

  const copyShareScore = () => {
    sound.playClick();
    const shareText = `⚡ Mathemagical — ${result.modeTitle}
🏆 Score: ${result.score} (${result.accuracy}% accuracy)
🔥 Longest Streak: ${result.longestStreak}
⚡ Avg Time: ${(result.avgResponseTimeMs / 1000).toFixed(2)}s
Play at: ${window.location.href}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const incorrectAnswers = result.records.filter((r) => !r.isCorrect);

  // Compute insight from actual data
  const generateInsight = (): string => {
    if (result.isPersonalBest) {
      return `🎉 Brand new personal best! You smashed your previous record by ${
        result.previousBestScore !== undefined
          ? Math.max(1, result.score - result.previousBestScore)
          : result.score
      } points!`;
    }
    if (result.accuracy === 100) {
      return `💎 Laser-sharp accuracy! Zero errors across all ${result.totalAttempts} questions!`;
    }
    if (result.avgResponseTimeMs < 1500) {
      return `⚡ Ultra-rapid reflex! An average response time of ${(result.avgResponseTimeMs / 1000).toFixed(2)}s puts you in speed-demon territory.`;
    }
    if (result.longestStreak >= 10) {
      return `🔥 Great rhythm! Your ${result.longestStreak}-answer streak carried major momentum.`;
    }
    return `📈 Consistent practice is the secret to mental fluency. Keep the momentum going!`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pop">
      {/* Top Banner & Mascot */}
      <div className="flex flex-col items-center text-center mb-6">
        <Mascot mood={result.accuracy >= 80 ? 'cheering' : 'happy'} size="lg" streak={result.longestStreak} />
        
        {result.isPersonalBest ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-butter-300 border-2 border-midnight-900 font-display text-xs font-black shadow-retro-sm uppercase tracking-wider text-midnight-950 animate-bounce-subtle">
            <Sparkles size={14} /> NEW PERSONAL BEST! <Sparkles size={14} />
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 px-3 py-1 mt-3 rounded-full bg-cream-200 dark:bg-slate-800 border border-midnight-900 dark:border-slate-700 font-display text-xs font-bold text-midnight-900 dark:text-cream-200">
            Session Complete
          </div>
        )}

        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-midnight-900 dark:text-cream-100 mt-2">
          {result.modeTitle}
        </h1>
        <p className="text-sm font-medium text-midnight-900/70 dark:text-cream-200/70 mt-1 max-w-md">
          {generateInsight()}
        </p>
      </div>

      {/* Main Score Showcase Card */}
      <Card variant="white" shadow="lg" className="p-6 mb-6 dark:bg-slate-900 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 text-center border-b-2 border-midnight-900/10 dark:border-slate-800 pb-6">
          {/* Big Score */}
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-midnight-900/60 dark:text-cream-200/60">
              Total Score
            </span>
            <div className="font-mono font-extrabold text-5xl sm:text-6xl text-cobalt-600 dark:text-cobalt-400 mt-1 tracking-tight">
              {result.score}
            </div>
            <span className="text-xs font-bold text-midnight-900/70 dark:text-cream-200/70">
              {result.correctCount} correct of {result.totalAttempts}
            </span>
          </div>

          <div className="h-12 w-0.5 bg-midnight-900/10 dark:bg-slate-800 hidden sm:block" />

          {/* Accuracy */}
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-midnight-900/60 dark:text-cream-200/60">
              Accuracy
            </span>
            <div className={`font-mono font-extrabold text-5xl sm:text-6xl mt-1 tracking-tight ${
              result.accuracy >= 90 ? 'text-mint-600 dark:text-emerald-400' : result.accuracy >= 75 ? 'text-midnight-900 dark:text-cream-100' : 'text-cherry-500 dark:text-rose-400'
            }`}>
              {result.accuracy}%
            </div>
            <span className="text-xs font-bold text-midnight-900/70 dark:text-cream-200/70">
              {result.incorrectCount} mistakes
            </span>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-5">
          <div className="p-3 rounded-xl bg-cream-100 dark:bg-slate-800 border border-midnight-900/20 dark:border-slate-700 text-center">
            <span className="text-[11px] font-mono text-midnight-900/60 dark:text-cream-200/60 flex items-center justify-center gap-1">
              <Clock size={12} /> Avg Speed
            </span>
            <p className="font-mono font-bold text-lg text-midnight-900 dark:text-cream-100 mt-0.5">
              {(result.avgResponseTimeMs / 1000).toFixed(2)}s
            </p>
          </div>

          <div className="p-3 rounded-xl bg-cream-100 dark:bg-slate-800 border border-midnight-900/20 dark:border-slate-700 text-center">
            <span className="text-[11px] font-mono text-midnight-900/60 dark:text-cream-200/60 flex items-center justify-center gap-1">
              <Flame size={12} className="text-cherry-500" /> Best Streak
            </span>
            <p className="font-mono font-bold text-lg text-midnight-900 dark:text-cream-100 mt-0.5">
              {result.longestStreak} in a row
            </p>
          </div>

          <div className="p-3 rounded-xl bg-cream-100 dark:bg-slate-800 border border-midnight-900/20 dark:border-slate-700 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] font-mono text-midnight-900/60 dark:text-cream-200/60 flex items-center justify-center gap-1">
              <Target size={12} /> Duration
            </span>
            <p className="font-mono font-bold text-lg text-midnight-900 dark:text-cream-100 mt-0.5">
              {result.duration}s
            </p>
          </div>
        </div>

        {/* 1-Click Share Button */}
        <div className="mt-5 pt-4 border-t border-midnight-900/10 dark:border-slate-800 flex justify-center">
          <button
            onClick={copyShareScore}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cream-50 dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 font-display text-xs font-bold text-midnight-900 dark:text-cream-100 hover:bg-butter-200 dark:hover:bg-slate-700 shadow-retro-sm transition-all"
          >
            {copied ? (
              <>
                <Check size={14} className="text-mint-600" /> Copied to Clipboard!
              </>
            ) : (
              <>
                <Share2 size={14} /> Share Score (Copy to Clipboard)
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Newly Unlocked Badges / Stickers */}
      {result.unlockedBadges && result.unlockedBadges.length > 0 && (
        <div className="p-4 rounded-2xl bg-butter-200 dark:bg-butter-950/60 border-2 border-midnight-900 dark:border-slate-700 shadow-retro mb-6 animate-bounce-subtle">
          <div className="flex items-center gap-2 mb-2 font-display font-bold text-midnight-950 dark:text-butter-300">
            <Award size={20} className="text-midnight-950 dark:text-butter-300" />
            <span>New Sticker Unlocked!</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.unlockedBadges.map((badgeTitle, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-midnight-900 dark:border-slate-700 font-display text-xs font-bold shadow-retro-sm text-midnight-900 dark:text-cream-100"
              >
                ⭐ {badgeTitle}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mistakes Review (if any) */}
      {incorrectAnswers.length > 0 && (
        <Card variant="cream" shadow="sm" className="p-4 mb-6 dark:bg-slate-900 dark:border-slate-700">
          <h3 className="font-display font-bold text-sm text-midnight-900 dark:text-cream-100 mb-3 flex items-center gap-1.5">
            <XCircle size={16} className="text-cherry-500" />
            <span>Mistakes to Learn From ({incorrectAnswers.length})</span>
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {incorrectAnswers.map((rec, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-midnight-900/20 dark:border-slate-700 text-xs flex items-center justify-between gap-3"
              >
                <div>
                  <span className="font-mono font-bold text-midnight-900 dark:text-cream-100 text-sm">
                    <MathText text={rec.question} />
                  </span>
                  {rec.explanation && (
                    <p className="text-[11px] text-midnight-900/70 dark:text-cream-200/70 mt-0.5">
                      💡 <MathText text={rec.explanation} />
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-cherry-600 dark:text-cherry-400 line-through">
                    You: {rec.userAnswer ? <MathText text={rec.userAnswer} /> : '(blank)'}
                  </div>
                  <div className="font-mono font-bold text-mint-700 dark:text-mint-400">
                    Ans: <MathText text={rec.correctAnswer} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={onPlayAgain}
          icon={<RotateCcw size={18} />}
          className="w-full sm:w-auto"
        >
          PLAY AGAIN <span className="text-[11px] opacity-75 font-mono ml-1">[Space]</span>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={onBackToArcade}
          icon={<Home size={18} />}
          className="w-full sm:w-auto"
        >
          BACK TO ARCADE <span className="text-[11px] opacity-75 font-mono ml-1">[Esc]</span>
        </Button>
      </div>
    </div>
  );
};
