import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { Question, AnswerRecord, GameSessionResult } from '../../types/game';
import { generateTimesTableQuestion, TablePracticeMode } from '../../engine/questionGenerator';
import { checkAnswer } from '../../engine/evaluator';
import { sound } from '../../audio/soundEngine';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { NumberPad } from '../common/NumberPad';
import { Mascot } from '../mascot/Mascot';

interface TimesTableProps {
  onFinish: (result: GameSessionResult) => void;
  onExit: () => void;
  alwaysShowKeypad?: boolean;
}

export const TimesTablePlayground: React.FC<TimesTableProps> = ({
  onFinish,
  onExit,
  alwaysShowKeypad = false,
}) => {
  const [selectedTables, setSelectedTables] = useState<number[]>([7, 8, 9, 12]);
  const [practiceMode, setPracticeMode] = useState<TablePracticeMode>('mixed');
  const [targetCount, setTargetCount] = useState<number>(15);
  const [gameState, setGameState] = useState<'config' | 'playing'>('config');

  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const qStartTimeRef = useRef<number>(Date.now());
  const gameStartTimeRef = useRef<number>(Date.now());

  const toggleTable = (num: number) => {
    sound.playClick();
    setSelectedTables((prev) => {
      if (prev.includes(num)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((n) => n !== num);
      }
      return [...prev, num].sort((a, b) => a - b);
    });
  };

  const selectAllTables = () => {
    sound.playClick();
    setSelectedTables([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  };

  const selectTrickyTables = () => {
    sound.playClick();
    setSelectedTables([6, 7, 8, 9, 12]);
  };

  const startRound = () => {
    setGameState('playing');
    setQuestionIndex(0);
    setRecords([]);
    setStreak(0);
    setLongestStreak(0);
    gameStartTimeRef.current = Date.now();
    loadNext(0);
  };

  const loadNext = useCallback((idx: number) => {
    const q = generateTimesTableQuestion(selectedTables, practiceMode);
    setCurrentQuestion(q);
    setUserInput('');
    qStartTimeRef.current = Date.now();
  }, [selectedTables, practiceMode]);

  useEffect(() => {
    if (gameState === 'playing') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [gameState, questionIndex]);

  const handleAnswer = (ans: string) => {
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
      },
    ];
    setRecords(newRecords);

    if (isCorrect) {
      sound.playCorrect(streak + 1);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setLongestStreak((prev) => Math.max(prev, nextStreak));
    } else {
      sound.playWrong();
      setStreak(0);
    }

    const nextIndex = questionIndex + 1;
    if (nextIndex >= targetCount) {
      // Completed round!
      const totalDurationSec = Math.max(3, Math.round((Date.now() - gameStartTimeRef.current) / 1000));
      const correctCount = newRecords.filter((r) => r.isCorrect).length;
      const accuracy = Math.round((correctCount / targetCount) * 100);
      const avgResponse = Math.round(newRecords.reduce((a, b) => a + b.timeMs, 0) / targetCount);

      onFinish({
        mode: 'timestables',
        modeTitle: `Times Table Playground (${selectedTables.map((t) => `${t}s`).join(', ')})`,
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
      setQuestionIndex(nextIndex);
      loadNext(nextIndex);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    if (currentQuestion && checkAnswer(val, currentQuestion.answer)) {
      handleAnswer(val);
    }
  };

  if (gameState === 'config') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pop">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 font-display text-sm font-bold text-midnight-900 dark:text-cream-200 hover:text-cobalt-600 dark:hover:text-electric-400 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Hub
        </button>

        <div className="flex items-center gap-4 mb-6">
          <Mascot mood="happy" size="md" />
          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-midnight-900 dark:text-cream-50">
              Times Table Playground
            </h1>
            <p className="text-sm font-medium text-midnight-900/60 dark:text-cream-200/60 mt-0.5">
              Build instant, effortless recall for your multiplication tables
            </p>
          </div>
        </div>

        <Card variant="white" shadow="lg" className="space-y-6 p-6">
          {/* Tables Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-display font-bold text-sm text-midnight-900 dark:text-cream-100">
                Choose Tables to Practise:
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectTrickyTables}
                  className="px-2.5 py-1 rounded-lg bg-butter-200 dark:bg-butter-950/70 dark:text-butter-300 border border-midnight-900 dark:border-slate-700 font-bold hover:bg-butter-300"
                >
                  Tricky (6,7,8,9,12)
                </button>
                <button
                  type="button"
                  onClick={selectAllTables}
                  className="px-2.5 py-1 rounded-lg bg-cream-200 dark:bg-slate-800 dark:text-cream-200 border border-midnight-900 dark:border-slate-700 font-bold hover:bg-cream-300"
                >
                  All (2-12)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                const active = selectedTables.includes(num);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => toggleTable(num)}
                    className={`h-12 rounded-xl border-2 border-midnight-900 dark:border-slate-700 font-mono text-lg font-black transition-all ${
                      active
                        ? 'bg-cobalt-600 text-white shadow-retro'
                        : 'bg-cream-50 dark:bg-slate-800 text-midnight-900/40 dark:text-slate-400 hover:bg-cream-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {num}×
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block font-display font-bold text-sm text-midnight-900 dark:text-cream-100 mb-2">
              Challenge Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'standard', name: 'Standard (7 × 8)' },
                { id: 'missing', name: 'Missing Factor (? × 8 = 56)' },
                { id: 'reverse', name: 'Division (56 ÷ 7)' },
                { id: 'mixed', name: 'Mixed Variety' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setPracticeMode(m.id as TablePracticeMode);
                  }}
                  className={`p-2.5 rounded-xl border-2 border-midnight-900 dark:border-slate-700 font-display font-bold text-xs text-center transition-all ${
                    practiceMode === m.id
                      ? 'bg-butter-300 dark:bg-butter-500 text-midnight-950 dark:text-slate-950 shadow-retro'
                      : 'bg-cream-50 dark:bg-slate-800 text-midnight-900 dark:text-cream-200 hover:bg-cream-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block font-display font-bold text-sm text-midnight-900 dark:text-cream-100 mb-2">
              Questions per Sprint
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 15, 25].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setTargetCount(cnt);
                  }}
                  className={`py-2 rounded-xl border-2 border-midnight-900 dark:border-slate-700 font-display font-bold text-sm transition-all ${
                    targetCount === cnt
                      ? 'bg-mint-400 dark:bg-mint-500 text-midnight-950 dark:text-slate-950 shadow-retro'
                      : 'bg-cream-50 dark:bg-slate-800 text-midnight-900 dark:text-cream-200'
                  }`}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" size="xl" fullWidth onClick={startRound} icon={<Play size={20} className="fill-white" />}>
            START PRACTICE
          </Button>
        </Card>
      </div>
    );
  }

  // Active play
  return (
    <div className="max-w-xl mx-auto px-4 py-6 select-none animate-pop">
      {/* Header */}
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

        <div className="px-3 py-1 rounded-xl bg-butter-300 dark:bg-butter-950/60 dark:text-butter-300 border-2 border-midnight-900 dark:border-slate-700 font-mono font-bold text-xs shadow-retro-sm">
          Streak: {streak}
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-3 rounded-full bg-cream-200 dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 overflow-hidden mb-6 shadow-retro-sm">
        <div
          className="h-full bg-cobalt-600 transition-all duration-300"
          style={{ width: `${((questionIndex) / targetCount) * 100}%` }}
        />
      </div>

      {/* Question */}
      <Card variant="white" shadow="lg" className="p-8 text-center relative">
        {currentQuestion?.promptSubtitle && (
          <span className="inline-block px-3 py-0.5 rounded-full bg-lavender-200 dark:bg-lavender-900/60 dark:text-lavender-200 border border-midnight-900 dark:border-slate-700 text-xs font-display font-bold text-midnight-900 mb-2">
            {currentQuestion.promptSubtitle}
          </span>
        )}
        <div className="font-mono font-extrabold text-5xl sm:text-6xl text-midnight-950 dark:text-cream-50 my-6">
          {currentQuestion?.prompt}
        </div>

        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Answer"
          className="w-full max-w-xs mx-auto text-center font-mono font-black text-4xl py-3 rounded-2xl bg-cream-100 dark:bg-slate-800 border-3 border-midnight-900 dark:border-slate-700 shadow-retro focus:outline-none focus:ring-4 focus:ring-cobalt-400 text-midnight-950 dark:text-cream-50"
        />
      </Card>

      {/* Keypad */}
      <div className={alwaysShowKeypad ? 'block' : 'sm:hidden'}>
        <NumberPad
          onInput={(c) => {
            const next = userInput + c;
            setUserInput(next);
            if (currentQuestion && checkAnswer(next, currentQuestion.answer)) {
              handleAnswer(next);
            }
          }}
          onBackspace={() => setUserInput((p) => p.slice(0, -1))}
          onClear={() => setUserInput('')}
          onSubmit={() => {
            if (userInput.trim().length > 0) handleAnswer(userInput);
          }}
        />
      </div>
    </div>
  );
};
