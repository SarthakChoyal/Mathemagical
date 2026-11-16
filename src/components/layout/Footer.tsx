import React from 'react';
import { Keyboard, Heart, Sparkles, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t-2 border-midnight-900 dark:border-slate-800 bg-cream-200/50 dark:bg-slate-950/60 py-10 px-4 text-center select-none">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
        {/* Keyboard Pro-Tips */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-midnight-900/80 dark:text-cream-200/80 bg-white/80 dark:bg-slate-900/80 border-2 border-midnight-900 dark:border-slate-700 px-4 py-2.5 rounded-2xl shadow-retro-sm">
          <span className="font-display font-bold flex items-center gap-1.5 text-cobalt-600 dark:text-butter-300">
            <Keyboard size={15} /> PRO TIPS:
          </span>
          <span>Instant Type-Advance is ON (typing the exact answer advances immediately)</span>
          <span>•</span>
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-cream-200 dark:bg-slate-800 border border-midnight-900 dark:border-slate-600 font-bold">Enter</kbd> to submit</span>
          <span>•</span>
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-cream-200 dark:bg-slate-800 border border-midnight-900 dark:border-slate-600 font-bold">Esc</kbd> to quit/pause</span>
        </div>

        {/* Brand note */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-sm font-display font-bold text-midnight-900 dark:text-cream-100">
            <span>MATHEMAGICAL</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-cherry-600 dark:text-cherry-400">
              Crafted with <Heart size={14} className="fill-cherry-500 text-cherry-500" /> for numerical fluency
            </span>
          </div>
          <p className="text-xs text-midnight-900/60 dark:text-cream-200/50 max-w-lg leading-relaxed">
            Inspired by Zetamac, Nintendo DS Brain Training, childhood math arcades and indie games.
            Designed especially to build rapid calculator-free fluency for the ESAT, TMUA, and everyday genius.
          </p>
        </div>

        {/* Badges / offline note */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-midnight-900/50 dark:text-cream-200/40">
          <span className="flex items-center gap-1">
            <Sparkles size={12} /> 100% Client-Side
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Zap size={12} /> Zero Logins
          </span>
          <span>•</span>
          <span>Instant Offline Play</span>
        </div>
      </div>
    </footer>
  );
};
