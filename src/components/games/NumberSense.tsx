import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Sparkles } from 'lucide-react';
import { Question, AnswerRecord, GameSessionResult } from '../../types/game';
import { generateNumberSenseQuestion } from '../../engine/questionGenerator';
import { checkAnswer } from '../../engine/evaluator';
import { sound } from '../../audio/soundEngine';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { NumberPad } from '../common/NumberPad';
import { Mascot } from '../mascot/Mascot';

interface NumberSenseProps {
  onFinish: (result: GameSessionResult) => void;
  onExit: () => void;
  alwaysShowKeypad?: boolean;
}

export const NumberSense: React.FC<NumberSenseProps> = ({
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
    const q = generateNumberSenseQuestion();
    setCurrentQuestion(q);
    setUserInput('');
    qStartTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && !currentQuestion?.options) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [gameState, questionIndex, currentQuestion]);

  const handleAnswerSubmit = (ans: string | number) => {
    if (!currentQuestion) return;
    const timeMs = Date.now() - qStartTimeRef.current;
    const isCorrect = checkAnswer(ans, currentQuestion.answer);

    const newRecords = [
      ...records,
      {
        question: currentQuestion.prompt,
        userAnswer: ans.toString(),
        correctAnswer: currentQuestion.answer.toString(),
        isCorrect,
        timeMs,
        explanation: currentQuestion.explanation || currentQuestion.hint,
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
        mode: 'numbersense',
        modeTitle: 'Number Sense Playground',
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
          className="inline-flex items-center gap-2 font-display text-sm font-bold text-midnight-900 dark:text-cream-200 hover:text-cobalt-600 dark:hover:text-electric-400 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Hub
        </button>

        <Card variant="white" shadow="lg" className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <span className="text-6xl p-4 rounded-3xl bg-mint-200 dark:bg-mint-950/60 border-2 border-midnight-900 dark:border-slate-700 shadow-retro">
              🧠
            </span>
          </div>

          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-midnight-900 dark:text-cream-50">
              Number Sense
            </h1>
            <p className="text-sm font-medium text-midnight-900/60 dark:text-cream-200/60 mt-1">
              Estimation, number patterns, squares, cubes & mental comparisons
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left text-xs font-mono">
            <div className="p-3 rounded-xl bg-cream-100 dark:bg-slate-800 border border-midnight-900 dark:border-slate-700 text-midnight-900/80 dark:text-cream-200/80">
              <span className="font-display font-bold text-sm text-midnight-900 dark:text-cream-100 block mb-1">
                🔍 Estimation
              </span>
              Round numbers quickly to pick the closest ballpark.
            </div>
            <div className="p-3 rounded-xl bg-cream-100 dark:bg-slate-800 border border-midnight-900 dark:border-slate-700 text-midnight-900/80 dark:text-cream-200/80">
              <span className="font-display font-bold text-sm text-midnight-900 dark:text-cream-100 block mb-1">
                📐 Powers
              </span>
              Squares 11² to 25² and cubes 2³ to 10³.
            </div>
          </div>

          <Button variant="mint" size="xl" fullWidth onClick={startGame} icon={<Play size={20} className="fill-midnight-950" />}>
            START REASONING DRILL
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

        <div className="px-3 py-1 rounded-xl bg-mint-300 dark:bg-mint-950/60 dark:text-mint-300 border-2 border-midnight-900 dark:border-slate-700 font-mono font-bold text-xs shadow-retro-sm">
          Streak: {streak}
        </div>
      </div>

      <div className="w-full h-3 rounded-full bg-cream-200 dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 overflow-hidden mb-6 shadow-retro-sm">
        <div
          className="h-full bg-mint-500 transition-all duration-300"
          style={{ width: `${(questionIndex / totalQuestions) * 100}%` }}
        />
      </div>

      <Card variant="white" shadow="lg" className="p-8 text-center relative">
        {currentQuestion?.promptSubtitle && (
          <span className="inline-block px-3 py-0.5 rounded-full bg-butter-200 dark:bg-butter-950/60 dark:text-butter-300 border border-midnight-900 dark:border-slate-700 text-xs font-display font-bold text-midnight-900 mb-2">
            {currentQuestion.promptSubtitle}
          </span>
        )}

        <div className="font-mono font-extrabold text-3xl sm:text-5xl text-midnight-950 dark:text-cream-50 my-6">
          {currentQuestion?.prompt}
        </div>

        {/* Options buttons if multiple choice */}
        {currentQuestion?.options ? (
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mt-6">
            {currentQuestion.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswerSubmit(opt)}
                className="py-3 px-4 rounded-xl bg-cream-100 dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 font-mono text-xl font-bold text-midnight-950 dark:text-cream-100 shadow-retro-sm hover:bg-butter-200 dark:hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Answer..."
              className="w-full max-w-xs mx-auto text-center font-mono font-black text-4xl py-3 rounded-2xl bg-cream-100 dark:bg-slate-800 border-3 border-midnight-900 dark:border-slate-700 shadow-retro focus:outline-none focus:ring-4 focus:ring-mint-400 text-midnight-950 dark:text-cream-50"
            />
          </div>
        )}
      </Card>

      {!currentQuestion?.options && (
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
      )}
    </div>
  );
};
