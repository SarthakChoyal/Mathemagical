import React from 'react';
import { sound } from '../../audio/soundEngine';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'mint' | 'outline' | 'ghost' | 'cherry';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      sound.playClick();
      if (onClick) onClick(e);
    }
  };

  const baseStyles =
    'relative inline-flex items-center justify-center font-display font-semibold select-none rounded-xl border-2 border-midnight-900 dark:border-slate-600 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 shadow-retro-sm dark:shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
    md: 'text-sm px-4 py-2 gap-2 shadow-retro dark:shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
    lg: 'text-base px-6 py-3 gap-2.5 shadow-retro-md dark:shadow-[4px_4px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none',
    xl: 'text-lg px-8 py-4 gap-3 shadow-retro-lg dark:shadow-[6px_6px_0px_#000] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none',
  };

  const variantStyles = {
    primary:
      'bg-cobalt-600 text-white hover:bg-cobalt-500 hover:-translate-x-0.5 hover:-translate-y-0.5 shadow-retro dark:shadow-[3px_3px_0px_#1D4ED8]',
    secondary:
      'bg-butter-300 text-midnight-950 hover:bg-butter-200 hover:-translate-x-0.5 hover:-translate-y-0.5 shadow-retro dark:shadow-[3px_3px_0px_#CA8A04]',
    accent:
      'bg-lavender-400 text-midnight-950 hover:bg-lavender-300 hover:-translate-x-0.5 hover:-translate-y-0.5 shadow-retro dark:shadow-[3px_3px_0px_#7C3AED]',
    mint:
      'bg-mint-400 text-midnight-950 hover:bg-mint-300 hover:-translate-x-0.5 hover:-translate-y-0.5 shadow-retro dark:shadow-[3px_3px_0px_#059669]',
    cherry:
      'bg-cherry-500 text-white hover:bg-cherry-400 hover:-translate-x-0.5 hover:-translate-y-0.5 shadow-retro dark:shadow-[3px_3px_0px_#BE123C]',
    outline:
      'bg-cream-50 dark:bg-slate-800 text-midnight-900 dark:text-cream-100 hover:bg-cream-200 dark:hover:bg-slate-700 shadow-retro-sm dark:shadow-[2px_2px_0px_#000]',
    ghost:
      'border-transparent bg-transparent text-midnight-900 dark:text-cream-100 shadow-none hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
