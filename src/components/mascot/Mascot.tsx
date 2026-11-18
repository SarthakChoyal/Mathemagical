import React, { useState, useEffect } from 'react';

interface MascotProps {
  mood?: 'idle' | 'happy' | 'thinking' | 'cheering' | 'oops';
  streak?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  accessory?: 'none' | 'glasses' | 'crown' | 'wizard';
}

/**
 * Sleek Retro-Handheld / Geometric Math Emblem ("M-Core")
 * Inspired by Teenage Engineering, Playdate, and Nintendo Brain Training.
 */
export const Mascot: React.FC<MascotProps> = ({
  mood = 'idle',
  streak = 0,
  size = 'md',
  className = '',
}) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 180);
    }, 3400);
    return () => clearInterval(interval);
  }, []);

  const sizePx = size === 'sm' ? 40 : size === 'lg' ? 88 : 60;

  // Dynamic screen accent color based on mood & streak
  const screenGlow =
    mood === 'oops'
      ? '#F43F5E'
      : mood === 'cheering' || streak >= 10
      ? '#34D399'
      : mood === 'thinking'
      ? '#A78BFA'
      : '#38BDF8';

  const renderDisplay = () => {
    if (mood === 'oops') {
      return (
        <g stroke="#F43F5E" strokeWidth="3.5" strokeLinecap="round">
          <line x1="34" y1="38" x2="42" y2="46" />
          <line x1="42" y1="38" x2="34" y2="46" />
          <line x1="58" y1="38" x2="66" y2="46" />
          <line x1="66" y1="38" x2="58" y2="46" />
          <path d="M 38 60 Q 50 54 62 60" fill="none" strokeWidth="3" />
        </g>
      );
    }

    if (mood === 'cheering' || streak >= 10) {
      return (
        <g stroke="#34D399" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <polyline points="32,46 38,38 44,46" />
          <polyline points="56,46 62,38 68,46" />
          <path d="M 36 57 Q 50 67 64 57" stroke="#FACC15" strokeWidth="3.2" />
        </g>
      );
    }

    if (mood === 'thinking') {
      return (
        <g fill="#A78BFA">
          <rect x="33" y="40" width="9" height="4" rx="2" />
          <rect x="58" y="38" width="9" height="8" rx="2" />
          <circle cx="44" cy="60" r="2.2" fill="#FACC15" />
          <circle cx="50" cy="60" r="2.2" fill="#FACC15" />
          <circle cx="56" cy="60" r="2.2" fill="#FACC15" />
        </g>
      );
    }

    // Idle / Happy: crisp LED pixel eyes + subtle geometric math symbol
    return (
      <g>
        <rect
          x="34"
          y={pulse ? '42' : '38'}
          width="8"
          height={pulse ? '3' : '10'}
          rx="2.5"
          fill={screenGlow}
          className="transition-all duration-100"
        />
        <rect
          x="58"
          y={pulse ? '42' : '38'}
          width="8"
          height={pulse ? '3' : '10'}
          rx="2.5"
          fill={screenGlow}
          className="transition-all duration-100"
        />
        {/* Clean minimal smile / waveform */}
        <path
          d="M 41 58 Q 50 63 59 58"
          fill="none"
          stroke="#FACC15"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    );
  };

  return (
    <div
      className={`inline-flex items-center justify-center relative select-none ${
        mood === 'cheering' ? 'animate-bounce-subtle' : ''
      } ${className}`}
      style={{ width: sizePx, height: sizePx }}
      aria-label="Mathemagical Core Emblem"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[3px_3px_0px_#0B0F19]"
      >
        {/* Outer Hardware Chassis */}
        <rect
          x="8"
          y="8"
          width="84"
          height="84"
          rx="22"
          fill="#2563EB"
          stroke="#0B0F19"
          strokeWidth="5"
        />

        {/* Top-left subtle bevel highlight */}
        <path
          d="M 22 15 L 78 15"
          stroke="#60A5FA"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Inner Dark OLED Display */}
        <rect
          x="18"
          y="22"
          width="64"
          height="52"
          rx="12"
          fill="#0B0F19"
          stroke="#1E293B"
          strokeWidth="2.5"
        />

        {/* Subtle geometric grid lines on OLED */}
        <line x1="50" y1="24" x2="50" y2="72" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="20" y1="48" x2="80" y2="48" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />

        {/* Dynamic LED Face / State */}
        {renderDisplay()}

        {/* Bottom Hardware Control Strip (Playdate / Pocket Synth vibe) */}
        <circle cx="30" cy="82" r="3.5" fill="#FACC15" stroke="#0B0F19" strokeWidth="1.5" />
        <rect x="42" y="79.5" width="16" height="5" rx="2.5" fill="#1E293B" />
        <circle cx="70" cy="82" r="3.5" fill={streak >= 5 ? '#34D399' : '#F43F5E'} stroke="#0B0F19" strokeWidth="1.5" />

        {/* Top Antenna / Sigma Crest */}
        <rect x="44" y="2" width="12" height="7" rx="3" fill="#FACC15" stroke="#0B0F19" strokeWidth="2.5" />
      </svg>

      {streak >= 5 && size !== 'sm' && (
        <span className="absolute -top-1.5 -right-2 px-1.5 py-0.5 rounded-md bg-butter-300 border-2 border-midnight-950 font-mono font-black text-[10px] text-midnight-950 shadow-retro-sm">
          {streak}×
        </span>
      )}
    </div>
  );
};
