import { Operation, Question, ClassicConfig, Difficulty } from '../types/game';

// Seeded pseudorandom generator for Daily Challenge consistency
function createSeededRandom(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function getRandomInt(min: number, max: number, rng = Math.random): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pickRandom<T>(array: T[], rng = Math.random): T {
  return array[Math.floor(rng() * array.length)];
}

// Greatest Common Divisor
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// ---------------------------------------------------------------------------
// 1. CLASSIC ARITHMETIC QUESTION GENERATOR (Zetamac Style)
// ---------------------------------------------------------------------------

export function generateClassicQuestion(
  config: ClassicConfig,
  recentPrompts: Set<string>
): Question {
  const operations = config.operations.length > 0 ? config.operations : ['+' as Operation];
  let attempts = 0;

  while (attempts < 20) {
    attempts++;
    const op = pickRandom(operations);
    let a = 0;
    let b = 0;
    let answer = 0;
    let prompt = '';

    switch (config.difficulty) {
      case 'easy':
        if (op === '+') {
          a = getRandomInt(2, 20);
          b = getRandomInt(2, 20);
          answer = a + b;
        } else if (op === '-') {
          b = getRandomInt(2, 15);
          answer = getRandomInt(2, 20);
          a = answer + b; // ensures positive answer
        } else if (op === '×') {
          a = getRandomInt(2, 10);
          b = getRandomInt(2, 10);
          answer = a * b;
        } else {
          // Division
          b = getRandomInt(2, 10);
          answer = getRandomInt(2, 10);
          a = answer * b;
        }
        break;

      case 'medium': // Standard Zetamac difficulty
        if (op === '+') {
          a = getRandomInt(12, 99);
          b = getRandomInt(12, 99);
          answer = a + b;
        } else if (op === '-') {
          b = getRandomInt(12, 89);
          answer = getRandomInt(12, 89);
          a = answer + b;
        } else if (op === '×') {
          a = getRandomInt(2, 12);
          b = getRandomInt(11, 89);
          // 50% chance to swap so both smaller-first and larger-first are practiced
          if (Math.random() > 0.5) {
            const temp = a; a = b; b = temp;
          }
          answer = a * b;
        } else {
          // Division
          b = getRandomInt(2, 12);
          answer = getRandomInt(11, 89);
          a = answer * b;
        }
        break;

      case 'hard':
        if (op === '+') {
          a = getRandomInt(50, 450);
          b = getRandomInt(50, 450);
          answer = a + b;
        } else if (op === '-') {
          b = getRandomInt(40, 399);
          answer = getRandomInt(30, 400);
          a = answer + b;
        } else if (op === '×') {
          a = getRandomInt(6, 20);
          b = getRandomInt(12, 99);
          if (Math.random() > 0.5) {
            const temp = a; a = b; b = temp;
          }
          answer = a * b;
        } else {
          b = getRandomInt(4, 16);
          answer = getRandomInt(14, 99);
          a = answer * b;
        }
        break;

      case 'insane':
        if (op === '+') {
          a = getRandomInt(150, 1500);
          b = getRandomInt(150, 1500);
          answer = a + b;
        } else if (op === '-') {
          b = getRandomInt(100, 1200);
          answer = getRandomInt(100, 1200);
          a = answer + b;
        } else if (op === '×') {
          a = getRandomInt(12, 35);
          b = getRandomInt(15, 60);
          answer = a * b;
        } else {
          b = getRandomInt(12, 30);
          answer = getRandomInt(15, 75);
          a = answer * b;
        }
        break;

      case 'custom':
      default:
        const min = config.minNumber || 2;
        const max = config.maxNumber || 50;
        if (op === '+') {
          a = getRandomInt(min, max);
          b = getRandomInt(min, max);
          answer = a + b;
        } else if (op === '-') {
          a = getRandomInt(min, max);
          b = getRandomInt(min, max);
          if (!config.allowNegatives && a < b) {
            const temp = a; a = b; b = temp;
          }
          answer = a - b;
        } else if (op === '×') {
          a = getRandomInt(Math.max(2, min), Math.min(25, max));
          b = getRandomInt(Math.max(2, min), Math.min(30, max));
          answer = a * b;
        } else {
          b = getRandomInt(Math.max(2, min), Math.min(15, max));
          answer = getRandomInt(Math.max(2, min), Math.min(30, max));
          a = answer * b;
        }
        break;
    }

    prompt = `${a} ${op} ${b}`;
    if (!recentPrompts.has(prompt) || attempts >= 18) {
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt,
        answer,
        operation: op,
      };
    }
  }

  return {
    id: Math.random().toString(36).substring(2, 9),
    prompt: `12 + 15`,
    answer: 27,
    operation: '+',
  };
}

// ---------------------------------------------------------------------------
// 2. NUMBER NINJA QUESTION GENERATOR (Survival / Escalating Waves)
// ---------------------------------------------------------------------------

