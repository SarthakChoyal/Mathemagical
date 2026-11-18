import React, { useState } from 'react';
import { X, Volume2, VolumeX, Smartphone, Trash2, Check, SlidersHorizontal, Zap } from 'lucide-react';
import { UserSettings, ThemeName } from '../../types/stats';
import { sound } from '../../audio/soundEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onResetAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetAllData,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const next = !settings.soundEnabled;
    sound.setEnabled(next);
    onUpdateSettings({ ...settings, soundEnabled: next });
  };

  const handleToggleInstantAdvance = () => {
    sound.playClick();
    onUpdateSettings({ ...settings, instantAdvance: !settings.instantAdvance });
  };

  const handleToggleKeypad = () => {
    sound.playClick();
    onUpdateSettings({ ...settings, showOnScreenKeypad: !settings.showOnScreenKeypad });
  };

  const handleSelectTheme = (theme: ThemeName) => {
    sound.playClick();
    onUpdateSettings({ ...settings, theme });
  };

  const handleResetConfirm = () => {
    sound.playClick();
    onResetAllData();
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/70 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-cream-50 dark:bg-slate-900 border-3 border-midnight-900 dark:border-slate-700 rounded-3xl p-6 shadow-retro-xl dark:shadow-[8px_8px_0px_#000] relative text-midnight-900 dark:text-cream-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-midnight-900/10 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cobalt-100 dark:bg-blue-950/70 border border-midnight-900 dark:border-blue-500/40 text-cobalt-700 dark:text-cobalt-300">
              <SlidersHorizontal size={18} />
            </div>
            <h2 className="font-display font-extrabold text-xl text-midnight-900 dark:text-cream-100">
              Preferences
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl border-2 border-midnight-900 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-cream-200 dark:hover:bg-slate-700 text-midnight-900 dark:text-cream-100 active:translate-x-0.5 active:translate-y-0.5 shadow-retro-sm transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-3.5">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-butter-200 dark:bg-amber-950/70 border border-midnight-900 dark:border-amber-500/40 text-midnight-900 dark:text-amber-300">
                {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </div>
              <div>
                <p className="font-display font-bold text-sm text-midnight-900 dark:text-cream-100">Arcade Sound Effects</p>
                <p className="text-xs text-midnight-900/60 dark:text-cream-200/60">Chimes, clicks and celebration fanfares</p>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`w-14 h-8 shrink-0 rounded-full border-2 border-midnight-900 dark:border-slate-600 p-0.5 transition-colors relative ${
                settings.soundEnabled ? 'bg-mint-400 dark:bg-emerald-500' : 'bg-cream-200 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white border-2 border-midnight-900 dark:border-slate-900 shadow-sm transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Instant Advance Toggle (Zetamac Style) */}
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-mint-200 dark:bg-emerald-950/70 border border-midnight-900 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                <Zap size={20} />
              </div>
              <div>
                <p className="font-display font-bold text-sm text-midnight-900 dark:text-cream-100">Instant Type-Advance</p>
                <p className="text-xs text-midnight-900/60 dark:text-cream-200/60">
                  Instantly advances as soon as the correct number is typed
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleInstantAdvance}
              className={`w-14 h-8 shrink-0 rounded-full border-2 border-midnight-900 dark:border-slate-600 p-0.5 transition-colors relative ${
                settings.instantAdvance ? 'bg-mint-400 dark:bg-emerald-500' : 'bg-cream-200 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white border-2 border-midnight-900 dark:border-slate-900 shadow-sm transition-transform ${
                  settings.instantAdvance ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Always Show Virtual Keypad */}
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-lavender-200 dark:bg-purple-950/70 border border-midnight-900 dark:border-purple-500/40 text-purple-700 dark:text-purple-300">
                <Smartphone size={20} />
              </div>
              <div>
                <p className="font-display font-bold text-sm text-midnight-900 dark:text-cream-100">On-Screen Keypad</p>
                <p className="text-xs text-midnight-900/60 dark:text-cream-200/60">Always show keypad on desktop</p>
              </div>
            </div>
            <button
              onClick={handleToggleKeypad}
              className={`w-14 h-8 shrink-0 rounded-full border-2 border-midnight-900 dark:border-slate-600 p-0.5 transition-colors relative ${
                settings.showOnScreenKeypad ? 'bg-mint-400 dark:bg-emerald-500' : 'bg-cream-200 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white border-2 border-midnight-900 dark:border-slate-900 shadow-sm transition-transform ${
                  settings.showOnScreenKeypad ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Mathematical Theme Palette Selection */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm">
            <div className="flex items-center justify-between mb-2.5">
              <p className="font-display font-bold text-sm text-midnight-900 dark:text-cream-100">Arcade Palette</p>
              <span className="text-[10px] font-mono uppercase tracking-wider text-midnight-900/50 dark:text-cream-200/50">
                Mathematical Surfaces
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'cream', name: 'Parchment', glyph: 'π', bg: '#FAF7EE', fg: '#111728', isDark: false },
                { id: 'mint', name: 'Graph Pad', glyph: '∫', bg: '#ECF7F0', fg: '#0F5132', isDark: false },
                { id: 'midnight', name: 'Obsidian', glyph: 'Σ', bg: '#0B0F19', fg: '#F8FAFC', isDark: true },
                { id: 'blueprint', name: 'Blueprint', glyph: 'Δ', bg: '#0B1A32', fg: '#7DD3FC', isDark: true },
              ].map((t) => {
                const active = settings.theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTheme(t.id as ThemeName)}
                    style={{ backgroundColor: t.bg, color: t.fg }}
                    className={`relative p-2.5 rounded-xl border-2 border-midnight-900 dark:border-slate-600 flex flex-col items-center justify-center gap-0.5 shadow-retro-sm transition-all ${
                      active ? 'ring-2 ring-cobalt-500 dark:ring-butter-300 scale-[1.03]' : 'opacity-85 hover:opacity-100'
                    }`}
                    title={t.name}
                  >
                    <span className="font-serif font-bold text-lg leading-none">{t.glyph}</span>
                    <span className="font-display font-bold text-[10px] tracking-tight">{t.name}</span>
                    {active && (
                      <span
                        className={`absolute top-1 right-1 rounded-full p-0.5 ${
                          t.isDark ? 'bg-butter-300 text-midnight-950' : 'bg-cobalt-600 text-white'
                        }`}
                      >
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Danger Zone: Reset Data */}
          <div className="pt-1">
            {!showConfirmReset ? (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-2.5 rounded-xl border border-cherry-500/50 dark:border-rose-500/40 text-cherry-600 dark:text-rose-400 hover:bg-cherry-50 dark:hover:bg-rose-950/40 font-display text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Reset All Stats &amp; Unlocked Badges</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-cherry-50 dark:bg-rose-950/50 border-2 border-cherry-500 dark:border-rose-500/70 text-center space-y-2">
                <p className="text-xs font-bold text-cherry-700 dark:text-rose-300">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetConfirm}
                    className="flex-1 py-1.5 rounded-lg bg-cherry-600 text-white font-display text-xs font-bold shadow-retro-sm hover:bg-cherry-500"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-midnight-900 dark:border-slate-600 text-midnight-900 dark:text-cream-100 font-display text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
