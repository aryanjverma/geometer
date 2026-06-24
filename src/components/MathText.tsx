import { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  /** Text that may embed inline math wrapped in single dollar signs, e.g. "Area $\\frac{1}{2}bh$". */
  children: string;
}

interface TextToken {
  type: 'text';
  value: string;
}

interface MathToken {
  type: 'math';
  html: string;
}

type Token = TextToken | MathToken;

const MATH_SPAN = /\$([^$]+)\$/g;

/** Split a string into plain-text and KaTeX-rendered math tokens. */
export function tokenizeMath(input: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;
  for (const match of input.matchAll(MATH_SPAN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      tokens.push({ type: 'text', value: input.slice(lastIndex, start) });
    }
    tokens.push({
      type: 'math',
      html: katex.renderToString(match[1], {
        throwOnError: false,
        displayMode: false,
      }),
    });
    lastIndex = start + match[0].length;
  }
  if (lastIndex < input.length) {
    tokens.push({ type: 'text', value: input.slice(lastIndex) });
  }
  return tokens;
}

/**
 * Renders a string, turning any `$...$` spans into inline KaTeX while leaving
 * the surrounding prose untouched. Content authors opt into math by wrapping an
 * expression in single dollar signs.
 */
export function MathText({ children }: MathTextProps) {
  const tokens = useMemo(() => tokenizeMath(children), [children]);

  return (
    <>
      {tokens.map((token, i) =>
        token.type === 'text' ? (
          <span key={i}>{token.value}</span>
        ) : (
          <span key={i} dangerouslySetInnerHTML={{ __html: token.html }} />
        ),
      )}
    </>
  );
}