export function generateNinjaQuestion(wave: number): Question {
  // Wave 1-3: Fast additions & subtractions
  if (wave <= 3) {
    const isAdd = Math.random() > 0.5;
    if (isAdd) {
      const a = getRandomInt(10, 40);
      const b = getRandomInt(5, 30);
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `${a} + ${b}`,
        answer: a + b,
        operation: '+',
      };
    } else {
      const b = getRandomInt(5, 30);
      const diff = getRandomInt(10, 40);
      const a = b + diff;
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `${a} - ${b}`,
        answer: diff,
        operation: '-',
      };
    }
  }

  // Wave 4-7: Multiplication and Division
  if (wave <= 7) {
    const isMul = Math.random() > 0.4;
    if (isMul) {
      const a = getRandomInt(3, 11);
      const b = getRandomInt(4, 14);
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `${a} × ${b}`,
        answer: a * b,
        operation: '×',
      };
    } else {
      const b = getRandomInt(3, 9);
      const ans = getRandomInt(4, 15);
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `${ans * b} ÷ ${b}`,
        answer: ans,
        operation: '÷',
      };
    }
  }

  // Wave 8-12: Multi-step speed arithmetic!
  if (wave <= 12) {
    const roll = Math.random();
    if (roll < 0.4) {
      // (a × b) + c
      const a = getRandomInt(3, 8);
      const b = getRandomInt(3, 9);
      const c = getRandomInt(5, 25);
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `(${a} × ${b}) + ${c}`,
        answer: a * b + c,
        operation: 'misc',
      };
    } else if (roll < 0.7) {
      // (a × b) - c
      const a = getRandomInt(4, 9);
      const b = getRandomInt(4, 9);
      const c = getRandomInt(3, 15);
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `(${a} × ${b}) - ${c}`,
        answer: a * b - c,
        operation: 'misc',
      };
    } else {
      // 100 - (a + b)
      const a = getRandomInt(15, 45);
      const b = getRandomInt(15, 45);
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `100 - (${a} + ${b})`,
        answer: 100 - (a + b),
        operation: '-',
      };
    }
  }

  // Wave 13+: Master Ninja speed pressure
  const a = getRandomInt(12, 25);
  const b = getRandomInt(11, 20);
  return {
    id: Math.random().toString(36).substring(2, 9),
    prompt: `${a} × ${b}`,
    answer: a * b,
    operation: '×',
  };
}

// ---------------------------------------------------------------------------
// 3. TIMES TABLE PLAYGROUND
// ---------------------------------------------------------------------------

export type TablePracticeMode = 'standard' | 'missing' | 'reverse' | 'mixed';

export function generateTimesTableQuestion(
  tables: number[],
  mode: TablePracticeMode = 'standard'
): Question {
  const table = pickRandom(tables.length > 0 ? tables : [7]);
  const factor = getRandomInt(2, 12);
  const product = table * factor;

  const chosenMode = mode === 'mixed' 
    ? pickRandom(['standard', 'missing', 'reverse'] as TablePracticeMode[]) 
    : mode;

  if (chosenMode === 'missing') {
    // e.g. "7 × ? = 56" or "? × 8 = 56"
    const hideFirst = Math.random() > 0.5;
    if (hideFirst) {
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `? × ${factor} = ${product}`,
        promptSubtitle: `Find the missing factor`,
        answer: table,
        operation: '×',
      };
    } else {
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `${table} × ? = ${product}`,
        promptSubtitle: `Find the missing factor`,
        answer: factor,
        operation: '×',
      };
    }
  }

  if (chosenMode === 'reverse') {
    // Reverse multiplication / division: "56 ÷ 7 = ?"
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `${product} ÷ ${table}`,
      promptSubtitle: `Reverse times table`,
      answer: factor,
      operation: '÷',
    };
  }

  // Standard "7 × 8"
  return {
    id: Math.random().toString(36).substring(2, 9),
    prompt: `${table} × ${factor}`,
    answer: product,
    operation: '×',
  };
}

// ---------------------------------------------------------------------------
// 4. FRACTION FRENZY
// ---------------------------------------------------------------------------

