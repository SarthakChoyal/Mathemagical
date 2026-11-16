import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, RotateCcw, Sparkles, CheckCircle2, Target } from 'lucide-react';
import { GameSessionResult } from '../../types/game';
import { sound } from '../../audio/soundEngine';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Mascot } from '../mascot/Mascot';
import confetti from 'canvas-confetti';

interface Target100Props {
  onFinish: (result: GameSessionResult) => void;
  onExit: () => void;
}

interface Tile {
  id: string;
  value: number;
}

export const Target100: React.FC<Target100Props> = ({ onFinish, onExit }) => {
  const puzzles = [
    { target: 100, numbers: [25, 50, 4, 3, 2, 7] },
    { target: 100, numbers: [75, 25, 6, 4, 2, 1] },
    { target: 100, numbers: [10, 20, 30, 4, 5, 2] },
    { target: 100, numbers: [50, 8, 7, 5, 4, 2] },
    { target: 100, numbers: [15, 20, 25, 6, 4, 2] },
  ];

  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const currentPuzzle = puzzles[puzzleIndex % puzzles.length];

  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTileA, setSelectedTileA] = useState<Tile | null>(null);
  const [selectedOp, setSelectedOp] = useState<'+' | '-' | '×' | '÷' | null>(null);
  const [historySteps, setHistorySteps] = useState<string[]>([]);
  const [hasWon, setHasWon] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const resetPuzzle = (pIndex = puzzleIndex) => {
    const p = puzzles[pIndex % puzzles.length];
    setTiles(p.numbers.map((n, i) => ({ id: `t_${i}_${n}`, value: n })));
    setSelectedTileA(null);
    setSelectedOp(null);
    setHistorySteps([]);
    setHasWon(false);
    setStartTime(Date.now());
  };

  useEffect(() => {
    resetPuzzle(puzzleIndex);
  }, [puzzleIndex]);

  const handleTileClick = (tile: Tile) => {
    sound.playClick();

    if (!selectedTileA) {
      setSelectedTileA(tile);
      return;
    }

    if (selectedTileA.id === tile.id) {
      // Deselect
      setSelectedTileA(null);
      return;
    }

    // If we have Tile A and an operator, clicking Tile B computes the operation!
    if (selectedTileA && selectedOp) {
      const valA = selectedTileA.value;
      const valB = tile.value;
      let res = 0;

      if (selectedOp === '+') res = valA + valB;
      else if (selectedOp === '-') {
        if (valA - valB <= 0) {
          sound.playWrong();
          return;
        }
        res = valA - valB;
      } else if (selectedOp === '×') res = valA * valB;
      else if (selectedOp === '÷') {
        if (valB === 0 || valA % valB !== 0) {
          sound.playWrong();
          return; // Integers only in countdown
        }
        res = valA / valB;
      }

      // Valid step
      sound.playCorrect();
      const stepStr = `${valA} ${selectedOp} ${valB} = ${res}`;
      setHistorySteps((prev) => [...prev, stepStr]);

      // Remove A and B, add new Tile
      const newTiles = tiles.filter((t) => t.id !== selectedTileA.id && t.id !== tile.id);
      newTiles.push({ id: `res_${Date.now()}`, value: res });
      setTiles(newTiles);

      setSelectedTileA(null);
      setSelectedOp(null);

      if (res === currentPuzzle.target) {
        setHasWon(true);
        sound.playFanfare();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      // Re-assign tile A
      setSelectedTileA(tile);
    }
  };

  const handleOpClick = (op: '+' | '-' | '×' | '÷') => {
    if (!selectedTileA) return;
    sound.playClick();
    setSelectedOp(op);
  };

  const finishSession = () => {
    const duration = Math.max(5, Math.round((Date.now() - startTime) / 1000));
    onFinish({
      mode: 'target100',
      modeTitle: 'Target 100: Bullseye',
      score: 100,
      totalAttempts: 1,
      correctCount: 1,
      incorrectCount: 0,
      accuracy: 100,
      duration,
      avgResponseTimeMs: duration * 1000,
      longestStreak: 1,
      records: [
        {
          question: `Reach 100 with [${currentPuzzle.numbers.join(', ')}]`,
          userAnswer: historySteps.join(' -> '),
          correctAnswer: '100',
          isCorrect: true,
          timeMs: duration * 1000,
        },
      ],
      timestamp: Date.now(),
    });
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 select-none animate-pop">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onExit}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm text-midnight-900 dark:text-cream-100"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
          <Target size={18} className="text-cherry-500" />
          <span className="font-display font-black text-lg text-midnight-900 dark:text-cream-50">
            TARGET 100
          </span>
        </div>

        <button
          onClick={() => resetPuzzle()}
          className="p-2 rounded-xl bg-cream-200 dark:bg-slate-800 border-2 border-midnight-900 dark:border-slate-700 shadow-retro-sm text-midnight-900 dark:text-cream-100 hover:bg-cream-300 dark:hover:bg-slate-700"
          title="Reset puzzle"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Target Banner */}
      <div className="text-center py-6 px-4 bg-butter-200 dark:bg-butter-950/60 border-3 border-midnight-900 dark:border-slate-700 rounded-3xl shadow-retro-md mb-6">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-midnight-900/60 dark:text-butter-300/80">
          Target Number
        </span>
        <div className="font-mono font-black text-6xl sm:text-7xl text-midnight-950 dark:text-cream-50 mt-1">
          {currentPuzzle.target}
        </div>
        <p className="text-xs font-medium text-midnight-900/70 dark:text-cream-200/70 mt-1">
          Combine numbers using +, −, ×, ÷ to reach exactly 100!
        </p>
      </div>

      {/* Number Tiles Rack */}
      <div className="mb-6">
        <label className="block text-center font-display font-bold text-xs uppercase tracking-wider text-midnight-900/60 dark:text-cream-200/60 mb-2">
          Available Numbers:
        </label>
        <div className="flex flex-wrap justify-center gap-3">
          {tiles.map((tile) => {
            const isSelected = selectedTileA?.id === tile.id;
            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-3 border-midnight-900 dark:border-slate-700 font-mono text-2xl sm:text-3xl font-black transition-all flex items-center justify-center ${
                  isSelected
                    ? 'bg-butter-300 dark:bg-butter-500 ring-4 ring-cobalt-500 scale-105 shadow-retro text-midnight-950'
                    : 'bg-white dark:bg-slate-800 shadow-retro-sm hover:bg-cream-100 dark:hover:bg-slate-700 text-midnight-950 dark:text-cream-50 active:translate-x-0.5 active:translate-y-0.5'
                }`}
              >
                {tile.value}
              </button>
            );
          })}
        </div>
      </div>

      {/* Operator Buttons */}
      <div className="flex justify-center gap-3 mb-6">
        {(['+', '-', '×', '÷'] as const).map((op) => {
          const isSelected = selectedOp === op;
          return (
            <button
              key={op}
              disabled={!selectedTileA}
              onClick={() => handleOpClick(op)}
              className={`h-14 w-14 rounded-xl border-2 border-midnight-900 dark:border-slate-700 font-mono text-2xl font-black transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed ${
                isSelected
                  ? 'bg-cobalt-600 text-white shadow-retro'
                  : 'bg-cream-200 dark:bg-slate-800 text-midnight-950 dark:text-cream-50 shadow-retro-sm hover:bg-cream-300 dark:hover:bg-slate-700'
              }`}
            >
              {op}
            </button>
          );
        })}
      </div>

      {/* History of Operations */}
      {historySteps.length > 0 && (
        <Card variant="cream" shadow="sm" className="p-4 mb-6">
          <p className="text-xs font-mono font-bold text-midnight-900/60 dark:text-cream-200/60 mb-1">
            STEPS TAKEN:
          </p>
          <div className="space-y-1">
            {historySteps.map((step, idx) => (
              <div key={idx} className="font-mono text-sm font-bold text-midnight-900 dark:text-cream-100">
                • {step}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Victory Celebration */}
      {hasWon ? (
        <div className="p-6 rounded-3xl bg-mint-300 dark:bg-mint-950/80 border-3 border-midnight-900 dark:border-slate-700 shadow-retro-lg text-center space-y-4 animate-bounce-subtle">
          <Mascot mood="cheering" size="md" />
          <h2 className="font-display font-extrabold text-2xl text-midnight-950 dark:text-cream-50">
            🎯 BULLSEYE 100!
          </h2>
          <p className="text-xs font-bold text-midnight-900/80 dark:text-cream-200/80">
            You solved the countdown target in {historySteps.length} moves!
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="primary" onClick={finishSession}>
              CLAIM TROPHY
            </Button>
            <Button
              variant="outline"
              onClick={() => setPuzzleIndex((prev) => prev + 1)}
            >
              NEXT PUZZLE
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={() => setPuzzleIndex((prev) => prev + 1)}
            className="text-xs font-display font-bold text-midnight-900/60 dark:text-cream-200/60 hover:text-midnight-900 dark:hover:text-cream-100 underline"
          >
            Skip to another puzzle
          </button>
        </div>
      )}
    </div>
  );
};
