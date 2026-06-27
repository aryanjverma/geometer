import { describe, expect, it } from 'vitest';
import { triangleAnglesLesson } from './triangle-angles';
import type { LessonStep } from '@/types/lesson';

/** `tag` is authored on steps but not part of the shared LessonStep type. */
type TaggedStep = LessonStep & { tag?: 'I do' | 'We do' | 'You do' };

const byId = (id: string): TaggedStep | undefined =>
  triangleAnglesLesson.steps.find((s) => s.id === id);

/** Map of figure-label slot -> display text for a triangle-angle step. */
function labelMap(id: string): Record<string, string> {
  const labels = byId(id)?.angleFigure?.labels ?? [];
  const out: Record<string, string> = {};
  for (const l of labels) out[l.at] = l.text;
  return out;
}

/** Slots whose label text is the literal `?`. */
function unknownSlots(id: string): string[] {
  const labels = byId(id)?.angleFigure?.labels ?? [];
  return labels.filter((l) => l.text === '?').map((l) => l.at);
}

/** Pull the integer degree value out of a LaTeX label such as `$65^\circ$`. */
function deg(text: string): number {
  const m = text.match(/(\d+)/);
  expect(m, `expected an integer in label "${text}"`).not.toBeNull();
  return Number.parseInt(m![1], 10);
}

