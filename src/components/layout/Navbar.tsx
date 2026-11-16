import React from 'react';
import { Volume2, VolumeX, Sparkles, Trophy, BarChart2, Calendar, Settings as SettingsIcon, Gamepad2, Moon, Sun, Zap } from 'lucide-react';
import { sound } from '../../audio/soundEngine';
import { Mascot } from '../mascot/Mascot';

interface NavbarProps {
  currentTab: 'home' | 'arcade' | 'daily' | 'stats' | 'stickers';
  onSelectTab: (tab: 'home' | 'arcade' | 'daily' | 'stats' | 'stickers') => void;
  onStartZetamac: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenSettings: () => void;
  isDailyDoneToday: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onStartZetamac,
  soundEnabled,
  onToggleSound,
  isDark,
  onToggleDark,
  onOpenSettings,
  isDailyDoneToday,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-cream-100/90 dark:bg-[#0B0F19]/90 backdrop-blur-md border-b-2 border-midnight-900 dark:border-slate-800 px-4 py-3 select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <Mascot mood="happy" size="sm" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-2xl tracking-tight text-midnight-900 dark:text-cream-100 group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors">
                MATHEMAGICAL
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-butter-300 dark:bg-amber-400 border border-midnight-900 dark:border-slate-700 text-[10px] font-mono font-bold uppercase tracking-wider text-midnight-950 shadow-retro-sm">
                Arcade
              </span>
            </div>
            <span className="text-[11px] font-medium text-midnight-900/60 dark:text-cream-200/60 -mt-1 hidden sm:block">
              An arcade for your brain
            </span>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-cream-200/80 dark:bg-slate-900/80 p-1 rounded-2xl border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm">
          {/* Dedicated Zetamac Tab */}
          <button
            onClick={onStartZetamac}
            className="px-3 py-1.5 rounded-xl font-display text-sm font-bold transition-all flex items-center gap-1.5 bg-butter-300 dark:bg-amber-400 text-midnight-950 border border-midnight-900 dark:border-amber-300 shadow-retro-sm hover:bg-butter-200"
            title="Jump straight into pure Zetamac 60s speed run"
          >
            <Zap size={15} className="fill-midnight-950 text-midnight-950" />
            <span>Zetamac</span>
          </button>

          <button
            onClick={() => onSelectTab('home')}
            className={`px-3 py-1.5 rounded-xl font-display text-sm font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'home'
                ? 'bg-cobalt-600 text-white shadow-retro-sm'
                : 'text-midnight-900 dark:text-cream-200 hover:bg-cream-100 dark:hover:bg-slate-800'
            }`}
          >
            <Gamepad2 size={16} />
            <span>Arcade</span>
          </button>

          <button
            onClick={() => onSelectTab('daily')}
            className={`px-3 py-1.5 rounded-xl font-display text-sm font-bold transition-all flex items-center gap-1.5 relative ${
              currentTab === 'daily'
                ? 'bg-cobalt-600 text-white shadow-retro-sm'
                : 'text-midnight-900 dark:text-cream-200 hover:bg-cream-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar size={16} />
            <span>Daily</span>
            {!isDailyDoneToday && (
              <span className="w-2 h-2 rounded-full bg-cherry-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('stickers')}
            className={`px-3 py-1.5 rounded-xl font-display text-sm font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'stickers'
                ? 'bg-cobalt-600 text-white shadow-retro-sm'
                : 'text-midnight-900 dark:text-cream-200 hover:bg-cream-100 dark:hover:bg-slate-800'
            }`}
          >
            <Trophy size={16} />
            <span>Stickers</span>
          </button>

          <button
            onClick={() => onSelectTab('stats')}
            className={`px-3 py-1.5 rounded-xl font-display text-sm font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'stats'
                ? 'bg-cobalt-600 text-white shadow-retro-sm'
                : 'text-midnight-900 dark:text-cream-200 hover:bg-cream-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart2 size={16} />
            <span>Stats</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Dark Mode Toggle */}
          <button
            onClick={onToggleDark}
            title={isDark ? 'Switch to Warm Cream' : 'Switch to Midnight Dark'}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 text-midnight-900 dark:text-butter-300 shadow-retro-sm hover:bg-cream-100 dark:hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className={`p-2 rounded-xl border-2 border-midnight-900 dark:border-slate-700 font-display transition-all ${
              soundEnabled
                ? 'bg-butter-300 dark:bg-amber-400 text-midnight-950 shadow-retro-sm hover:bg-butter-200'
                : 'bg-cream-50 dark:bg-slate-800 text-midnight-900/50 dark:text-slate-400 shadow-retro-sm hover:bg-cream-200'
            } active:translate-x-0.5 active:translate-y-0.5`}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Daily Quick Indicator */}
          <button
            onClick={() => onSelectTab('daily')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-midnight-900 dark:border-slate-700 text-xs font-display font-bold shadow-retro-sm transition-all ${
              isDailyDoneToday
                ? 'bg-mint-300 dark:bg-emerald-400 text-midnight-950'
                : 'bg-cherry-400 text-white hover:bg-cherry-300'
            }`}
          >
            <Sparkles size={14} />
            <span>{isDailyDoneToday ? 'Daily Done!' : 'Daily Ready'}</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 text-midnight-900 dark:text-cream-100 shadow-retro-sm hover:bg-cream-100 dark:hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Subnav */}
      <div className="flex md:hidden items-center justify-around mt-2.5 pt-2 border-t border-midnight-900/10 dark:border-slate-800">
        <button
          onClick={onStartZetamac}
          className="px-2.5 py-1 rounded-lg text-xs font-display font-black bg-butter-300 dark:bg-amber-400 text-midnight-950 flex items-center gap-1"
        >
          <Zap size={12} className="fill-midnight-950" /> Zetamac
        </button>
        <button
          onClick={() => onSelectTab('home')}
          className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold ${
            currentTab === 'home' ? 'bg-cobalt-600 text-white' : 'text-midnight-900 dark:text-cream-200'
          }`}
        >
          Arcade
        </button>
        <button
          onClick={() => onSelectTab('daily')}
          className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold flex items-center gap-1 ${
            currentTab === 'daily' ? 'bg-cobalt-600 text-white' : 'text-midnight-900 dark:text-cream-200'
          }`}
        >
          Daily
          {!isDailyDoneToday && <span className="w-1.5 h-1.5 rounded-full bg-cherry-500" />}
        </button>
        <button
          onClick={() => onSelectTab('stickers')}
          className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold ${
            currentTab === 'stickers' ? 'bg-cobalt-600 text-white' : 'text-midnight-900 dark:text-cream-200'
          }`}
        >
          Stickers
        </button>
        <button
          onClick={() => onSelectTab('stats')}
          className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold ${
            currentTab === 'stats' ? 'bg-cobalt-600 text-white' : 'text-midnight-900 dark:text-cream-200'
          }`}
        >
          Stats
        </button>
      </div>
    </header>
  );
};
