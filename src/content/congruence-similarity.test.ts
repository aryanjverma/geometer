import { describe, expect, it } from 'vitest';
import { congruenceSimilarityLesson } from './congruence-similarity';
import type { GridPoint, GridShape, LessonStep } from '@/types/lesson';

const EPS = 1e-9;

/** Euclidean distance between two grid points. */
function dist(a: GridPoint, b: GridPoint): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

/** Sorted multiset of side lengths for a polygon's ordered vertices. */
function sideLengths(shape: GridShape): number[] {
  const v = shape.vertices;
  const sides: number[] = [];
  for (let i = 0; i < v.length; i++) {
    sides.push(dist(v[i], v[(i + 1) % v.length]));
  }
  return sides.sort((p, q) => p - q);
}

/** True when two shapes have the same sorted side-length multiset. */
function areCongruent(a: GridShape, b: GridShape): boolean {
  const sa = sideLengths(a);
  const sb = sideLengths(b);
  if (sa.length !== sb.length) return false;
  return sa.every((s, i) => Math.abs(s - sb[i]) < EPS);
}

/** True when sorted side lengths share one common ratio (k); returns the ratio. */
function similarityRatio(a: GridShape, b: GridShape): number | null {
  const sa = sideLengths(a);
  const sb = sideLengths(b);
  if (sa.length !== sb.length) return null;
  const k = sb[0] / sa[0];
  for (let i = 0; i < sa.length; i++) {
    if (Math.abs(sb[i] / sa[i] - k) > 1e-9) return null;
  }
  return k;
}

function areSimilarNotCongruent(a: GridShape, b: GridShape): boolean {
  const k = similarityRatio(a, b);
  if (k === null) return false;
  return Math.abs(k - 1) > EPS && !areCongruent(a, b);
}

/** `tag` is authored on steps but not part of the shared LessonStep type. */
type TaggedStep = LessonStep & { tag?: 'I do' | 'We do' | 'You do' };

const byId = (id: string): TaggedStep | undefined =>
  congruenceSimilarityLesson.steps.find((s) => s.id === id);

function shapesOf(id: string): GridShape[] {
  return byId(id)?.grid?.shapes ?? [];
}

function lastSub(id: string) {
  const subs = byId(id)?.subSteps ?? [];
  return subs[subs.length - 1];
}

/**
 * Collect display strings (prompts, feedback, demo/reveal bodies, guided and
 * substep prompts, choice labels). Excludes raw grid shape labels and numeric
 * input `label` fields, mirroring how the distance lesson treats graph labels.
 */
function displayStrings(): string[] {
  const out: string[] = [];
  const pushFeedback = (f?: {
    correct?: string;
    wrong?: string;
    hint?: string;
  }) => {
    if (!f) return;
    if (f.correct) out.push(f.correct);
    if (f.wrong) out.push(f.wrong);
    if (f.hint) out.push(f.hint);
  };
  for (const step of congruenceSimilarityLesson.steps) {
    out.push(step.prompt);
    pushFeedback(step.feedback);
    if (step.transition?.cta) out.push(step.transition.cta);
    if (step.demo?.intro) out.push(step.demo.intro);
    for (const r of step.demo?.reveals ?? []) {
      out.push(r.label, r.body);
      if (r.formula) out.push(r.formula);
    }
    for (const g of step.guided ?? []) {
      out.push(g.prompt);
      pushFeedback(g.feedback);
    }
    for (const ss of step.subSteps ?? []) {
      out.push(ss.prompt);
      pushFeedback(ss.feedback);
      for (const c of ss.choices ?? []) out.push(c.label);
    }
  }
  return out;
}

