import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Delete, Sparkles } from 'lucide-react';
import { AnswerRecord, GameSessionResult } from '../../types/game';
import {
  OperatorSymbol,
  OperatorPuzzle,
  evaluateBidmas,
  generateOperatorPuzzle,
} from '../../engine/questionGenerator';
import { sound } from '../../audio/soundEngine';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface OperatorBlitzProps {
  onFinish: (result: GameSessionResult) => void;
  onExit: () => void;
}

const OPS: { sym: OperatorSymbol; keyHint: string; label: string; colorClass: string }[] = [
  {
    sym: '+',
    keyHint: '+',
    label: 'Add',
    colorClass: 'bg-cobalt-100 dark:bg-blue-950/70 hover:bg-cobalt-200 dark:hover:bg-blue-900/80 text-cobalt-800 dark:text-blue-200 border-midnight-900 dark:border-blue-500/40',
  },
  {
    sym: '-',
    keyHint: '-',
    label: 'Subtract',
    colorClass: 'bg-cherry-100 dark:bg-rose-950/70 hover:bg-cherry-200 dark:hover:bg-rose-900/80 text-cherry-700 dark:text-rose-200 border-midnight-900 dark:border-rose-500/40',
  },
  {
    sym: '×',
    keyHint: '*',
    label: 'Multiply',
    colorClass: 'bg-butter-200 dark:bg-amber-950/70 hover:bg-butter-300 dark:hover:bg-amber-900/80 text-amber-900 dark:text-amber-200 border-midnight-900 dark:border-amber-500/40',
  },
  {
    sym: '÷',
    keyHint: '/',
    label: 'Divide',
    colorClass: 'bg-mint-200 dark:bg-emerald-950/70 hover:bg-mint-300 dark:hover:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 border-midnight-900 dark:border-emerald-500/40',
  },
];

