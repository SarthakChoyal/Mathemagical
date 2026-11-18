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
    // Dynamically generate two fractions with small denominators (2 to 8)
    const d1 = pickRandom([2, 3, 4, 5, 6]);
    let d2 = pickRandom([2, 3, 4, 5, 6, 8]);
    while (d2 === d1) {
      d2 = pickRandom([2, 3, 4, 5, 6, 8]);
    }
    const n1 = getRandomInt(1, d1 - 1);
    const n2 = getRandomInt(1, d2 - 1);
    
    // Compute n1/d1 + n2/d2
    const num = n1 * d2 + n2 * d1;
    const den = d1 * d2;
    const g = gcd(num, den);
    const simpNum = num / g;
    const simpDen = den / g;
    const ans = simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`;

    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `${n1}/${d1} + ${n2}/${d2}`,
      promptSubtitle: 'Enter simplified fraction',
      answer: ans,
      operation: '+',
      explanation: `Common denominator is ${den / gcd(d1, d2)}. Evaluates to ${ans}.`,
    };
  }

  if (type === 'multiply') {
    // Dynamically generate: n1/d1 * n2/d2
    const d1 = pickRandom([2, 3, 4, 5, 7]);
    const d2 = pickRandom([2, 3, 4, 5, 8]);
    const n1 = getRandomInt(1, d1 - 1);
    const n2 = getRandomInt(1, d2 - 1);

    const num = n1 * n2;
    const den = d1 * d2;
    const g = gcd(num, den);
    const simpNum = num / g;
    const simpDen = den / g;
    const ans = simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`;

    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `${n1}/${d1} × ${n2}/${d2}`,
      promptSubtitle: 'Enter simplified fraction',
      answer: ans,
      operation: '×',
      explanation: `(${n1}×${n2}) / (${d1}×${d2}) = ${num}/${den} = ${ans}.`,
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

  // Which is larger? (Procedurally randomized comparison)
  const compType = pickRandom(['fractions', 'squares', 'roots']);
  if (compType === 'fractions') {
    const d1 = getRandomInt(3, 9);
    let d2 = getRandomInt(3, 9);
    while (d2 === d1) d2 = getRandomInt(3, 9);
    const n1 = getRandomInt(1, d1 - 1);
    const n2 = getRandomInt(1, d2 - 1);
    const val1 = n1 * d2;
    const val2 = n2 * d1;
    const ans = val1 > val2 ? `${n1}/${d1}` : val1 < val2 ? `${n2}/${d2}` : 'Equal';
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `Which is larger: ${n1}/${d1} or ${n2}/${d2} ?`,
      promptSubtitle: 'Comparison',
      answer: ans,
      options: [`${n1}/${d1}`, `${n2}/${d2}`, 'Equal'],
      operation: 'misc',
      explanation: `Cross multiply: ${n1}×${d2} = ${val1} vs ${n2}×${d1} = ${val2}. Larger is ${ans}.`,
    };
  }

  if (compType === 'squares') {
    const base = getRandomInt(11, 25);
    const sq = base * base;
    const offset = pickRandom([-7, -5, 3, 5, 8]);
    const target = sq + offset;
    const ans = sq > target ? `${base}²` : `${target}`;
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `Which is larger: ${base}² or ${target} ?`,
      promptSubtitle: 'Comparison',
      answer: ans,
      options: [`${base}²`, `${target}`, 'Equal'],
      operation: 'misc',
      explanation: `${base}² = ${sq}. Compared to ${target}, ${ans} is larger.`,
    };
  }

  // Roots comparison
  const base = getRandomInt(11, 20);
  const sq = base * base;
  const offset = pickRandom([-5, -3, 3, 6]);
  const rootTarget = sq + offset;
  const ans = rootTarget > sq ? `√${rootTarget}` : `${base}`;
  return {
    id: Math.random().toString(36).substring(2, 9),
    prompt: `Which is larger: √${rootTarget} or ${base} ?`,
    promptSubtitle: 'Comparison',
    answer: ans,
    options: [`√${rootTarget}`, `${base}`, 'Equal'],
    operation: 'misc',
    explanation: `${base}² = ${sq}. Since ${rootTarget} ${rootTarget > sq ? '>' : '<'} ${sq}, ${ans} is larger.`,
  };
}

// ---------------------------------------------------------------------------
// 6. EXAM PREPARATION MODE (Full ESAT M1/M2 & TMUA Mental Fluency) - 100% PROCEDURAL
// ---------------------------------------------------------------------------

export type ExamTopic = 'all' | 'number' | 'algebra' | 'trigcalc' | 'geomprob';

function makeExamQuestion(
  prompt: string,
  promptSubtitle: string,
  answer: string | number,
  explanation: string,
  options?: (string | number)[]
): Question {
  return {
    id: Math.random().toString(36).substring(2, 9),
    prompt,
    promptSubtitle,
    answer,
    explanation,
    options,
    operation: 'misc',
  };
}

function simplifyFrac(num: number, den: number): { n: number; d: number; text: string } {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = gcd(Math.abs(num), Math.abs(den));
  const n = num / g;
  const d = den / g;
  return { n, d, text: d === 1 ? `${n}` : `${n}/${d}` };
}

function fmtSignedTerm(coeff: number, variable: string, isFirst = false): string {
  if (coeff === 0) return '';
  const abs = Math.abs(coeff);
  const mag = variable ? (abs === 1 ? variable : `${abs}${variable}`) : `${abs}`;
  if (isFirst) return coeff < 0 ? `-${mag}` : mag;
  return coeff < 0 ? ` - ${mag}` : ` + ${mag}`;
}

