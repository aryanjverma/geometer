import { describe, it, expect } from 'vitest';
import { distanceLesson } from './distance-coordinate-plane';
import type { DistanceSubStep, LessonStep } from '@/types/lesson';

/**
 * Collect every human-readable string that is rendered through <MathText>.
 * These are the only strings that should carry $...$ LaTeX. Graph point /
 * segment labels and numeric input field labels are rendered as raw text
 * (not via MathText), so they are intentionally excluded.
 */
function collectDisplayStrings(): { path: string; value: string }[] {
  const out: { path: string; value: string }[] = [];
  const push = (path: string, value: string | undefined) => {
    if (typeof value === 'string') out.push({ path, value });
  };

  distanceLesson.steps.forEach((step: LessonStep, i) => {
    const base = `steps[${i}](${step.id})`;
    push(`${base}.prompt`, step.prompt);
    push(`${base}.formula`, step.formula);
    push(`${base}.intro`, step.intro);
    push(`${base}.feedback.correct`, step.feedback?.correct);
    push(`${base}.feedback.wrong`, step.feedback?.wrong);
    push(`${base}.feedback.hint`, step.feedback?.hint);

    if (step.demo) {
      push(`${base}.demo.intro`, step.demo.intro);
      step.demo.reveals.forEach((rv, r) => {
        push(`${base}.demo.reveals[${r}].label`, rv.label);
        push(`${base}.demo.reveals[${r}].body`, rv.body);
        push(`${base}.demo.reveals[${r}].formula`, rv.formula);
      });
    }

    (step.subSteps ?? []).forEach((sub: DistanceSubStep, s) => {
      const sbase = `${base}.subSteps[${s}](${sub.id})`;
      push(`${sbase}.prompt`, sub.prompt);
      push(`${sbase}.feedback.correct`, sub.feedback?.correct);
      push(`${sbase}.feedback.wrong`, sub.feedback?.wrong);
      push(`${sbase}.feedback.hint`, sub.feedback?.hint);
      (sub.choices ?? []).forEach((c, ci) => {
        push(`${sbase}.choices[${ci}](${c.id}).label`, c.label);
      });
    });
  });

  return out;
}

