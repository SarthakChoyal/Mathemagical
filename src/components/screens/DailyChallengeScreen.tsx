import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Sparkles, CheckCircle2, Play, Flame, Award, ArrowLeft } from 'lucide-react';
import { Question, AnswerRecord, GameSessionResult } from '../../types/game';
import { generateDailyChallengeQuestions } from '../../engine/questionGenerator';
import { checkAnswer } from '../../engine/evaluator';
import { sound } from '../../audio/soundEngine';
import { StorageService } from '../../storage/storage';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { NumberPad } from '../common/NumberPad';
import { Mascot } from '../mascot/Mascot';
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
    gameStartTimeRef.current = Date.now();
    qStartTimeRef.current = Date.now();
  };

  useEffect(() => {
    if (gameState === 'playing') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [gameState, currentIndex]);

  const currentQ = questions[currentIndex];

  const handleAnswer = (ans: string) => {
    if (!currentQ) return;
    const timeMs = Date.now() - qStartTimeRef.current;
    const isCorrect = checkAnswer(ans, currentQ.answer);

    const newRecs = [
      ...records,
      {
        question: currentQ.prompt,
        userAnswer: ans,
        correctAnswer: currentQ.answer.toString(),
        isCorrect,
        timeMs,
      },
    ];
    setRecords(newRecs);

    if (isCorrect) {
      sound.playCorrect(streak + 1);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setLongestStreak((p) => Math.max(p, nextStreak));
    } else {
      sound.playWrong();
      setStreak(0);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      // Mark completed in storage
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
        longestStreak: Math.max(longestStreak, isCorrect ? streak + 1 : streak),
        records: newRecs,
        timestamp: Date.now(),
      });
    } else {
      setCurrentIndex(nextIndex);
      setUserInput('');
      qStartTimeRef.current = Date.now();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    if (currentQ && checkAnswer(val, currentQ.answer)) {
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
            <span className="text-6xl p-4 rounded-3xl bg-butter-200 dark:bg-amber-400 border-2 border-midnight-900 dark:border-amber-300 shadow-retro">
              📅
            </span>
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
            10 specially generated questions spanning mental arithmetic, tables, powers, and fractions. The same sequence for everyone today!
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

      <Card variant="white" shadow="lg" className="p-8 text-center relative dark:bg-slate-900 dark:border-slate-700">
        {currentQ?.promptSubtitle && (
          <span className="inline-block px-3 py-0.5 rounded-full bg-cream-200 dark:bg-slate-800 border border-midnight-900 dark:border-slate-700 text-xs font-display font-bold text-midnight-900 dark:text-butter-300 mb-2">
            {currentQ.promptSubtitle}
          </span>
        )}

        <div className="font-mono font-extrabold text-4xl sm:text-6xl text-midnight-950 dark:text-cream-100 my-6">
          {currentQ?.prompt}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Answer..."
          className="w-full max-w-xs mx-auto text-center font-mono font-black text-4xl py-3 rounded-2xl bg-cream-100 dark:bg-slate-800 border-3 border-midnight-900 dark:border-slate-700 shadow-retro focus:outline-none focus:ring-4 focus:ring-butter-400 text-midnight-950 dark:text-cream-100"
        />
      </Card>

      <div className={alwaysShowKeypad ? 'block' : 'sm:hidden'}>
        <NumberPad
          onInput={(c) => {
            const next = userInput + c;
            setUserInput(next);
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
    </div>
  );
};