export const OperatorBlitz: React.FC<OperatorBlitzProps> = ({ onFinish, onExit }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing'>('intro');
  const [totalQuestions, setTotalQuestions] = useState<number>(12);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [puzzle, setPuzzle] = useState<OperatorPuzzle | null>(null);
  const [slot1, setSlot1] = useState<OperatorSymbol | null>(null);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);

  const qStartTimeRef = useRef<number>(Date.now());
  const gameStartTimeRef = useRef<number>(Date.now());

  const loadRound = useCallback((round: number) => {
    setPuzzle(generateOperatorPuzzle(round));
    setSlot1(null);
    qStartTimeRef.current = Date.now();
  }, []);

  const startGame = () => {
    setGameState('playing');
    setQuestionIndex(0);
    setRecords([]);
    setStreak(0);
    setLongestStreak(0);
    gameStartTimeRef.current = Date.now();
    loadRound(0);
  };

  const handleOperatorPick = useCallback(
    (op: OperatorSymbol) => {
      if (!puzzle || gameState !== 'playing') return;

      if (!slot1) {
        sound.playClick();
        setSlot1(op);
        return;
      }

      const timeMs = Date.now() - qStartTimeRef.current;
      const evaluated = evaluateBidmas(puzzle.nums, [slot1, op]);
      const isCorrect = evaluated !== null && evaluated === puzzle.target;

      const [a, b, c] = puzzle.nums;
      const userExpr = `${a} ${slot1} ${b} ${op} ${c}${evaluated !== null ? ` (= ${evaluated})` : ''}`;

      const newRecords: AnswerRecord[] = [
        ...records,
        {
          question: `${a} [?] ${b} [?] ${c} = ${puzzle.target}`,
          userAnswer: userExpr,
          correctAnswer: puzzle.explanation,
          isCorrect,
          timeMs,
          explanation: `BIDMAS order applies × and ÷ before + and −.`,
        },
      ];
      setRecords(newRecords);

      if (isCorrect) {
        sound.playCorrect(streak + 1);
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setLongestStreak((p) => Math.max(p, nextStreak));
      } else {
        sound.playWrong();
        setStreak(0);
      }

      const nextIdx = questionIndex + 1;
      if (nextIdx >= totalQuestions) {
        const totalDurationSec = Math.max(5, Math.round((Date.now() - gameStartTimeRef.current) / 1000));
        const correctCount = newRecords.filter((r) => r.isCorrect).length;
        const accuracy = Math.round((correctCount / totalQuestions) * 100);
        const avgResponse = Math.round(newRecords.reduce((acc, r) => acc + r.timeMs, 0) / totalQuestions);

        onFinish({
          mode: 'operators',
          modeTitle: 'Operator Blitz',
          score: correctCount,
          totalAttempts: totalQuestions,
          correctCount,
          incorrectCount: totalQuestions - correctCount,
          accuracy,
          duration: totalDurationSec,
          avgResponseTimeMs: avgResponse,
          longestStreak: Math.max(longestStreak, isCorrect ? streak + 1 : streak),
          records: newRecords,
          timestamp: Date.now(),
        });
      } else {
        setQuestionIndex(nextIdx);
        loadRound(nextIdx);
      }
    },
    [puzzle, gameState, slot1, records, streak, longestStreak, questionIndex, totalQuestions, onFinish, loadRound]
  );

  // Support fast keyboard play (+, -, *, x, /, Backspace)
  useEffect(() => {
    if (gameState !== 'playing') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleOperatorPick('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperatorPick('-');
      } else if (e.key === '*' || e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleOperatorPick('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperatorPick('÷');
      } else if (e.key === 'Backspace' && slot1) {
        e.preventDefault();
        sound.playClick();
        setSlot1(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, slot1, handleOperatorPick]);

  if (gameState === 'intro') {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-8 animate-pop">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 font-display text-sm font-bold text-midnight-900 dark:text-cream-100 hover:text-cobalt-600 dark:hover:text-butter-300 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Hub
        </button>

        <Card variant="white" shadow="lg" className="p-6 sm:p-8 text-center space-y-6 dark:bg-slate-900 dark:border-slate-700">
          <div className="flex justify-center">
            <span className="p-4 rounded-3xl bg-lavender-200 dark:bg-purple-950/60 border-2 border-midnight-900 dark:border-purple-400/50 shadow-retro inline-flex items-center gap-1 font-mono font-black text-2xl text-purple-700 dark:text-purple-300">
              + − × ÷
            </span>
          </div>

          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-midnight-900 dark:text-cream-100">
              Operator Blitz
            </h1>
            <p className="text-sm font-medium text-midnight-900/60 dark:text-cream-200/60 mt-1 max-w-md mx-auto">
              Crack equations backwards: slot the missing operators to hit the target under strict BIDMAS order.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cream-100 dark:bg-slate-800 border border-midnight-900 dark:border-slate-700 text-left text-xs font-mono dark:text-cream-200 space-y-2">
            <p className="font-display font-bold text-sm text-midnight-900 dark:text-cream-100 flex items-center gap-1.5">
              <Sparkles size={14} className="text-cobalt-600 dark:text-cobalt-400" />
              Example: 6 [?] 4 [?] 2 = 22
            </p>
            <p>• Tap <strong className="text-midnight-950 dark:text-white">×</strong> then <strong className="text-midnight-950 dark:text-white">−</strong> → 6 × 4 − 2 = 22</p>
            <p>• Any valid operator combo that evaluates to the target wins instantly.</p>
            <p>• Supports keyboard keys <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-midnight-900 dark:border-slate-600 font-bold">+</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-midnight-900 dark:border-slate-600 font-bold">-</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-midnight-900 dark:border-slate-600 font-bold">*</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-midnight-900 dark:border-slate-600 font-bold">/</kbd></p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[12, 20].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setTotalQuestions(cnt);
                }}
                className={`p-3 rounded-xl border-2 border-midnight-900 dark:border-slate-700 font-display font-bold text-sm transition-all ${
                  totalQuestions === cnt
                    ? 'bg-cobalt-600 text-white shadow-retro'
                    : 'bg-cream-50 dark:bg-slate-800/60 text-midnight-900 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-slate-800'
                }`}
              >
                {cnt} Equations
              </button>
            ))}
          </div>

          <Button variant="primary" size="xl" fullWidth onClick={startGame} icon={<Play size={20} className="fill-white" />}>
            START OPERATOR BLITZ
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 select-none animate-pop">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onExit}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm text-midnight-900 dark:text-cream-100"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="font-display font-bold text-sm text-midnight-900 dark:text-cream-100">
          Equation {questionIndex + 1} of {totalQuestions}
        </div>

        <div className="px-3 py-1 rounded-xl bg-purple-600 text-white border-2 border-midnight-900 dark:border-purple-400/50 font-mono font-bold text-xs shadow-retro-sm">
          Streak: {streak}
        </div>
      </div>

      <div className="w-full h-3 rounded-full bg-cream-200 dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 overflow-hidden mb-6 shadow-retro-sm">
        <div
          className="h-full bg-purple-600 transition-all duration-300"
          style={{ width: `${(questionIndex / totalQuestions) * 100}%` }}
        />
      </div>

      {puzzle && (
        <Card variant="white" shadow="lg" className="p-6 sm:p-8 text-center dark:bg-slate-900 dark:border-slate-700 space-y-6">
          <span className="inline-block px-3 py-0.5 rounded-full bg-cream-200 dark:bg-slate-800 border border-midnight-900 dark:border-slate-700 text-xs font-display font-bold text-midnight-900 dark:text-butter-300">
            Reverse BIDMAS • Slot 2 Operators
          </span>

          {/* Equation Slots Display */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 font-mono font-black text-3xl sm:text-5xl text-midnight-950 dark:text-cream-100 my-4">
            <span>{puzzle.nums[0]}</span>

            <button
              type="button"
              onClick={() => {
                if (slot1) {
                  sound.playClick();
                  setSlot1(null);
                }
              }}
              title={slot1 ? 'Click to clear first slot' : 'First operator'}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                slot1
                  ? 'bg-cobalt-600 text-white border-midnight-900 dark:border-cobalt-400 shadow-retro-sm'
                  : 'bg-cream-100 dark:bg-slate-800 text-cobalt-600 dark:text-cobalt-400 border-dashed border-cobalt-500 ring-2 ring-cobalt-400/40 animate-pulse'
              }`}
            >
              {slot1 ?? '?'}
            </button>

            <span>{puzzle.nums[1]}</span>

            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                slot1
                  ? 'bg-cream-100 dark:bg-slate-800 text-cobalt-600 dark:text-cobalt-400 border-dashed border-cobalt-500 ring-2 ring-cobalt-400/40 animate-pulse'
                  : 'bg-cream-50 dark:bg-slate-800/50 text-midnight-900/30 dark:text-slate-600 border-midnight-900/20 dark:border-slate-700'
              }`}
            >
              ?
            </div>

            <span>{puzzle.nums[2]}</span>
            <span className="text-midnight-900/50 dark:text-slate-400">=</span>
            <span className="px-3 py-1 rounded-2xl bg-butter-200 dark:bg-amber-950/60 border-2 border-midnight-900 dark:border-amber-500/40 text-midnight-950 dark:text-amber-300">
              {puzzle.target}
            </span>
          </div>

          {/* Interactive 4-Operator Pad */}
          <div className="grid grid-cols-4 gap-3 pt-2">
            {OPS.map((op) => (
              <button
                key={op.sym}
                type="button"
                onClick={() => handleOperatorPick(op.sym)}
                aria-label={op.label}
                className={`py-4 sm:py-5 rounded-2xl border-2 font-mono font-black text-3xl sm:text-4xl shadow-retro active:translate-x-0.5 active:translate-y-0.5 transition-all flex flex-col items-center justify-center gap-1 ${op.colorClass}`}
              >
                <span>{op.sym}</span>
                <span className="text-[10px] font-sans font-bold uppercase opacity-60 hidden sm:block">
                  key {op.keyHint}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 text-xs font-mono text-midnight-900/60 dark:text-cream-200/60">
            <span>{slot1 ? 'Pick 2nd operator — auto-checks!' : 'Pick 1st operator'}</span>
            {slot1 && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSlot1(null);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cream-100 dark:bg-slate-800 border border-midnight-900/20 dark:border-slate-700 font-bold text-midnight-900 dark:text-cream-100 hover:bg-cream-200 dark:hover:bg-slate-700"
              >
                <Delete size={12} /> Clear slot
              </button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
