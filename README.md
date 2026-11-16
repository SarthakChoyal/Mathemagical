# 🕹️ MATHEMAGICAL • An Arcade for Your Brain

> Quick-fire mental arithmetic. Satisfying streaks. A sharper brain.

Inspired by **Zetamac**, **Nintendo DS Brain Training**, nostalgic handheld math games, and modern indie game design, **Mathemagical** is an interactive mental arithmetic web application engineered to build exceptional numerical fluency.

Built especially for students preparing for the **ESAT** (Engineering and Science Admissions Test) and **TMUA** (Test of Mathematics for University Admission) examinations, where **calculators are strictly forbidden**, as well as anyone who wants to sharpen their mental arithmetic agility.

---

## 🌟 Product Philosophy

1. **Instant Play**: No login, no signup, no account, no questionnaires. Open the web app and start answering calculations within seconds.
2. **Beautiful Simplicity**: A warm cream & midnight navy palette, tactile retro drop shadows (`shadow-retro`), rounded card components, and playful typography.
3. **Zetamac-Grade Speed**: Responsive typing with instant advance—type the exact answer and the engine immediately transitions to the next problem with zero latency.
4. **Childhood Nostalgia & Indie Charm**: Animated companion mascot **"Pip"**, an album of 15 unlockable retro stickers/badges, and Web Audio synthesized chimes and fanfares.
5. **No Accounts, 100% Client-Side**: All personal bests, high streaks, operation stats, and daily challenge history are saved locally in `localStorage`.

---

## 🎮 Game Modes

### 1. ⚡ Classic Arithmetic (Zetamac Flagship)
- **Operations**: Addition, Subtraction, Multiplication, Division, and Mixed operations.
- **Difficulties**: Easy, Medium (classic Zetamac standard), Hard, and Insane.
- **Customization**: Time limits (30s Blitz, 60s Standard, 2m Endurance, 5m Marathon), negative numbers, integer-only division guarantees.
- **Instant Type-Advance**: Typing the correct answer advances immediately with no need to hit Enter.

### 2. 🥷 Number Ninja (Survival Mode)
- 3 Hearts / Lives system.
- Per-question countdown timer that shrinks with every wave.
- Combo multiplier system (up to 5x score) rewarding quick consecutive answers.
- Multi-step mental operations as waves progress.

### 3. ✖️ Times Table Playground
- Select specific multiplication tables (2–12, or custom tricky combos like 7, 8, 9, 12).
- Modes: Standard (`7 × 8`), Missing Factor (`7 × ? = 56`), and Division / Reverse (`56 ÷ 7`).

### 4. 🍰 Fraction Frenzy
- Mental fraction arithmetic with simplified fraction syntax (e.g. `3/4`).
- Simplification, addition/subtraction with common and unlike denominators, multiplication, and decimal conversions.

### 5. 🧠 Number Sense
- Numerical reasoning mini-games:
  - Ballpark mental estimation.
  - Squares ($11^2$ to $25^2$) & Cubes ($2^3$ to $10^3$).
  - Sequence completions and pattern finding.
  - Number bonds to 100 & 1,000.
  - Rapid comparisons (e.g. $3/7$ vs $4/9$).

### 6. 🎯 Target 100 (Countdown Style)
- Tactile number puzzle: combine given numbers using $+$, $-$, $\times$, $\div$ to reach exactly 100.
- Immediate visual step feedback and bullseye celebration.

### 7. 🎓 ESAT & TMUA Admissions Exam Mode
- Designed for university admissions tests where calculators are banned.
- Drills mental fractional powers (e.g. $8^{2/3} = 4$, $16^{-3/4} = 1/8$), percentage adjustments, compound ratios, scientific notation exponents, and mental quadratic factorizations.
- Includes step-by-step mental math explanations for every problem.

### 8. 📅 Daily Challenge
- Seeded deterministically by the current calendar date—every student across the world receives the exact same set of 10 questions on the same day.
- Tracks calendar completion and habits.

---

## 🎨 Visual Identity & Art Direction

- **Color Palette**:
  - Warm Cream (`#FAF7EE`, `#FFFDF7`)
  - Deep Midnight Navy (`#111728`, `#0B0F1A`)
  - Electric Cobalt Blue (`#2563EB`)
  - Butter Yellow (`#FDE047`, `#FEF08A`)
  - Soft Cherry Red (`#F43F5E`, `#FDA4AF`)
  - Mint Green (`#34D399`, `#10B981`)
  - Lavender (`#A78BFA`, `#DDD6FE`)
  - Peach (`#FB923C`, `#FED7AA`)
- **Typography**:
  - `Fredoka`: Rounded, characterful arcade display font.
  - `Plus Jakarta Sans`: Clean, readable editorial body text.
  - `JetBrains Mono`: Monospaced tabular numerals for mathematical clarity.
- **Tactile Retro Buttons**: 3D extruded borders with `active:translate-x-0.5 active:translate-y-0.5` tactile feedback.
- **Pip the Mascot**: Interactive SVG mascot who blinks, smiles, cheers on high streaks, and wears unlocked accessories.
- **Pure Web Audio Synthesizer**: In-browser synthesized chimes, marimba sounds, error thuds, and fanfare chords with zero external audio assets. Muted by default per specifications.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Run Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev
# -> Opens http://localhost:3000/

# Production build
npm run build
```

---

## 📁 Project Architecture

```
src/
├── audio/
│   └── soundEngine.ts       # Pure Web Audio API synthesized sound effects
├── components/
│   ├── common/              # Button, Card, Badge, NumberPad
│   ├── games/               # ClassicArithmetic, NumberNinja, TimesTable, etc.
│   ├── layout/              # Navbar, Footer
│   ├── mascot/              # Mascot "Pip" SVG with animated expressions
│   ├── modals/              # SettingsModal (sound, theme, instant advance)
│   └── screens/             # HomeScreen, ResultsScreen, StatsScreen, StickersScreen, DailyChallenge
├── engine/
│   ├── evaluator.ts         # Math validation, fraction & float tolerance parsing
│   └── questionGenerator.ts # Procedural generators & seeded PRNG for daily puzzles
├── storage/
│   └── storage.ts           # LocalStorage service, stats aggregation & 15 badges
├── types/
│   ├── game.ts              # Game modes, questions, answer records, sessions
│   └── stats.ts             # Personal bests, user preferences & theme types
├── App.tsx                  # Root coordinator & state manager
├── index.css                # Tailwind directives & retro paper styling
└── main.tsx                 # React entry point
```

---

*“Make mental arithmetic practice so fun that students forget they're revising.”*
