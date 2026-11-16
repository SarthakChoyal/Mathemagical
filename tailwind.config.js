/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFEFA',
          100: '#FAF7EE',
          200: '#F4EEDA',
          300: '#E9DFC3',
        },
        midnight: {
          800: '#1A2238',
          900: '#111728',
          950: '#0B0F1A',
        },
        cobalt: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        butter: {
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
        },
        cherry: {
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        },
        mint: {
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        lavender: {
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
        },
        peach: {
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
        }
      },
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'retro-sm': '2px 2px 0px rgba(17, 23, 40, 1)',
        'retro': '3px 3px 0px rgba(17, 23, 40, 1)',
        'retro-md': '4px 4px 0px rgba(17, 23, 40, 1)',
        'retro-lg': '6px 6px 0px rgba(17, 23, 40, 1)',
        'retro-xl': '8px 8px 0px rgba(17, 23, 40, 1)',
        'retro-pressed': '1px 1px 0px rgba(17, 23, 40, 1)',
        'retro-light': '3px 3px 0px rgba(254, 240, 138, 1)',
      },
      animation: {
        'bounce-subtle': 'bounceSubtle 0.5s ease-in-out infinite alternate',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 0.3s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'pop': 'pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'confetti': 'confetti 1.2s ease-out forwards',
      },
      keyframes: {
        bounceSubtle: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
