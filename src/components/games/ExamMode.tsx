import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, GraduationCap } from 'lucide-react';
import { Question, AnswerRecord, GameSessionResult } from '../../types/game';
import { generateExamQuestion, ExamTopic } from '../../engine/questionGenerator';
import { checkAnswer } from '../../engine/evaluator';
import { sound } from '../../audio/soundEngine';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { NumberPad } from '../common/NumberPad';
import { MathText } from '../common/MathText';

interface ExamModeProps {
  onFinish: (result: GameSessionResult) => void;
  onExit: () => void;
  alwaysShowKeypad?: boolean;
}

export const ExamMode: React.FC<ExamModeProps> = ({
  onFinish,
  onExit,
  alwaysShowKeypad = false,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing'>('intro');
  const [examTopic, setExamTopic] = useState<ExamTopic>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
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
    const q = generateExamQuestion(examTopic);
    setCurrentQuestion(q);
    setUserInput('');
    qStartTimeRef.current = Date.now();
  }, [examTopic]);

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
    if (nextIdx >= questionCount) {
      const totalDurationSec = Math.max(5, Math.round((Date.now() - gameStartTimeRef.current) / 1000));
      const correctCount = newRecords.filter((r) => r.isCorrect).length;
      const accuracy = Math.round((correctCount / questionCount) * 100);
      const avgResponse = Math.round(newRecords.reduce((a, b) => a + b.timeMs, 0) / questionCount);

      onFinish({
        mode: 'exam',
        modeTitle: 'ESAT & TMUA Numerical Fluency',
        score: correctCount,
        totalAttempts: questionCount,
        correctCount,
        incorrectCount: questionCount - correctCount,
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
      <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-pop">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 font-display text-sm font-bold text-midnight-900 dark:text-cream-100 hover:text-cobalt-600 dark:hover:text-butter-300 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Hub
        </button>

        <Card variant="white" shadow="lg" className="p-6 sm:p-8 text-center space-y-6 dark:bg-slate-900 dark:border-slate-700">
          <div className="flex justify-center">
            <span className="p-4 rounded-3xl bg-mint-200 dark:bg-emerald-950/60 border-2 border-midnight-900 dark:border-emerald-500/40 shadow-retro inline-flex items-center justify-center">
              <GraduationCap size={44} className="text-emerald-700 dark:text-emerald-300" />
            </span>
          </div>

          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-midnight-900 dark:text-cream-100">
              Admissions Blitz
            </h1>
            <p className="text-sm font-medium text-midnight-900/60 dark:text-cream-200/60 mt-1 max-w-xl mx-auto">
              Calculator-free ESAT (Maths 1 &amp; 2) and TMUA mental fluency: procedural traps, bounds, logs, trig, and probability.
            </p>
          </div>

          {/* Exam Domains */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs font-mono">
            <div className="p-3 rounded-xl bg-cream-100 dark:bg-slate-800 border border-midnight-900 dark:border-slate-700">
              <span className="font-display font-bold text-xs text-cobalt-600 dark:text-cobalt-400 block mb-1">
                Number, Surds &amp; SI
              </span>
              SI prefix jumps, unit traps, rationalising surds, bounds &amp; recurring decimals.
            </div>

            <div className="p-3 rounded-xl bg-cream-100 dark:bg-slate-800 border border-midnight-900 dark:border-slate-700">
              <span className="font-display font-bold text-xs text-mint-600 dark:text-emerald-400 block mb-1">
                Logs, Series &amp; Calculus
              </span>
              Log laws, circle radii, S_∞, integral limits, FTC &amp; trapezium estimates.
            </div>

            <div className="p-3 rounded-xl bg-cream-100 dark:bg-slate-800 border border-midnight-900 dark:border-slate-700">
              <span className="font-display font-bold text-xs text-cherry-600 dark:text-rose-400 block mb-1">
                Trig, Geom &amp; Prob
              </span>
              Trig root counting, 3D Pythagoras, similarity scaling &amp; Binomial E(X).
            </div>
          </div>

          {/* Topic Filter */}
          <div className="text-left">
            <label className="block font-display font-bold text-sm text-midnight-900 dark:text-cream-100 mb-2">
              Admissions Focus
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {[
                { id: 'all', name: 'Full Mix', desc: 'ESAT M1/M2 & TMUA' },
                { id: 'number', name: 'Number & Surds', desc: 'SI, bounds, surds, %' },
                { id: 'algebra', name: 'Algebra & Logs', desc: 'Circles, S_∞, rem thm' },
                { id: 'trigcalc', name: 'Trig & Calc', desc: 'Roots, FTC, trapezium' },
                { id: 'geomprob', name: 'Geom & Prob', desc: 'Scale, 3D, nCr, E(X)' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setExamTopic(t.id as ExamTopic);
                  }}
                  className={`p-2.5 rounded-xl border-2 border-midnight-900 dark:border-slate-700 font-display text-center transition-all ${
                    examTopic === t.id
                      ? 'bg-cobalt-600 text-white shadow-retro'
                      : 'bg-cream-50 dark:bg-slate-800/60 text-midnight-900 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold text-xs block">{t.name}</span>
                  <span className="text-[10px] opacity-75 block mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Drill Length */}
          <div className="text-left">
            <label className="block font-display font-bold text-sm text-midnight-900 dark:text-cream-100 mb-2">
              Session Length
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { count: 10, label: '10 Qs', sub: 'Quick Sprint' },
                { count: 20, label: '20 Qs', sub: 'Standard Set' },
                { count: 27, label: '27 Qs', sub: 'Full ESAT Module' },
              ].map((opt) => (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setQuestionCount(opt.count);
                  }}
                  className={`p-2.5 rounded-xl border-2 border-midnight-900 dark:border-slate-700 font-display text-center transition-all ${
                    questionCount === opt.count
                      ? 'bg-emerald-600 text-white shadow-retro'
                      : 'bg-cream-50 dark:bg-slate-800/60 text-midnight-900 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold text-xs block">{opt.label}</span>
                  <span className="text-[10px] opacity-75 block mt-0.5">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 rounded-xl bg-butter-100 dark:bg-amber-950/40 border border-midnight-900/30 dark:border-amber-500/30 text-[11px] font-sans text-midnight-900/70 dark:text-amber-200/80 text-left">
            <strong>Admissions Note:</strong> Calculators are prohibited in ESAT and TMUA. All prompts are procedurally generated to sharpen non-calculator speed and accuracy; not affiliated with official exam boards.
          </div>

          <Button variant="primary" size="xl" fullWidth onClick={startGame} icon={<Play size={20} className="fill-white" />}>
            {`BEGIN EXAM DRILL (${questionCount} QUESTIONS)`}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 select-none animate-pop">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onExit}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm text-midnight-900 dark:text-cream-100"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="font-display font-bold text-sm text-midnight-900 dark:text-cream-100">
          Question {questionIndex + 1} of {questionCount}
        </div>

        <div className="px-3 py-1 rounded-xl bg-cobalt-500 text-white border-2 border-midnight-900 dark:border-slate-700 font-mono font-bold text-xs shadow-retro-sm">
          Streak: {streak}
        </div>
      </div>

      <div className="w-full h-3 rounded-full bg-cream-200 dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 overflow-hidden mb-6 shadow-retro-sm">
        <div
          className="h-full bg-cobalt-600 transition-all duration-300"
          style={{ width: `${(questionIndex / questionCount) * 100}%` }}
        />
      </div>

      <Card variant="white" shadow="lg" className="p-6 sm:p-8 text-center relative dark:bg-slate-900 dark:border-slate-700">
        {currentQuestion?.promptSubtitle && (
          <span className="inline-block px-3 py-0.5 rounded-full bg-cream-200 dark:bg-slate-800 border border-midnight-900 dark:border-slate-700 text-xs font-display font-bold text-midnight-900 dark:text-butter-300 mb-2">
            {currentQuestion.promptSubtitle}
          </span>
        )}

        <div className="font-mono font-extrabold text-xl sm:text-3xl leading-snug text-midnight-950 dark:text-cream-100 my-6">
          <MathText text={currentQuestion?.prompt || ''} />
        </div>

        {currentQuestion?.options ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto mt-6">
            {currentQuestion.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswerSubmit(opt.toString())}
                className="py-3 px-4 rounded-xl bg-cream-100 dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 font-mono text-base sm:text-lg font-bold text-midnight-950 dark:text-cream-100 shadow-retro-sm hover:bg-butter-200 dark:hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <MathText text={opt.toString()} />
              </button>
            ))}
          </div>
        ) : (
          <>
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
              className="w-full max-w-xs mx-auto text-center font-mono font-black text-3xl py-3 rounded-2xl bg-cream-100 dark:bg-slate-800 border-3 border-midnight-900 dark:border-slate-700 shadow-retro focus:outline-none focus:ring-4 focus:ring-cobalt-400 text-midnight-950 dark:text-cream-100"
            />

            <p className="text-xs font-mono text-midnight-900/50 dark:text-cream-200/50 mt-4">
              Press Enter or type exact answer
            </p>
          </>
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
            allowFractionSlash
            allowNegative
          />
        </div>
      )}
    </div>
  );
};
