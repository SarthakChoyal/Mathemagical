import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, CheckCircle2, Play, ArrowLeft, Delete, Lock } from 'lucide-react';
import { Question, AnswerRecord, GameSessionResult } from '../../types/game';
import {
  generateDailyChallengeQuestions,
  evaluateBidmas,
  OperatorSymbol,
} from '../../engine/questionGenerator';
import { checkAnswer } from '../../engine/evaluator';
import { sound } from '../../audio/soundEngine';
import { StorageService } from '../../storage/storage';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { NumberPad } from '../common/NumberPad';
import { Mascot } from '../mascot/Mascot';
import calendarIcon from '../../assets/calendar-icon.png';
import confetti from 'canvas-confetti';

interface DailyProps {
  onFinish: (result: GameSessionResult) => void;
  onExit: () => void;
  alwaysShowKeypad?: boolean;
}

export const DailyChallengeScreen: React.FC<DailyProps> = ({
  onFinish,
  onExit,
  alwaysShowKeypad = false,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isAlreadyDone = StorageService.isDailyCompleted(todayStr);

  const [gameState, setGameState] = useState<'preview' | 'playing'>('preview');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [vaultSlot1, setVaultSlot1] = useState<OperatorSymbol | null>(null);
  const [retryFeedback, setRetryFeedback] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const qStartTimeRef = useRef(Date.now());
  const gameStartTimeRef = useRef(Date.now());

  useEffect(() => {
    const dailyQs = generateDailyChallengeQuestions(todayStr);
    setQuestions(dailyQs);
  }, [todayStr]);

  const startDaily = () => {
    setGameState('playing');
    setCurrentIndex(0);
    setRecords([]);
    setStreak(0);
    setLongestStreak(0);
    setUserInput('');
    setVaultSlot1(null);
    setRetryFeedback(null);
    gameStartTimeRef.current = Date.now();
    qStartTimeRef.current = Date.now();
  };

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (gameState === 'playing' && !currentQ?.operatorPuzzle) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [gameState, currentIndex, currentQ]);

  const handleAnswer = useCallback(
    (ans: string) => {
      if (!currentQ) return;
      const timeMs = Date.now() - qStartTimeRef.current;

      let isCorrect = false;
      if (currentQ.operatorPuzzle && vaultSlot1) {
        const val = evaluateBidmas(currentQ.operatorPuzzle.nums, [vaultSlot1, ans as OperatorSymbol]);
        isCorrect = val !== null && val === currentQ.operatorPuzzle.target;
        if (!isCorrect) {
          sound.playWrong();
          setStreak(0);
          setVaultSlot1(null);
          setRetryFeedback(
            val === null
              ? 'Not divisible! Try another pair.'
              : `Got ${val} (need ${currentQ.operatorPuzzle.target}). Keep going!`
          );
          return;
        }
      } else {
        isCorrect = checkAnswer(ans, currentQ.answer);
        if (!isCorrect) {
          sound.playWrong();
          setStreak(0);
          setRetryFeedback('Not quite — keep going!');
          return;
        }
      }

      setRetryFeedback(null);
      sound.playCorrect(streak + 1);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setLongestStreak((p) => Math.max(p, nextStreak));

      const recordedAnswer =
        currentQ.operatorPuzzle && vaultSlot1
          ? `${currentQ.operatorPuzzle.nums[0]} ${vaultSlot1} ${currentQ.operatorPuzzle.nums[1]} ${ans} ${currentQ.operatorPuzzle.nums[2]} = ${currentQ.operatorPuzzle.target}`
          : ans;

      const newRecs = [
        ...records,
        {
          question: currentQ.prompt,
          userAnswer: recordedAnswer,
          correctAnswer: currentQ.answer.toString(),
          isCorrect: true,
          timeMs,
          explanation: currentQ.explanation,
        },
      ];
      setRecords(newRecs);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= questions.length) {
        StorageService.markDailyCompleted(todayStr);

        const durationSec = Math.max(5, Math.round((Date.now() - gameStartTimeRef.current) / 1000));
        const correctCount = newRecs.filter((r) => r.isCorrect).length;
        const accuracy = Math.round((correctCount / questions.length) * 100);
        const avgResponse = Math.round(newRecs.reduce((a, b) => a + b.timeMs, 0) / questions.length);

        onFinish({
          mode: 'daily',
          modeTitle: `Daily Challenge (${todayStr})`,
          score: correctCount,
          totalAttempts: questions.length,
          correctCount,
          incorrectCount: questions.length - correctCount,
          accuracy,
          duration: durationSec,
          avgResponseTimeMs: avgResponse,
          longestStreak: Math.max(longestStreak, nextStreak),
          records: newRecs,
          timestamp: Date.now(),
        });
      } else {
        setCurrentIndex(nextIndex);
        setUserInput('');
        setVaultSlot1(null);
        qStartTimeRef.current = Date.now();
      }
    },
    [currentQ, vaultSlot1, streak, records, currentIndex, questions.length, todayStr, longestStreak, onFinish]
  );

  const handleVaultPick = useCallback(
    (op: OperatorSymbol) => {
      if (!currentQ?.operatorPuzzle) return;
      if (!vaultSlot1) {
        sound.playClick();
        setVaultSlot1(op);
        setRetryFeedback(null);
        return;
      }
      handleAnswer(op);
    },
    [currentQ, vaultSlot1, handleAnswer]
  );

  // Keyboard shortcuts for Q10 Signature Vault
  useEffect(() => {
    if (gameState !== 'playing' || !currentQ?.operatorPuzzle) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleVaultPick('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleVaultPick('-');
      } else if (e.key === '*' || e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleVaultPick('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleVaultPick('÷');
      } else if (e.key === 'Backspace' && vaultSlot1) {
        e.preventDefault();
        sound.playClick();
        setVaultSlot1(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, currentQ, vaultSlot1, handleVaultPick]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    if (retryFeedback) setRetryFeedback(null);
    if (currentQ && !currentQ.operatorPuzzle && checkAnswer(val, currentQ.answer)) {
      handleAnswer(val);
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (gameState === 'preview') {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 animate-pop">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 font-display text-sm font-bold text-midnight-900 dark:text-cream-100 hover:text-cobalt-600 dark:hover:text-butter-300 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Hub
        </button>

        <Card variant="white" shadow="lg" className="p-8 text-center space-y-6 dark:bg-slate-900 dark:border-slate-700">
          <div className="flex justify-center">
            <div className="p-3.5 rounded-3xl bg-butter-200 dark:bg-slate-800 border-2 border-midnight-900 dark:border-amber-400/50 shadow-retro inline-flex items-center justify-center">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 select-none">
                <img
                  src={calendarIcon}
                  alt="Daily Challenge Calendar"
                  className="w-full h-full object-contain drop-shadow-sm"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-[41%] bottom-[8%] flex items-center justify-center font-display font-black text-2xl sm:text-3xl tracking-tight text-midnight-950"
                >
                  {new Date().getDate()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-butter-300 dark:bg-amber-400 border border-midnight-900 dark:border-amber-300 text-xs font-mono font-bold text-midnight-950 mb-2">
              <Sparkles size={14} /> GLOBAL DAILY PUZZLE
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-midnight-900 dark:text-cream-100">
              Daily Challenge
            </h1>
            <p className="font-mono text-sm font-bold text-cobalt-600 dark:text-butter-300 mt-1">
              {formattedDate}
            </p>
          </div>

          <p className="text-sm text-midnight-900/70 dark:text-cream-200/70 max-w-sm mx-auto">
            9 seeded speed-math rounds + today&apos;s <strong className="text-midnight-900 dark:text-cream-100">Signature BIDMAS Vault</strong> finale. Every problem must be solved to finish!
          </p>

          {isAlreadyDone ? (
            <div className="p-4 rounded-2xl bg-mint-200 dark:bg-emerald-950/60 border-2 border-midnight-900 dark:border-emerald-500 shadow-retro text-center space-y-2">
              <div className="flex items-center justify-center gap-2 font-display font-bold text-mint-900 dark:text-emerald-200">
                <CheckCircle2 size={20} />
                <span>You completed today's challenge!</span>
              </div>
              <p className="text-xs text-mint-950/70 dark:text-emerald-300/70">
                Great dedication! You can replay to hone your speed, or return tomorrow for the next one.
              </p>
              <div className="pt-2">
                <Button variant="outline" size="md" onClick={startDaily}>
                  Replay Today's Daily
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="primary" size="xl" fullWidth onClick={startDaily} icon={<Play size={20} className="fill-white" />}>
              START DAILY CHALLENGE
            </Button>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 select-none animate-pop">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onExit}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm text-midnight-900 dark:text-cream-100"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="font-display font-bold text-sm text-midnight-900 dark:text-cream-100">
          Daily Q{currentIndex + 1} of {questions.length}
        </div>

        <div className="px-3 py-1 rounded-xl bg-butter-300 dark:bg-amber-400 text-midnight-950 border-2 border-midnight-900 dark:border-amber-300 font-mono font-bold text-xs shadow-retro-sm">
          Streak: {streak}
        </div>
      </div>

      <div className="w-full h-3 rounded-full bg-cream-200 dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 overflow-hidden mb-6 shadow-retro-sm">
        <div
          className="h-full bg-butter-400 transition-all duration-300"
          style={{ width: `${(currentIndex / questions.length) * 100}%` }}
        />
      </div>

      <Card variant="white" shadow="lg" className="p-6 sm:p-8 text-center relative dark:bg-slate-900 dark:border-slate-700">
        {currentQ?.promptSubtitle && (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cream-200 dark:bg-slate-800 border border-midnight-900 dark:border-slate-700 text-xs font-display font-bold text-midnight-900 dark:text-butter-300 mb-2">
            {currentQ.operatorPuzzle && <Lock size={12} />}
            {currentQ.promptSubtitle}
          </span>
        )}

        {currentQ?.operatorPuzzle ? (
          <div className="space-y-5 mt-3">
            <p className="text-xs font-mono text-midnight-900/60 dark:text-cream-200/60">
              Crack the Daily Vault: slot 2 operators under BIDMAS order
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 font-mono font-black text-3xl sm:text-4xl text-midnight-950 dark:text-cream-100 my-4">
              <span>{currentQ.operatorPuzzle.nums[0]}</span>

              <button
                type="button"
                onClick={() => {
                  if (vaultSlot1) {
                    sound.playClick();
                    setVaultSlot1(null);
                  }
                }}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                  vaultSlot1
                    ? 'bg-cobalt-600 text-white border-midnight-900 dark:border-cobalt-400 shadow-retro-sm'
                    : 'bg-cream-100 dark:bg-slate-800 text-cobalt-600 dark:text-cobalt-400 border-dashed border-cobalt-500 ring-2 ring-cobalt-400/40 animate-pulse'
                }`}
              >
                {vaultSlot1 ?? '?'}
              </button>

              <span>{currentQ.operatorPuzzle.nums[1]}</span>

              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                  vaultSlot1
                    ? 'bg-cream-100 dark:bg-slate-800 text-cobalt-600 dark:text-cobalt-400 border-dashed border-cobalt-500 ring-2 ring-cobalt-400/40 animate-pulse'
                    : 'bg-cream-50 dark:bg-slate-800/50 text-midnight-900/30 dark:text-slate-600 border-midnight-900/20 dark:border-slate-700'
                }`}
              >
                ?
              </div>

              <span>{currentQ.operatorPuzzle.nums[2]}</span>
              <span className="text-midnight-900/50 dark:text-slate-400">=</span>
              <span className="px-3 py-1 rounded-2xl bg-butter-200 dark:bg-amber-950/60 border-2 border-midnight-900 dark:border-amber-500/40 text-midnight-950 dark:text-amber-300">
                {currentQ.operatorPuzzle.target}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              {(['+', '-', '×', '÷'] as OperatorSymbol[]).map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => handleVaultPick(op)}
                  className="py-3.5 sm:py-4 rounded-2xl border-2 border-midnight-900 dark:border-slate-600 bg-cream-100 dark:bg-slate-800 hover:bg-butter-200 dark:hover:bg-slate-700 font-mono font-black text-3xl text-midnight-950 dark:text-cream-100 shadow-retro active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  {op}
                </button>
              ))}
            </div>

            {vaultSlot1 && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setVaultSlot1(null);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-cream-100 dark:bg-slate-800 border border-midnight-900/20 dark:border-slate-700 text-xs font-mono font-bold text-midnight-900 dark:text-cream-100"
                >
                  <Delete size={12} /> Clear 1st slot
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="font-mono font-extrabold text-4xl sm:text-6xl text-midnight-950 dark:text-cream-100 my-6">
              {currentQ?.prompt}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && userInput.trim().length > 0) {
                  handleAnswer(userInput);
                }
              }}
              placeholder="Answer..."
              className="w-full max-w-xs mx-auto text-center font-mono font-black text-4xl py-3 rounded-2xl bg-cream-100 dark:bg-slate-800 border-3 border-midnight-900 dark:border-slate-700 shadow-retro focus:outline-none focus:ring-4 focus:ring-butter-400 text-midnight-950 dark:text-cream-100"
            />
          </>
        )}

        {retryFeedback && (
          <p className="text-xs font-mono font-bold text-cherry-600 dark:text-rose-400 mt-4">
            {retryFeedback}
          </p>
        )}
      </Card>

      {!currentQ?.operatorPuzzle && (
        <div className={alwaysShowKeypad ? 'block' : 'sm:hidden'}>
          <NumberPad
            onInput={(c) => {
              const next = userInput + c;
              setUserInput(next);
              if (retryFeedback) setRetryFeedback(null);
              if (currentQ && checkAnswer(next, currentQ.answer)) {
                handleAnswer(next);
              }
            }}
            onBackspace={() => setUserInput((p) => p.slice(0, -1))}
            onClear={() => setUserInput('')}
            onSubmit={() => {
              if (userInput.trim().length > 0) handleAnswer(userInput);
            }}
            allowFractionSlash
          />
        </div>
      )}
    </div>
  );
};
