import React from 'react';
import { ArrowLeft, Lock, Award, Sparkles, Check } from 'lucide-react';
import { ALL_BADGES, StorageService } from '../../storage/storage';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Mascot } from '../mascot/Mascot';
import { sound } from '../../audio/soundEngine';

interface StickersScreenProps {
  onBack: () => void;
}

export const StickersScreen: React.FC<StickersScreenProps> = ({ onBack }) => {
  const stats = StorageService.getStats();
  const unlockedSet = new Set(stats.unlockedBadgeIds);

  const unlockedCount = ALL_BADGES.filter((b) => unlockedSet.has(b.id)).length;
  const progressPercent = Math.round((unlockedCount / ALL_BADGES.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pop">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 font-display text-sm font-bold text-midnight-900 dark:text-cream-100 hover:text-cobalt-600 dark:hover:text-butter-300 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Games
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Mascot mood={progressPercent > 50 ? 'cheering' : 'happy'} size="md" />
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-midnight-900 dark:text-cream-100">
            Accolades
          </h1>
          <p className="text-sm font-medium text-midnight-900/60 dark:text-cream-200/60 mt-0.5">
            Collect retro reward badges as your mathematical prowess grows
          </p>
        </div>
      </div>

      {/* Album Progress Banner */}
      <Card variant="butter" shadow="md" className="p-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-midnight-950 dark:text-amber-300" />
            <span className="font-display font-bold text-sm text-midnight-950 dark:text-amber-200">
              Progression
            </span>
          </div>
          <span className="font-mono font-black text-sm text-midnight-950 dark:text-amber-200">
            {unlockedCount} / {ALL_BADGES.length} Collected ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-midnight-950/20 border border-midnight-950/40 overflow-hidden">
          <div
            className="h-full bg-cobalt-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

      {/* Sticker Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {ALL_BADGES.map((badge) => {
          const isUnlocked = unlockedSet.has(badge.id);
          return (
            <div
              key={badge.id}
              onClick={() => {
                if (isUnlocked) sound.playClick();
              }}
              className={`p-4 rounded-2xl border-2 border-midnight-900 dark:border-slate-700 text-center transition-all flex flex-col items-center justify-between ${
                isUnlocked
                  ? 'bg-white dark:bg-slate-900/90 shadow-retro dark:shadow-[2px_2px_0px_#000] hover:-translate-y-1 hover:shadow-retro-md'
                  : 'bg-cream-200/50 dark:bg-slate-900/30 opacity-60 border-dashed shadow-none'
              }`}
            >
              {/* Sticker Icon */}
              <div
                className={`w-16 h-16 rounded-2xl border-2 border-midnight-900 dark:border-slate-700 flex items-center justify-center text-3xl mb-3 shadow-retro-sm ${
                  isUnlocked ? 'bg-butter-200 dark:bg-amber-400' : 'bg-cream-100 dark:bg-slate-800'
                }`}
              >
                {isUnlocked ? badge.icon : <Lock size={22} className="text-midnight-900/40 dark:text-slate-500" />}
              </div>

              {/* Title & Desc */}
              <div className="flex-1 flex flex-col justify-center">
                <span className="font-display font-bold text-sm text-midnight-900 dark:text-cream-100 leading-tight">
                  {badge.title}
                </span>
                <p className="text-[11px] text-midnight-900/60 dark:text-cream-200/60 mt-1 leading-snug">
                  {badge.description}
                </p>
              </div>

              {/* Badge Footer Tag */}
              <div className="mt-3">
                {isUnlocked ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-mint-700 dark:text-emerald-300 bg-mint-100 dark:bg-emerald-950/60 border border-mint-500/40 px-2 py-0.5 rounded-full">
                    <Check size={11} /> Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-midnight-900/40 dark:text-slate-500 uppercase">
                    Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Button variant="outline" size="md" onClick={onBack}>
          BACK TO GAMES
        </Button>
      </div>
    </div>
  );
};
