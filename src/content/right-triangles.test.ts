import { describe, it, expect } from 'vitest';
import { rightTrianglesLesson } from './right-triangles';

/** Recursively collect every human-readable string value in the lesson tree. */
function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    out.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value)) collectStrings(v, out);
  }
  return out;
}

const allStrings = collectStrings(rightTrianglesLesson);

describe('right-triangles content: LaTeX conversion', () => {
  it('contains no raw unicode math notation anywhere', () => {
    // ² ³ ½ √ × and unicode sub/superscript digits must all be gone.
    const bannedUnicode = /[²³½¼¾√×÷·₀-₉⁰-⁹]/;
    const offenders = allStrings.filter((s) => bannedUnicode.test(s));
    expect(offenders).toEqual([]);
  });

  it('has balanced dollar delimiters in every string', () => {
    for (const s of allStrings) {
      const count = (s.match(/\$/g) ?? []).length;
      expect(count % 2, `Unbalanced $ in: ${s}`).toBe(0);
    }
  });

  it('keeps LaTeX commands inside $...$ math spans', () => {
    // Any \frac, \sqrt, \times, \text or a digit-exponent caret must live in math.
    const latexToken = /(\\frac|\\sqrt|\\times|\\text|\^)/g;
    for (const s of allStrings) {
      if (!latexToken.test(s)) continue;
      // Strip out all $...$ spans; no LaTeX token should remain outside.
      const outsideMath = s.replace(/\$[^$]*\$/g, '');
      expect(
        /(\\frac|\\sqrt|\\times|\\text|\^)/.test(outsideMath),
        `LaTeX outside math in: ${s}`,
      ).toBe(false);
    }
  });

  it('uses LaTeX for the core Pythagorean and area expressions', () => {
    const joined = allStrings.join('\n');
    expect(joined).toContain('$a^2 + b^2 = c^2$');
    expect(joined).toContain('\\sqrt{100}');
    expect(joined).toContain('\\sqrt{25}');
    expect(joined).toContain('\\frac{1}{2}');
    expect(joined).toContain('\\times');
  });
});

describe('right-triangles content: academic diction', () => {
  it('avoids overly casual phrasing', () => {
    const banned = [/plug in/i, /plug them/i, /plug the/i, /straight up/i, /undo the square/i];
    for (const phrase of banned) {
      const offenders = allStrings.filter((s) => phrase.test(s));
      expect(offenders, `Matched ${phrase}`).toEqual([]);
    }
  });
});

describe('right-triangles content: structural invariants (must not change)', () => {
  it('preserves step ids and types', () => {
    const shape = rightTrianglesLesson.steps.map((s) => ({ id: s.id, type: s.type }));
    expect(shape).toEqual([
      { id: 'intro', type: 'transition' },
      { id: 'demo-pythagorean', type: 'demonstration' },
      { id: 'transition-wedo', type: 'transition' },
      { id: 'guided-pythagorean', type: 'guided' },
      { id: 'transition-youdo', type: 'transition' },
      { id: 'q1-hypotenuse', type: 'numeric' },
      { id: 'q2-area', type: 'formula-compute' },
      { id: 'q3-leg-then-perimeter', type: 'leg-then-perimeter' },
      { id: 'q4-leg-then-area', type: 'multi-part-numeric' },
    ]);
  });

  it('preserves all numeric answers', () => {
    const steps = rightTrianglesLesson.steps;
    const byId = (id: string) => steps.find((s) => s.id === id)!;

    const guided = byId('guided-pythagorean').guided!;
    const legsPart = guided.find((g) => g.id === 'legs')!;
    expect(legsPart.inputs!.map((i) => i.answer)).toEqual([3, 4]);
    expect(guided.find((g) => g.id === 'c-squared')!.answer).toBe(25);
    expect(guided.find((g) => g.id === 'c')!.answer).toBe(5);

    expect(byId('q1-hypotenuse').answer).toBe(13);
    expect(byId('q2-area').answer).toBe(24);

    const perimParts = byId('q3-leg-then-perimeter').parts!;
    expect(perimParts.find((p) => p.id === 'leg')!.answer).toBe(12);
    expect(perimParts.find((p) => p.id === 'perimeter')!.answer).toBe(36);

    const areaParts = byId('q4-leg-then-area').parts!;
    expect(areaParts.find((p) => p.id === 'leg')!.answer).toBe(6);
    expect(areaParts.find((p) => p.id === 'area')!.answer).toBe(24);
  });

  it('preserves triangle numeric data', () => {
    const steps = rightTrianglesLesson.steps;
    const byId = (id: string) => steps.find((s) => s.id === id)!;
    expect(byId('demo-pythagorean').triangle).toEqual({ legs: [6, 8], hypotenuse: 10 });
    expect(byId('guided-pythagorean').triangle).toEqual({ legs: [3, 4] });
    expect(byId('q1-hypotenuse').triangle).toEqual({ legs: [5, 12] });
    expect(byId('q3-leg-then-perimeter').triangle).toEqual({
      leg: 9,
      hypotenuse: 15,
      missingLeg: 12,
    });
  });
});