export function generateFractionQuestion(): Question {
  const type = pickRandom(['simplify', 'add_same', 'add_diff', 'multiply', 'conversion']);

  if (type === 'simplify') {
    // e.g., 18/24 -> 3/4
    const primes = [2, 3, 5];
    const commonFactor = pickRandom(primes) * pickRandom([1, 2, 3]);
    let num = getRandomInt(1, 6);
    let den = getRandomInt(num + 1, 9);
    // ensure irreducible base
    const d = gcd(num, den);
    num = num / d;
    den = den / d;

    const displayNum = num * commonFactor;
    const displayDen = den * commonFactor;
    const answer = `${num}/${den}`;

    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `Simplify: ${displayNum} / ${displayDen}`,
      promptSubtitle: 'Enter as fraction (e.g. 3/4)',
      answer,
      operation: 'misc',
      hint: `Divide both top and bottom by ${commonFactor}`,
    };
  }

  if (type === 'add_same') {
    // Common denominator: e.g. 1/7 + 3/7 = 4/7
    const den = getRandomInt(4, 12);
    const n1 = getRandomInt(1, den - 2);
    const n2 = getRandomInt(1, den - 1 - n1);
    const numSum = n1 + n2;
    const d = gcd(numSum, den);
    const answer = d === den ? '1' : `${numSum / d}/${den / d}`;

    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `${n1}/${den} + ${n2}/${den}`,
      promptSubtitle: 'Enter simplified fraction (e.g. 2/5 or 1)',
      answer,
      operation: '+',
    };
  }

  if (type === 'add_diff') {
    // Simple unlike denominators: 1/2 + 1/4 = 3/4 or 1/3 + 1/6 = 1/2
    const pairs = [
      { n1: 1, d1: 2, n2: 1, d2: 4, ans: '3/4' },
      { n1: 1, d1: 2, n2: 1, d2: 3, ans: '5/6' },
      { n1: 2, d1: 3, n2: 1, d2: 6, ans: '5/6' },
      { n1: 1, d1: 4, n2: 1, d2: 8, ans: '3/8' },
      { n1: 3, d1: 4, n2: 1, d2: 2, ans: '5/4' },
      { n1: 1, d1: 5, n2: 2, d2: 5, ans: '3/5' },
      { n1: 1, d1: 3, n2: 1, d2: 4, ans: '7/12' },
      { n1: 1, d1: 2, n2: 3, d2: 8, ans: '7/8' },
    ];
    const item = pickRandom(pairs);
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `${item.n1}/${item.d1} + ${item.n2}/${item.d2}`,
      promptSubtitle: 'Enter simplified fraction',
      answer: item.ans,
      operation: '+',
    };
  }

  if (type === 'multiply') {
    // 1/2 × 2/3 = 1/3
    const pairs = [
      { prompt: '1/2 × 2/3', ans: '1/3' },
      { prompt: '3/4 × 2/5', ans: '3/10' },
      { prompt: '2/3 × 3/4', ans: '1/2' },
      { prompt: '1/3 × 3/5', ans: '1/5' },
      { prompt: '4/5 × 5/8', ans: '1/2' },
      { prompt: '3/7 × 7/9', ans: '1/3' },
    ];
    const p = pickRandom(pairs);
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: p.prompt,
      promptSubtitle: 'Enter simplified fraction',
      answer: p.ans,
      operation: '×',
    };
  }

  // Conversion: e.g. 0.75 as fraction or 3/5 as decimal
  const conversions = [
    { prompt: '0.25 as fraction', ans: '1/4' },
    { prompt: '0.5 as fraction', ans: '1/2' },
    { prompt: '0.75 as fraction', ans: '3/4' },
    { prompt: '0.2 as fraction', ans: '1/5' },
    { prompt: '0.4 as fraction', ans: '2/5' },
    { prompt: '0.6 as fraction', ans: '3/5' },
    { prompt: '0.8 as fraction', ans: '4/5' },
    { prompt: '0.125 as fraction', ans: '1/8' },
    { prompt: '0.375 as fraction', ans: '3/8' },
  ];
  const c = pickRandom(conversions);
  return {
    id: Math.random().toString(36).substring(2, 9),
    prompt: c.prompt,
    promptSubtitle: 'Enter fraction (e.g. 3/4)',
    answer: c.ans,
    operation: 'misc',
  };
}

// ---------------------------------------------------------------------------
// 5. NUMBER SENSE MINI-GAMES
// ---------------------------------------------------------------------------

