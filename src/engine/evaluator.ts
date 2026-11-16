// Smart Mathematical Input Evaluator

export function normalizeInput(input: string | number): string {
  if (typeof input === 'number') return input.toString().trim();
  return input.toString().trim().replace(/\s+/g, '');
}

export function checkAnswer(userInput: string | number, expectedAnswer: string | number): boolean {
  const normUser = normalizeInput(userInput);
  const normExpected = normalizeInput(expectedAnswer);

  if (!normUser) return false;

  // Direct exact match
  if (normUser === normExpected) return true;

  // Numeric float tolerance check (e.g. 0.25 vs .25 or 12.0 vs 12)
  const numUser = parseFloat(normUser);
  const numExpected = parseFloat(normExpected);

  if (!isNaN(numUser) && !isNaN(numExpected)) {
    // If neither is a fraction string like "3/4"
    if (!normUser.includes('/') && !normExpected.includes('/')) {
      if (Math.abs(numUser - numExpected) < 0.0001) {
        return true;
      }
    }
  }

  // Fraction comparison: e.g. user typed "2/4" and expected is "1/2" or user typed "0.5"
  if (normUser.includes('/') || normExpected.includes('/')) {
    const parseFraction = (fStr: string): number | null => {
      const parts = fStr.split('/');
      if (parts.length === 2) {
        const top = parseFloat(parts[0]);
        const bot = parseFloat(parts[1]);
        if (!isNaN(top) && !isNaN(bot) && bot !== 0) {
          return top / bot;
        }
      }
      return null;
    };

    const valUser = normUser.includes('/') ? parseFraction(normUser) : parseFloat(normUser);
    const valExp = normExpected.includes('/') ? parseFraction(normExpected) : parseFloat(normExpected);

    if (valUser !== null && valExp !== null && !isNaN(valUser) && !isNaN(valExp)) {
      if (Math.abs(valUser - valExp) < 0.0001) {
        return true;
      }
    }
  }

  return false;
}
