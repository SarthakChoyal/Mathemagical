import React from 'react';
import { Delete, CornerDownLeft, X } from 'lucide-react';
import { sound } from '../../audio/soundEngine';

interface NumberPadProps {
  onInput: (char: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  allowFractionSlash?: boolean;
  allowNegative?: boolean;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  onInput,
  onBackspace,
  onClear,
  onSubmit,
  allowFractionSlash = false,
  allowNegative = false,
}) => {
  const handleKey = (char: string) => {
    sound.playClick();
    onInput(char);
  };

  const handleBackspace = () => {
    sound.playClick();
    onBackspace();
  };

  const handleClear = () => {
    sound.playClick();
    onClear();
  };

  const handleSubmit = () => {
    sound.playClick();
    onSubmit();
  };

  return (
    <div className="w-full max-w-sm mx-auto select-none mt-4">
      <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleKey(num.toString())}
            className="h-14 rounded-xl bg-white dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 font-mono text-2xl font-bold text-midnight-900 dark:text-cream-100 shadow-retro-sm dark:shadow-[2px_2px_0px_#000] hover:bg-cream-100 dark:hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center"
          >
            {num}
          </button>
        ))}

        {/* Extra slot: Fraction slash, negative, or clear */}
        {allowFractionSlash ? (
          <button
            type="button"
            onClick={() => handleKey('/')}
            className="h-14 rounded-xl bg-lavender-200 dark:bg-purple-900/60 border-2 border-midnight-900 dark:border-purple-500 font-mono text-xl font-bold text-midnight-900 dark:text-purple-200 shadow-retro-sm dark:shadow-[2px_2px_0px_#000] hover:bg-lavender-300 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center"
          >
            /
          </button>
        ) : allowNegative ? (
          <button
            type="button"
            onClick={() => handleKey('-')}
            className="h-14 rounded-xl bg-lavender-200 dark:bg-purple-900/60 border-2 border-midnight-900 dark:border-purple-500 font-mono text-xl font-bold text-midnight-900 dark:text-purple-200 shadow-retro-sm dark:shadow-[2px_2px_0px_#000] hover:bg-lavender-300 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center"
          >
            −
          </button>
        ) : (
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-xl bg-cream-200 dark:bg-slate-700 border-2 border-midnight-900 dark:border-slate-600 font-mono text-sm font-bold text-midnight-900 dark:text-cream-100 shadow-retro-sm dark:shadow-[2px_2px_0px_#000] hover:bg-cream-300 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1"
          >
            <X size={16} /> CLR
          </button>
        )}

        {/* Zero */}
        <button
          type="button"
          onClick={() => handleKey('0')}
          className="h-14 rounded-xl bg-white dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 font-mono text-2xl font-bold text-midnight-900 dark:text-cream-100 shadow-retro-sm dark:shadow-[2px_2px_0px_#000] hover:bg-cream-100 dark:hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center"
        >
          0
        </button>

        {/* Backspace */}
        <button
          type="button"
          onClick={handleBackspace}
          className="h-14 rounded-xl bg-cherry-300 dark:bg-rose-900/60 border-2 border-midnight-900 dark:border-rose-500 font-mono text-xl font-bold text-midnight-950 dark:text-rose-200 shadow-retro-sm dark:shadow-[2px_2px_0px_#000] hover:bg-cherry-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center"
        >
          <Delete size={20} />
        </button>
      </div>

      {/* Big Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-2.5 w-full h-12 rounded-xl bg-mint-400 dark:bg-emerald-500 border-2 border-midnight-900 dark:border-emerald-300 font-display text-base font-bold text-midnight-950 dark:text-slate-950 shadow-retro dark:shadow-[3px_3px_0px_#000] hover:bg-mint-300 active:translate-x-0.5 active:translate-y-0.5 active:shadow-retro-pressed transition-all flex items-center justify-center gap-2"
      >
        <span>ENTER</span>
        <CornerDownLeft size={18} />
      </button>
    </div>
  );
};
