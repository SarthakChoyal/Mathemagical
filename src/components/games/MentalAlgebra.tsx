import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Sparkles } from 'lucide-react';
import { Question, AnswerRecord, GameSessionResult } from '../../types/game';
import { generateAlgebraQuestion, AlgebraType } from '../../engine/questionGenerator';
import { checkAnswer } from '../../engine/evaluator';
import { sound } from '../../audio/soundEngine';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { NumberPad } from '../common/NumberPad';
import { Mascot } from '../mascot/Mascot';

interface AlgebraProps {
  onFinish: (result: GameSessionResult) => void;
  onExit: () => void;
  alwaysShowKeypad?: boolean;
}

export const MentalAlgebra: React.FC<AlgebraProps> = ({
  onFinish,
  onExit,
  alwaysShowKeypad = false,
}) => {
  const [algebraMode, setAlgebraMode] = useState<AlgebraType>('mixed');
  const [gameState, setGameState] = useState<'config' | 'playing'>('config');
  const [targetCount, setTargetCount] = useState<number>(10);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const qStartTimeRef = useRef<number>(Date.now());
  const gameStartTimeRef = useRef<number>(Date.now());

  const startGame = () => {
    setGameState('playing');
    setQuestionIndex(0);
    setRecords([]);
    setStreak(0);
    setLongestStreak(0);
    gameStartTimeRef.current = Date.now();
    loadNext();
  };

  const loadNext = useCallback(() => {
    const q = generateAlgebraQuestion(algebraMode);
    setCurrentQuestion(q);
    setUserInput('');
    qStartTimeRef.current = Date.now();
  }, [algebraMode]);

  useEffect(() => {
    if (gameState === 'playing') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [gameState, questionIndex]);

  const handleAnswerSubmit = (ans: string) => {
    if (!currentQuestion) return;
    const timeMs = Date.now() - qStartTimeRef.current;
    const isCorrect = checkAnswer(ans, currentQuestion.answer);

    const newRecords = [
      ...records,
      {
        question: currentQuestion.prompt,
        userAnswer: ans,
        correctAnswer: currentQuestion.answer.toString(),
        isCorrect,
        timeMs,
        explanation: currentQuestion.explanation,
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
    if (nextIdx >= targetCount) {
      const totalDurationSec = Math.max(5, Math.round((Date.now() - gameStartTimeRef.current) / 1000));
      const correctCount = newRecords.filter((r) => r.isCorrect).length;
      const accuracy = Math.round((correctCount / targetCount) * 100);
      const avgResponse = Math.round(newRecords.reduce((a, b) => a + b.timeMs, 0) / targetCount);

      onFinish({
        mode: 'algebra',
        modeTitle: `Mental Algebra (${algebraMode.toUpperCase()})`,
        score: correctCount,
        totalAttempts: targetCount,
        correctCount,
        incorrectCount: targetCount - correctCount,
        accuracy,
        duration: totalDurationSec,
        avgResponseTimeMs: avgResponse,
        longestStreak: Math.max(longestStreak, isCorrect ? streak + 1 : streak),
        records: newRecords,
        timestamp: Date.now(),
      });
    } else {
      setQuestionIndex(nextIdx);
      loadNext();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    if (currentQuestion && checkAnswer(val, currentQuestion.answer)) {
      handleAnswerSubmit(val);
    }
  };

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
              Mental Algebra
            </h1>
            <p className="text-sm font-medium text-midnight-900/60 dark:text-cream-200/60 mt-0.5">
              Solve equations, quadratic roots, and exponent rules at rapid speed
            </p>
          </div>
        </div>

        <Card variant="white" shadow="lg" className="space-y-6 p-6 dark:bg-midnight-900 dark:border-midnight-800">
          <div>
            <label className="block font-display font-bold text-sm text-midnight-900 dark:text-cream-100 mb-2">
              Topic Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'linear', name: 'Linear Equations', desc: 'Solve ax + b = c rapidly' },
                { id: 'quadratic', name: 'Mental Quadratics', desc: 'Find smaller/larger roots' },
                { id: 'powers', name: 'Exponent Rules', desc: 'Solve 2^x equations & power laws' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAlgebraMode(m.id as AlgebraType);
                  }}
                  className={`p-3 rounded-2xl border-2 border-midnight-900 dark:border-slate-700 font-display text-center transition-all ${
                    algebraMode === m.id
                      ? 'bg-cobalt-600 text-white shadow-retro dark:shadow-retro-light'
                      : 'bg-cream-50 dark:bg-slate-800/60 text-midnight-900 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold text-sm block">{m.name}</span>
                  <span className="text-[10px] opacity-75 block mt-1">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-display font-bold text-sm text-midnight-900 dark:text-cream-100 mb-2">
              Number of Questions
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 15, 20].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setTargetCount(cnt);
                  }}
                  className={`py-2 rounded-xl border-2 border-midnight-900 dark:border-slate-700 font-display font-bold text-sm transition-all ${
                    targetCount === cnt
                      ? 'bg-mint-400 text-midnight-950 shadow-retro dark:shadow-retro-light'
                      : 'bg-cream-50 dark:bg-slate-800/60 text-midnight-900 dark:text-cream-100'
                  }`}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" size="xl" fullWidth onClick={startGame} icon={<Play size={20} className="fill-white" />}>
            START ALGEBRA DRILL
          </Button>
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
          Question {questionIndex + 1} of {targetCount}
        </div>

        <div className="px-3 py-1 rounded-xl bg-butter-300 text-midnight-950 border-2 border-midnight-900 font-mono font-bold text-xs shadow-retro-sm">
          Streak: {streak}
        </div>
      </div>

      <div className="w-full h-3 rounded-full bg-cream-200 dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 overflow-hidden mb-6 shadow-retro-sm">
        <div
          className="h-full bg-butter-400 transition-all duration-300"
          style={{ width: `${(questionIndex / targetCount) * 100}%` }}
        />
      </div>

      <Card variant="white" shadow="lg" className="p-8 text-center relative dark:bg-midnight-900 dark:border-slate-700">
        {currentQuestion?.promptSubtitle && (
          <span className="inline-block px-3 py-0.5 rounded-full bg-cream-200 dark:bg-slate-800 border border-midnight-900 dark:border-slate-700 text-xs font-display font-bold text-midnight-900 dark:text-butter-300 mb-2">
            {currentQuestion.promptSubtitle}
          </span>
        )}

        <div className="font-mono font-extrabold text-3xl sm:text-4xl text-midnight-950 dark:text-cream-100 my-6 tracking-tight">
          {currentQuestion?.prompt}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && userInput.trim().length > 0) {
              handleAnswerSubmit(userInput);
            }
          }}
          placeholder="Answer..."
          className="w-full max-w-xs mx-auto text-center font-mono font-black text-3xl py-3 rounded-2xl bg-cream-100 dark:bg-slate-800 border-3 border-midnight-900 dark:border-slate-700 shadow-retro focus:outline-none focus:ring-4 focus:ring-butter-400 text-midnight-950 dark:text-cream-100"
        />

        <p className="text-xs font-mono text-midnight-900/50 dark:text-cream-200/50 mt-4">
          Press Enter or type exact number
        </p>
      </Card>

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
          allowNegative
        />
      </div>
    </div>
  );
};
