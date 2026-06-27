import { describe, expect, it } from 'vitest';
import { anglesLinesLesson } from './angles-lines';
import type { FigureLabel, LessonStep } from '@/types/lesson';

/** `tag` is authored on steps but not part of the shared LessonStep type. */
type TaggedStep = LessonStep & { tag?: 'I do' | 'We do' | 'You do' };

const byId = (id: string): TaggedStep | undefined =>
  anglesLinesLesson.steps.find((s) => s.id === id);

/** Given degree values for a step (every figure label that is not the `?`). */
function givens(id: string): number[] {
  const labels: FigureLabel[] = byId(id)?.angleFigure?.labels ?? [];
  return labels
    .filter((l) => l.text !== '?')
    .map((l) => Number.parseInt(l.text, 10));
}

/** Number of labels whose text is the literal `?`. */
function unknownCount(id: string): number {
  const labels: FigureLabel[] = byId(id)?.angleFigure?.labels ?? [];
  return labels.filter((l) => l.text === '?').length;
}

/**
 * Collect every human-readable display string in the lesson: prompts,
 * feedback, transition CTAs, demo intro/reveals, and guided prompts/feedback.
 * Excludes bare figure label values (mirrors how the congruence lesson
 * excludes raw grid labels).
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
  for (const step of anglesLinesLesson.steps) {
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
  }
  return out;
}

describe('angles-lines lesson', () => {
  it('has the correct lessonId and title', () => {
    expect(anglesLinesLesson.lessonId).toBe('angles-lines');
    expect(anglesLinesLesson.title).toBe('Angles and Lines');
  });

  it('has the exact ordered list of steps', () => {
    const expected: Array<{ id: string; type: string }> = [
      { id: 'intro', type: 'transition' },
      { id: 'demo-linear-pair', type: 'demonstration' },
      { id: 'demo-vertical', type: 'demonstration' },
      { id: 'demo-corresponding', type: 'demonstration' },
      { id: 'transition-wedo', type: 'transition' },
      { id: 'guided-combined', type: 'guided' },
      { id: 'transition-youdo', type: 'transition' },
      { id: 'q1-vertical-angles', type: 'find-angle' },
      { id: 'q2-linear-pair', type: 'find-angle' },
      { id: 'q3-corresponding-angle', type: 'find-angle' },
      { id: 'q4-missing-angle', type: 'find-angle' },
    ];
    const actual = anglesLinesLesson.steps.map((s) => ({
      id: s.id,
      type: s.type,
    }));
    expect(actual).toEqual(expected);
  });

  it('tags steps with the I do / We do / You do progression', () => {
    expect(byId('demo-linear-pair')?.tag).toBe('I do');
    expect(byId('demo-vertical')?.tag).toBe('I do');
    expect(byId('demo-corresponding')?.tag).toBe('I do');
    expect(byId('guided-combined')?.tag).toBe('We do');
    expect(byId('q1-vertical-angles')?.tag).toBe('You do');
    expect(byId('q2-linear-pair')?.tag).toBe('You do');
    expect(byId('q3-corresponding-angle')?.tag).toBe('You do');
    expect(byId('q4-missing-angle')?.tag).toBe('You do');
  });

  it('gives every step a non-empty prompt', () => {
    for (const step of anglesLinesLesson.steps) {
      expect(typeof step.prompt).toBe('string');
      expect(step.prompt.trim().length).toBeGreaterThan(0);
    }
  });

  it('has an I do demonstration for each of the three theorems', () => {
    for (const id of ['demo-linear-pair', 'demo-vertical', 'demo-corresponding']) {
      const demo = byId(id);
      expect(demo?.type, id).toBe('demonstration');
      expect(demo?.tag, id).toBe('I do');
      expect(demo?.angleFigure, id).toBeDefined();
      expect(demo?.angleFigure?.kind, id).toBe('parallel-lines');
      const reveals = demo?.demo?.reveals ?? [];
      expect(reveals.length, id).toBeGreaterThanOrEqual(2);
      expect(reveals.length, id).toBeLessThanOrEqual(4);
    }
  });

  it('keeps the slide-angles interactive on the corresponding-angles demo only', () => {
    expect(byId('demo-corresponding')?.demo?.interactive).toBe('slide-angles');
    expect(byId('demo-linear-pair')?.demo?.interactive).toBeUndefined();
    expect(byId('demo-vertical')?.demo?.interactive).toBeUndefined();
  });

  it('builds the We do step with three guided parts, one per theorem, each with a figure', () => {
    const guided = byId('guided-combined')?.guided ?? [];
    expect(guided.length).toBe(3);
    for (const part of guided) {
      expect(part.angleFigure, part.id).toBeDefined();
      expect(part.angleFigure?.kind, part.id).toBe('parallel-lines');
      expect(part.angleFigure?.labels?.some((l) => l.text === '?'), part.id).toBe(true);
    }
  });

  it('gives every find-angle step a parallel-lines figure, one unknown, an integer answer, and feedback', () => {
    for (const id of [
      'q1-vertical-angles',
      'q2-linear-pair',
      'q3-corresponding-angle',
      'q4-missing-angle',
    ]) {
      const step = byId(id);
      expect(step?.angleFigure, id).toBeDefined();
      expect(step?.angleFigure?.kind, id).toBe('parallel-lines');
      expect(unknownCount(id), id).toBe(1);
      expect(Number.isInteger(step?.answer), id).toBe(true);
      expect(step?.feedback, id).toBeDefined();
      expect(step?.feedback?.correct, id).toBeTruthy();
      expect(step?.feedback?.wrong, id).toBeTruthy();
      expect(step?.feedback?.hint, id).toBeTruthy();
      // Exactly one given value supports each single-unknown problem.
      expect(givens(id).length, id).toBe(1);
    }
  });

  // --- Ground-truth correctness (recomputed from the figure givens) -------

  it('q1 is the Vertical Angles Theorem: unknown equals the given angle', () => {
    const [g] = givens('q1-vertical-angles');
    expect(byId('q1-vertical-angles')?.answer).toBe(g);
  });

  it('q2 is the Linear Pair Theorem: unknown is the supplement of the given', () => {
    const [g] = givens('q2-linear-pair');
    expect(byId('q2-linear-pair')?.answer).toBe(180 - g);
  });

  it('q3 is the Corresponding Angles Postulate: unknown equals the given angle', () => {
    const [g] = givens('q3-corresponding-angle');
    expect(byId('q3-corresponding-angle')?.answer).toBe(g);
  });

  it('q4 chains corresponding then linear pair: unknown is the supplement of the given', () => {
    // Given the top angle t1, its same-side neighbour t2 is the linear-pair
    // supplement (180 - t1); the unknown b2 corresponds to t2, so b2 = 180 - t1.
    const [g] = givens('q4-missing-angle');
    expect(byId('q4-missing-angle')?.answer).toBe(180 - g);
  });

  // --- Style guards -------------------------------------------------------

  it('writes math with LaTeX, never raw unicode math glyphs', () => {
    const banned = /[\u00b2\u00b3\u00bd\u00bc\u00be\u221a\u00d7\u00f7\u00b7\u00b0\u2080-\u2089\u2070-\u2079]/;
    for (const text of displayStrings()) {
      expect(text, text).not.toMatch(banned);
    }
  });

  it('has balanced dollar delimiters in every display string', () => {
    for (const text of displayStrings()) {
      const count = (text.match(/\$/g) ?? []).length;
      expect(count % 2, `Unbalanced $ in: ${text}`).toBe(0);
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
        expect(lower, `"${phrase}" in: ${text}`).not.toContain(phrase);
      }
    }
  });
});
