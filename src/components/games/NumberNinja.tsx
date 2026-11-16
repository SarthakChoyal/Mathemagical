import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Heart, Zap, Shield, Play } from 'lucide-react';
import { Question, AnswerRecord, GameSessionResult } from '../../types/game';
import { generateNinjaQuestion } from '../../engine/questionGenerator';
import { checkAnswer } from '../../engine/evaluator';
import { sound } from '../../audio/soundEngine';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { NumberPad } from '../common/NumberPad';
import { Mascot } from '../mascot/Mascot';

interface NumberNinjaProps {
  onFinish: (result: GameSessionResult) => void;
  onExit: () => void;
  alwaysShowKeypad?: boolean;
}

export const NumberNinja: React.FC<NumberNinjaProps> = ({
  onFinish,
  onExit,
  alwaysShowKeypad = false,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [lives, setLives] = useState<number>(3);
  const [wave, setWave] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [timeRemainingPercent, setTimeRemainingPercent] = useState<number>(100);

  const inputRef = useRef<HTMLInputElement>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const questionTimerRef = useRef<number | null>(null);
  const startTimeTotalRef = useRef<number>(Date.now());

  // Per-question time limit decreases with wave:
  // Wave 1: 10s, Wave 5: 6s, Wave 10+: 3.5s
  const getTimeLimitForWave = (w: number) => Math.max(3.2, 10 - (w - 1) * 0.55);

  const spawnNextQuestion = useCallback((nextWave: number) => {
    const q = generateNinjaQuestion(nextWave);
    setCurrentQuestion(q);
    setUserInput('');
    questionStartTimeRef.current = Date.now();
    setTimeRemainingPercent(100);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setLives(3);
    setWave(1);
    setScore(0);
    setCombo(1);
    setRecords([]);
    startTimeTotalRef.current = Date.now();
    spawnNextQuestion(1);
    sound.playFanfare();
  };

  // Question countdown tick
  useEffect(() => {
    if (gameState !== 'playing' || !currentQuestion) return;

    const timeLimitSec = getTimeLimitForWave(wave);
    const intervalMs = 50;
    const decrement = (intervalMs / (timeLimitSec * 1000)) * 100;

    questionTimerRef.current = window.setInterval(() => {
      setTimeRemainingPercent((prev) => {
        if (prev <= decrement) {
          clearInterval(questionTimerRef.current!);
          // Time ran out on this question: lose life
          handleTimeout();
          return 0;
        }
        return prev - decrement;
      });
    }, intervalMs);

    setTimeout(() => inputRef.current?.focus(), 50);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [gameState, currentQuestion, wave]);

  const handleTimeout = () => {
    sound.playWrong();
    const newLives = lives - 1;
    setLives(newLives);
    setCombo(1);

    if (currentQuestion) {
      setRecords((prev) => [
        ...prev,
        {
          question: currentQuestion.prompt,
          userAnswer: '(timeout)',
          correctAnswer: currentQuestion.answer.toString(),
          isCorrect: false,
          timeMs: Math.round(getTimeLimitForWave(wave) * 1000),
        },
      ]);
    }

    if (newLives <= 0) {
      endGame();
    } else {
      spawnNextQuestion(wave);
    }
  };

  const endGame = () => {
    setGameState('gameover');
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    const totalDurationSec = Math.max(5, Math.round((Date.now() - startTimeTotalRef.current) / 1000));
    const correctCount = records.filter((r) => r.isCorrect).length;
    const totalAttempts = records.length;
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
    const avgResponse = totalAttempts > 0 ? Math.round(records.reduce((a, b) => a + b.timeMs, 0) / totalAttempts) : 0;

    onFinish({
      mode: 'ninja',
      modeTitle: `Number Ninja (Wave ${wave})`,
      score,
      totalAttempts,
      correctCount,
      incorrectCount: totalAttempts - correctCount,
      accuracy,
      duration: totalDurationSec,
      avgResponseTimeMs: avgResponse,
      longestStreak: wave,
      records,
      timestamp: Date.now(),
    });
  };

  const handleAnswerSubmit = (ans: string) => {
    if (!currentQuestion) return;
    const timeMs = Date.now() - questionStartTimeRef.current;
    const isCorrect = checkAnswer(ans, currentQuestion.answer);

    if (isCorrect) {
      const addedScore = 10 * combo;
      setScore((prev) => prev + addedScore);
      setCombo((prev) => Math.min(5, prev + 1));
      const nextWave = wave + 1;
      setWave(nextWave);
      sound.playCorrect(combo);

      setRecords((prev) => [
        ...prev,
        {
          question: currentQuestion.prompt,
          userAnswer: ans,
          correctAnswer: currentQuestion.answer.toString(),
          isCorrect: true,
          timeMs,
        },
      ]);

      spawnNextQuestion(nextWave);
    } else {
      sound.playWrong();
      setCombo(1);
      const newLives = lives - 1;
      setLives(newLives);

      setRecords((prev) => [
        ...prev,
        {
          question: currentQuestion.prompt,
          userAnswer: ans,
          correctAnswer: currentQuestion.answer.toString(),
          isCorrect: false,
          timeMs,
        },
      ]);

      if (newLives <= 0) {
        endGame();
      } else {
        setUserInput('');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    if (currentQuestion && checkAnswer(val, currentQuestion.answer)) {
      handleAnswerSubmit(val);
    }
  };

  if (gameState === 'intro') {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 animate-pop">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 font-display text-sm font-bold text-midnight-900 dark:text-cream-200 hover:text-cobalt-600 dark:hover:text-electric-400 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Hub
        </button>

        <Card variant="white" shadow="lg" className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <span className="text-6xl p-4 rounded-3xl bg-cherry-100 dark:bg-cherry-950/60 border-2 border-midnight-900 dark:border-slate-700 shadow-retro">
              🥷
            </span>
          </div>

          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-midnight-900 dark:text-cream-50">
              Number Ninja
            </h1>
            <p className="text-sm font-medium text-midnight-900/60 dark:text-cream-200/60 mt-1">
              Survival mode. Solve questions before the blade timer runs out!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-left">
            <div className="p-3 rounded-xl bg-cream-100 dark:bg-slate-800/90 border border-midnight-900 dark:border-slate-700">
              <span className="text-xs font-mono font-bold text-cherry-600 dark:text-cherry-400 flex items-center gap-1">
                <Heart size={14} className="fill-cherry-500" /> 3 LIVES
              </span>
              <p className="text-[11px] text-midnight-900/70 dark:text-cream-200/70 mt-1">Mistakes and timeouts cost 1 life.</p>
            </div>

            <div className="p-3 rounded-xl bg-cream-100 dark:bg-slate-800/90 border border-midnight-900 dark:border-slate-700">
              <span className="text-xs font-mono font-bold text-butter-600 dark:text-butter-400 flex items-center gap-1">
                <Zap size={14} /> COMBOS
              </span>
              <p className="text-[11px] text-midnight-900/70 dark:text-cream-200/70 mt-1">Chaining quick answers boosts multiplier up to 5x.</p>
            </div>

            <div className="p-3 rounded-xl bg-cream-100 dark:bg-slate-800/90 border border-midnight-900 dark:border-slate-700">
              <span className="text-xs font-mono font-bold text-cobalt-600 dark:text-cobalt-400 flex items-center gap-1">
                <Shield size={14} /> WAVES
              </span>
              <p className="text-[11px] text-midnight-900/70 dark:text-cream-200/70 mt-1">Questions get faster and trickier each wave.</p>
            </div>
          </div>

          <Button variant="cherry" size="xl" fullWidth onClick={startGame} icon={<Play size={20} className="fill-white" />}>
            ENTER THE DOJO
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 select-none animate-pop">
      {/* Top HUD */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onExit}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm text-midnight-900 dark:text-cream-100"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Lives */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm">
          {[1, 2, 3].map((heart) => (
            <Heart
              key={heart}
              size={18}
              className={`${
                heart <= lives ? 'fill-cherry-500 text-cherry-500' : 'text-midnight-900/20 dark:text-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Wave Badge */}
        <div className="px-3 py-1 rounded-xl bg-lavender-300 dark:bg-lavender-900/60 dark:text-lavender-200 border-2 border-midnight-900 dark:border-slate-700 font-display font-bold text-xs shadow-retro-sm">
          WAVE {wave}
        </div>

        {/* Combo */}
        <div className="px-3 py-1 rounded-xl bg-butter-300 dark:bg-butter-950/60 dark:text-butter-300 border-2 border-midnight-900 dark:border-slate-700 font-mono font-black text-sm shadow-retro-sm">
          {combo}x MULTIPLIER
        </div>
      </div>

      {/* Ninja Blade Timer */}
      <div className="w-full h-3 rounded-full bg-cream-200 dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 overflow-hidden mb-6 shadow-retro-sm">
        <div
          className={`h-full transition-all duration-75 ${
            timeRemainingPercent < 30 ? 'bg-cherry-500' : 'bg-mint-500'
          }`}
          style={{ width: `${timeRemainingPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <Card variant="white" shadow="lg" className="p-8 text-center relative">
        <div className="font-mono font-extrabold text-5xl sm:text-6xl text-midnight-950 dark:text-cream-50 my-6">
          {currentQuestion?.prompt}
        </div>

        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Strike!"
          className="w-full max-w-xs mx-auto text-center font-mono font-black text-4xl py-3 rounded-2xl bg-cream-100 dark:bg-slate-800 border-3 border-midnight-900 dark:border-slate-700 shadow-retro focus:outline-none focus:ring-4 focus:ring-cherry-400 text-midnight-950 dark:text-cream-50"
        />

        <p className="text-xs font-mono text-midnight-900/50 dark:text-cream-200/50 mt-4">
          Type quickly! The blade is moving.
        </p>
      </Card>

      {/* Keypad */}
      <div className={alwaysShowKeypad ? 'block' : 'sm:hidden'}>
        <NumberPad
          onInput={(c) => {
            const next = userInput + c;
            setUserInput(next);
            if (currentQuestion && checkAnswer(next, currentQuestion.answer)) {
              handleAnswerSubmit(next);
            }
          }}
          onBackspace={() => setUserInput((p) => p.slice(0, -1))}
          onClear={() => setUserInput('')}
          onSubmit={() => {
            if (userInput.trim().length > 0) handleAnswerSubmit(userInput);
          }}
        />
      </div>
    </div>
  );
};