function generateExamNumberQuestion(): Question {
  const category = pickRandom([
    'units_si',
    'hcf_lcm',
    'powers_indices',
    'compare_powers',
    'recurring_dec',
    'decimals_sci',
    'surds',
    'bounds',
    'percent_ratio',
  ]);

  if (category === 'units_si') {
    const sub = pickRandom(['si_prefix', 'area_vol', 'speed']);
    if (sub === 'si_prefix') {
      const prefixes = [
        { name: 'nano', sym: 'n', exp: -9 },
        { name: 'micro', sym: 'μ', exp: -6 },
        { name: 'milli', sym: 'm', exp: -3 },
        { name: 'centi', sym: 'c', exp: -2 },
        { name: 'kilo', sym: 'k', exp: 3 },
        { name: 'mega', sym: 'M', exp: 6 },
        { name: 'giga', sym: 'G', exp: 9 },
      ];
      const p1 = pickRandom(prefixes);
      let p2 = pickRandom(prefixes);
      while (p2.sym === p1.sym) p2 = pickRandom(prefixes);
      const unit = pickRandom(['m', 'W', 'g', 'Hz']);
      const diff = p1.exp - p2.exp;
      return makeExamQuestion(
        `1 ${p1.sym}${unit} = 10^k ${p2.sym}${unit}. Find k.`,
        'ESAT M1.2 • SI Prefix Conversion',
        diff,
        `${p1.name} = 10^(${p1.exp}) and ${p2.name} = 10^(${p2.exp}). Subtract exponents: (${p1.exp}) - (${p2.exp}) = ${diff}.`
      );
    }

    if (sub === 'area_vol') {
      const val = getRandomInt(2, 9);
      const variant = pickRandom(['m2_cm2', 'cm2_mm2', 'm3_L']);
      if (variant === 'm2_cm2') {
        return makeExamQuestion(
          `Convert ${val} m^2 into cm^2.`,
          'ESAT M1.2 • Area Unit Trap',
          val * 10000,
          `1 m = 100 cm, so 1 m^2 = 100^2 = 10,000 cm^2. ${val} × 10,000 = ${val * 10000}.`
        );
      }
      if (variant === 'cm2_mm2') {
        return makeExamQuestion(
          `Convert ${val} cm^2 into mm^2.`,
          'ESAT M1.2 • Area Unit Trap',
          val * 100,
          `1 cm = 10 mm, so 1 cm^2 = 10^2 = 100 mm^2. ${val} × 100 = ${val * 100}.`
        );
      }
      return makeExamQuestion(
        `Convert ${val} m^3 into litres.`,
        'ESAT M1.2 • Volume Conversion',
        val * 1000,
        `1 m^3 = 1,000 litres. ${val} × 1,000 = ${val * 1000}.`
      );
    }

    const k = getRandomInt(1, 6);
    const kmh = 18 * k;
    const ms = 5 * k;
    if (Math.random() > 0.5) {
      return makeExamQuestion(
        `Convert ${kmh} km/h into m/s.`,
        'ESAT M1.2 • Compound Speed Units',
        ms,
        `Multiply by 1000/3600 = 5/18: ${kmh} × (5/18) = ${ms} m/s.`
      );
    }
    return makeExamQuestion(
      `Convert ${ms} m/s into km/h.`,
      'ESAT M1.2 • Compound Speed Units',
      kmh,
      `Multiply by 3.6 (18/5): ${ms} × 3.6 = ${kmh} km/h.`
    );
  }

  if (category === 'hcf_lcm') {
    if (Math.random() > 0.5) {
      const primes = [2, 3, 5, 7];
      const p = pickRandom(primes);
      let q = pickRandom(primes);
      while (q === p) q = pickRandom(primes);
      const a = getRandomInt(1, 4);
      const b = getRandomInt(1, 3);
      const factors = (a + 1) * (b + 1);
      return makeExamQuestion(
        `How many positive factors does ${p}^${a} × ${q}^${b} have?`,
        'ESAT M2.3 • Prime Factorisation',
        factors,
        `Add 1 to each exponent and multiply: (${a} + 1)(${b} + 1) = ${factors}.`
      );
    }

    const g = pickRandom([4, 6, 8, 9, 12, 15]);
    const [u, v] = pickRandom([
      [2, 3],
      [3, 4],
      [2, 5],
      [3, 5],
      [4, 5],
      [3, 7],
    ]);
    const A = g * u;
    const B = g * v;
    const askLcm = Math.random() > 0.5;
    if (askLcm) {
      return makeExamQuestion(
        `Find the LCM of ${A} and ${B}.`,
        'ESAT M2.3 • HCF & LCM',
        g * u * v,
        `Both share factor ${g} (${A} = ${g}×${u}, ${B} = ${g}×${v}). LCM = ${g} × ${u} × ${v} = ${g * u * v}.`
      );
    }
    return makeExamQuestion(
      `Find the HCF of ${A} and ${B}.`,
      'ESAT M2.3 • HCF & LCM',
      g,
      `${A} = ${g}×${u} and ${B} = ${g}×${v}, with ${u} and ${v} coprime. HCF = ${g}.`
    );
  }

  if (category === 'powers_indices') {
    if (Math.random() > 0.45) {
      const basePairs = [
        { base: 8, root: 3, rootVal: 2, powers: [2, 4, 5] },
        { base: 27, root: 3, rootVal: 3, powers: [2, 4] },
        { base: 16, root: 4, rootVal: 2, powers: [3, 5] },
        { base: 32, root: 5, rootVal: 2, powers: [2, 3, 4] },
        { base: 64, root: 3, rootVal: 4, powers: [2, 3] },
        { base: 81, root: 4, rootVal: 3, powers: [2, 3] },
        { base: 25, root: 2, rootVal: 5, powers: [3] },
        { base: 4, root: 2, rootVal: 2, powers: [3, 5] },
      ];
      const item = pickRandom(basePairs);
      const p = pickRandom(item.powers);
      const ans = Math.pow(item.rootVal, p);
      return makeExamQuestion(
        `Evaluate ${item.base}^(${p}/${item.root})`,
        'ESAT / TMUA • Fractional Indices',
        ans,
        `${item.root}-th root of ${item.base} is ${item.rootVal}, then (${item.rootVal})^${p} = ${ans}.`
      );
    }

    // Negative fractional power on a fraction: (a^r / b^r)^(-p/r) = (b/a)^p
    const pairs = [
      { a: 2, b: 3, r: 3, p: 2 },
      { a: 3, b: 2, r: 3, p: 2 },
      { a: 2, b: 5, r: 2, p: 3 },
      { a: 3, b: 4, r: 2, p: 2 },
      { a: 2, b: 3, r: 4, p: 1 },
    ];
    const item = pickRandom(pairs);
    const numIn = Math.pow(item.a, item.r);
    const denIn = Math.pow(item.b, item.r);
    const topOut = Math.pow(item.b, item.p);
    const botOut = Math.pow(item.a, item.p);
    const ans = simplifyFrac(topOut, botOut).text;
    return makeExamQuestion(
      `Evaluate (${numIn}/${denIn})^(-${item.p}/${item.r})`,
      'MM1.1 • Negative Fractional Indices',
      ans,
      `Negative exponent flips the fraction to (${denIn}/${numIn})^(${item.p}/${item.r}) = (${item.b}/${item.a})^${item.p} = ${ans}.`
    );
  }

  if (category === 'compare_powers') {
    const k = pickRandom([6, 8, 10, 12, 15]);
    const pool = [
      { base: 2, exp: 2, val: 4 },
      { base: 2, exp: 3, val: 8 },
      { base: 2, exp: 4, val: 16 },
      { base: 2, exp: 5, val: 32 },
      { base: 3, exp: 2, val: 9 },
      { base: 3, exp: 3, val: 27 },
      { base: 5, exp: 1, val: 5 },
      { base: 5, exp: 2, val: 25 },
      { base: 6, exp: 1, val: 6 },
      { base: 7, exp: 1, val: 7 },
      { base: 10, exp: 1, val: 10 },
    ];
    const chosen: typeof pool = [];
    while (chosen.length < 3) {
      const candidate = pickRandom(pool);
      if (
        !chosen.some((c) => c.base === candidate.base || c.val === candidate.val)
      ) {
        chosen.push(candidate);
      }
    }
    const findLargest = Math.random() > 0.35;
    const winner = chosen.reduce((best, cur) =>
      findLargest ? (cur.val > best.val ? cur : best) : cur.val < best.val ? cur : best
    );
    const labels = chosen.map((c) => `${c.base}^(${c.exp * k})`);
    const winnerLabel = `${winner.base}^(${winner.exp * k})`;
    const breakdown = chosen
      .map((c) => `(${c.base}^${c.exp})^${k} = ${c.val}^${k}`)
      .join(', ');
    return makeExamQuestion(
      `Which is ${findLargest ? 'largest' : 'smallest'}: ${labels[0]}, ${labels[1]}, or ${labels[2]} ?`,
      'TMUA / ESAT • Power Comparison',
      winnerLabel,
      `Compare ${k}-th roots: ${breakdown}. So ${winnerLabel} is ${findLargest ? 'largest' : 'smallest'}.`,
      labels
    );
  }

  if (category === 'recurring_dec') {
    const variant = pickRandom(['single', 'double', 'mixed']);
    if (variant === 'single') {
      const d = getRandomInt(1, 8);
      const frac = simplifyFrac(d, 9);
      return makeExamQuestion(
        `Write 0.[rec:${d}] as a simplified fraction.`,
        'ESAT M2.9 • Recurring Decimals',
        frac.text,
        `Let x = 0.${d}${d}${d}... Then 10x - x = ${d} ⇒ x = ${d}/9 = ${frac.text}.`
      );
    }
    if (variant === 'double') {
      const a = getRandomInt(1, 8);
      let b = getRandomInt(1, 9);
      while (b === a) b = getRandomInt(1, 9);
      const val = a * 10 + b;
      const frac = simplifyFrac(val, 99);
      return makeExamQuestion(
        `Write 0.[rec:${a}${b}] as a simplified fraction.`,
        'ESAT M2.9 • Recurring Decimals',
        frac.text,
        `100x - x = ${val} ⇒ x = ${val}/99 = ${frac.text}.`
      );
    }
    const a = getRandomInt(1, 8);
    let b = getRandomInt(1, 8);
    while (b === a) b = getRandomInt(1, 8);
    const num = 9 * a + b;
    const frac = simplifyFrac(num, 90);
    return makeExamQuestion(
      `Write 0.${a}[rec:${b}] as a simplified fraction.`,
      'ESAT M2.9 • Recurring Decimals',
      frac.text,
      `100x - 10x = ${a}${b} - ${a} = ${num} ⇒ x = ${num}/90 = ${frac.text}.`
    );
  }

  if (category === 'decimals_sci') {
    if (Math.random() > 0.45) {
      // Standard index form multiplication with possible carry normalization
      const a = getRandomInt(2, 9);
      const b = getRandomInt(2, 9);
      const p1 = getRandomInt(-5, 6);
      const p2 = getRandomInt(-4, 6);
      const prod = a * b;
      const carry = prod >= 10 ? 1 : 0;
      const k = p1 + p2 + carry;
      const coeffStr = carry ? `${(prod / 10).toFixed(1)}` : `${prod}`;
      return makeExamQuestion(
        `(${a} × 10^(${p1})) × (${b} × 10^(${p2})) = c × 10^k (1 ≤ c < 10). Find k.`,
        'ESAT M2.8 • Standard Form Exponent',
        k,
        `${a} × ${b} = ${prod} = ${coeffStr} × 10^${carry}. Total exponent: (${p1}) + (${p2}) + ${carry} = ${k}.`
      );
    }

    if (Math.random() > 0.5) {
      // Procedural decimal multiplication
      const a = getRandomInt(2, 9);
      const b = getRandomInt(2, 9);
      const s1 = getRandomInt(1, 2);
      const s2 = getRandomInt(1, 2);
      const factor = Math.pow(10, s1 + s2);
      const aStr = (a / Math.pow(10, s1)).toFixed(s1);
      const bStr = (b / Math.pow(10, s2)).toFixed(s2);
      const exactStr = Number(((a * b) / factor).toFixed(s1 + s2)).toString();
      return makeExamQuestion(
        `${aStr} × ${bStr}`,
        'ESAT M2.2 • Decimal Arithmetic',
        exactStr,
        `${a} × ${b} = ${a * b}. Shift decimal left by ${s1 + s2} places → ${exactStr}.`
      );
    }

    // Procedural decimal division
    const q = getRandomInt(3, 15);
    const d = getRandomInt(2, 9);
    const s1 = pickRandom([1, 2]);
    const s2 = pickRandom([2, 3]);
    const dividend = ((q * d) / Math.pow(10, s1)).toFixed(s1).replace(/\.?0+$/, '');
    const divisor = (d / Math.pow(10, s2)).toFixed(s2);
    const ans = Number((q * Math.pow(10, s2 - s1)).toFixed(2));
    return makeExamQuestion(
      `${dividend} ÷ ${divisor}`,
      'ESAT M2.2 • Decimal Division',
      ans,
      `Multiply top and bottom by 10^${Math.max(s1, s2)} to clear decimals → ${ans}.`
    );
  }

  if (category === 'surds') {
    if (Math.random() > 0.45) {
      // Compare 3 surds/integers by squaring mentally
      const candidates = [
        { label: '2√5', sq: 20 },
        { label: '3√3', sq: 27 },
        { label: '5', sq: 25 },
        { label: '2√7', sq: 28 },
        { label: '3√5', sq: 45 },
        { label: '2√11', sq: 44 },
        { label: '7', sq: 49 },
        { label: '4√3', sq: 48 },
        { label: '5√2', sq: 50 },
        { label: '3√6', sq: 54 },
        { label: '8', sq: 64 },
        { label: '4√5', sq: 80 },
      ];
      const picks: typeof candidates = [];
      while (picks.length < 3) {
        const c = pickRandom(candidates);
        if (!picks.some((p) => p.sq === c.sq)) picks.push(c);
      }
      const askMax = Math.random() > 0.4;
      const win = picks.reduce((best, cur) =>
        askMax ? (cur.sq > best.sq ? cur : best) : cur.sq < best.sq ? cur : best
      );
      const opts = picks.map((p) => p.label);
      const sqList = picks.map((p) => `${p.label}² = ${p.sq}`).join(', ');
      return makeExamQuestion(
        `Which is ${askMax ? 'largest' : 'smallest'}: ${opts[0]}, ${opts[1]}, or ${opts[2]} ?`,
        'ESAT M2.11 • Surd Ordering',
        win.label,
        `Square each value: ${sqList}. So ${win.label} is ${askMax ? 'largest' : 'smallest'}.`,
        opts
      );
    }

    // Rationalising denominator: kd / (a - √b) = p + q√b -> find p + q
    const validPairs = [
      { a: 2, b: 3, d: 1 },
      { a: 2, b: 2, d: 2 },
      { a: 3, b: 5, d: 4 },
      { a: 3, b: 6, d: 3 },
      { a: 3, b: 7, d: 2 },
      { a: 4, b: 10, d: 6 },
      { a: 4, b: 11, d: 5 },
    ];
    const item = pickRandom(validPairs);
    const k = getRandomInt(1, 3);
    const top = k * item.d;
    const plusDenom = Math.random() > 0.5;
    const denom = plusDenom ? `${item.a} + √${item.b}` : `${item.a} - √${item.b}`;
    const form = plusDenom ? `p - q√${item.b}` : `p + q√${item.b}`;
    const ans = k * (item.a + 1);
    return makeExamQuestion(
      `Write ${top} / (${denom}) as ${form}. Find p + q.`,
      'MM1.2 • Rationalising Surds',
      ans,
      `Multiply by conjugate (${item.a} ${plusDenom ? '-' : '+'} √${item.b}): denominator is ${item.a}² - ${item.b} = ${item.d}, cancelling to ${k}(${item.a} ${plusDenom ? '-' : '+'} √${item.b}) ⇒ p = ${k * item.a}, q = ${k}, so p + q = ${ans}.`
    );
  }

  if (category === 'bounds') {
    const mode = pickRandom(['max_diff', 'min_diff', 'nearest10', 'surd_est']);
    if (mode === 'max_diff' || mode === 'min_diff') {
      const a = getRandomInt(5, 12);
      const b = getRandomInt(2, 6);
      if (mode === 'max_diff') {
        return makeExamQuestion(
          `x = ${a} (nearest int), y = ${b} (nearest int). Max possible (x - y)?`,
          'ESAT M2.12 • Error Bounds',
          a + 1 - b,
          `Max(x - y) = Max(x) - Min(y) = ${a + 0.5} - ${b - 0.5} = ${a + 1 - b}.`
        );
      }
      return makeExamQuestion(
        `x = ${a} (nearest int), y = ${b} (nearest int). Min possible (x - y)?`,
        'ESAT M2.12 • Error Bounds',
        a - 1 - b,
        `Min(x - y) = Min(x) - Max(y) = ${a - 0.5} - ${b + 0.5} = ${a - 1 - b}.`
      );
    }

    if (mode === 'nearest10') {
      const a = getRandomInt(3, 9) * 10;
      const b = getRandomInt(1, 4) * 10;
      return makeExamQuestion(
        `x = ${a} (nearest 10), y = ${b} (nearest 10). Max possible (x - y)?`,
        'ESAT M2.12 • Error Bounds',
        a - b + 10,
        `Max(x - y) = ${a + 5} - ${b - 5} = ${a - b + 10}.`
      );
    }

    // Closest integer to √T
    const n = getRandomInt(5, 14);
    let target = n * n;
    while (
      target === n * n ||
      Math.sqrt(target) === Math.floor(Math.sqrt(target)) ||
      Math.abs((Math.sqrt(target) % 1) - 0.5) < 0.12
    ) {
      const offset = getRandomInt(-(n + 2), n + 3);
      target = n * n + offset;
    }
    const ans = Math.round(Math.sqrt(target));
    return makeExamQuestion(
      `Which integer is closest to √${target} ?`,
      'ESAT M2.14 • Surd Approximation',
      ans,
      `${ans}² = ${ans * ans} (whereas ${ans - 1}² = ${(ans - 1) ** 2} and ${ans + 1}² = ${(ans + 1) ** 2}). √${target} ≈ ${Math.sqrt(target).toFixed(2)} → ${ans}.`
    );
  }

  // percent_ratio: Reverse %, direct/inverse power proportion, or ratio split
  const sub = pickRandom(['percent', 'reverse_pct', 'power_prop', 'ratios']);
  if (sub === 'percent') {
    const pct = pickRandom([15, 25, 35, 45, 65, 75]);
    const base = pickRandom([40, 80, 120, 160, 200, 240, 300, 320, 400]);
    const ans = (pct * base) / 100;
    return makeExamQuestion(
      `${pct}% of ${base}`,
      'ESAT M3.8 • Mental Percentages',
      ans,
      `10% of ${base} = ${base / 10}, so ${pct}% = ${ans}.`
    );
  }

  if (sub === 'reverse_pct') {
    const orig = getRandomInt(3, 15) * 20;
    const rate = pickRandom([10, 20, 25, 50]);
    const isInc = Math.random() > 0.5;
    const finalVal = isInc ? (orig * (100 + rate)) / 100 : (orig * (100 - rate)) / 100;
    return makeExamQuestion(
      `After a ${rate}% ${isInc ? 'increase' : 'decrease'}, a value becomes ${finalVal}. Original value?`,
      'ESAT M3.8 • Reverse Percentages',
      orig,
      `${isInc ? 100 + rate : 100 - rate}% corresponds to ${finalVal}. Divide by ${isInc ? (100 + rate) / 100 : (100 - rate) / 100} → ${orig}.`
    );
  }

  if (sub === 'power_prop') {
    const k = pickRandom([2, 3, 4]);
    const variant = pickRandom(['inv_sq', 'dir_sq', 'dir_sqrt']);
    if (variant === 'inv_sq') {
      const frac = simplifyFrac(1, k * k).text;
      return makeExamQuestion(
        `y is inversely proportional to x^2. If x is multiplied by ${k}, by what factor is y multiplied?`,
        'ESAT M3.9 • Inverse Power Proportion',
        frac,
        `y ∝ 1/x^2, so scaling x by ${k} divides y by ${k}² = ${k * k} → factor ${frac}.`
      );
    }
    if (variant === 'dir_sq') {
      return makeExamQuestion(
        `y is directly proportional to x^2. If x is multiplied by ${k}, by what factor is y multiplied?`,
        'ESAT M3.9 • Direct Power Proportion',
        k * k,
        `y ∝ x^2, so scaling x by ${k} multiplies y by ${k}² = ${k * k}.`
      );
    }
    return makeExamQuestion(
      `y is proportional to √x. If x is multiplied by ${k * k}, by what factor is y multiplied?`,
      'ESAT M3.9 • Fractional Power Proportion',
      k,
      `y ∝ √x, so multiplying x by ${k * k} multiplies y by √${k * k} = ${k}.`
    );
  }

  const r1 = getRandomInt(1, 5);
  const r2 = getRandomInt(2, 7);
  const unit = getRandomInt(8, 25);
  const total = (r1 + r2) * unit;
  const isLarger = Math.random() > 0.5;
  const ans = isLarger ? Math.max(r1, r2) * unit : Math.min(r1, r2) * unit;
  return makeExamQuestion(
    `Divide ${total} in ratio ${r1}:${r2}. Find ${isLarger ? 'larger' : 'smaller'} share.`,
    'ESAT M3.4 • Ratio Division',
    ans,
    `Total parts = ${r1 + r2}. 1 part = ${total} ÷ ${r1 + r2} = ${unit}. ${isLarger ? 'Larger' : 'Smaller'} share = ${ans}.`
  );
}

