import React, { useState, useEffect } from 'react';

interface MascotProps {
  mood?: 'idle' | 'happy' | 'thinking' | 'cheering' | 'oops';
  streak?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  accessory?: 'none' | 'glasses' | 'crown' | 'wizard';
}

export const Mascot: React.FC<MascotProps> = ({
  mood = 'idle',
  streak = 0,
  size = 'md',
  className = '',
  accessory = 'none',
}) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // Natural blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3500 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const sizePx = size === 'sm' ? 44 : size === 'lg' ? 96 : 64;

  // Eye states
  const renderEyes = () => {
    if (isBlinking && mood !== 'happy' && mood !== 'cheering') {
      return (
        <g stroke="#111728" strokeWidth="3" strokeLinecap="round">
          <line x1="28" y1="36" x2="38" y2="36" />
          <line x1="52" y1="36" x2="62" y2="36" />
        </g>
      );
    }

    if (mood === 'happy' || mood === 'cheering' || streak >= 5) {
      // Happy curved eyes
      return (
        <g stroke="#111728" strokeWidth="3.5" fill="none" strokeLinecap="round">
          <path d="M 28 38 Q 33 30 38 38" />
          <path d="M 52 38 Q 57 30 62 38" />
        </g>
      );
    }

    if (mood === 'oops') {
      // Surprised circle eyes
      return (
        <g fill="#111728">
          <circle cx="33" cy="35" r="4.5" />
          <circle cx="57" cy="35" r="4.5" />
        </g>
      );
    }

    // Default curious eyes with shine
    return (
      <g>
        <circle cx="33" cy="35" r="5" fill="#111728" />
        <circle cx="35" cy="33" r="1.8" fill="#FFFFFF" />
        <circle cx="57" cy="35" r="5" fill="#111728" />
        <circle cx="59" cy="33" r="1.8" fill="#FFFFFF" />
      </g>
    );
  };

  // Mouth states
  const renderMouth = () => {
    if (mood === 'cheering' || streak >= 10) {
      // Big open happy mouth
      return (
        <path
          d="M 36 45 Q 45 56 54 45 Z"
          fill="#F43F5E"
          stroke="#111728"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      );
    }
    if (mood === 'happy' || streak >= 3) {
      // Warm smile
      return (
        <path
          d="M 37 46 Q 45 53 53 46"
          fill="none"
          stroke="#111728"
          strokeWidth="3"
          strokeLinecap="round"
        />
      );
    }
    if (mood === 'oops') {
      // Small 'o' mouth
      return (
        <ellipse cx="45" cy="48" rx="3.5" ry="4.5" fill="#111728" />
      );
    }
    // Gentle smile
    return (
      <path
        d="M 39 46 Q 45 50 51 46"
        fill="none"
        stroke="#111728"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    );
  };

  // Accessories
  const renderAccessory = () => {
    if (accessory === 'glasses' || streak >= 15) {
      return (
        <g stroke="#111728" strokeWidth="2.5" fill="rgba(255,255,255,0.4)">
          <circle cx="33" cy="35" r="8" />
          <circle cx="57" cy="35" r="8" />
          <line x1="41" y1="35" x2="49" y2="35" />
          <line x1="25" y1="35" x2="20" y2="34" />
          <line x1="65" y1="35" x2="70" y2="34" />
        </g>
      );
    }
    if (accessory === 'crown' || streak >= 25) {
      return (
        <g fill="#FACC15" stroke="#111728" strokeWidth="2.5" strokeLinejoin="round">
          <polygon points="32,22 36,12 45,18 54,12 58,22" />
          <circle cx="45" cy="18" r="1.5" fill="#F43F5E" />
        </g>
      );
    }
    return null;
  };

  return (
    <div
      className={`relative inline-block select-none transition-transform duration-200 ${
        mood === 'cheering' || streak >= 8 ? 'animate-bounce-subtle' : ''
      } ${className}`}
      style={{ width: sizePx, height: sizePx }}
    >
      <svg
        viewBox="0 0 90 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Antenna / Lightbulb */}
        <line x1="45" y1="20" x2="45" y2="10" stroke="#111728" strokeWidth="3" strokeLinecap="round" />
        <circle cx="45" cy="8" r="5" fill="#FDE047" stroke="#111728" strokeWidth="2.5" />

        {/* Mascot Body: Soft squoval retro computer / TV head */}
        <rect
          x="16"
          y="20"
          width="58"
          height="52"
          rx="18"
          fill="#FEF08A"
          stroke="#111728"
          strokeWidth="3.5"
        />

        {/* Screen / Face Area */}
        <rect
          x="22"
          y="25"
          width="46"
          height="36"
          rx="12"
          fill="#FFFDF7"
          stroke="#111728"
          strokeWidth="2"
        />

        {/* Cute rosy cheeks */}
        <circle cx="28" cy="45" r="3.5" fill="#FDA4AF" opacity="0.8" />
        <circle cx="62" cy="45" r="3.5" fill="#FDA4AF" opacity="0.8" />

        {/* Eyes & Mouth */}
        {renderEyes()}
        {renderMouth()}
        {renderAccessory()}

        {/* Little Feet */}
        <ellipse cx="32" cy="74" rx="7" ry="4" fill="#111728" />
        <ellipse cx="58" cy="74" rx="7" ry="4" fill="#111728" />
      </svg>
    </div>
  );
};