export function generateNumberSenseQuestion(): Question {
  const category = pickRandom(['squares', 'cubes', 'estimation', 'sequence', 'bonds', 'comparison']);

  if (category === 'squares') {
    const base = getRandomInt(11, 25);
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `${base}²`,
      promptSubtitle: 'Squares & Cubes',
      answer: base * base,
      operation: 'misc',
    };
  }

  if (category === 'cubes') {
    const base = getRandomInt(2, 10);
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `${base}³`,
      promptSubtitle: 'Squares & Cubes',
      answer: base * base * base,
      operation: 'misc',
    };
  }

  if (category === 'bonds') {
    const target = pickRandom([100, 1000]);
    const num = target === 100 ? getRandomInt(12, 88) : getRandomInt(120, 880);
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `${num} + ? = ${target}`,
      promptSubtitle: `Number bond to ${target}`,
      answer: target - num,
      operation: '+',
    };
  }

  if (category === 'sequence') {
    const patterns = [
      () => {
        const step = getRandomInt(3, 9);
        const start = getRandomInt(2, 20);
        return {
          prompt: `${start}, ${start + step}, ${start + 2 * step}, ${start + 3 * step}, ?`,
          answer: start + 4 * step,
          sub: `Rule: +${step}`
        };
      },
      () => {
        const start = getRandomInt(2, 6);
        return {
          prompt: `${start}, ${start * 2}, ${start * 4}, ${start * 8}, ?`,
          answer: start * 16,
          sub: 'Rule: ×2'
        };
      },
      () => {
        const start = getRandomInt(1, 4);
        const sqs = [start, start + 1, start + 2, start + 3, start + 4].map(x => x * x);
        return {
          prompt: `${sqs[0]}, ${sqs[1]}, ${sqs[2]}, ${sqs[3]}, ?`,
          answer: sqs[4],
          sub: 'Rule: Consecutive squares'
        };
      }
    ];
    const seq = pickRandom(patterns)();
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: seq.prompt,
      promptSubtitle: 'Complete the sequence',
      answer: seq.answer,
      operation: 'misc',
      hint: seq.sub,
    };
  }

  if (category === 'estimation') {
    // Multiple-choice estimation
    const n1 = getRandomInt(28, 92);
    const n2 = getRandomInt(18, 52);
    const exact = n1 * n2;
    // Round to nearest hundreds
    const approx = Math.round(exact / 100) * 100;
    const dist1 = approx + 500;
    const dist2 = Math.max(100, approx - 500);
    const dist3 = approx + 1000;
    const options = [approx, dist1, dist2, dist3].sort(() => Math.random() - 0.5);

    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `${n1} × ${n2} ≈ ?`,
      promptSubtitle: 'Choose the closest estimation',
      answer: approx,
      options,
      operation: 'misc',
      hint: `Round ${n1} and ${n2} to nearest ten: ${Math.round(n1/10)*10} × ${Math.round(n2/10)*10}`,
    };
  }

  // Which is larger?
  const comparisons = [
    { p: 'Which is larger: 3/7 or 4/9 ?', ans: '4/9', opts: ['3/7', '4/9', 'Equal'], exp: 'Cross multiply: 3×9 = 27 vs 4×7 = 28. Since 28 > 27, 4/9 is larger.' },
    { p: 'Which is larger: 5/8 or 0.6 ?', ans: '5/8', opts: ['5/8', '0.6', 'Equal'], exp: '5/8 = 0.625, which is greater than 0.6.' },
    { p: 'Which is larger: 15² or 220 ?', ans: '15²', opts: ['15²', '220', 'Equal'], exp: '15² = 225, which is greater than 220.' },
    { p: 'Which is larger: √170 or 13 ?', ans: '√170', opts: ['√170', '13', 'Equal'], exp: '13² = 169. Since 170 > 169, √170 > 13.' }
  ];
  const comp = pickRandom(comparisons);
  return {
    id: Math.random().toString(36).substring(2, 9),
    prompt: comp.p,
    promptSubtitle: 'Comparison',
    answer: comp.ans,
    options: comp.opts,
    operation: 'misc',
    explanation: comp.exp,
  };
}

// ---------------------------------------------------------------------------
// 6. EXAM PREPARATION MODE (ESAT & TMUA Numerical Fluency) - 100% PROCEDURAL
// ---------------------------------------------------------------------------