function generateExamAlgebraQuestion(): Question {
  const category = pickRandom([
    'composite',
    'quadratics',
    'remainder_factor',
    'lines_circles',
    'logs_exp',
    'series_binomial',
  ]);

  if (category === 'composite') {
    const mode = pickRandom(['sq', 'mod', 'sqrt']);
    const a = getRandomInt(2, 4);
    const b = getRandomInt(-5, 6);
    const bStr = fmtSignedTerm(b, '');

    if (mode === 'mod') {
      const shift = getRandomInt(4, 9);
      const k = getRandomInt(1, shift - 2);
      const gk = Math.abs(k - shift);
      const ans = a * gk + b;
      return makeExamQuestion(
        `f(x) = ${a}x${bStr}, g(x) = |x - ${shift}|. Find f(g(${k}))`,
        'TMUA / MM1.7 • Modulus Composite',
        ans,
        `g(${k}) = |${k} - ${shift}| = ${gk}. Then f(${gk}) = ${a}(${gk})${bStr} = ${ans}.`
      );
    }

    if (mode === 'sqrt') {
      const sq = pickRandom([2, 3, 4, 5]);
      const shift = getRandomInt(1, 5);
      const k = sq * sq - shift;
      const ans = a * sq + b;
      return makeExamQuestion(
        `f(x) = ${a}x${bStr}, g(x) = √(x + ${shift}). Find f(g(${k}))`,
        'TMUA / MM1.7 • Composite Functions',
        ans,
        `g(${k}) = √(${k} + ${shift}) = ${sq}. Then f(${sq}) = ${a}(${sq})${bStr} = ${ans}.`
      );
    }

    const c = getRandomInt(1, 4);
    const k = getRandomInt(1, 3);
    const gk = k * k + c;
    const ans = a * gk + b;
    return makeExamQuestion(
      `f(x) = ${a}x${bStr}, g(x) = x^2 + ${c}. Find f(g(${k}))`,
      'TMUA / MM8.2 • Composite Functions',
      ans,
      `g(${k}) = ${k}² + ${c} = ${gk}. Then f(${gk}) = ${a}(${gk})${bStr} = ${ans}.`
    );
  }

  if (category === 'quadratics') {
    const mode = pickRandom(['discriminant', 'roots', 'complete_sq', 'dots']);
    if (mode === 'discriminant') {
      const targetRoots = pickRandom([0, 1, 2]);
      let b = getRandomInt(-8, 8);
      let c = 0;
      if (targetRoots === 1) {
        b = pickRandom([-8, -6, -4, -2, 2, 4, 6, 8]);
        c = (b * b) / 4;
      } else if (targetRoots === 0) {
        b = getRandomInt(-6, 6);
        c = Math.floor((b * b) / 4) + getRandomInt(1, 6);
      } else {
        b = getRandomInt(-7, 7);
        c = Math.ceil((b * b) / 4) - getRandomInt(1, 6);
      }
      const disc = b * b - 4 * c;
      const roots = disc > 0 ? 2 : disc === 0 ? 1 : 0;
      return makeExamQuestion(
        `How many real roots: x^2${fmtSignedTerm(b, 'x')}${fmtSignedTerm(c, '')} = 0 ?`,
        'TMUA / MM1.3 • Discriminant Logic',
        roots,
        `Δ = (${b})² - 4(${c}) = ${disc}. Since Δ ${disc > 0 ? '> 0' : disc === 0 ? '= 0' : '< 0'}, there are ${roots} real root(s).`,
        [0, 1, 2]
      );
    }

    if (mode === 'complete_sq') {
      const h = getRandomInt(1, 6) * (Math.random() > 0.5 ? 1 : -1);
      const c = getRandomInt(-5, 25);
      const minVal = c - h * h;
      return makeExamQuestion(
        `Find the minimum value of y = x^2${fmtSignedTerm(-2 * h, 'x')}${fmtSignedTerm(c, '')}.`,
        'MM1.3 • Completing the Square',
        minVal,
        `Complete the square: (x${fmtSignedTerm(-h, '')})²${fmtSignedTerm(minVal, '')}. Minimum value is ${minVal}.`
      );
    }

    if (mode === 'dots') {
      const sumTarget = pickRandom([40, 50, 100, 200]);
      const halfDiff = getRandomInt(2, 12);
      const a = sumTarget / 2 + halfDiff;
      const b = sumTarget / 2 - halfDiff;
      const ans = (a + b) * (a - b);
      return makeExamQuestion(
        `${a}^2 - ${b}^2`,
        'ESAT M4.5 • Difference of Two Squares',
        ans,
        `(${a} + ${b})(${a} - ${b}) = ${a + b} × ${a - b} = ${ans}.`
      );
    }

    const r1 = getRandomInt(-5, 5);
    const r2 = getRandomInt(r1 + 1, 9);
    const pickSmaller = Math.random() > 0.5;
    const sum = r1 + r2;
    const prod = r1 * r2;
    return makeExamQuestion(
      `${pickSmaller ? 'Smaller' : 'Larger'} root of: x^2${fmtSignedTerm(-sum, 'x')}${fmtSignedTerm(prod, '')} = 0`,
      'ESAT / TMUA • Mental Quadratics',
      pickSmaller ? r1 : r2,
      `Factors to (x${fmtSignedTerm(-r1, '')})(x${fmtSignedTerm(-r2, '')}) = 0. Roots are ${r1} and ${r2}.`
    );
  }

  if (category === 'remainder_factor') {
    if (Math.random() > 0.5) {
      const a = pickRandom([1, 2]);
      const b = getRandomInt(-3, 3);
      const c = getRandomInt(-4, 4);
      const d = getRandomInt(-5, 6);
      const r = pickRandom([-2, -1, 1, 2]);
      const rem = a * r * r * r + b * r * r + c * r + d;
      const poly = `${a === 1 ? '' : a}x^3${fmtSignedTerm(b, 'x^2')}${fmtSignedTerm(c, 'x')}${fmtSignedTerm(d, '')}`;
      return makeExamQuestion(
        `Remainder when ${poly} is divided by (x${fmtSignedTerm(-r, '')})?`,
        'MM1.6c • Remainder Theorem',
        rem,
        `Substitute x = ${r}: ${a}(${r})³${fmtSignedTerm(b, `(${r})²`)}${fmtSignedTerm(c, `(${r})`)}${fmtSignedTerm(d, '')} = ${rem}.`
      );
    }

    const a = pickRandom([1, 2]);
    const r = pickRandom([-2, -1, 1, 2, 3]);
    const k = getRandomInt(-6, 6) || 2;
    const d = -(a * r * r * r + k * r);
    const poly = `${a === 1 ? '' : a}x^3 + kx${fmtSignedTerm(d, '')}`;
    return makeExamQuestion(
      `(x${fmtSignedTerm(-r, '')}) is a factor of ${poly}. Find k.`,
      'MM1.6c • Factor Theorem',
      k,
      `Set P(${r}) = 0: ${a}(${r})³ + ${r}k${fmtSignedTerm(d, '')} = 0 ⇒ k = ${k}.`
    );
  }

  if (category === 'lines_circles') {
    if (Math.random() > 0.5) {
      let a = getRandomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
      let b = getRandomInt(2, 6);
      while (gcd(Math.abs(a), b) !== 1) b = getRandomInt(2, 6);
      const c = getRandomInt(1, 12);
      const perp = simplifyFrac(b, a).text;
      const lineStr = `${a === 1 ? '' : a === -1 ? '-' : a}x + ${b}y = ${c}`;
      return makeExamQuestion(
        `Find the gradient of a line perpendicular to ${lineStr}.`,
        'MM3.1 • Perpendicular Lines',
        perp,
        `Line gradient m₁ = ${simplifyFrac(-a, b).text}. Perpendicular gradient m₂ = -1/m₁ = ${perp}.`
      );
    }

    const h = getRandomInt(-4, 4);
    const k = getRandomInt(-4, 4);
    const r = getRandomInt(2, 7);
    const cx = -2 * h;
    const cy = -2 * k;
    const e = h * h + k * k - r * r;
    const eq = `x^2 + y^2${fmtSignedTerm(cx, 'x')}${fmtSignedTerm(cy, 'y')}${fmtSignedTerm(e, '')} = 0`;
    return makeExamQuestion(
      `Find the radius of the circle: ${eq}`,
      'MM3.2 • Circle Equation',
      r,
      `Complete the square: centre (${h}, ${k}), r² = (${h})² + (${k})² - (${e}) = ${r * r} ⇒ r = ${r}.`
    );
  }

  if (category === 'logs_exp') {
    const mode = pickRandom(['log_power', 'log_combine', 'exp_quad']);
    if (mode === 'log_power') {
      const p = pickRandom([2, 3, 5]);
      const m = p === 5 ? pickRandom([1, 2]) : pickRandom([1, 2, 3]);
      let n = pickRandom([-2, -1, 2, 3, 4]);
      while (n === m || Math.pow(p, Math.abs(n)) > 125) {
        n = pickRandom([-1, 2, 3]);
      }
      const base = Math.pow(p, m);
      const argStr = n < 0 ? `1/${Math.pow(p, -n)}` : `${Math.pow(p, n)}`;
      const ans = simplifyFrac(n, m).text;
      return makeExamQuestion(
        `Evaluate log_${base}(${argStr})`,
        'MM5.2 • Logarithms',
        ans,
        `Write both as powers of ${p}: ${base} = ${p}^${m} and ${argStr} = ${p}^(${n}), so the log is ${ans}.`
      );
    }

    if (mode === 'log_combine') {
      const b = pickRandom([2, 3, 5]);
      const k = getRandomInt(1, 3);
      const target = Math.pow(b, k);
      const factor = getRandomInt(2, 5);
      const askMinus = Math.random() > 0.5;
      if (askMinus) {
        const m = target * factor;
        return makeExamQuestion(
          `log_${b}(${m}) - log_${b}(${factor})`,
          'MM5.2 • Laws of Logarithms',
          k,
          `log_${b}(${m} ÷ ${factor}) = log_${b}(${target}) = ${k}.`
        );
      }
      // Factor split b = p*q -> p^k * q^k = b^k
      const primes = [2, 3, 5];
      const p = pickRandom(primes);
      let q = pickRandom(primes);
      while (q === p) q = pickRandom(primes);
      const compBase = p * q;
      const exp = pickRandom([1, 2]);
      const term1 = Math.pow(p, exp);
      const term2 = Math.pow(q, exp);
      return makeExamQuestion(
        `log_${compBase}(${term1}) + log_${compBase}(${term2})`,
        'MM5.2 • Laws of Logarithms',
        exp,
        `Multiply inside log: log_${compBase}(${term1} × ${term2}) = log_${compBase}(${Math.pow(compBase, exp)}) = ${exp}.`
      );
    }

    const base = pickRandom([2, 3]);
    const r1 = pickRandom([0, 1]);
    const r2 = pickRandom([1, 2, 3]);
    const finalR2 = r2 === r1 ? r1 + 1 : base === 3 && r2 === 3 ? 2 : r2;
    const u = Math.pow(base, r1);
    const v = Math.pow(base, finalR2);
    const bSq = base * base;
    return makeExamQuestion(
      `Sum of solutions for x: ${bSq}^x - ${u + v}·${base}^x + ${u * v} = 0`,
      'MM5.3 • Exponential Quadratics',
      r1 + finalR2,
      `Substitute y = ${base}^x: (y - ${u})(y - ${v}) = 0 ⇒ ${base}^x = ${u}, ${v} ⇒ x = ${r1}, ${finalR2}. Sum = ${r1 + finalR2}.`
    );
  }

  // series_binomial
  const mode = pickRandom(['gp_inf', 'ap_sum', 'binomial', 'recurrence']);
  if (mode === 'gp_inf') {
    const k = pickRandom([2, 3, 4, 5]);
    const negR = Math.random() > 0.5;
    const denomFactor = negR ? k + 1 : k - 1;
    const m = getRandomInt(2, 6);
    const a = denomFactor * m;
    const rStr = negR ? `-1/${k}` : `1/${k}`;
    const ans = k * m;
    const t2 = simplifyFrac(negR ? -a : a, k).text;
    const t3 = simplifyFrac(a, k * k).text;
    return makeExamQuestion(
      `Find S_∞ for geometric series: ${a} + (${t2}) + ${t3} + ...`,
      'MM2.3 • Sum to Infinity',
      ans,
      `First term a = ${a}, ratio r = ${rStr}. S_∞ = a / (1 - r) = ${a} / (${denomFactor}/${k}) = ${ans}.`
    );
  }

  if (mode === 'ap_sum') {
    const n = pickRandom([6, 8, 10, 12]);
    const a = getRandomInt(1, 6);
    const d = getRandomInt(2, 5);
    const sum = (n / 2) * (2 * a + (n - 1) * d);
    return makeExamQuestion(
      `Sum of first ${n} terms of arithmetic series: ${a} + ${a + d} + ${a + 2 * d} + ...`,
      'MM2.2 • Arithmetic Series',
      sum,
      `S_${n} = (${n}/2)[2(${a}) + (${n - 1})(${d})] = ${n / 2} × ${2 * a + (n - 1) * d} = ${sum}.`
    );
  }

  if (mode === 'binomial') {
    const n = pickRandom([3, 4, 5]);
    const r = pickRandom([1, 2]);
    const a = pickRandom([1, 2]);
    const b = pickRandom([-3, -2, 2, 3]);
    const nCr = r === 1 ? n : (n * (n - 1)) / 2;
    const coeff = nCr * Math.pow(a, n - r) * Math.pow(b, r);
    const expr = `(${a}${fmtSignedTerm(b, 'x')})^${n}`;
    return makeExamQuestion(
      `Coefficient of x^${r} in ${expr}?`,
      'MM2.4 • Binomial Expansion',
      coeff,
      `C(${n},${r}) × ${a}^${n - r} × (${b})^${r} = ${nCr} × ${Math.pow(a, n - r)} × ${Math.pow(b, r)} = ${coeff}.`
    );
  }

  // Periodic recurrence cycle
  if (Math.random() > 0.5) {
    // x_(n+1) = 1 / (1 - x_n) with period 3 starting from x_1 = 2 -> 2, -1, 1/2
    const cycle = [2, -1, '1/2'];
    const targetN = getRandomInt(50, 2027);
    const idx = (targetN - 1) % 3;
    return makeExamQuestion(
      `Sequence: x_1 = 2 and x_(n+1) = 1 / (1 - x_n). Find x_${targetN}.`,
      'MM2.1 • Periodic Recurrence',
      cycle[idx],
      `Terms cycle every 3: x_1 = 2, x_2 = -1, x_3 = 1/2, x_4 = 2. Since ${targetN} ≡ ${idx + 1} (mod 3), x_${targetN} = ${cycle[idx]}.`
    );
  }

  const c = getRandomInt(5, 14);
  const x1 = getRandomInt(1, 6);
  const x2 = c - x1;
  const targetN = getRandomInt(41, 200);
  const ans = targetN % 2 === 1 ? x1 : x2;
  return makeExamQuestion(
    `Sequence: x_1 = ${x1} and x_(n+1) = ${c} - x_n. Find x_${targetN}.`,
    'MM2.1 • Recurrence Relation',
    ans,
    `Odd terms equal ${x1}, even terms equal ${c} - ${x1} = ${x2}. So x_${targetN} = ${ans}.`
  );
}