/**
 * Collect every display string in the lesson (prompts, feedback, transition
 * CTAs, demo intro/reveals, guided prompts/feedback, and figure labels), so the
 * style guards run over everything a learner can read. Mirrors
 * congruence-similarity.test.ts `displayStrings()`.
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
  for (const step of triangleAnglesLesson.steps) {
    out.push(step.prompt);
    if (step.formula) out.push(step.formula);
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
    for (const l of step.angleFigure?.labels ?? []) out.push(l.text);
  }
  return out;
}

describe('triangle-angles lesson', () => {
  it('has the correct lessonId and title', () => {
    expect(triangleAnglesLesson.lessonId).toBe('triangle-angles');
    expect(triangleAnglesLesson.title).toBe('Triangles with Lines and Angles');
  });

  it('has the exact ordered list of steps', () => {
    const expected: Array<{ id: string; type: string }> = [
      { id: 'intro', type: 'transition' },
      { id: 'demo-exterior', type: 'demonstration' },
      { id: 'transition-wedo', type: 'transition' },
      { id: 'guided-exterior', type: 'guided' },
      { id: 'transition-youdo', type: 'transition' },
      { id: 'q1-exterior-sum', type: 'triangle-angle' },
      { id: 'q2-remote-interior', type: 'triangle-angle' },
      { id: 'q3-parallel-triangle', type: 'triangle-angle' },
      { id: 'q4-parallel-triangle-x', type: 'triangle-angle' },
    ];
    const actual = triangleAnglesLesson.steps.map((s) => ({
      id: s.id,
      type: s.type,
    }));
    expect(actual).toEqual(expected);
  });

  it('tags steps with the I do / We do / You do progression', () => {
    expect(byId('demo-exterior')?.tag).toBe('I do');
    expect(byId('guided-exterior')?.tag).toBe('We do');
    expect(byId('q1-exterior-sum')?.tag).toBe('You do');
    expect(byId('q2-remote-interior')?.tag).toBe('You do');
    expect(byId('q3-parallel-triangle')?.tag).toBe('You do');
    expect(byId('q4-parallel-triangle-x')?.tag).toBe('You do');
  });

  it('gives every step a non-empty prompt', () => {
    for (const step of triangleAnglesLesson.steps) {
      expect(typeof step.prompt).toBe('string');
      expect(step.prompt.length).toBeGreaterThan(0);
    }
  });

  it('builds the I-do demo as the exterior-angle proof', () => {
    const demo = byId('demo-exterior');
    expect(demo?.demo?.interactive).toBe('exterior-angle');
    expect(demo?.angleFigure).toBeDefined();
    expect(demo?.angleFigure?.kind).toBe('exterior-triangle');
    const reveals = demo?.demo?.reveals ?? [];
    expect(reveals.length).toBeGreaterThanOrEqual(2);
    expect(reveals.length).toBeLessThanOrEqual(4);
  });

  it('builds the We-do guided step with guided parts', () => {
    expect((byId('guided-exterior')?.guided ?? []).length).toBeGreaterThan(0);
  });

  it('shapes every You-do triangle-angle step correctly', () => {
    for (const id of [
      'q1-exterior-sum',
      'q2-remote-interior',
      'q3-parallel-triangle',
      'q4-parallel-triangle-x',
    ]) {
      const step = byId(id);
      expect(step?.angleFigure, `${id} angleFigure`).toBeDefined();
      expect(step?.angleFigure?.labels?.length, `${id} labels`).toBeGreaterThan(
        0,
      );
      expect(unknownSlots(id), `${id} exactly one "?"`).toHaveLength(1);
      expect(Number.isInteger(step?.answer), `${id} integer answer`).toBe(true);
      expect(step?.feedback, `${id} feedback`).toBeDefined();
    }
  });

  // --- Ground-truth correctness, recomputed from the figure labels ---------

  it('q1: exterior angle = sum of the two remote interior angles', () => {
    // Unknown is the exterior slot; the two vertices carry the remote interiors.
    expect(unknownSlots('q1-exterior-sum')).toEqual(['ext']);
    const m = labelMap('q1-exterior-sum');
    const truth = deg(m.A) + deg(m.B);
    expect(byId('q1-exterior-sum')?.answer).toBe(truth);
  });

  it('q2: remote interior = exterior angle - known remote interior', () => {
    // Unknown is vertex A; exterior and the other vertex (B) are given.
    expect(unknownSlots('q2-remote-interior')).toEqual(['A']);
    const m = labelMap('q2-remote-interior');
    const truth = deg(m.ext) - deg(m.B);
    expect(byId('q2-remote-interior')?.answer).toBe(truth);
  });

  it('q3: parallel line recovers angle B, then triangle sum gives angle C', () => {
    // A line through C parallel to AB makes angle B known by alternate interior
    // angles; with angle A given, the unknown interior angle C = 180 - A - B.
    expect(unknownSlots('q3-parallel-triangle')).toEqual(['C']);
    const m = labelMap('q3-parallel-triangle');
    const truth = 180 - deg(m.A) - deg(m.B);
    expect(byId('q3-parallel-triangle')?.answer).toBe(truth);
  });

  it('q4: parallel line gives angle B, then exterior theorem gives angle A', () => {
    // A corresponding angle fixes angle B; the exterior angle is given, so the
    // remaining remote interior angle A = exterior - B.
    expect(unknownSlots('q4-parallel-triangle-x')).toEqual(['A']);
    const m = labelMap('q4-parallel-triangle-x');
    const truth = deg(m.ext) - deg(m.B);
    expect(byId('q4-parallel-triangle-x')?.answer).toBe(truth);
  });

  // --- Style guards --------------------------------------------------------

  it('writes math with LaTeX, never raw unicode math glyphs', () => {
    const banned = /[²³½¼¾√×÷·°₀-₉⁰-⁹]/;
    for (const text of displayStrings()) {
      expect(text, `unicode math glyph in: ${text}`).not.toMatch(banned);
    }
  });

  it('has balanced dollar delimiters in every display string', () => {
    for (const text of displayStrings()) {
      const count = (text.match(/\$/g) ?? []).length;
      expect(count % 2, `unbalanced $ in: ${text}`).toBe(0);
    }
  });

  it('uses academic diction (no banned casual phrasing)', () => {
    const banned = [
      'plug in',
      'plug it in',
      'plug them',
      'plug the',
      'straight up',
      'slanted',
      'sideways',
      'the bottom side',
    ];
    for (const text of displayStrings()) {
      const lower = text.toLowerCase();
      for (const phrase of banned) {
        expect(lower, `banned phrase "${phrase}" in: ${text}`).not.toContain(
          phrase,
        );
      }
    }
  });
});