export function generateExamQuestion(): Question {
  const category = pickRandom(['powers', 'percent', 'ratios', 'decimals', 'algebra', 'scientific']);

  if (category === 'powers') {
    // Perfect powers: a^(m/n)
    const basePairs = [
      { base: 8, root: 3, rootVal: 2, powers: [2, 4, 5] },
      { base: 27, root: 3, rootVal: 3, powers: [2, 4] },
      { base: 16, root: 4, rootVal: 2, powers: [3, 5] },
      { base: 32, root: 5, rootVal: 2, powers: [2, 3, 4] },
      { base: 64, root: 3, rootVal: 4, powers: [2] },
      { base: 81, root: 4, rootVal: 3, powers: [3] },
      { base: 25, root: 2, rootVal: 5, powers: [3] },
      { base: 4, root: 2, rootVal: 2, powers: [3, 5] },
    ];
    const item = pickRandom(basePairs);
    const p = pickRandom(item.powers);
    const ans = Math.pow(item.rootVal, p);

    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `${item.base}^(${p}/${item.root})`,
      promptSubtitle: 'ESAT / TMUA Fluency: Fractional Powers',
      answer: ans,
      operation: 'misc',
      explanation: `Find the ${item.root}-th root of ${item.base} = ${item.rootVal}, then raise to power ${p}: (${item.rootVal})^${p} = ${ans}.`,
    };
  }

  if (category === 'percent') {
    // Mental percentages: e.g. 15%, 35%, 45%, 75%
    const pct = pickRandom([15, 25, 35, 45, 65, 75]);
    const base = pickRandom([40, 80, 120, 160, 200, 240, 300, 320, 400]);
    const ans = (pct * base) / 100;

    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `${pct}% of ${base}`,
      promptSubtitle: 'ESAT / TMUA Fluency: Mental Percentages',
      answer: ans,
      operation: 'misc',
      explanation: `Split mentally: 10% of ${base} = ${base / 10}. Then compute ${pct}% = ${ans}.`,
    };
  }

  if (category === 'ratios') {
    // Divide Total in ratio a:b
    const r1 = getRandomInt(1, 5);
    const r2 = getRandomInt(2, 7);
    const unit = getRandomInt(8, 25);
    const total = (r1 + r2) * unit;
    const isLarger = Math.random() > 0.5;
    const ans = isLarger ? Math.max(r1, r2) * unit : Math.min(r1, r2) * unit;

    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `Divide ${total} in ratio ${r1}:${r2}. Find ${isLarger ? 'larger' : 'smaller'} share.`,
      promptSubtitle: 'ESAT / TMUA Fluency: Ratio Division',
      answer: ans,
      operation: 'misc',
      explanation: `Total parts = ${r1 + r2}. 1 part = ${total} ÷ ${r1 + r2} = ${unit}. ${isLarger ? 'Larger' : 'Smaller'} share = ${ans}.`,
    };
  }

  if (category === 'scientific') {
    // Scientific notation orders of magnitude
    const a = getRandomInt(2, 6);
    const b = getRandomInt(2, 6);
    const p1 = getRandomInt(3, 7);
    const p2 = getRandomInt(2, 4);
    const ans = a * b;

    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `(${a} × 10^${p1}) × (${b} × 10^${p2}) = ? × 10^${p1 + p2}`,
      promptSubtitle: 'ESAT / TMUA Fluency: Scientific Powers',
      answer: ans,
      operation: 'misc',
      explanation: `${a} × ${b} = ${ans}. Exponents add: 10^(${p1} + ${p2}) = 10^${p1 + p2}.`,
    };
  }

  if (category === 'decimals') {
    // Fast mental decimals
    const pairs = [
      { p: '0.04 × 0.25', ans: '0.01', exp: '0.25 = 1/4. A quarter of 0.04 is 0.01.' },
      { p: '1.44 ÷ 0.12', ans: 12, exp: 'Multiply numerator and denominator by 100: 144 ÷ 12 = 12.' },
      { p: '0.8 × 0.05', ans: '0.04', exp: '8 × 5 = 40. Shift decimal 3 places: 0.04.' },
      { p: '0.72 ÷ 0.08', ans: 9, exp: '72 ÷ 8 = 9.' },
      { p: '0.06 × 0.5', ans: '0.03', exp: 'Half of 0.06 is 0.03.' },
      { p: '2.5 × 16', ans: 40, exp: '2.5 × 16 = 5 × 8 = 40.' },
    ];
    const item = pickRandom(pairs);
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: item.p,
      promptSubtitle: 'ESAT / TMUA Fluency: Decimals',
      answer: item.ans,
      operation: 'misc',
      explanation: item.exp,
    };
  }

  // Quick quadratic roots mental factoring
  const r1 = getRandomInt(1, 7);
  const r2 = getRandomInt(r1 + 1, 9);
  const sum = r1 + r2;
  const prod = r1 * r2;
  const pickSmaller = Math.random() > 0.5;

  return {
    id: Math.random().toString(36).substring(2, 9),
    prompt: `${pickSmaller ? 'Smaller' : 'Larger'} root of: x² - ${sum}x + ${prod} = 0`,
    promptSubtitle: 'ESAT / TMUA Fluency: Mental Quadratics',
    answer: pickSmaller ? r1 : r2,
    operation: 'misc',
    explanation: `Factors to (x - ${r1})(x - ${r2}) = 0. The roots are ${r1} and ${r2}.`,
  };
}

// ---------------------------------------------------------------------------
// 7. MENTAL CALCULUS (Differentiation & Integration - Goldilocks Zone)
// ---------------------------------------------------------------------------

export type CalculusType = 'diff' | 'int' | 'mixed';

