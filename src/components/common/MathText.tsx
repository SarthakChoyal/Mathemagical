import React from 'react';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Lightweight, offline-safe mathematical renderer.
 * Supports:
 * - 2x2 Matrices: [[a, b], [c, d]]
 * - Definite Integrals: ∫ [a to b] ...
 * - Exponents / Superscripts: x^2, x^3, e^(2x), 2^x, (x+1)^4
 * - Subscripts: log_2, S_∞
 * - Recurring decimals: [rec:6] or [rec:27]
 */
export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  // Check if text contains a 2x2 matrix pattern [[a, b], [c, d]]
  const matrixRegex = /\[\[([^\]]+)\],\s*\[([^\]]+)\]\]/g;
  if (matrixRegex.test(text)) {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    matrixRegex.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = matrixRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`t-${lastIndex}`}>
            {formatInlineMath(text.slice(lastIndex, match.index))}
          </span>
        );
      }

      const row1 = match[1].split(',').map((s) => s.trim());
      const row2 = match[2].split(',').map((s) => s.trim());

      parts.push(
        <span
          key={`m-${match.index}`}
          className="inline-flex items-center align-middle mx-1.5 px-2 py-1 border-l-2 border-r-2 border-current rounded-sm leading-tight"
        >
          <span className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-center font-mono">
            <span>{row1[0]}</span>
            <span>{row1[1]}</span>
            <span>{row2[0]}</span>
            <span>{row2[1]}</span>
          </span>
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`t-end`}>{formatInlineMath(text.slice(lastIndex))}</span>
      );
    }

    return <span className={`inline-flex flex-wrap items-center justify-center gap-1 ${className}`}>{parts}</span>;
  }

  return <span className={className}>{formatInlineMath(text)}</span>;
};

function formatInlineMath(str: string): React.ReactNode[] {
  // Handle definite integral: ∫ [a to b]
  const integralRegex = /∫\s*\[([^\]]+)\s+to\s+([^\]]+)\]/g;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = integralRegex.exec(str)) !== null) {
    if (m.index > lastIdx) {
      nodes.push(...formatSuperscriptsAndSubscripts(str.slice(lastIdx, m.index), `pre-${m.index}`));
    }
    const lower = m[1].trim();
    const upper = m[2].trim();
    nodes.push(
      <span key={`int-${m.index}`} className="inline-flex items-center mr-1.5 align-middle">
        <span className="text-[1.35em] leading-none font-serif italic pr-0.5">∫</span>
        <span className="inline-flex flex-col justify-between text-[0.42em] leading-none font-mono -ml-0.5 mr-0.5 h-[2.1em]">
          <span className="self-start">{upper}</span>
          <span className="self-start">{lower}</span>
        </span>
      </span>
    );
    lastIdx = m.index + m[0].length;
  }

  if (lastIdx < str.length) {
    nodes.push(...formatSuperscriptsAndSubscripts(str.slice(lastIdx), 'tail'));
  }

  return nodes;
}

function formatSuperscriptsAndSubscripts(str: string, keyPrefix: string): React.ReactNode[] {
  // Handle recurring decimal blocks [rec:digits] first
  const recRegex = /\[rec:([0-9]+)\]/g;
  if (recRegex.test(str)) {
    const out: React.ReactNode[] = [];
    let last = 0;
    recRegex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = recRegex.exec(str)) !== null) {
      if (m.index > last) {
        out.push(...parseSupSubTokens(str.slice(last, m.index), `${keyPrefix}-pre-${m.index}`));
      }
      const digits = m[1];
      out.push(
        <span key={`${keyPrefix}-rec-${m.index}`} className="inline-flex items-baseline">
          {digits.split('').map((ch, idx) => {
            const hasDot = idx === 0 || idx === digits.length - 1;
            return (
              <span key={idx} className="relative inline-block leading-none">
                {hasDot && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-[0.34em] left-1/2 -translate-x-1/2 w-[0.16em] h-[0.16em] rounded-full bg-current"
                  />
                )}
                {ch}
              </span>
            );
          })}
        </span>
      );
      last = m.index + m[0].length;
    }
    if (last < str.length) {
      out.push(...parseSupSubTokens(str.slice(last), `${keyPrefix}-post`));
    }
    return out;
  }

  return parseSupSubTokens(str, keyPrefix);
}

function parseSupSubTokens(str: string, keyPrefix: string): React.ReactNode[] {
  // Match ^(expr), ^char, or _(expr), _char
  const tokenRegex = /(\^\([^)]+\)|\^[a-zA-Z0-9−\-]+|_\([^)]+\)|_[a-zA-Z0-9∞]+)/g;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      parts.push(<React.Fragment key={`${keyPrefix}-t-${lastIdx}`}>{str.slice(lastIdx, match.index)}</React.Fragment>);
    }

    const token = match[0];
    const isSup = token.startsWith('^');
    let inner = token.slice(1);
    if (inner.startsWith('(') && inner.endsWith(')')) {
      inner = inner.slice(1, -1);
    }

    if (isSup) {
      parts.push(
        <sup key={`${keyPrefix}-sup-${match.index}`} className="text-[0.65em] font-bold leading-none ml-[1px]">
          {inner}
        </sup>
      );
    } else {
      parts.push(
        <sub key={`${keyPrefix}-sub-${match.index}`} className="text-[0.65em] font-bold leading-none ml-[1px]">
          {inner}
        </sub>
      );
    }

    lastIdx = match.index + token.length;
  }

  if (lastIdx < str.length) {
    parts.push(<React.Fragment key={`${keyPrefix}-end`}>{str.slice(lastIdx)}</React.Fragment>);
  }

  return parts;
}
