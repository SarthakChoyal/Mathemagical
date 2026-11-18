import React from 'react';
import { Trophy, BarChart2, Calendar, Settings as SettingsIcon, Gamepad2, Moon, Sun } from 'lucide-react';
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
  isDark,
  onToggleDark,
  onOpenSettings,
  isDailyDoneToday,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-nav)] backdrop-blur-md border-b-2 border-midnight-900 dark:border-slate-800 px-4 sm:px-6 py-3 select-none">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Column: Brand / Logo */}
        <div className="flex-1 flex justify-start">
          <div
            onClick={() => onSelectTab('home')}
            className="inline-flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          >
            <Mascot mood="happy" size="sm" />
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-midnight-900 dark:text-cream-100 group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors">
                MATHEMAGICAL
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-midnight-900/60 dark:text-cream-200/60 -mt-0.5 hidden sm:block">
                Mental fluency for A-Level &amp; Admissions
              </span>
            </div>
          </div>
        </div>

        {/* Center Column: Perfectly Centered Navigation Tabs */}
        <div className="hidden md:flex justify-center shrink-0">
          <nav className="flex items-center gap-1.5 bg-cream-200/80 dark:bg-slate-900/80 p-1 rounded-2xl border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm">
            <button
              onClick={() => onSelectTab('home')}
              className={`px-3.5 py-1.5 rounded-xl font-display text-sm font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'home'
                  ? 'bg-cobalt-600 text-white shadow-retro-sm'
                  : 'text-midnight-900 dark:text-cream-200 hover:bg-cream-100 dark:hover:bg-slate-800'
              }`}
            >
              <Gamepad2 size={16} />
              <span>Home</span>
            </button>

            <button
              onClick={() => onSelectTab('daily')}
              className={`px-3.5 py-1.5 rounded-xl font-display text-sm font-bold transition-all flex items-center gap-1.5 relative ${
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
              className={`px-3.5 py-1.5 rounded-xl font-display text-sm font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'stickers'
                  ? 'bg-cobalt-600 text-white shadow-retro-sm'
                  : 'text-midnight-900 dark:text-cream-200 hover:bg-cream-100 dark:hover:bg-slate-800'
              }`}
            >
              <Trophy size={16} />
              <span>Accolades</span>
            </button>

            <button
              onClick={() => onSelectTab('stats')}
              className={`px-3.5 py-1.5 rounded-xl font-display text-sm font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'stats'
                  ? 'bg-cobalt-600 text-white shadow-retro-sm'
                  : 'text-midnight-900 dark:text-cream-200 hover:bg-cream-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart2 size={16} />
              <span>Stats</span>
            </button>
          </nav>
        </div>

        {/* Right Column: Action Controls */}
        <div className="flex-1 flex justify-end items-center gap-2">
          {/* Quick Dark Mode Toggle */}
          <button
            onClick={onToggleDark}
            title={isDark ? 'Switch to Warm Cream' : 'Switch to Midnight Dark'}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 text-midnight-900 dark:text-butter-300 shadow-retro-sm hover:bg-cream-100 dark:hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
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
          onClick={() => onSelectTab('home')}
          className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold ${
            currentTab === 'home' ? 'bg-cobalt-600 text-white' : 'text-midnight-900 dark:text-cream-200'
          }`}
        >
          Home
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
          Badges
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