export function generateCalculusQuestion(mode: CalculusType = 'mixed'): Question {
  const chosen = mode === 'mixed' ? (Math.random() > 0.5 ? 'diff' : 'int') : mode;

  if (chosen === 'diff') {
    const diffRule = pickRandom(['poly_eval', 'cubic_eval', 'chain_eval', 'trig_eval', 'exp_eval', 'coeff']);

    if (diffRule === 'poly_eval') {
      // f(x) = ax^2 + bx at x = c
      const a = getRandomInt(2, 5);
      const b = getRandomInt(-7, 7);
      const c = getRandomInt(1, 4);
      const ans = 2 * a * c + b;
      const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;

      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `d/dx (${a}x² ${bSign}x) at x = ${c}`,
        promptSubtitle: 'Mental Differentiation: Power Rule',
        answer: ans,
        operation: 'misc',
        explanation: `f'(x) = ${2 * a}x ${bSign}. At x = ${c}: ${2 * a}(${c}) ${bSign} = ${ans}.`,
      };
    }

    if (diffRule === 'cubic_eval') {
      // f(x) = ax^3 - bx at x = 1 or 2
      const a = getRandomInt(1, 3);
      const b = getRandomInt(1, 8);
      const c = getRandomInt(1, 2);
      const ans = 3 * a * (c * c) - b;

      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `d/dx (${a}x³ - ${b}x) at x = ${c}`,
        promptSubtitle: 'Mental Differentiation: Cubic',
        answer: ans,
        operation: 'misc',
        explanation: `f'(x) = ${3 * a}x² - ${b}. At x = ${c}: ${3 * a}(${c * c}) - ${b} = ${ans}.`,
      };
    }

    if (diffRule === 'chain_eval') {
      // f(x) = (ax + b)^2 at x = c
      const a = getRandomInt(2, 3);
      const b = getRandomInt(1, 4);
      const c = getRandomInt(1, 2);
      const inner = a * c + b;
      const ans = 2 * a * inner;

      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `d/dx [(${a}x + ${b})²] at x = ${c}`,
        promptSubtitle: 'Mental Differentiation: Chain Rule',
        answer: ans,
        operation: 'misc',
        explanation: `Chain rule: 2(${a}x + ${b}) × ${a} = ${2 * a}(${a}x + ${b}). At x = ${c}: ${2 * a}(${inner}) = ${ans}.`,
      };
    }

    if (diffRule === 'exp_eval') {
      // d/dx (e^(kx)) at x = 0 is k, or 3e^(2x) at x = 0 is 6
      const a = getRandomInt(2, 5);
      const k = getRandomInt(2, 6);
      const ans = a * k;

      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `d/dx (${a}e^(${k}x)) at x = 0`,
        promptSubtitle: 'Mental Differentiation: Exponential',
        answer: ans,
        operation: 'misc',
        explanation: `Derivative is ${a} × ${k}e^(${k}x) = ${ans}e^(${k}x). At x = 0, e^0 = 1, so the answer is ${ans}.`,
      };
    }

    if (diffRule === 'trig_eval') {
      const trigList = [
        { p: 'd/dx (4 sin x) at x = 0', ans: 4, exp: 'Derivative is 4 cos(x). At x = 0, cos(0) = 1, so 4.' },
        { p: 'd/dx (5 cos x) at x = π/2', ans: -5, exp: 'Derivative is -5 sin(x). At x = π/2, sin(π/2) = 1, so -5.' },
        { p: 'd/dx (sin 3x) at x = 0', ans: 3, exp: 'Chain rule gives 3 cos(3x). At x = 0, 3(1) = 3.' },
        { p: 'd/dx (6 sin x) at x = π', ans: -6, exp: 'Derivative is 6 cos(x). At x = π, cos(π) = -1, so -6.' },
      ];
      const t = pickRandom(trigList);
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: t.p,
        promptSubtitle: 'Mental Differentiation: Trig',
        answer: t.ans,
        operation: 'misc',
        explanation: t.exp,
      };
    }

    // Coeff question
    const a = getRandomInt(2, 5);
    const b = getRandomInt(2, 6);
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `Coeff of x in d/dx (${a}x³ + ${b}x² - 4x)`,
      promptSubtitle: 'Mental Differentiation: Coefficients',
      answer: 2 * b,
      operation: 'misc',
      explanation: `d/dx gives ${3 * a}x² + ${2 * b}x - 4. The coefficient of x is ${2 * b}.`,
    };
  }

  // INTEGRATION (Mental Definite Integrals in the Goldilocks zone!)
  const intRule = pickRandom(['linear_int', 'quadratic_int', 'poly_0_1', 'power_4', 'trig_int', 'recip_sqrt']);

  if (intRule === 'linear_int') {
    // ∫_0^b 2k x dx = k b^2
    const k = getRandomInt(1, 4);
    const b = getRandomInt(2, 5);
    const coeff = 2 * k;
    const ans = k * (b * b);

    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `∫ [0 to ${b}] ${coeff}x dx`,
      promptSubtitle: 'Mental Integration: Power Rule',
      answer: ans,
      operation: 'misc',
      explanation: `Antiderivative is ${k}x². Evaluated from 0 to ${b}: ${k}(${b}²) = ${k}(${b * b}) = ${ans}.`,
    };
  }

  if (intRule === 'quadratic_int') {
    // ∫_0^b 3k x^2 dx = k b^3
    const k = getRandomInt(1, 3);
    const b = getRandomInt(2, 3);
    const coeff = 3 * k;
    const ans = k * (b * b * b);

    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `∫ [0 to ${b}] ${coeff}x² dx`,
      promptSubtitle: 'Mental Integration: Definite Integral',
      answer: ans,
      operation: 'misc',
      explanation: `Antiderivative is ${k}x³. Evaluated from 0 to ${b}: ${k}(${b}³) = ${k}(${b * b * b}) = ${ans}.`,
    };
  }

  if (intRule === 'poly_0_1') {
    // ∫_0^1 (4ax^3 + 3bx^2 + c) dx = a + b + c
    const a = getRandomInt(1, 5);
    const b = getRandomInt(1, 5);
    const c = getRandomInt(1, 5);
    const ans = a + b + c;

    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `∫ [0 to 1] (${4 * a}x³ + ${3 * b}x² + ${c}) dx`,
      promptSubtitle: 'Mental Integration: [0 to 1] Shortcut',
      answer: ans,
      operation: 'misc',
      explanation: `Antiderivative is ${a}x⁴ + ${b}x³ + ${c}x. Evaluated at 1: ${a} + ${b} + ${c} = ${ans}.`,
    };
  }

  if (intRule === 'power_4') {
    // ∫_0^2 4x^3 dx = 16 or ∫_0^2 2x dx = 4
    const ans = 16;
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `∫ [0 to 2] 4x³ dx`,
      promptSubtitle: 'Mental Integration: Power Rule',
      answer: ans,
      operation: 'misc',
      explanation: `Antiderivative is x⁴. Evaluated from 0 to 2: 2⁴ - 0 = 16.`,
    };
  }

  if (intRule === 'recip_sqrt') {
    // ∫_1^4 (k / √x) dx = [2k √x]_1^4 = 2k(2 - 1) = 2k
    const k = getRandomInt(1, 6);
    const ans = 2 * k;

    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `∫ [1 to 4] (${k} / √x) dx`,
      promptSubtitle: 'Mental Integration: Fractional Powers',
      answer: ans,
      operation: 'misc',
      explanation: `Antiderivative is 2(${k})√x = ${2 * k}√x. Evaluated: ${2 * k}(√4 - √1) = ${2 * k}(2 - 1) = ${ans}.`,
    };
  }

  // Trig definite integrals
  const trigDefList = [
    { p: '∫ [0 to π] sin(x) dx', ans: 2, exp: '[-cos x] from 0 to π = -(-1) - (-1) = 1 + 1 = 2.' },
    { p: '∫ [0 to π/2] cos(x) dx', ans: 1, exp: '[sin x] from 0 to π/2 = 1 - 0 = 1.' },
    { p: '∫ [0 to π] 3 sin(x) dx', ans: 6, exp: '3 × [ -cos x ] from 0 to π = 3 × 2 = 6.' },
  ];
  const td = pickRandom(trigDefList);
  return {
    id: Math.random().toString(36).substring(2, 9),
    prompt: td.p,
    promptSubtitle: 'Mental Integration: Trig',
    answer: td.ans,
    operation: 'misc',
    explanation: td.exp,
  };
}