describe('congruence-similarity lesson', () => {
  it('has the correct lessonId and title', () => {
    expect(congruenceSimilarityLesson.lessonId).toBe('congruence-similarity');
    expect(congruenceSimilarityLesson.title).toBe('Congruence and Similarity');
  });

  it('has the exact ordered list of steps', () => {
    const expected: Array<{ id: string; type: string }> = [
      { id: 'intro', type: 'transition' },
      { id: 'demo-congruence', type: 'congruence-demo' },
      { id: 'guided-congruence', type: 'congruence-guided' },
      { id: 'demo-similarity', type: 'similarity-demo' },
      { id: 'guided-similarity', type: 'similarity-guided' },
      { id: 'transition-youdo', type: 'transition' },
      { id: 'q1-congruence-check', type: 'congruence-check' },
      { id: 'q2-similarity-check', type: 'similarity-check' },
      { id: 'q3-match-congruent', type: 'shape-match' },
      { id: 'q4-match-similar', type: 'shape-match' },
      { id: 'q5-side-length', type: 'coordinate-rule' },
      { id: 'q6-scale-ratio', type: 'coordinate-rule' },
    ];
    const actual = congruenceSimilarityLesson.steps.map((s) => ({
      id: s.id,
      type: s.type,
    }));
    expect(actual).toEqual(expected);
  });

  it('tags steps with the I do / We do / You do progression', () => {
    expect(byId('demo-congruence')?.tag).toBe('I do');
    expect(byId('guided-congruence')?.tag).toBe('We do');
    expect(byId('demo-similarity')?.tag).toBe('I do');
    expect(byId('guided-similarity')?.tag).toBe('We do');
    expect(byId('q1-congruence-check')?.tag).toBe('You do');
    expect(byId('q2-similarity-check')?.tag).toBe('You do');
    expect(byId('q3-match-congruent')?.tag).toBe('You do');
    expect(byId('q4-match-similar')?.tag).toBe('You do');
    expect(byId('q5-side-length')?.tag).toBe('You do');
    expect(byId('q6-scale-ratio')?.tag).toBe('You do');
  });

  it('gives every step a non-empty prompt', () => {
    for (const step of congruenceSimilarityLesson.steps) {
      expect(typeof step.prompt).toBe('string');
      expect(step.prompt.length).toBeGreaterThan(0);
    }
  });

  it('builds demo steps with two grid shapes and 2-4 reveals', () => {
    for (const id of ['demo-congruence', 'demo-similarity']) {
      const step = byId(id);
      expect(step?.grid).toBeDefined();
      expect(shapesOf(id)).toHaveLength(2);
      const reveals = step?.demo?.reveals ?? [];
      expect(reveals.length).toBeGreaterThanOrEqual(2);
      expect(reveals.length).toBeLessThanOrEqual(4);
    }
  });

  it('builds guided steps with a grid (2 shapes) and guided parts', () => {
    for (const id of ['guided-congruence', 'guided-similarity']) {
      expect(byId(id)?.grid).toBeDefined();
      expect(shapesOf(id)).toHaveLength(2);
      expect((byId(id)?.guided ?? []).length).toBeGreaterThan(0);
    }
  });

  it('builds check steps with a grid (2 shapes) ending in a choice substep', () => {
    for (const id of ['q1-congruence-check', 'q2-similarity-check']) {
      expect(byId(id)?.grid).toBeDefined();
      expect(shapesOf(id)).toHaveLength(2);
      const subs = byId(id)?.subSteps ?? [];
      expect(subs.length).toBeGreaterThan(0);
      const last = subs[subs.length - 1];
      expect(last.kind).toBe('choice');
    }
  });

  it('asks "Are they congruent?" then "Are they similar?" on the checks', () => {
    expect(lastSub('q1-congruence-check')?.prompt).toContain(
      'Are they congruent?',
    );
    expect(lastSub('q2-similarity-check')?.prompt).toContain('Are they similar?');
  });

  it('defines shape-match steps with the correct goal and allowed moves', () => {
    const q3 = byId('q3-match-congruent');
    expect(q3?.match?.goal).toBe('congruent');
    expect(q3?.match?.allow).toEqual(
      expect.arrayContaining(['translate', 'rotate']),
    );
    const q4 = byId('q4-match-similar');
    expect(q4?.match?.goal).toBe('similar');
    expect(q4?.match?.allow).toEqual(
      expect.arrayContaining(['translate', 'dilate']),
    );
  });

  // --- Geometry correctness ---------------------------------------------

  it('demo-congruence shows two genuinely congruent shapes', () => {
    const [a, b] = shapesOf('demo-congruence');
    expect(areCongruent(a, b)).toBe(true);
  });

  it('demo-similarity shows similar but not congruent shapes', () => {
    const [a, b] = shapesOf('demo-similarity');
    expect(areSimilarNotCongruent(a, b)).toBe(true);
  });

  it('q1 shapes are congruent and the answer is yes', () => {
    const [a, b] = shapesOf('q1-congruence-check');
    expect(areCongruent(a, b)).toBe(true);
    expect(lastSub('q1-congruence-check')?.correctChoice).toBe('yes');
  });

  it('q2 shapes are similar (not congruent) and the answer is yes', () => {
    const [a, b] = shapesOf('q2-similarity-check');
    expect(areSimilarNotCongruent(a, b)).toBe(true);
    expect(lastSub('q2-similarity-check')?.correctChoice).toBe('yes');
  });

  it('q3 match source and target are congruent', () => {
    const m = byId('q3-match-congruent')?.match;
    expect(m).toBeDefined();
    expect(areCongruent(m!.source, m!.target)).toBe(true);
  });

  it('q4 match source and target are similar but not congruent', () => {
    const m = byId('q4-match-similar')?.match;
    expect(m).toBeDefined();
    expect(areSimilarNotCongruent(m!.source, m!.target)).toBe(true);
  });

  it('keeps every vertex within its step grid bounds (>=1 cell margin)', () => {
    for (const step of congruenceSimilarityLesson.steps) {
      const grid = step.grid;
      if (!grid) continue;
      const collect: GridShape[] = [...(grid.shapes ?? [])];
      if (step.match) collect.push(step.match.source, step.match.target);
      for (const shape of collect) {
        for (const p of shape.vertices) {
          expect(p.x).toBeGreaterThanOrEqual(grid.xMin + 1);
          expect(p.x).toBeLessThanOrEqual(grid.xMax - 1);
          expect(p.y).toBeGreaterThanOrEqual(grid.yMin + 1);
          expect(p.y).toBeLessThanOrEqual(grid.yMax - 1);
        }
      }
    }
  });

  it('points every choice substep correctChoice at an existing choice id', () => {
    for (const step of congruenceSimilarityLesson.steps) {
      for (const ss of step.subSteps ?? []) {
        if (ss.kind !== 'choice') continue;
        const ids = (ss.choices ?? []).map((c) => c.id);
        expect(ids).toContain(ss.correctChoice);
      }
    }
  });

  // --- Style guards ------------------------------------------------------

  it('writes math with LaTeX, never raw unicode math glyphs', () => {
    const banned = /[²√½×÷·]/;
    for (const text of displayStrings()) {
      expect(text).not.toMatch(banned);
    }
  });

  it('uses academic diction (no banned casual phrasing)', () => {
    const banned = [
      'plug in',
      'plug it in',
      'plug them into',
      'straight up',
      'slanted',
      'sideways',
      'the bottom side',
    ];
    for (const text of displayStrings()) {
      const lower = text.toLowerCase();
      for (const phrase of banned) {
        expect(lower).not.toContain(phrase);
      }
    }
  });
});