function generateExamTrigCalcQuestion(): Question {
  const category = pickRandom([
    'trig_exact',
    'trig_roots',
    'radians_area',
    'calc_simplify',
    'integral_limits',
    'trapezium',
  ]);

  if (category === 'trig_exact') {
    if (Math.random() > 0.5) {
      const templates = [
        { p: 'sin^2(30°) + cos^2(45°)', ans: '3/4', exp: '(1/2)² + (√2/2)² = 1/4 + 1/2 = 3/4.' },
        { p: 'tan^2(60°) + 4·sin(30°)', ans: 5, exp: '(√3)² + 4(1/2) = 3 + 2 = 5.' },
        { p: '4·cos(60°)·sin(π/6)', ans: 1, exp: '4 × (1/2) × (1/2) = 1.' },
        { p: 'tan(π/4) + 2·cos^2(π/6)', ans: '5/2', exp: '1 + 2(√3/2)² = 1 + 3/2 = 5/2.' },
        { p: '3·tan^2(30°) + cos(0°)', ans: 2, exp: '3(1/3) + 1 = 2.' },
        { p: '2·sin^2(π/3) - cos(π/3)', ans: 1, exp: '2(3/4) - 1/2 = 3/2 - 1/2 = 1.' },
      ];
      const scale = pickRandom([1, 2]);
      const base = pickRandom(templates);
      if (scale === 2 && typeof base.ans === 'number') {
        return makeExamQuestion(
          `Evaluate 2 × [${base.p}]`,
          'MM4.3 • Exact Trig Fluency',
          base.ans * 2,
          `Inside = ${base.ans} (${base.exp}). Doubled = ${base.ans * 2}.`
        );
      }
      return makeExamQuestion(
        `Evaluate ${base.p}`,
        'MM4.3 • Exact Trig Fluency',
        base.ans,
        base.exp
      );
    }

    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [8, 15, 17],
    ];
    const [a, b, c] = pickRandom(triples);
    const askTan = Math.random() > 0.5;
    if (askTan) {
      return makeExamQuestion(
        `θ is acute and sin(θ) = ${a}/${c}. Find tan(θ).`,
        'MM4.5 • Trig Identities',
        `${a}/${b}`,
        `By ${a}-${b}-${c} right triangle, cos(θ) = ${b}/${c}, so tan(θ) = sin/cos = ${a}/${b}.`
      );
    }
    return makeExamQuestion(
      `θ is acute and sin(θ) = ${a}/${c}. Find cos(θ).`,
      'MM4.5 • Trig Identities',
      `${b}/${c}`,
      `cos²(θ) = 1 - (${a}/${c})² = ${b * b}/${c * c} ⇒ cos(θ) = ${b}/${c}.`
    );
  }

  if (category === 'trig_roots') {
    const fn = pickRandom(['sin', 'cos'] as const);
    const k = getRandomInt(1, 4);
    const c = pickRandom([-1, -0.5, 0, 0.5, 1]);
    const closed = Math.random() > 0.5;
    const interval = closed ? '0 ≤ x ≤ 2π' : '0 < x < 2π';
    const cStr = c === 0.5 ? '1/2' : c === -0.5 ? '-1/2' : `${c}`;

    let count = 2 * k;
    if (fn === 'sin') {
      if (c === 0) count = closed ? 2 * k + 1 : 2 * k - 1;
      else if (Math.abs(c) === 1) count = k;
      else count = 2 * k;
    } else {
      if (c === 1) count = closed ? k + 1 : k - 1;
      else if (c === -1) count = k;
      else count = 2 * k;
    }

    return makeExamQuestion(
      `How many solutions does ${fn}(${k === 1 ? '' : k}x) = ${cStr} have in ${interval} ?`,
      'MM4.6 • Trig Root Counting',
      count,
      `${fn}(${k === 1 ? '' : k}x) completes ${k} full cycle(s) on [0, 2π]. Checking endpoints carefully gives ${count} solution(s).`
    );
  }

  if (category === 'radians_area') {
    if (Math.random() > 0.5) {
      const angles = [
        { label: 'π/6', num: 1, den: 6 },
        { label: 'π/4', num: 1, den: 4 },
        { label: 'π/3', num: 1, den: 3 },
        { label: 'π/2', num: 1, den: 2 },
        { label: '2π/3', num: 2, den: 3 },
      ];
      const ang = pickRandom(angles);
      const r = pickRandom([4, 6, 8, 12]);
      // Area = 0.5 * r^2 * theta = k * pi
      const k = simplifyFrac(r * r * ang.num, 2 * ang.den).text;
      return makeExamQuestion(
        `Sector has radius ${r} and angle ${ang.label}. Area = kπ. Find k.`,
        'MM4.2 • Radian Sector Area',
        k,
        `Area = (1/2)r²θ = (1/2)(${r}²)(${ang.label}) = ${k}π.`
      );
    }

    const a = getRandomInt(2, 6) * 2;
    const b = getRandomInt(2, 6) * 2;
    const angle = pickRandom([30, 150]);
    const area = (a * b) / 4;
    return makeExamQuestion(
      `Triangle has sides ${a} and ${b} with included angle ${angle}°. Find its area.`,
      'MM4.1 • Triangle Area ½ab sin C',
      area,
      `sin(${angle}°) = 1/2. Area = (1/2)(${a})(${b})(1/2) = ${area}.`
    );
  }

  if (category === 'calc_simplify') {
    const mode = pickRandom(['normal', 'turn', 'simplify_diff']);
    if (mode === 'normal') {
      const a = getRandomInt(1, 3);
      const b = getRandomInt(-3, 3);
      const x0 = pickRandom([1, 2]);
      const grad = 2 * a * x0 + b;
      if (grad !== 0) {
        const normalGrad = simplifyFrac(-1, grad).text;
        return makeExamQuestion(
          `Gradient of the NORMAL to y = ${a === 1 ? '' : a}x^2${fmtSignedTerm(b, 'x')} at x = ${x0}?`,
          'MM6.3 • Tangents & Normals',
          normalGrad,
          `dy/dx = ${2 * a}x${fmtSignedTerm(b, '')}. At x = ${x0}, tangent gradient = ${grad}, so normal gradient = ${normalGrad}.`
        );
      }
    }

    if (mode === 'turn') {
      const k = getRandomInt(1, 5);
      const c = getRandomInt(-6, 9);
      return makeExamQuestion(
        `Find the positive x-coordinate of the turning point of y = x^3 - ${3 * k}x^2${fmtSignedTerm(c, '')}.`,
        'MM6.3 • Stationary Points',
        2 * k,
        `dy/dx = 3x² - ${6 * k}x = 3x(x - ${2 * k}) = 0 ⇒ x = ${2 * k} (for x > 0).`
      );
    }

    // Differentiate (ax + b)^2 / x^(1/2) at x = 1
    // (a^2 x^(3/2) + 2ab x^(1/2) + b^2 x^(-1/2)) -> derivative at 1 is (3/2)a^2 + ab - (1/2)b^2
    const a = pickRandom([2, 4]);
    const b = pickRandom([-2, 2, 4]);
    const ans = 1.5 * a * a + a * b - 0.5 * b * b;
    return makeExamQuestion(
      `Differentiate (${a}x${fmtSignedTerm(b, '')})^2 / x^(1/2) and evaluate at x = 1.`,
      'MM6.2 • Simplify Before Differentiating',
      ans,
      `Expand to ${a * a}x^(3/2)${fmtSignedTerm(2 * a * b, 'x^(1/2)')} + ${b * b}x^(-1/2), differentiate power-by-power, then set x = 1 → ${ans}.`
    );
  }

  if (category === 'integral_limits') {
    const mode = pickRandom(['split', 'geom_area', 'ftc']);
    if (mode === 'split') {
      const a = getRandomInt(1, 3);
      const b = a + getRandomInt(2, 4);
      const c = b + getRandomInt(2, 4);
      const iAB = getRandomInt(3, 12);
      const iBC = getRandomInt(2, 9);
      const iAC = iAB + iBC;
      if (Math.random() > 0.5) {
        const m = pickRandom([2, 3]);
        const d = pickRandom([1, 2]);
        const ans = m * iAB + d * (b - a);
        return makeExamQuestion(
          `If ∫ [${a} to ${b}] f(x)dx = ${iAB}, find ∫ [${a} to ${b}] (${m}f(x) + ${d})dx.`,
          'MM7.4 • Combining Integrals',
          ans,
          `${m}(${iAB}) + ${d}(${b} - ${a}) = ${m * iAB} + ${d * (b - a)} = ${ans}.`
        );
      }
      return makeExamQuestion(
        `∫ [${a} to ${c}] f(x)dx = ${iAC} and ∫ [${b} to ${c}] f(x)dx = ${iBC}. Find ∫ [${b} to ${a}] f(x)dx.`,
        'MM7.4 • Integral Limit Traps',
        -iAB,
        `∫ [${a} to ${b}] = ${iAC} - ${iBC} = ${iAB}. Reversing limits negates the sign → -${iAB}.`
      );
    }

    if (mode === 'geom_area') {
      const a = getRandomInt(1, 4);
      const b = getRandomInt(2, 5);
      const m = pickRandom([2, 4]);
      const area = (m * (a * a + b * b)) / 2;
      return makeExamQuestion(
        `Total geometric area between y = ${m}x and the x-axis from x = -${a} to x = ${b}?`,
        'MM7.1 • Integral vs Area Trap',
        area,
        `Sum absolute triangle areas above and below axis: (1/2)(${a})(${m * a}) + (1/2)(${b})(${m * b}) = ${(m * a * a) / 2} + ${(m * b * b) / 2} = ${area}.`
      );
    }

    const a = pickRandom([1, 2]);
    const b = getRandomInt(-3, 5);
    const c = getRandomInt(-4, 6);
    const x0 = getRandomInt(2, 4);
    const ans = a * x0 * x0 + b * x0 + c;
    return makeExamQuestion(
      `F(x) = ∫ [1 to x] (${a === 1 ? '' : a}t^2${fmtSignedTerm(b, 't')}${fmtSignedTerm(c, '')})dt. Find F'(${x0}).`,
      'MM7.3 • Fundamental Theorem',
      ans,
      `By FTC, F'(x) is the integrand at t = x: ${a}(${x0})²${fmtSignedTerm(b, `(${x0})`)}${fmtSignedTerm(c, '')} = ${ans}.`
    );
  }

  // trapezium
  if (Math.random() > 0.45) {
    const curves = [
      { name: 'y = x^2 (x > 0)', ans: 'Overestimate', exp: 'y = x^2 is convex (concave up, f\'\' > 0), so chords lie above the curve.' },
      { name: 'y = e^x', ans: 'Overestimate', exp: 'y = e^x is convex (f\'\' > 0), so trapezium chords overestimate the area.' },
      { name: 'y = 1/x (x > 0)', ans: 'Overestimate', exp: 'For x > 0, y\'\' = 2/x^3 > 0 (convex), giving an overestimate.' },
      { name: 'y = √x (x > 0)', ans: 'Underestimate', exp: 'y = √x is concave down (f\'\' < 0), so chords lie below the curve.' },
      { name: 'y = ln(x) (x > 1)', ans: 'Underestimate', exp: 'y = ln(x) is concave down (f\'\' = -1/x^2 < 0), giving an underestimate.' },
      { name: 'y = sin(x) on [0, π]', ans: 'Underestimate', exp: 'sin(x) arches concave down on [0, π], so chords underestimate the area.' },
      { name: 'y = 3x + 2', ans: 'Exact', exp: 'A straight line forms exact trapezia with zero error.' },
    ];
    const item = pickRandom(curves);
    return makeExamQuestion(
      `Does the Trapezium Rule overestimate or underestimate ∫ ${item.name} ?`,
      'MM7.5 • Trapezium Concavity',
      item.ans,
      item.exp,
      ['Underestimate', 'Exact', 'Overestimate']
    );
  }

  // 2-strip trapezium rule on y = x^2 over [0, 2k]
  const k = pickRandom([1, 2, 3]);
  const ans = 3 * k * k * k;
  return makeExamQuestion(
    `Estimate ∫ [0 to ${2 * k}] x^2 dx using the Trapezium Rule with 2 equal strips.`,
    'MM7.5 • Trapezium Calculation',
    ans,
    `Strip width h = ${k}. Ordinates at 0, ${k}, ${2 * k} are 0, ${k * k}, ${4 * k * k}. Area ≈ (${k}/2)[0 + 2(${k * k}) + ${4 * k * k}] = ${ans}.`
  );
}