// ---------------------------------------------------------------------------
// 8. MENTAL ALGEBRA & EQUATIONS (100% Procedural)
// ---------------------------------------------------------------------------

export type AlgebraType = 'linear' | 'quadratic' | 'powers' | 'mixed';

export function generateAlgebraQuestion(mode: AlgebraType = 'mixed'): Question {
  const chosen = mode === 'mixed' ? pickRandom(['linear', 'quadratic', 'powers']) : mode;

  if (chosen === 'linear') {
    // ax + b = c  => guaranteed integer x
    const x = getRandomInt(-9, 12);
    const a = getRandomInt(2, 6);
    const b = getRandomInt(-15, 25);
    const c = a * x + b;
    const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;

    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `Solve for x: ${a}x ${bSign} = ${c}`,
      promptSubtitle: 'Mental Algebra: Linear Speed',
      answer: x,
      operation: 'misc',
      explanation: `${a}x = ${c} - (${b}) = ${c - b}. Then x = ${c - b} ÷ ${a} = ${x}.`,
    };
  }

  if (chosen === 'quadratic') {
    // x^2 - (r1 + r2)x + r1*r2 = 0
    const r1 = getRandomInt(-6, 6);
    let r2 = getRandomInt(-6, 6);
    if (r1 === r2) r2 = r1 + 3;
    const sum = r1 + r2;
    const prod = r1 * r2;

    const bSign = sum >= 0 ? `- ${sum}` : `+ ${Math.abs(sum)}`;
    const cSign = prod >= 0 ? `+ ${prod}` : `- ${Math.abs(prod)}`;
    const pickSmaller = Math.random() > 0.5;
    const targetRoot = pickSmaller ? Math.min(r1, r2) : Math.max(r1, r2);

    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `${pickSmaller ? 'Smaller' : 'Larger'} root of: x² ${bSign}x ${cSign} = 0`,
      promptSubtitle: 'Mental Algebra: Quadratics',
      answer: targetRoot,
      operation: 'misc',
      explanation: `Factors to (x - ${r1})(x - ${r2}) = 0. The roots are ${Math.min(r1, r2)} and ${Math.max(r1, r2)}.`,
    };
  }

  // Powers & Exponents
  const base = pickRandom([2, 3, 5]);
  if (base === 2) {
    const exp = getRandomInt(3, 7);
    const val = Math.pow(2, exp);
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `If 2^x = ${val}, what is x?`,
      promptSubtitle: 'Mental Algebra: Exponents',
      answer: exp,
      operation: 'misc',
      explanation: `Powers of 2: 2^${exp} = ${val}. Thus x = ${exp}.`,
    };
  }

  const a = getRandomInt(2, 4);
  const b = getRandomInt(2, 5);
  return {
    id: Math.random().toString(36).substring(2, 9),
    prompt: `If 2^${a} × 2^${b} = 2^x, what is x?`,
    promptSubtitle: 'Mental Algebra: Exponent Rules',
    answer: a + b,
    operation: 'misc',
    explanation: `When multiplying identical bases, add exponents: ${a} + ${b} = ${a + b}.`,
  };
}

