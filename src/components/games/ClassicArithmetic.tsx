import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft, Flame, Clock, Target, Sparkles, Check, Settings2 } from 'lucide-react';
import { ClassicConfig, Question, AnswerRecord, GameSessionResult, Operation, Difficulty } from '../../types/game';
import { generateClassicQuestion } from '../../engine/questionGenerator';
import { checkAnswer } from '../../engine/evaluator';
import { sound } from '../../audio/soundEngine';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { NumberPad } from '../common/NumberPad';
import { Mascot } from '../mascot/Mascot';

interface ClassicArithmeticProps {
  onFinish: (result: GameSessionResult) => void;
  onExit: () => void;
  initialPreset?: Partial<ClassicConfig>;
  alwaysShowKeypad?: boolean;
}

export const ClassicArithmetic: React.FC<ClassicArithmeticProps> = ({
  onFinish,
  onExit,
  initialPreset,
  alwaysShowKeypad = false,
}) => {
  // Configuration state
  const [config, setConfig] = useState<ClassicConfig>({
    duration: initialPreset?.duration ?? 60,
    operations: initialPreset?.operations ?? ['+', '-', '×', '÷'],
    difficulty: initialPreset?.difficulty ?? 'medium',
    allowNegatives: initialPreset?.allowNegatives ?? false,
    minNumber: 2,
    maxNumber: 100,
    instantAdvance: true,
  });

  const [gameState, setGameState] = useState<'config' | 'countdown' | 'playing' | 'paused'>('config');
  const [countdown, setCountdown] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(config.duration);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [incorrectCount, setIncorrectCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [records, setRecords] = useState<AnswerRecord[]>([]);

  // Flash feedback effect
  const [flashColor, setFlashColor] = useState<'none' | 'green' | 'red'>('none');

  const inputRef = useRef<HTMLInputElement>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  const recentPromptsRef = useRef<Set<string>>(new Set());
  const hasFinishedRef = useRef<boolean>(false);

  // Helper to load next question
  const nextQuestion = useCallback(() => {
    const q = generateClassicQuestion(config, recentPromptsRef.current);
    recentPromptsRef.current.add(q.prompt);
    if (recentPromptsRef.current.size > 25) {
      recentPromptsRef.current.clear();
    }
    setCurrentQuestion(q);
    setUserInput('');
    questionStartTimeRef.current = Date.now();
  }, [config]);

  // Start game with 3-2-1 countdown
  const startCountdown = useCallback(() => {
    hasFinishedRef.current = false;
    setGameState('countdown');
    setCountdown(3);
    sound.playCountdown(false);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        sound.playCountdown(false);
      } else if (count === 0) {
        setCountdown(0);
        sound.playCountdown(true);
      } else {
        clearInterval(interval);
        // Start playing
        setTimeLeft(config.duration);
        setScore(0);
        setCorrectCount(0);
        setIncorrectCount(0);
        setStreak(0);
        setLongestStreak(0);
        setRecords([]);
        recentPromptsRef.current.clear();
        setGameState('playing');
        nextQuestion();
      }
    }, 800);
  }, [config.duration, nextQuestion]);

  // Auto-start if preset requested instant play
  useEffect(() => {
    if (initialPreset?.autoStart) {
      startCountdown();
    }
  }, [initialPreset, startCountdown]);

  // Timer loop
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          if (prev <= 6 && prev > 1) {
            sound.playTick();
          }
          return prev - 1;
        });
      }, 1000);

      // Auto focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState]);

  // Handle Game Over
  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0 && !hasFinishedRef.current) {
      hasFinishedRef.current = true;
      setGameState('config');
      const totalAttempts = correctCount + incorrectCount;
      const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
      const totalTimeMs = records.reduce((acc, r) => acc + r.timeMs, 0);
      const avgResponse = totalAttempts > 0 ? Math.round(totalTimeMs / totalAttempts) : 0;

      const result: GameSessionResult = {
        mode: 'classic',
        modeTitle: `Classic Arithmetic (${config.duration}s - ${config.difficulty.toUpperCase()})`,
        score,
        totalAttempts,
        correctCount,
        incorrectCount,
        accuracy,
        duration: config.duration,
        avgResponseTimeMs: avgResponse,
        longestStreak,
        records,
        timestamp: Date.now(),
      };

      onFinish(result);
    }
  }, [timeLeft, gameState, correctCount, incorrectCount, score, longestStreak, records, config, onFinish]);

  // Handle Answer Submission
  const submitAnswer = useCallback(
    (inputToValidate: string) => {
      if (!currentQuestion) return;
      const timeMs = Date.now() - questionStartTimeRef.current;
      const isCorrect = checkAnswer(inputToValidate, currentQuestion.answer);

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setLongestStreak((prev) => Math.max(prev, newStreak));
        setScore((prev) => prev + 1);
        setCorrectCount((prev) => prev + 1);

        // Flash green
        setFlashColor('green');
        setTimeout(() => setFlashColor('none'), 180);

        sound.playCorrect(newStreak);

        setRecords((prev) => [
          ...prev,
          {
            question: currentQuestion.prompt,
            userAnswer: inputToValidate,
            correctAnswer: currentQuestion.answer.toString(),
            isCorrect: true,
            timeMs,
          },
        ]);

        nextQuestion();
      } else {
        // Incorrect
        setStreak(0);
        setIncorrectCount((prev) => prev + 1);

        setFlashColor('red');
        setTimeout(() => setFlashColor('none'), 220);
        sound.playWrong();

        setRecords((prev) => [
          ...prev,
          {
            question: currentQuestion.prompt,
            userAnswer: inputToValidate,
            correctAnswer: currentQuestion.answer.toString(),
            isCorrect: false,
            timeMs,
          },
        ]);

        // Keep question or skip? Zetamac keeps question until correct or clears input
        // Standard Zetamac clears input so student can try again
        setUserInput('');
      }
    },
    [currentQuestion, streak, nextQuestion]
  );

  // Handle Typing & Instant Advance Check
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);

    if (config.instantAdvance && currentQuestion) {
      // If user typed the exact correct answer (length match or value match)
      if (checkAnswer(val, currentQuestion.answer)) {
        submitAnswer(val);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (userInput.trim().length > 0) {
        submitAnswer(userInput);
      }
    } else if (e.key === 'Escape') {
      onExit();
    }
  };

  // Toggle operations in config
  const toggleOperation = (op: Operation) => {
    sound.playClick();
    setConfig((prev) => {
      const exists = prev.operations.includes(op);
      if (exists && prev.operations.length === 1) return prev; // Keep at least one
      return {
        ...prev,
        operations: exists ? prev.operations.filter((o) => o !== op) : [...prev.operations, op],
      };
    });
  };

  // ---------------------------------------------------------------------------
  // 1. CONFIGURATION VIEW
  // ---------------------------------------------------------------------------
  if (gameState === 'config') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pop">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 font-display text-sm font-bold text-midnight-900 dark:text-cream-100 hover:text-cobalt-600 dark:hover:text-butter-300 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Hub
        </button>

        <div className="flex items-center gap-4 mb-6">
          <Mascot mood="happy" size="md" />
          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-midnight-900 dark:text-cream-100">
              Classic Arithmetic
            </h1>
            <p className="text-sm font-medium text-midnight-900/60 dark:text-cream-200/60 mt-0.5">
              Rapid-fire Zetamac-inspired mental maths training
            </p>
          </div>
        </div>

        <Card variant="white" shadow="lg" className="space-y-6 p-6 dark:bg-slate-900 dark:border-slate-700">
          {/* Duration Selector */}
          <div>
            <label className="block font-display font-bold text-sm text-midnight-900 mb-2">
              Time Limit
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { sec: 30, label: '30s Blitz' },
                { sec: 60, label: '60s Standard' },
                { sec: 120, label: '2 Mins' },
                { sec: 300, label: '5 Mins Marathon' },
              ].map(({ sec, label }) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setConfig({ ...config, duration: sec });
                  }}
                  className={`py-2.5 px-2 rounded-xl border-2 border-midnight-900 font-display font-bold text-xs sm:text-sm text-center transition-all ${
                    config.duration === sec
                      ? 'bg-cobalt-600 text-white shadow-retro'
                      : 'bg-cream-50 text-midnight-900 hover:bg-cream-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Operations Toggle */}
          <div>
            <label className="block font-display font-bold text-sm text-midnight-900 mb-2">
              Operations Included
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['+', '-', '×', '÷'] as Operation[]).map((op) => {
                const active = config.operations.includes(op);
                const labels: Record<Operation, string> = {
                  '+': 'Addition',
                  '-': 'Subtraction',
                  '×': 'Multiplication',
                  '÷': 'Division',
                };
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => toggleOperation(op)}
                    className={`p-3 rounded-xl border-2 border-midnight-900 font-display text-center transition-all ${
                      active
                        ? 'bg-butter-300 text-midnight-950 shadow-retro'
                        : 'bg-cream-50 text-midnight-900/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className="font-mono text-2xl font-black block">{op}</span>
                    <span className="text-[11px] font-bold block mt-0.5">{labels[op]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Selector */}
          <div>
            <label className="block font-display font-bold text-sm text-midnight-900 mb-2">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['easy', 'medium', 'hard', 'insane'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setConfig({ ...config, difficulty: diff });
                  }}
                  className={`py-2.5 rounded-xl border-2 border-midnight-900 font-display font-bold text-xs uppercase transition-all ${
                    config.difficulty === diff
                      ? 'bg-mint-400 text-midnight-950 shadow-retro'
                      : 'bg-cream-50 text-midnight-900 hover:bg-cream-100'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-midnight-900/60 mt-2 font-medium">
              {config.difficulty === 'easy' && '• Single & double digits (sums up to 40, tables up to 10×10)'}
              {config.difficulty === 'medium' && '• Standard Zetamac: double digit sums (12-99) and 2-12 × 11-89'}
              {config.difficulty === 'hard' && '• High tier: large double/triple digit additions, tables up to 20×99'}
              {config.difficulty === 'insane' && '• Elite mathletes: 4-digit sums, division up to 1000'}
            </p>
          </div>

          {/* Instant Advance Setting */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-cream-100 border border-midnight-900/20">
            <div>
              <p className="font-display font-bold text-sm text-midnight-900">
                Instant Type-Advance
              </p>
              <p className="text-xs text-midnight-900/60">
                Advances automatically the moment you type the right number
              </p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setConfig({ ...config, instantAdvance: !config.instantAdvance });
              }}
              className={`w-12 h-7 rounded-full border-2 border-midnight-900 p-0.5 transition-colors relative ${
                config.instantAdvance ? 'bg-mint-400' : 'bg-cream-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white border-2 border-midnight-900 transition-transform ${
                  config.instantAdvance ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Launch Button */}
          <Button
            variant="primary"
            size="xl"
            fullWidth
            onClick={startCountdown}
            icon={<Play size={22} className="fill-white" />}
          >
            START ROUND
          </Button>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. COUNTDOWN VIEW (3 - 2 - 1 - GO!)
  // ---------------------------------------------------------------------------
  if (gameState === 'countdown') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <Mascot mood="thinking" size="lg" />
        <div className="font-mono font-black text-8xl sm:text-9xl text-cobalt-600 mt-6 animate-pop">
          {countdown > 0 ? countdown : 'GO!'}
        </div>
        <p className="font-display font-bold text-lg text-midnight-900/70 mt-4">
          Get your fingers ready...
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. ACTIVE GAMEPLAY VIEW
  // ---------------------------------------------------------------------------
  const timeProgress = (timeLeft / config.duration) * 100;
  const isUrgent = timeLeft <= 10;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 select-none animate-pop">
      {/* Top HUD: Exit, Timer, Streak, Score */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onExit}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm text-midnight-900 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5"
          title="Exit game"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Live Streak indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm">
          <Flame
            size={18}
            className={`${streak >= 5 ? 'text-cherry-500 fill-cherry-500 animate-bounce-subtle' : 'text-midnight-900/30 dark:text-slate-500'}`}
          />
          <span className="font-mono font-black text-base text-midnight-900 dark:text-cream-100">
            {streak}
          </span>
          <span className="text-[10px] font-display font-bold uppercase text-midnight-900/60 dark:text-cream-200/60">
            Streak
          </span>
        </div>

        {/* Live Score */}
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-xl bg-butter-300 dark:bg-amber-400 border-2 border-midnight-900 dark:border-amber-300 shadow-retro-sm">
          <span className="text-xs font-display font-bold uppercase text-midnight-950">
            Score:
          </span>
          <span className="font-mono font-black text-xl text-midnight-950">
            {score}
          </span>
        </div>
      </div>

      {/* Timer Progress Bar */}
      <div className="relative w-full h-4 rounded-full bg-cream-200 dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 overflow-hidden mb-6 shadow-retro-sm">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            isUrgent ? 'bg-cherry-500 animate-pulse' : 'bg-cobalt-600'
          }`}
          style={{ width: `${timeProgress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-mono font-bold text-midnight-900 dark:text-cream-200 tracking-wider">
            {timeLeft}s remaining
          </span>
        </div>
      </div>

      {/* Main Question Display Card */}
      <div
        className={`relative rounded-3xl border-3 border-midnight-900 dark:border-slate-700 p-8 sm:p-12 text-center transition-colors duration-150 shadow-retro-lg dark:shadow-[6px_6px_0px_#000] ${
          flashColor === 'green'
            ? 'bg-mint-200 dark:bg-emerald-950/80'
            : flashColor === 'red'
            ? 'bg-cherry-200 dark:bg-rose-950/80'
            : 'bg-white dark:bg-slate-900/95'
        }`}
      >
        {/* Mascot Reacts in corner */}
        <div className="absolute top-3 right-3 hidden sm:block">
          <Mascot
            mood={flashColor === 'green' ? 'happy' : flashColor === 'red' ? 'oops' : 'idle'}
            streak={streak}
            size="sm"
          />
        </div>

        {/* Question Text */}
        <div className="font-mono font-extrabold text-5xl sm:text-7xl text-midnight-950 dark:text-cream-100 tracking-tight select-none my-4">
          {currentQuestion?.prompt || '...'}
        </div>

        {/* Large Input Field */}
        <div className="relative max-w-xs mx-auto mt-6">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            autoCorrect="off"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type answer..."
            className="w-full text-center font-mono font-black text-4xl sm:text-5xl py-3 px-4 rounded-2xl bg-cream-100 dark:bg-slate-800 border-3 border-midnight-900 dark:border-slate-700 shadow-retro dark:shadow-[3px_3px_0px_#000] focus:outline-none focus:ring-4 focus:ring-cobalt-400 text-midnight-950 dark:text-cream-100 placeholder:text-midnight-900/20 dark:placeholder:text-slate-600"
          />
        </div>

        <p className="text-xs font-mono text-midnight-900/50 dark:text-cream-200/50 mt-4">
          {config.instantAdvance ? '⚡ Instant advance enabled' : 'Press Enter to submit'}
        </p>
      </div>

      {/* On-Screen Keypad for Mobile or when toggled */}
      <div className={alwaysShowKeypad ? 'block' : 'sm:hidden'}>
        <NumberPad
          onInput={(char) => {
            const nextVal = userInput + char;
            setUserInput(nextVal);
            if (config.instantAdvance && currentQuestion) {
              if (checkAnswer(nextVal, currentQuestion.answer)) {
                submitAnswer(nextVal);
              }
            }
          }}
          onBackspace={() => setUserInput((prev) => prev.slice(0, -1))}
          onClear={() => setUserInput('')}
          onSubmit={() => {
            if (userInput.trim().length > 0) submitAnswer(userInput);
          }}
          allowNegative={config.allowNegatives}
        />
      </div>
    </div>
  );
};