function generateExamGeomProbQuestion(): Question {
  const category = pickRandom([
    'geometry_angles',
    'similarity_scale',
    'combinatorics',
    'prob_dependent',
    'expectation',
  ]);

  if (category === 'geometry_angles') {
    const mode = pickRandom(['polygon', 'chord', 'pythag_3d']);
    if (mode === 'polygon') {
      const n = pickRandom([5, 6, 8, 9, 10, 12, 15, 18, 20]);
      const ext = 360 / n;
      const askInt = Math.random() > 0.35;
      if (askInt) {
        return makeExamQuestion(
          `Find one interior angle (in °) of a regular ${n}-sided polygon.`,
          'ESAT M5.2 • Polygon Geometry',
          180 - ext,
          `Exterior angle = 360° ÷ ${n} = ${ext}°. Interior angle = 180° - ${ext}° = ${180 - ext}°.`
        );
      }
      return makeExamQuestion(
        `Find one exterior angle (in °) of a regular ${n}-sided polygon.`,
        'ESAT M5.2 • Polygon Geometry',
        ext,
        `Exterior angles sum to 360° ⇒ 360° ÷ ${n} = ${ext}°.`
      );
    }

    if (mode === 'chord') {
      const triples = [
        [3, 4, 5],
        [6, 8, 10],
        [5, 12, 13],
        [9, 12, 15],
      ];
      const [dist, halfChord, r] = pickRandom(triples);
      return makeExamQuestion(
        `A circle of radius ${r} has a chord ${dist} units from the centre. Total chord length?`,
        'MM3.3 • Chord Bisection',
        2 * halfChord,
        `Perpendicular from centre bisects the chord. By Pythagoras: half-chord = √(${r}² - ${dist}²) = ${halfChord}. Full chord = ${2 * halfChord}.`
      );
    }

    const cuboids = [
      [1, 2, 2, 3],
      [2, 3, 6, 7],
      [2, 4, 4, 6],
      [3, 4, 12, 13],
      [1, 4, 8, 9],
      [4, 4, 7, 9],
    ];
    const [a, b, c, d] = pickRandom(cuboids);
    const scale = pickRandom([1, 2]);
    return makeExamQuestion(
      `Find the 3D space diagonal of a ${a * scale} × ${b * scale} × ${c * scale} cuboid.`,
      'ESAT M5.7 • 3D Pythagoras',
      d * scale,
      `√(${a * scale}² + ${b * scale}² + ${c * scale}²) = √${(d * scale) ** 2} = ${d * scale}.`
    );
  }

  if (category === 'similarity_scale') {
    const [p, q] = pickRandom([
      [1, 2],
      [1, 3],
      [2, 3],
      [3, 4],
    ]);
    const mult = getRandomInt(2, 5);
    const smallVol = Math.pow(p, 3) * mult;
    const largeVol = Math.pow(q, 3) * mult;
    return makeExamQuestion(
      `Two similar solids have surface area ratio ${p * p}:${q * q}. Smaller volume is ${smallVol}. Larger volume?`,
      'ESAT M3.10 • Similarity Scaling',
      largeVol,
      `Length ratio is ${p}:${q}, so volume ratio is ${p}³:${q}³ = ${p ** 3}:${q ** 3}. Larger volume = ${smallVol} × (${q ** 3}/${p ** 3}) = ${largeVol}.`
    );
  }

  if (category === 'combinatorics') {
    if (Math.random() > 0.45) {
      const n = getRandomInt(5, 8);
      const r = pickRandom([2, 3]);
      const ans = r === 2 ? (n * (n - 1)) / 2 : (n * (n - 1) * (n - 2)) / 6;
      return makeExamQuestion(
        `Ways to choose ${r} people from a group of ${n}?`,
        'TMUA / ESAT • Combinatorics',
        ans,
        `${n}C${r} = ${ans}.`
      );
    }

    const totalDigits = getRandomInt(4, 6);
    const ans = totalDigits * (totalDigits - 1) * (totalDigits - 2);
    return makeExamQuestion(
      `How many 3-digit numbers can be formed from digits 1..${totalDigits} with NO repeated digits?`,
      'ESAT M2.5 • Systematic Counting',
      ans,
      `${totalDigits} choices for 1st, ${totalDigits - 1} for 2nd, ${totalDigits - 2} for 3rd: ${totalDigits} × ${totalDigits - 1} × ${totalDigits - 2} = ${ans}.`
    );
  }

  if (category === 'prob_dependent') {
    const sub = pickRandom(['bag', 'cond', 'exhaustive']);
    if (sub === 'bag') {
      const r = getRandomInt(3, 6);
      const b = getRandomInt(3, 6);
      const total = r + b;
      const frac = simplifyFrac(r * (r - 1), total * (total - 1)).text;
      return makeExamQuestion(
        `Bag has ${r} red, ${b} blue counters. Pick 2 without replacement. P(both red)?`,
        'ESAT M7.7 • Dependent Probability',
        frac,
        `(${r}/${total}) × (${r - 1}/${total - 1}) = ${r * (r - 1)}/${total * (total - 1)} = ${frac}.`
      );
    }

    if (sub === 'cond') {
      const pA = pickRandom([0.2, 0.4, 0.5, 0.6, 0.8]);
      const pBgA = pickRandom([0.25, 0.5, 0.75]);
      const ans = Math.round(pA * pBgA * 100) / 100;
      return makeExamQuestion(
        `P(A) = ${pA}, P(B|A) = ${pBgA}. Find P(A ∩ B)`,
        'ESAT M7.7 • Conditional Probability',
        ans,
        `P(A ∩ B) = P(A) × P(B|A) = ${pA} × ${pBgA} = ${ans}.`
      );
    }

    const k = pickRandom([2, 3, 4]);
    const pC = pickRandom([0.1, 0.15, 0.2]);
    const pB = Number((k * pC).toFixed(2));
    const pA = Number((1 - pB - pC).toFixed(2));
    return makeExamQuestion(
      `Mutually exclusive exhaustive A, B, C: P(A) = ${pA}, P(B) = ${k}·P(C). Find P(C).`,
      'ESAT M7.4 • Exhaustive Outcomes',
      pC,
      `1 - ${pA} = ${(1 - pA).toFixed(2)} = ${k + 1}·P(C) ⇒ P(C) = ${pC}.`
    );
  }

  // 100% Procedural Binomial E(X) and Var(X): n = k * b^2 ensures exact integers for BOTH
  const b = pickRandom([2, 3, 4, 5, 6]);
  const validA: number[] = [];
  for (let i = 1; i < b; i++) {
    if (gcd(i, b) === 1) validA.push(i);
  }
  const a = pickRandom(validA);
  const k = getRandomInt(1, b >= 5 ? 2 : 3);
  const n = k * b * b;
  const askVar = Math.random() > 0.5;
  if (askVar) {
    const variance = k * a * (b - a);
    return makeExamQuestion(
      `X ~ B(${n}, ${a}/${b}). Find Var(X)`,
      'TMUA / A-Level • Binomial Variance',
      variance,
      `Var(X) = np(1 - p) = ${n} × (${a}/${b}) × (${b - a}/${b}) = ${variance}.`
    );
  }
  const mean = k * a * b;
  return makeExamQuestion(
    `X ~ B(${n}, ${a}/${b}). Find E(X)`,
    'TMUA / A-Level • Binomial Expectation',
    mean,
    `E(X) = np = ${n} × (${a}/${b}) = ${mean}.`
  );
}