// ---------------------------------------------------------------------------
// 7. DAILY CHALLENGE GENERATOR (Seeded by Date)
// ---------------------------------------------------------------------------

export function generateDailyChallengeQuestions(dateStr: string): Question[] {
  const rng = createSeededRandom(dateStr);
  const questions: Question[] = [];

  // 10 curated questions spanning Arithmetic, Multiplication, Fractions, and Number Sense
  // 1-3: Classic Speed
  for (let i = 0; i < 3; i++) {
    const a = getRandomInt(15, 60, rng);
    const b = getRandomInt(12, 50, rng);
    questions.push({
      id: `daily_${dateStr}_${i}`,
      prompt: `${a} + ${b}`,
      answer: a + b,
      operation: '+',
      promptSubtitle: `Daily Challenge Q${i + 1}/10`,
    });
  }

  // 4-6: Times Tables & Division
  for (let i = 3; i < 6; i++) {
    const a = getRandomInt(6, 12, rng);
    const b = getRandomInt(7, 14, rng);
    questions.push({
      id: `daily_${dateStr}_${i}`,
      prompt: `${a} × ${b}`,
      answer: a * b,
      operation: '×',
      promptSubtitle: `Daily Challenge Q${i + 1}/10`,
    });
  }

  // 7-8: Mental Powers / Squares
  const sq = getRandomInt(12, 19, rng);
  questions.push({
    id: `daily_${dateStr}_6`,
    prompt: `${sq}²`,
    answer: sq * sq,
    operation: 'misc',
    promptSubtitle: `Daily Challenge Q7/10: Squares`,
  });

  const cb = getRandomInt(3, 6, rng);
  questions.push({
    id: `daily_${dateStr}_7`,
    prompt: `${cb}³`,
    answer: cb * cb * cb,
    operation: 'misc',
    promptSubtitle: `Daily Challenge Q8/10: Cubes`,
  });

  // 9: Fractions
  const fPairs = [
    { p: '1/3 + 1/6', a: '1/2' },
    { p: '3/4 - 1/2', a: '1/4' },
    { p: '2/5 × 5/8', a: '1/4' },
    { p: '0.75 as fraction', a: '3/4' },
  ];
  const fp = pickRandom(fPairs, rng);
  questions.push({
    id: `daily_${dateStr}_8`,
    prompt: fp.p,
    answer: fp.a,
    operation: 'misc',
    promptSubtitle: `Daily Challenge Q9/10: Fractions`,
  });

  // 10: Boss Question
  const n1 = getRandomInt(14, 25, rng);
  const n2 = getRandomInt(12, 20, rng);
  questions.push({
    id: `daily_${dateStr}_9`,
    prompt: `(${n1} × ${n2}) - 50`,
    answer: (n1 * n2) - 50,
    operation: 'misc',
    promptSubtitle: `Daily Challenge Q10/10: Grand Finale`,
  });

  return questions;
}

// ---------------------------------------------------------------------------
// 8. TARGET 100 PUZZLE GENERATOR
// ---------------------------------------------------------------------------

export interface TargetPuzzle {
  id: string;
  numbers: number[];
  target: number;
}

export function generateTarget100Puzzle(): TargetPuzzle {
  const puzzles: TargetPuzzle[] = [
    { id: 't1', numbers: [25, 50, 4, 3, 2, 7], target: 100 },
    { id: 't2', numbers: [75, 25, 6, 4, 2, 1], target: 100 },
    { id: 't3', numbers: [10, 20, 30, 4, 5, 2], target: 100 },
    { id: 't4', numbers: [50, 10, 8, 5, 3, 2], target: 100 },
    { id: 't5', numbers: [25, 7, 5, 3, 2, 1], target: 100 },
    { id: 't6', numbers: [12, 8, 7, 5, 4, 2], target: 100 },
    { id: 't7', numbers: [15, 20, 25, 6, 4, 2], target: 100 },
  ];
  return pickRandom(puzzles);
}