describe('distanceLesson — LaTeX conversion', () => {
  // Raw math notation that must only ever appear inside $...$ spans.
  const BANNED_UNICODE: { name: string; ch: string }[] = [
    { name: 'Delta (Δ)', ch: '\u0394' },
    { name: 'superscript two (²)', ch: '\u00b2' },
    { name: 'square root (√)', ch: '\u221a' },
    { name: 'times (×)', ch: '\u00d7' },
    { name: 'minus sign (−)', ch: '\u2212' },
  ];

  it('contains no raw math unicode in any MathText display string', () => {
    const offenders: string[] = [];
    for (const { path, value } of collectDisplayStrings()) {
      for (const { name, ch } of BANNED_UNICODE) {
        if (value.includes(ch)) {
          offenders.push(`${path}: contains ${name} -> "${value}"`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('uses LaTeX commands instead of plain ASCII math symbols where math is present', () => {
    // Spot-check that key expressions were actually converted to LaTeX, not
    // merely stripped of unicode.
    const all = collectDisplayStrings().map((d) => d.value).join('\n');
    expect(all).toMatch(/\\Delta x/);
    expect(all).toMatch(/\\Delta y/);
    expect(all).toMatch(/\\sqrt\{/);
    expect(all).toMatch(/\^2/);
  });

  it('balances dollar-sign math delimiters in every display string', () => {
    const offenders: string[] = [];
    for (const { path, value } of collectDisplayStrings()) {
      const count = (value.match(/\$/g) ?? []).length;
      if (count % 2 !== 0) offenders.push(`${path}: odd $ count -> "${value}"`);
    }
    expect(offenders).toEqual([]);
  });
});

describe('distanceLesson — academic diction', () => {
  const BANNED_PHRASES: RegExp[] = [
    /straight up/i,
    /straight across/i,
    /\bplug\b/i,
  ];

  it('avoids casual phrasing in display strings', () => {
    const offenders: string[] = [];
    for (const { path, value } of collectDisplayStrings()) {
      for (const re of BANNED_PHRASES) {
        if (re.test(value)) offenders.push(`${path}: matches ${re} -> "${value}"`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('distanceLesson — structural invariants (must NOT change)', () => {
  it('preserves the ordered list of step ids and types', () => {
    const shape = distanceLesson.steps.map((s) => ({ id: s.id, type: s.type }));
    expect(shape).toEqual([
      { id: 'intro', type: 'transition' },
      { id: 'demo-distance', type: 'distance-demo' },
      { id: 'transition-wedo', type: 'transition' },
      { id: 'guided-distance', type: 'distance-guided' },
      { id: 'transition-youdo', type: 'transition' },
      { id: 'q1-distance', type: 'distance-problem' },
      { id: 'q2-perimeter', type: 'distance-problem' },
      { id: 'q3-right-triangle', type: 'distance-problem' },
      { id: 'q4-journey', type: 'distance-problem' },
    ]);
  });

  it('keeps every correctChoice pointing at an existing choice id', () => {
    for (const step of distanceLesson.steps) {
      for (const sub of step.subSteps ?? []) {
        if (sub.correctChoice) {
          const ids = (sub.choices ?? []).map((c) => c.id);
          expect(ids).toContain(sub.correctChoice);
        }
      }
    }
  });

  it('keeps the q3 right-triangle choice answer as "yes"', () => {
    const q3 = distanceLesson.steps.find((s) => s.id === 'q3-right-triangle')!;
    const isRight = (q3.subSteps ?? []).find((s) => s.id === 'is-right')!;
    expect(isRight.correctChoice).toBe('yes');
    expect((isRight.choices ?? []).map((c) => c.id)).toEqual(['yes', 'no']);
  });

  it('preserves all numeric answers exactly', () => {
    const byId = new Map(distanceLesson.steps.map((s) => [s.id, s]));
    const subById = (stepId: string) =>
      new Map((byId.get(stepId)!.subSteps ?? []).map((s) => [s.id, s]));

    const guided = subById('guided-distance');
    expect(guided.get('deltas')!.inputs?.map((i) => i.answer)).toEqual([8, 6]);
    expect(guided.get('d-squared')!.answer).toBe(100);
    expect(guided.get('d')!.answer).toBe(10);

    expect(subById('q1-distance').get('distance')!.answer).toBe(13);

    const q2 = subById('q2-perimeter');
    expect(q2.get('sides')!.inputs?.map((i) => i.answer)).toEqual([8, 5, 5]);
    expect(q2.get('perimeter')!.answer).toBe(18);

    const q3 = subById('q3-right-triangle');
    expect(q3.get('sides')!.inputs?.map((i) => i.answer)).toEqual([15, 20, 25]);

    const q4 = subById('q4-journey');
    expect(q4.get('leg1')!.answer).toBe(5);
    expect(q4.get('leg2')!.answer).toBe(10);
    expect(q4.get('total')!.answer).toBe(15);
  });

  it('preserves all point coordinates exactly', () => {
    const coords: Record<string, [number, number][]> = {};
    for (const step of distanceLesson.steps) {
      if (step.graph) {
        coords[step.id] = step.graph.points.map((p) => [p.x, p.y]);
      }
    }
    expect(coords).toEqual({
      'demo-distance': [
        [1, 2],
        [5, 5],
      ],
      'guided-distance': [
        [2, 1],
        [10, 7],
      ],
      'q1-distance': [
        [2, 3],
        [14, 8],
      ],
      'q2-perimeter': [
        [1, 1],
        [9, 1],
        [5, 4],
      ],
      'q3-right-triangle': [
        [12, 0],
        [24, 9],
        [0, 16],
      ],
      'q4-journey': [
        [1, 1],
        [5, 4],
        [11, 12],
      ],
    });
  });
});
