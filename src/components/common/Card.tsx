import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'cream' | 'white' | 'butter' | 'mint' | 'lavender' | 'midnight';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'white',
  shadow = 'md',
  border = true,
  className = '',
  ...props
}) => {
  const variantStyles = {
    cream: 'bg-cream-100 dark:bg-slate-900/90 text-midnight-900 dark:text-cream-100',
    white: 'bg-white dark:bg-slate-900/90 text-midnight-900 dark:text-cream-100',
    butter: 'bg-butter-200 dark:bg-amber-950/40 text-midnight-950 dark:text-butter-200 border-amber-400/40',
    mint: 'bg-mint-200 dark:bg-emerald-950/40 text-midnight-950 dark:text-mint-200 border-emerald-400/40',
    lavender: 'bg-lavender-200 dark:bg-purple-950/40 text-midnight-950 dark:text-lavender-200 border-purple-400/40',
    midnight: 'bg-midnight-900 dark:bg-slate-950 text-cream-100 border-cream-200 dark:border-slate-700',
  };

  const shadowStyles = {
    none: '',
    sm: 'shadow-retro-sm dark:shadow-[2px_2px_0px_#000]',
    md: 'shadow-retro-md dark:shadow-[4px_4px_0px_#000]',
    lg: 'shadow-retro-lg dark:shadow-[6px_6px_0px_#000]',
  };

  return (
    <div
      className={`rounded-2xl ${
        border ? 'border-2 border-midnight-900 dark:border-slate-700' : ''
      } ${variantStyles[variant]} ${shadowStyles[shadow]} p-5 transition-all ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
