import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Sparkles, HelpCircle } from 'lucide-react';
import { Question, AnswerRecord, GameSessionResult } from '../../types/game';
import { generateFractionQuestion } from '../../engine/questionGenerator';
import { checkAnswer } from '../../engine/evaluator';
import { sound } from '../../audio/soundEngine';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { NumberPad } from '../common/NumberPad';
import { Mascot } from '../mascot/Mascot';

interface FractionFrenzyProps {
  onFinish: (result: GameSessionResult) => void;
  onExit: () => void;
  alwaysShowKeypad?: boolean;
}

export const FractionFrenzy: React.FC<FractionFrenzyProps> = ({
  onFinish,
  onExit,
  alwaysShowKeypad = false,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing'>('intro');
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const totalQuestions = 12;
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
    const q = generateFractionQuestion();
    setCurrentQuestion(q);
    setUserInput('');
    qStartTimeRef.current = Date.now();
  }, []);

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
        explanation: currentQuestion.hint,
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
      const avgResponse = Math.round(newRecords.reduce((a, b) => a + b.timeMs, 0) / totalQuestions);

      onFinish({
        mode: 'fractions',
        modeTitle: 'Fraction Frenzy',
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

  if (gameState === 'intro') {
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
            <span className="text-6xl p-4 rounded-3xl bg-lavender-200 dark:bg-purple-900/40 border-2 border-midnight-900 dark:border-purple-400 shadow-retro">
              🍰
            </span>
          </div>

          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-midnight-900 dark:text-cream-100">
              Fraction Frenzy
            </h1>
            <p className="text-sm font-medium text-midnight-900/60 dark:text-cream-200/60 mt-1">
              Master mental fractions, simplification and decimal conversions
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cream-100 dark:bg-slate-800 border border-midnight-900 dark:border-slate-700 text-left text-xs font-mono dark:text-cream-200 space-y-2">
            <p className="font-display font-bold text-sm text-midnight-900 dark:text-cream-100">How to enter answers:</p>
            <p>• Type fractions with a slash, e.g. <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-midnight-900 dark:border-slate-600 font-bold">3/4</kbd></p>
            <p>• Whole numbers can be typed directly, e.g. <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-midnight-900 dark:border-slate-600 font-bold">1</kbd></p>
            <p>• Always simplify fractions to their lowest terms (e.g. 2/4 becomes 1/2)</p>
          </div>

          <Button variant="accent" size="xl" fullWidth onClick={startGame} icon={<Play size={20} className="fill-midnight-950" />}>
            START FRACTIONS SPRINT
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
          Question {questionIndex + 1} of {totalQuestions}
        </div>

        <div className="px-3 py-1 rounded-xl bg-lavender-300 dark:bg-purple-900/60 border-2 border-midnight-900 dark:border-purple-400 font-mono font-bold text-xs dark:text-purple-200 shadow-retro-sm">
          Streak: {streak}
        </div>
      </div>

      <div className="w-full h-3 rounded-full bg-cream-200 dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 overflow-hidden mb-6 shadow-retro-sm">
        <div
          className="h-full bg-lavender-500 transition-all duration-300"
          style={{ width: `${(questionIndex / totalQuestions) * 100}%` }}
        />
      </div>

      <Card variant="white" shadow="lg" className="p-8 text-center relative dark:bg-slate-900 dark:border-slate-700">
        {currentQuestion?.promptSubtitle && (
          <span className="inline-block px-3 py-0.5 rounded-full bg-cream-200 dark:bg-slate-800 border border-midnight-900 dark:border-slate-700 text-xs font-display font-bold text-midnight-900 dark:text-butter-300 mb-2">
            {currentQuestion.promptSubtitle}
          </span>
        )}

        <div className="font-mono font-extrabold text-4xl sm:text-5xl text-midnight-950 dark:text-cream-100 my-6">
          {currentQuestion?.prompt}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="e.g. 3/4"
          className="w-full max-w-xs mx-auto text-center font-mono font-black text-3xl py-3 rounded-2xl bg-cream-100 dark:bg-slate-800 border-3 border-midnight-900 dark:border-slate-700 shadow-retro focus:outline-none focus:ring-4 focus:ring-lavender-400 text-midnight-950 dark:text-cream-100"
        />

        {currentQuestion?.hint && (
          <p className="text-xs font-mono text-midnight-900/50 dark:text-cream-200/50 mt-4 flex items-center justify-center gap-1">
            <HelpCircle size={14} /> {currentQuestion.hint}
          </p>
        )}
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
          allowFractionSlash
        />
      </div>
    </div>
  );
};
