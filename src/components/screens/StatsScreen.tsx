import React from 'react';
import { BarChart2, Flame, Target, Clock, Trophy, Award, ArrowLeft, RefreshCw, Zap } from 'lucide-react';
import { StorageService } from '../../storage/storage';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Mascot } from '../mascot/Mascot';
import { Operation } from '../../types/game';

interface StatsScreenProps {
  onBack: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ onBack }) => {
  const stats = StorageService.getStats();

  const operations: Operation[] = ['+', '-', '×', '÷'];
  const opLabels: Record<Operation, string> = {
    '+': 'Addition',
    '-': 'Subtraction',
    '×': 'Multiplication',
    '÷': 'Division',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pop">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 font-display text-sm font-bold text-midnight-900 dark:text-cream-100 hover:text-cobalt-600 dark:hover:text-butter-300 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Games
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Mascot mood="happy" size="md" />
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-midnight-900 dark:text-cream-100">
            Brain Statistics
          </h1>
          <p className="text-sm font-medium text-midnight-900/60 dark:text-cream-200/60 mt-0.5">
            Your personal record of mathematical speed and consistency
          </p>
        </div>
      </div>

      {/* Big Numbers Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card variant="white" shadow="sm" className="p-4 text-center dark:bg-slate-900 dark:border-slate-700">
          <span className="text-[11px] font-mono font-bold uppercase text-midnight-900/60 dark:text-cream-200/60 flex items-center justify-center gap-1">
            <Target size={13} /> Questions
          </span>
          <div className="font-mono font-extrabold text-3xl text-cobalt-600 dark:text-cobalt-400 mt-1">
            {stats.totalQuestionsAnswered}
          </div>
          <span className="text-[10px] text-midnight-900/60 dark:text-cream-200/60">
            {stats.totalCorrect} correct
          </span>
        </Card>

        <Card variant="white" shadow="sm" className="p-4 text-center dark:bg-slate-900 dark:border-slate-700">
          <span className="text-[11px] font-mono font-bold uppercase text-midnight-900/60 dark:text-cream-200/60 flex items-center justify-center gap-1">
            <Zap size={13} /> Accuracy
          </span>
          <div className="font-mono font-extrabold text-3xl text-mint-600 dark:text-emerald-400 mt-1">
            {stats.overallAccuracy}%
          </div>
          <span className="text-[10px] text-midnight-900/60 dark:text-cream-200/60">
            All-time precision
          </span>
        </Card>

        <Card variant="white" shadow="sm" className="p-4 text-center dark:bg-slate-900 dark:border-slate-700">
          <span className="text-[11px] font-mono font-bold uppercase text-midnight-900/60 dark:text-cream-200/60 flex items-center justify-center gap-1">
            <Flame size={13} className="text-cherry-500" /> Best Streak
          </span>
          <div className="font-mono font-extrabold text-3xl text-cherry-500 dark:text-rose-400 mt-1">
            {stats.highestOverallStreak}
          </div>
          <span className="text-[10px] text-midnight-900/60 dark:text-cream-200/60">
            Consecutive answers
          </span>
        </Card>

        <Card variant="white" shadow="sm" className="p-4 text-center dark:bg-slate-900 dark:border-slate-700">
          <span className="text-[11px] font-mono font-bold uppercase text-midnight-900/60 dark:text-cream-200/60 flex items-center justify-center gap-1">
            <Clock size={13} /> Sessions
          </span>
          <div className="font-mono font-extrabold text-3xl text-lavender-500 dark:text-purple-400 mt-1">
            {stats.sessionsCount}
          </div>
          <span className="text-[10px] text-midnight-900/60 dark:text-cream-200/60">
            {Math.round(stats.totalPlayTimeSeconds / 60)} mins trained
          </span>
        </Card>
      </div>

      {/* Operation Fluency Breakdown */}
      <Card variant="white" shadow="md" className="p-6 mb-6 dark:bg-slate-900 dark:border-slate-700">
        <h2 className="font-display font-bold text-lg text-midnight-900 dark:text-cream-100 mb-4 flex items-center gap-2">
          <span>Operation Mastery</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {operations.map((op) => {
            const data = stats.operationStats[op];
            const accuracy = data.attempts > 0 ? Math.round((data.correct / data.attempts) * 100) : 0;
            return (
              <div
                key={op}
                className="p-3.5 rounded-xl bg-cream-50 dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-butter-200 dark:bg-amber-400 border border-midnight-900 dark:border-amber-300 font-mono font-black text-lg flex items-center justify-center text-midnight-950">
                      {op}
                    </span>
                    <div>
                      <span className="font-display font-bold text-sm block text-midnight-900 dark:text-cream-100">
                        {opLabels[op]}
                      </span>
                      <span className="text-[11px] font-mono text-midnight-900/60 dark:text-cream-200/60">
                        {data.attempts} attempted
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-black text-lg text-midnight-900 dark:text-cream-100">
                    {data.attempts > 0 ? `${accuracy}%` : '—'}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-cream-200 dark:bg-slate-700 border border-midnight-900/30 dark:border-slate-600 overflow-hidden">
                  <div
                    className="h-full bg-cobalt-600 transition-all"
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Personal Records By Game */}
      <Card variant="white" shadow="md" className="p-6 mb-6 dark:bg-slate-900 dark:border-slate-700">
        <h2 className="font-display font-bold text-lg text-midnight-900 dark:text-cream-100 mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-butter-500" />
          <span>High Scores & Records</span>
        </h2>
        <div className="divide-y divide-midnight-900/10 dark:divide-slate-800">
          {Object.keys(stats.bests).length === 0 ? (
            <p className="text-sm font-medium text-midnight-900/50 dark:text-cream-200/50 py-4 text-center">
              No games logged yet! Complete your first game in the Arcade to see your records appear here.
            </p>
          ) : (
            Object.entries(stats.bests).map(([mode, best]) => (
              <div key={mode} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-display font-bold text-sm capitalize text-midnight-900 dark:text-cream-100">
                    {mode} Mode
                  </span>
                  <span className="text-xs font-mono text-midnight-900/60 dark:text-cream-200/60 block">
                    {best.totalGamesPlayed} rounds played
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-xl text-cobalt-600 dark:text-cobalt-400">
                    {best.highScore} pts
                  </span>
                  <span className="text-[11px] font-mono text-midnight-900/60 dark:text-cream-200/60 block">
                    {best.bestAccuracy}% best acc
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="text-center">
        <Button variant="outline" size="md" onClick={onBack}>
          BACK TO GAMES
        </Button>
      </div>
    </div>
  );
};
