import { describe, expect, it } from 'vitest';
import { nonRightTrianglesLesson } from './non-right-triangles';
import type { LessonStep } from '@/types/lesson';

/** Recursively collect every string value in the lesson tree. */
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

/** Collect every formula string in the lesson (step- and reveal-level). */
function collectFormulas(steps: LessonStep[]): string[] {
  const formulas: string[] = [];
  for (const step of steps) {
    if (step.formula) formulas.push(step.formula);
    for (const reveal of step.demo?.reveals ?? []) {
      if (reveal.formula) formulas.push(reveal.formula);
    }
  }
  return formulas;
}

const byId = (id: string) =>
  nonRightTrianglesLesson.steps.find((s) => s.id === id);

describe('non-right-triangles content', () => {
  it('adds a demo-why parallelogram demonstration step', () => {
    const step = byId('demo-why');
    expect(step).toBeDefined();
    expect(step?.type).toBe('demonstration');
    expect(step?.demo?.interactive).toBe('parallelogram');
  });

  it('places demo-why immediately after demo-area, before transition-wedo', () => {
    const ids = nonRightTrianglesLesson.steps.map((s) => s.id);
    const areaIdx = ids.indexOf('demo-area');
    const whyIdx = ids.indexOf('demo-why');
    const wedoIdx = ids.indexOf('transition-wedo');
    expect(whyIdx).toBe(areaIdx + 1);
    expect(whyIdx).toBeLessThan(wedoIdx);
  });

  it('keeps the original "I do" demo using the shear interactive', () => {
    expect(byId('demo-area')?.demo?.interactive).toBe('shear');
  });

  it('preserves all key numeric answers', () => {
    expect(byId('q1-area-base-height')?.answer).toBe(6);
    expect(byId('q2-derive-perimeter')?.answer).toBe(48);
    expect(byId('q3-interactive-split')?.answer).toBe(48);
    expect(byId('q4-perimeter-from-area')?.answer).toBe(64);
  });

  it('writes every formula with a fraction or operator as LaTeX', () => {
    const formulas = collectFormulas(nonRightTrianglesLesson.steps);
    expect(formulas.length).toBeGreaterThan(0);
    for (const formula of formulas) {
      expect(formula).toContain('$');
      // No raw unicode math glyphs — those belong inside $...$ as LaTeX.
      expect(formula).not.toMatch(/[½×÷·]/);
    }
  });

  it('uses academic diction (no banned casual phrasing)', () => {
    const banned = [
      'straight up',
      'plug in',
      'plug them into',
      'plug it in',
      'slanted',
      'the bottom side',
      'sideways',
    ];
    const strings = collectStrings(nonRightTrianglesLesson);
    for (const text of strings) {
      const lower = text.toLowerCase();
      for (const phrase of banned) {
        expect(lower).not.toContain(phrase);
      }
    }
  });
});
