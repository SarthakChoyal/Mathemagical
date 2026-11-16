import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'butter' | 'mint' | 'cobalt' | 'cherry' | 'lavender' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'butter',
  icon,
  className = '',
}) => {
  const variantStyles = {
    butter: 'bg-butter-300 dark:bg-amber-400 text-midnight-950 border-midnight-900 dark:border-amber-300',
    mint: 'bg-mint-300 dark:bg-emerald-400 text-midnight-950 border-midnight-900 dark:border-emerald-300',
    cobalt: 'bg-cobalt-500 dark:bg-cobalt-600 text-white border-midnight-900 dark:border-cobalt-400',
    cherry: 'bg-cherry-400 dark:bg-cherry-500 text-white border-midnight-900 dark:border-cherry-300',
    lavender: 'bg-lavender-300 dark:bg-purple-400 text-midnight-950 border-midnight-900 dark:border-purple-300',
    neutral: 'bg-cream-200 dark:bg-slate-800 text-midnight-900 dark:text-cream-100 border-midnight-900 dark:border-slate-600',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-display font-bold border ${variantStyles[variant]} shadow-retro-sm dark:shadow-[1px_1px_0px_#000] select-none ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