export function generateExamQuestion(topic: ExamTopic = 'all'): Question {
  const chosen: Exclude<ExamTopic, 'all'> =
    topic === 'all' ? pickRandom(['number', 'algebra', 'trigcalc', 'geomprob']) : topic;

  if (chosen === 'number') return generateExamNumberQuestion();
  if (chosen === 'algebra') return generateExamAlgebraQuestion();
  if (chosen === 'trigcalc') return generateExamTrigCalcQuestion();
  return generateExamGeomProbQuestion();
}

// ---------------------------------------------------------------------------
// 7. Mental Calculus (A-Level Maths & Further Maths - Goldilocks Zone)
// ---------------------------------------------------------------------------

export type CalculusType = "diff" | "int" | "series" | "mixed";

export function generateCalculusQuestion(mode: CalculusType = "mixed"): Question {
  const chosen = mode === "mixed" ? pickRandom(["diff", "int", "series"]) : mode;

  if (chosen === "diff") {
    const diffRule = pickRandom([
      "poly_eval",
      "cubic_eval",
      "chain_eval",
      "product_eval",
      "quotient_eval",
      "trig_eval",
      "exp_eval",
      "ln_eval",
    ]);

    if (diffRule === "poly_eval") {
      const a = getRandomInt(2, 6);
      const b = getRandomInt(-7, 7);
      const c = getRandomInt(1, 4);
      const ans = 2 * a * c + b;
      const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `d/dx (${a}x^2 ${bSign}x) at x = ${c}`,
        promptSubtitle: "Differentiation • Power Rule",
        answer: ans,
        operation: "misc",
        explanation: `f'(x) = ${2 * a}x ${bSign}. At x = ${c}: ${2 * a}(${c}) ${bSign} = ${ans}.`,
      };
    }

    if (diffRule === "cubic_eval") {
      const a = getRandomInt(1, 3);
      const b = getRandomInt(1, 8);
      const c = getRandomInt(1, 2);
      const ans = 3 * a * (c * c) - b;
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `d/dx (${a}x^3 - ${b}x) at x = ${c}`,
        promptSubtitle: "Differentiation • Cubic",
        answer: ans,
        operation: "misc",
        explanation: `f'(x) = ${3 * a}x² - ${b}. At x = ${c}: ${3 * a}(${c * c}) - ${b} = ${ans}.`,
      };
    }

    if (diffRule === "chain_eval") {
      const a = getRandomInt(2, 3);
      const b = getRandomInt(1, 4);
      const c = getRandomInt(1, 2);
      const inner = a * c + b;
      const ans = 2 * a * inner;
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `d/dx [(${a}x + ${b})^2] at x = ${c}`,
        promptSubtitle: "Differentiation • Chain Rule",
        answer: ans,
        operation: "misc",
        explanation: `Chain rule: 2(${a}x + ${b}) × ${a} = ${2 * a}(${a}x + ${b}). At x = ${c}: ${2 * a}(${inner}) = ${ans}.`,
      };
    }

    if (diffRule === "product_eval") {
      const a = getRandomInt(2, 7);
      const ans = a + 1;
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `d/dx [(${a}x + 1)e^x] at x = 0`,
        promptSubtitle: "Differentiation • Product Rule",
        answer: ans,
        operation: "misc",
        explanation: `Product rule: ${a}e^x + (${a}x + 1)e^x. At x = 0: ${a}(1) + 1(1) = ${ans}.`,
      };
    }

    if (diffRule === "quotient_eval") {
      const a = getRandomInt(4, 9);
      const b = getRandomInt(1, 5);
      const ans = a - b;
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `d/dx [(${a}x + ${b}) / (x + 1)] at x = 0`,
        promptSubtitle: "Differentiation • Quotient Rule",
        answer: ans,
        operation: "misc",
        explanation: `Quotient rule at x = 0: [${a}(1) - (${b})(1)] / 1² = ${ans}.`,
      };
    }

    if (diffRule === "exp_eval") {
      const a = getRandomInt(2, 5);
      const k = getRandomInt(2, 6);
      const ans = a * k;
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `d/dx (${a}e^(${k}x)) at x = 0`,
        promptSubtitle: "Differentiation • Exponential",
        answer: ans,
        operation: "misc",
        explanation: `Derivative is ${ans}e^(${k}x). At x = 0, e^0 = 1 → ${ans}.`,
      };
    }

    if (diffRule === "ln_eval") {
      const c = getRandomInt(2, 5);
      const ans = getRandomInt(2, 6);
      const k = c * ans;
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `d/dx (${k} ln x) at x = ${c}`,
        promptSubtitle: "Differentiation • Natural Log",
        answer: ans,
        operation: "misc",
        explanation: `Derivative is ${k}/x. At x = ${c}: ${k}/${c} = ${ans}.`,
      };
    }

    const trigList = [
      { p: "d/dx (4 sin x) at x = 0", ans: 4, exp: "4 cos(0) = 4." },
      { p: "d/dx (5 cos x) at x = π/2", ans: -5, exp: "-5 sin(π/2) = -5." },
      { p: "d/dx (sin 3x) at x = 0", ans: 3, exp: "3 cos(0) = 3." },
      { p: "d/dx (tan x) at x = π/4", ans: 2, exp: "sec²(π/4) = (√2)² = 2." },
    ];
    const t = pickRandom(trigList);
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: t.p,
      promptSubtitle: "Differentiation • Trig",
      answer: t.ans,
      operation: "misc",
      explanation: t.exp,
    };
  }

  if (chosen === "int") {
    const intRule = pickRandom([
      "linear_int",
      "quadratic_int",
      "poly_0_1",
      "rev_chain",
      "recip_sqrt",
      "parts_exp",
      "trig_int",
      "further_arctan",
    ]);

    if (intRule === "linear_int") {
      const k = getRandomInt(1, 4);
      const b = getRandomInt(2, 5);
      const coeff = 2 * k;
      const ans = k * (b * b);
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `∫ [0 to ${b}] ${coeff}x dx`,
        promptSubtitle: "Integration • Power Rule",
        answer: ans,
        operation: "misc",
        explanation: `Antiderivative is ${k}x². From 0 to ${b}: ${k}(${b}²) = ${ans}.`,
      };
    }

    if (intRule === "quadratic_int") {
      const k = getRandomInt(1, 3);
      const b = getRandomInt(2, 3);
      const coeff = 3 * k;
      const ans = k * (b * b * b);
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `∫ [0 to ${b}] ${coeff}x^2 dx`,
        promptSubtitle: "Integration • Definite Integral",
        answer: ans,
        operation: "misc",
        explanation: `Antiderivative is ${k}x³. From 0 to ${b}: ${k}(${b}³) = ${ans}.`,
      };
    }

    if (intRule === "poly_0_1") {
      const a = getRandomInt(1, 5);
      const b = getRandomInt(1, 5);
      const c = getRandomInt(1, 5);
      const ans = a + b + c;
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `∫ [0 to 1] (${4 * a}x^3 + ${3 * b}x^2 + ${c}) dx`,
        promptSubtitle: "Integration • [0 to 1] Shortcut",
        answer: ans,
        operation: "misc",
        explanation: `Antiderivative is ${a}x⁴ + ${b}x³ + ${c}x. At x = 1: ${a} + ${b} + ${c} = ${ans}.`,
      };
    }

    if (intRule === "rev_chain") {
      const k = getRandomInt(1, 3);
      const ans = 26 * k;
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `∫ [0 to 1] ${6 * k}(2x + 1)^2 dx`,
        promptSubtitle: "Integration • Reverse Chain Rule",
        answer: ans,
        operation: "misc",
        explanation: `Antiderivative is ${k}(2x+1)³. At 1: ${27 * k}, at 0: ${k}. Difference = ${ans}.`,
      };
    }

    if (intRule === "recip_sqrt") {
      const k = getRandomInt(1, 6);
      const ans = 2 * k;
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `∫ [1 to 4] (${k} / √x) dx`,
        promptSubtitle: "Integration • Fractional Powers",
        answer: ans,
        operation: "misc",
        explanation: `Antiderivative is ${2 * k}√x. Evaluated: ${2 * k}(2 - 1) = ${ans}.`,
      };
    }

    if (intRule === "parts_exp") {
      const k = getRandomInt(2, 9);
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `∫ [0 to 1] ${k}x e^x dx`,
        promptSubtitle: "Integration • By Parts",
        answer: k,
        operation: "misc",
        explanation: `∫ x e^x dx = e^x(x - 1). From 0 to 1: 0 - (-1) = 1. Multiply by ${k} → ${k}.`,
      };
    }

    if (intRule === "further_arctan") {
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `∫ [0 to 1] 4 / (1 + x^2) dx`,
        promptSubtitle: "Further Maths • Inverse Trig Integral",
        answer: "π",
        options: ["π/4", "π/2", "π", "2π"],
        operation: "misc",
        explanation: `[4 arctan(x)] from 0 to 1 = 4(π/4 - 0) = π.`,
      };
    }

    const trigDefList = [
      { p: "∫ [0 to π] sin(x) dx", ans: 2, exp: "[-cos x] from 0 to π = 1 - (-1) = 2." },
      { p: "∫ [0 to π/2] cos(x) dx", ans: 1, exp: "[sin x] from 0 to π/2 = 1 - 0 = 1." },
      { p: "∫ [0 to π/4] sec^2(x) dx", ans: 1, exp: "[tan x] from 0 to π/4 = 1 - 0 = 1." },
    ];
    const td = pickRandom(trigDefList);
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: td.p,
      promptSubtitle: "Integration • Trig",
      answer: td.ans,
      operation: "misc",
      explanation: td.exp,
    };
  }

  const seriesChoice = getRandomInt(0, 2);
  if (seriesChoice === 0) {
    const k = getRandomInt(2, 5);
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `Coeff of x^2 in Maclaurin series of e^(${k}x)?`,
      promptSubtitle: "Further Maths • Maclaurin Series",
      answer: (k * k) % 2 === 0 ? (k * k) / 2 : `${k * k}/2`,
      operation: "misc",
      explanation: `e^(kx) = 1 + kx + (kx)²/2! + ... → x² coeff is ${k}²/2 = ${k * k}/2.`,
    };
  }
  if (seriesChoice === 1) {
    const k = getRandomInt(2, 4);
    const ans = k * k * k;
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `Coeff of x^3 in Maclaurin series of 6 sin(${k}x)?`,
      promptSubtitle: "Further Maths • Maclaurin Series",
      answer: -ans,
      operation: "misc",
      explanation: `sin(u) = u - u³/6 + ... So 6 sin(${k}x) has x³ term -${ans}x³.`,
    };
  }
  const n = getRandomInt(2, 5);
  const coeff = (n * (n + 1)) / 2;
  return {
    id: Math.random().toString(36).substring(2, 9),
    prompt: `Coeff of x^2 in expansion of (1 - x)^(-${n})?`,
    promptSubtitle: "A-Level / Further • Binomial Series",
    answer: coeff,
    operation: "misc",
    explanation: `(-${n})(-${n + 1})/2! × (-1)² = ${n}(${n + 1})/2 = ${coeff}.`,
  };
}

