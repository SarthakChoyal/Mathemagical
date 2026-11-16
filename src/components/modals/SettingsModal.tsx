import React, { useState } from 'react';
import { X, Volume2, VolumeX, Moon, Sun, Smartphone, Trash2, Check, RotateCcw } from 'lucide-react';
import { UserSettings, ThemeName } from '../../types/stats';
import { sound } from '../../audio/soundEngine';
import { StorageService } from '../../storage/storage';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/60 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-md bg-cream-50 border-3 border-midnight-900 rounded-3xl p-6 shadow-retro-xl relative text-midnight-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-midnight-900/10 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <h2 className="font-display font-extrabold text-xl text-midnight-900">
              Settings & Preferences
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl border-2 border-midnight-900 bg-white hover:bg-cream-200 active:translate-x-0.5 active:translate-y-0.5 shadow-retro-sm transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-4">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border-2 border-midnight-900 shadow-retro-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-butter-200 border border-midnight-900">
                {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </div>
              <div>
                <p className="font-display font-bold text-sm">Arcade Sound Effects</p>
                <p className="text-xs text-midnight-900/60">Chimes, clicks and celebration fanfares</p>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`w-14 h-8 rounded-full border-2 border-midnight-900 p-0.5 transition-colors relative ${
                settings.soundEnabled ? 'bg-mint-400' : 'bg-cream-200'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white border-2 border-midnight-900 shadow-sm transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Instant Advance Toggle (Zetamac Style) */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border-2 border-midnight-900 shadow-retro-sm">
            <div>
              <p className="font-display font-bold text-sm">Instant Type-Advance</p>
              <p className="text-xs text-midnight-900/60">
                Instantly advances as soon as the correct number is typed
              </p>
            </div>
            <button
              onClick={handleToggleInstantAdvance}
              className={`w-14 h-8 rounded-full border-2 border-midnight-900 p-0.5 transition-colors relative ${
                settings.instantAdvance ? 'bg-mint-400' : 'bg-cream-200'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white border-2 border-midnight-900 shadow-sm transition-transform ${
                  settings.instantAdvance ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Always Show Virtual Keypad */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border-2 border-midnight-900 shadow-retro-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-lavender-200 border border-midnight-900">
                <Smartphone size={20} />
              </div>
              <div>
                <p className="font-display font-bold text-sm">On-Screen Keypad</p>
                <p className="text-xs text-midnight-900/60">Always show keypad on desktop</p>
              </div>
            </div>
            <button
              onClick={handleToggleKeypad}
              className={`w-14 h-8 rounded-full border-2 border-midnight-900 p-0.5 transition-colors relative ${
                settings.showOnScreenKeypad ? 'bg-mint-400' : 'bg-cream-200'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white border-2 border-midnight-900 shadow-sm transition-transform ${
                  settings.showOnScreenKeypad ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Theme Palette Selection */}
          <div className="p-3.5 rounded-2xl bg-white border-2 border-midnight-900 shadow-retro-sm">
            <p className="font-display font-bold text-sm mb-2">Arcade Palette</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'cream', name: 'Warm Cream', bg: '#FAF7EE' },
                { id: 'midnight', name: 'Midnight', bg: '#111728' },
                { id: 'mint', name: 'Mint Leaf', bg: '#A7F3D0' },
                { id: 'lavender', name: 'Lavender', bg: '#DDD6FE' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTheme(t.id as ThemeName)}
                  style={{ backgroundColor: t.bg }}
                  className={`h-11 rounded-xl border-2 border-midnight-900 flex items-center justify-center shadow-retro-sm transition-all ${
                    settings.theme === t.id ? 'ring-2 ring-cobalt-600 scale-105' : 'opacity-85 hover:opacity-100'
                  }`}
                  title={t.name}
                >
                  {settings.theme === t.id && (
                    <Check
                      size={18}
                      className={t.id === 'midnight' ? 'text-butter-300' : 'text-midnight-950'}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Danger Zone: Reset Data */}
          <div className="pt-2">
            {!showConfirmReset ? (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-2.5 rounded-xl border border-cherry-500/50 text-cherry-600 hover:bg-cherry-50 font-display text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Reset All Stats & Unlocked Stickers</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-cherry-50 border-2 border-cherry-500 text-center space-y-2">
                <p className="text-xs font-bold text-cherry-700">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetConfirm}
                    className="flex-1 py-1.5 rounded-lg bg-cherry-600 text-white font-display text-xs font-bold shadow-retro-sm"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 py-1.5 rounded-lg bg-white border border-midnight-900 font-display text-xs font-bold"
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