// ---------------------------------------------------------------------------
// 8. Algebra (A-Level Core + Further Core)
// ---------------------------------------------------------------------------

export type AlgebraType = "pure" | "further" | "mixed";

export function generateAlgebraQuestion(mode: AlgebraType = "mixed"): Question {
  const chosen = mode === "mixed" ? pickRandom(["pure", "further"]) : mode;

  if (chosen === "pure") {
    const pureRule = pickRandom(["linear", "quadratic", "logs", "exact_trig", "ap_gp", "binomial"]);

    if (pureRule === "linear") {
      const x = getRandomInt(-9, 12);
      const a = getRandomInt(2, 6);
      const b = getRandomInt(-15, 25);
      const c = a * x + b;
      const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `Solve for x: ${a}x ${bSign} = ${c}`,
        promptSubtitle: "Pure Core • Linear Speed",
        answer: x,
        operation: "misc",
        explanation: `${a}x = ${c - b}, so x = ${x}.`,
      };
    }

    if (pureRule === "quadratic") {
      const r1 = getRandomInt(-6, 6);
      let r2 = getRandomInt(-6, 6);
      if (r1 === r2) r2 = r1 + 3;
      const sum = r1 + r2;
      const prod = r1 * r2;
      const bSign = sum >= 0 ? `- ${sum}` : `+ ${Math.abs(sum)}`;
      const cSign = prod >= 0 ? `+ ${prod}` : `- ${Math.abs(prod)}`;
      const pickSmaller = Math.random() > 0.5;
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `${pickSmaller ? "Smaller" : "Larger"} root of: x^2 ${bSign}x ${cSign} = 0`,
        promptSubtitle: "Pure Core • Quadratics",
        answer: pickSmaller ? Math.min(r1, r2) : Math.max(r1, r2),
        operation: "misc",
        explanation: `Factors to (x - ${r1})(x - ${r2}) = 0. Roots: ${Math.min(r1, r2)} and ${Math.max(r1, r2)}.`,
      };
    }

    if (pureRule === "logs") {
      const base = pickRandom([2, 3, 5]);
      const exp = getRandomInt(2, base === 2 ? 6 : 4);
      const val = Math.pow(base, exp);
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `Evaluate log_${base}(${val})`,
        promptSubtitle: "Pure Core • Logarithms",
        answer: exp,
        operation: "misc",
        explanation: `Since ${base}^${exp} = ${val}, log_${base}(${val}) = ${exp}.`,
      };
    }

    if (pureRule === "exact_trig") {
      const trigs = [
        { p: "Exact value of sin(π/3)", ans: "√3/2", opts: ["1/2", "√2/2", "√3/2", "1"], exp: "sin(60°) = √3/2." },
        { p: "Exact value of cos(π/3)", ans: "1/2", opts: ["1/2", "√2/2", "√3/2", "0"], exp: "cos(60°) = 1/2." },
        { p: "Exact value of tan(π/3)", ans: "√3", opts: ["1/√3", "1", "√3", "2"], exp: "tan(60°) = √3." },
        { p: "Exact value of cos(2π/3)", ans: "-1/2", opts: ["-1/2", "1/2", "-√3/2", "√3/2"], exp: "cos(120°) = -cos(60°) = -1/2." },
        { p: "Exact value of sin(5π/6)", ans: "1/2", opts: ["-1/2", "1/2", "√3/2", "-√3/2"], exp: "sin(150°) = sin(30°) = 1/2." },
      ];
      const t = pickRandom(trigs);
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: t.p,
        promptSubtitle: "Pure Core • Exact Trig",
        answer: t.ans,
        options: t.opts,
        operation: "misc",
        explanation: t.exp,
      };
    }

    if (pureRule === "ap_gp") {
      const rDenom = pickRandom([2, 3, 4]);
      const mult = getRandomInt(2, 8);
      const a = (rDenom - 1) * mult;
      const sInf = rDenom * mult;
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt: `GP has a = ${a} and r = 1/${rDenom}. Find S_∞`,
        promptSubtitle: "Pure Core • Geometric Series",
        answer: sInf,
        operation: "misc",
        explanation: `S_∞ = a / (1 - r) = ${a} / (${rDenom - 1}/${rDenom}) = ${sInf}.`,
      };
    }

    const n = getRandomInt(5, 8);
    const r = pickRandom([2, 3]);
    const ans = r === 2 ? (n * (n - 1)) / 2 : (n * (n - 1) * (n - 2)) / 6;
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `Coeff of x^${r} in (1 + x)^${n}`,
      promptSubtitle: "Pure Core • Binomial Expansion",
      answer: ans,
      operation: "misc",
      explanation: `${n}C${r} = ${ans}.`,
    };
  }

  const fmRule = pickRandom(["complex_pow", "complex_mod", "complex_mult", "matrix_det", "matrix_singular", "vector_dot", "cubic_vieta"]);

  if (fmRule === "complex_pow") {
    const exp = getRandomInt(13, 99);
    const rem = exp % 4;
    const ans = rem === 0 ? "1" : rem === 1 ? "i" : rem === 2 ? "-1" : "-i";
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `Simplify i^${exp}`,
      promptSubtitle: "Further Maths • Complex Powers",
      answer: ans,
      options: ["1", "-1", "i", "-i"],
      operation: "misc",
      explanation: `${exp} mod 4 = ${rem}, so i^${exp} = i^${rem} = ${ans}.`,
    };
  }

  if (fmRule === "complex_mod") {
    const triples = [
      { a: 3, b: 4, c: 5 },
      { a: 5, b: 12, c: 13 },
      { a: 6, b: 8, c: 10 },
      { a: 8, b: 15, c: 17 },
    ];
    const t = pickRandom(triples);
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `Find modulus |${t.a} + ${t.b}i|`,
      promptSubtitle: "Further Maths • Complex Modulus",
      answer: t.c,
      operation: "misc",
      explanation: `√(${t.a}² + ${t.b}²) = √(${t.a * t.a + t.b * t.b}) = ${t.c}.`,
    };
  }

  if (fmRule === "complex_mult") {
    const a = getRandomInt(1, 5);
    const b = getRandomInt(1, 5);
    const c = getRandomInt(1, 5);
    const d = getRandomInt(1, 5);
    const askReal = Math.random() > 0.5;
    const ans = askReal ? a * c - b * d : a * d + b * c;
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `${askReal ? "Real" : "Imaginary"} part of (${a} + ${b}i)(${c} + ${d}i)`,
      promptSubtitle: "Further Maths • Complex Arithmetic",
      answer: ans,
      operation: "misc",
      explanation: `(${a} + ${b}i)(${c} + ${d}i) = (${a * c - b * d}) + (${a * d + b * c})i.`,
    };
  }

  if (fmRule === "matrix_det") {
    const a = getRandomInt(-4, 7);
    const b = getRandomInt(-4, 6);
    const c = getRandomInt(-4, 6);
    const d = getRandomInt(-4, 7);
    const det = a * d - b * c;
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `det [[${a}, ${b}], [${c}, ${d}]]`,
      promptSubtitle: "Further Maths • 2×2 Determinant",
      answer: det,
      operation: "misc",
      explanation: `ad - bc = (${a})(${d}) - (${b})(${c}) = ${det}.`,
    };
  }

  if (fmRule === "matrix_singular") {
    const d = getRandomInt(2, 5);
    const k = getRandomInt(2, 7);
    const b = d;
    const c = k;
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `Find k if [[k, ${b}], [${c}, ${d}]] is singular`,
      promptSubtitle: "Further Maths • Singular Matrix",
      answer: k,
      operation: "misc",
      explanation: `Singular means det = 0 → ${d}k - (${b})(${c}) = 0 → k = ${k}.`,
    };
  }

  if (fmRule === "vector_dot") {
    const a = [getRandomInt(-3, 5), getRandomInt(-3, 5), getRandomInt(-3, 5)];
    const b = [getRandomInt(-3, 5), getRandomInt(-3, 5), getRandomInt(-3, 5)];
    const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    return {
      id: Math.random().toString(36).substring(2, 9),
      prompt: `(${a[0]}, ${a[1]}, ${a[2]}) · (${b[0]}, ${b[1]}, ${b[2]})`,
      promptSubtitle: "Further Maths • Dot Product",
      answer: dot,
      operation: "misc",
      explanation: `(${a[0]}×${b[0]}) + (${a[1]}×${b[1]}) + (${a[2]}×${b[2]}) = ${dot}.`,
    };
  }

  const r1 = getRandomInt(1, 4);
  const r2 = getRandomInt(1, 4);
  const r3 = getRandomInt(-3, 4);
  const bCoeff = -(r1 + r2 + r3);
  const cCoeff = r1 * r2 + r2 * r3 + r3 * r1;
  const dCoeff = -(r1 * r2 * r3);
  const askSum = Math.random() > 0.5;
  const bStr = bCoeff >= 0 ? `+ ${bCoeff}` : `- ${Math.abs(bCoeff)}`;
  const cStr = cCoeff >= 0 ? `+ ${cCoeff}` : `- ${Math.abs(cCoeff)}`;
  const dStr = dCoeff >= 0 ? `+ ${dCoeff}` : `- ${Math.abs(dCoeff)}`;
  return {
    id: Math.random().toString(36).substring(2, 9),
    prompt: `Roots α, β, γ of x^3 ${bStr}x^2 ${cStr}x ${dStr} = 0. Find ${askSum ? "α + β + γ" : "αβγ"}`,
    promptSubtitle: "Further Maths • Roots of Cubics",
    answer: askSum ? r1 + r2 + r3 : r1 * r2 * r3,
    operation: "misc",
    explanation: askSum ? `Sum of roots = -b/a = ${r1 + r2 + r3}.` : `Product of roots = -d/a = ${r1 * r2 * r3}.`,
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

  // 9: Procedural Fractions (seeded by dateStr)
  const den1 = pickRandom([2, 3, 4, 5, 6], rng);
  let den2 = pickRandom([2, 3, 4, 5, 6], rng);
  while (den2 === den1) den2 = pickRandom([2, 3, 4, 5, 6], rng);
  const num1 = getRandomInt(1, den1 - 1, rng);
  const num2 = getRandomInt(1, den2 - 1, rng);
  const isAdd = rng() > 0.4;
  if (isAdd) {
    const sumNum = num1 * den2 + num2 * den1;
    const sumDen = den1 * den2;
    const ansFrac = simplifyFrac(sumNum, sumDen).text;
    questions.push({
      id: `daily_${dateStr}_8`,
      prompt: `${num1}/${den1} + ${num2}/${den2}`,
      answer: ansFrac,
      operation: 'misc',
      promptSubtitle: `Daily Challenge Q9/10 • Fractions`,
    });
  } else {
    const leftBig = num1 * den2 >= num2 * den1;
    const pStr = leftBig ? `${num1}/${den1} - ${num2}/${den2}` : `${num2}/${den2} - ${num1}/${den1}`;
    const diffNum = Math.abs(num1 * den2 - num2 * den1);
    const diffDen = den1 * den2;
    const ansFrac = diffNum === 0 ? '0' : simplifyFrac(diffNum, diffDen).text;
    questions.push({
      id: `daily_${dateStr}_8`,
      prompt: pStr,
      answer: ansFrac,
      operation: 'misc',
      promptSubtitle: `Daily Challenge Q9/10 • Fractions`,
    });
  }

  // 10: Signature Daily Puzzle — Seeded BIDMAS Operator Vault
  const highOps: OperatorSymbol[] = ['×', '÷'];
  const lowOps: OperatorSymbol[] = ['+', '-'];
  let vaultNums: [number, number, number] = [6, 4, 2];
  let vaultOps: [OperatorSymbol, OperatorSymbol] = ['×', '-'];
  let vaultTarget = 22;

  for (let attempt = 0; attempt < 60; attempt++) {
    const highFirst = rng() > 0.5;
    const opHigh = pickRandom(highOps, rng);
    const opLow = pickRandom(lowOps, rng);
    const op1 = highFirst ? opHigh : opLow;
    const op2 = highFirst ? opLow : opHigh;

    let a = getRandomInt(4, 15, rng);
    let b = getRandomInt(3, 12, rng);
    let c = getRandomInt(3, 12, rng);

    if (op1 === '÷') {
      const q = getRandomInt(3, 12, rng);
      b = getRandomInt(3, 9, rng);
      a = q * b;
    } else if (op2 === '÷') {
      const q = getRandomInt(3, 12, rng);
      c = getRandomInt(3, 9, rng);
      b = q * c;
    }

    const res = evaluateBidmas([a, b, c], [op1, op2]);
    if (res !== null && Number.isInteger(res) && res >= 1 && res <= 180) {
      vaultNums = [a, b, c];
      vaultOps = [op1, op2];
      vaultTarget = res;
      break;
    }
  }

  questions.push({
    id: `daily_${dateStr}_9`,
    prompt: `${vaultNums[0]} [?] ${vaultNums[1]} [?] ${vaultNums[2]} = ${vaultTarget}`,
    answer: `${vaultNums[0]} ${vaultOps[0]} ${vaultNums[1]} ${vaultOps[1]} ${vaultNums[2]} = ${vaultTarget}`,
    explanation: `BIDMAS solution: ${vaultNums[0]} ${vaultOps[0]} ${vaultNums[1]} ${vaultOps[1]} ${vaultNums[2]} = ${vaultTarget}.`,
    operation: 'misc',
    promptSubtitle: `Daily Q10/10 • Signature Vault`,
    operatorPuzzle: {
      nums: vaultNums,
      target: vaultTarget,
    },
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

// ---------------------------------------------------------------------------
// 9. OPERATOR BLITZ PUZZLE GENERATOR (Missing + - × ÷ under BIDMAS)
// ---------------------------------------------------------------------------

export type OperatorSymbol = '+' | '-' | '×' | '÷';

export interface OperatorPuzzle {
  id: string;
  nums: [number, number, number];
  target: number;
  solutionOps: [OperatorSymbol, OperatorSymbol];
  explanation: string;
}

export function evaluateBidmas(
  nums: [number, number, number],
  ops: [OperatorSymbol, OperatorSymbol]
): number | null {
  const apply = (lhs: number, op: OperatorSymbol, rhs: number): number | null => {
    if (op === '+') return lhs + rhs;
    if (op === '-') return lhs - rhs;
    if (op === '×') return lhs * rhs;
    if (rhs === 0 || lhs % rhs !== 0) return null;
    return lhs / rhs;
  };

  const [a, b, c] = nums;
  const [op1, op2] = ops;
  const isHigh = (op: OperatorSymbol) => op === '×' || op === '÷';

  // Higher precedence evaluated left-to-right first
  if (!isHigh(op1) && isHigh(op2)) {
    const right = apply(b, op2, c);
    if (right === null) return null;
    return apply(a, op1, right);
  }

  const left = apply(a, op1, b);
  if (left === null) return null;
  return apply(left, op2, c);
}

export function generateOperatorPuzzle(round: number): OperatorPuzzle {
  const allOps: OperatorSymbol[] = ['+', '-', '×', '÷'];
  const maxNum = round < 4 ? 9 : round < 8 ? 12 : 15;

  for (let attempt = 0; attempt < 80; attempt++) {
    const op1 = pickRandom(allOps);
    const op2 = pickRandom(allOps);

    let a = getRandomInt(2, maxNum);
    let b = getRandomInt(2, maxNum);
    let c = getRandomInt(2, maxNum);

    if (op1 === '÷' && op2 === '÷') {
      const q = getRandomInt(1, 5);
      b = getRandomInt(2, 5);
      c = getRandomInt(2, 5);
      a = q * b * c;
    } else if (op1 === '÷') {
      const q = getRandomInt(2, 9);
      b = getRandomInt(2, 9);
      a = q * b;
    } else if (op2 === '÷') {
      if (op1 === '×') {
        // Left-to-right (a × b) ÷ c: ensure (a × b) divisible by c cleanly
        c = getRandomInt(2, 8);
        const factor = getRandomInt(2, 9);
        a = c * getRandomInt(1, 3);
        b = factor;
      } else {
        // BIDMAS: b ÷ c runs first
        const q = getRandomInt(2, 9);
        c = getRandomInt(2, 9);
        b = q * c;
      }
    }

    const nums: [number, number, number] = [a, b, c];
    const solutionOps: [OperatorSymbol, OperatorSymbol] = [op1, op2];
    const target = evaluateBidmas(nums, solutionOps);

    if (
      target !== null &&
      Number.isInteger(target) &&
      (round >= 6 ? target >= -30 : target >= 0) &&
      Math.abs(target) <= 144
    ) {
      return {
        id: Math.random().toString(36).substring(2, 9),
        nums,
        target,
        solutionOps,
        explanation: `${a} ${op1} ${b} ${op2} ${c} = ${target}`,
      };
    }
  }

  return {
    id: Math.random().toString(36).substring(2, 9),
    nums: [6, 4, 2],
    target: 22,
    solutionOps: ['×', '-'],
    explanation: '6 × 4 - 2 = 22',
  };
}
