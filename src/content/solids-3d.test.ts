import { describe, expect, it } from 'vitest';
import { solids3dLesson } from './solids-3d';
import type { LessonStep, SolidFigure } from '@/types/lesson';

/** `tag` is authored on steps but not part of the shared LessonStep type. */
type TaggedStep = LessonStep & { tag?: 'I do' | 'We do' | 'You do' };

const byId = (id: string): TaggedStep | undefined =>
  solids3dLesson.steps.find((s) => s.id === id);

const solidOf = (id: string): SolidFigure | undefined => byId(id)?.solid;

/**
 * Recursively collect every human-readable string value in the lesson tree,
 * mirroring right-triangles.test.ts.
 */
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

const allStrings = collectStrings(solids3dLesson);

describe('solids-3d lesson: identity and structure', () => {
  it('has the correct lessonId and title', () => {
    expect(solids3dLesson.lessonId).toBe('solids-3d');
    expect(solids3dLesson.title).toBe('Circular 3D Shapes');
  });

  it('has the exact ordered list of steps', () => {
    const expected: Array<{ id: string; type: string }> = [
      { id: 'intro', type: 'transition' },
      { id: 'demo-cylinder', type: 'demonstration' },
      { id: 'transition-wedo', type: 'transition' },
      { id: 'guided-cylinder', type: 'guided' },
      { id: 'demo-cone', type: 'demonstration' },
      { id: 'guided-cone', type: 'guided' },
      { id: 'demo-sphere', type: 'demonstration' },
      { id: 'guided-sphere', type: 'guided' },
      { id: 'transition-youdo', type: 'transition' },
      { id: 'q1-cylinder-volume', type: 'solid-volume' },
      { id: 'q2-cone-volume', type: 'solid-volume' },
      { id: 'q3-sphere', type: 'solid-volume' },
      { id: 'q4-cone-radius-volume', type: 'cone-radius-volume' },
    ];
    const actual = solids3dLesson.steps.map((s) => ({ id: s.id, type: s.type }));
    expect(actual).toEqual(expected);
  });

  it('gives each of the three shapes an "I do" demo and a "We do" guided step', () => {
    expect(byId('demo-cylinder')?.tag).toBe('I do');
    expect(byId('guided-cylinder')?.tag).toBe('We do');
    expect(byId('demo-cone')?.tag).toBe('I do');
    expect(byId('guided-cone')?.tag).toBe('We do');
    expect(byId('demo-sphere')?.tag).toBe('I do');
    expect(byId('guided-sphere')?.tag).toBe('We do');
  });

  it('tags steps with the I do / We do / You do progression', () => {
    expect(byId('demo-cylinder')?.tag).toBe('I do');
    expect(byId('guided-cylinder')?.tag).toBe('We do');
    expect(byId('q1-cylinder-volume')?.tag).toBe('You do');
    expect(byId('q2-cone-volume')?.tag).toBe('You do');
    expect(byId('q3-sphere')?.tag).toBe('You do');
    expect(byId('q4-cone-radius-volume')?.tag).toBe('You do');
  });

  it('gives every step a non-empty prompt', () => {
    for (const step of solids3dLesson.steps) {
      expect(typeof step.prompt).toBe('string');
      expect(step.prompt.length).toBeGreaterThan(0);
    }
  });
});

describe('solids-3d lesson: demo steps', () => {
  it('demo-cone slices a cone with the slice-cone interactive and 2-4 reveals', () => {
    const demo = byId('demo-cone');
    expect(demo?.demo?.interactive).toBe('slice-cone');
    const reveals = demo?.demo?.reveals ?? [];
    expect(reveals.length).toBeGreaterThanOrEqual(2);
    expect(reveals.length).toBeLessThanOrEqual(4);
    expect(demo?.demo?.intro && demo.demo.intro.length).toBeGreaterThan(0);
  });

  it('demo-cone carries a cone solid whose dimensions form a Pythagorean triple', () => {
    const s = solidOf('demo-cone');
    expect(s?.kind).toBe('cone');
    expect(s?.radius).toBeDefined();
    expect(s?.height).toBeDefined();
    expect(s?.slant).toBeDefined();
    expect(s!.radius! ** 2 + s!.height! ** 2).toBe(s!.slant! ** 2);
  });

  it('demo-cylinder demonstrates a cylinder volume with reveals', () => {
    const demo = byId('demo-cylinder');
    expect(demo?.type).toBe('demonstration');
    expect(solidOf('demo-cylinder')?.kind).toBe('cylinder');
    expect((demo?.demo?.reveals ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it('demo-sphere demonstrates a sphere volume with reveals', () => {
    const demo = byId('demo-sphere');
    expect(demo?.type).toBe('demonstration');
    expect(solidOf('demo-sphere')?.kind).toBe('sphere');
    expect((demo?.demo?.reveals ?? []).length).toBeGreaterThanOrEqual(2);
  });
});

describe('solids-3d lesson: guided steps', () => {
  for (const [id, kind] of [
    ['guided-cylinder', 'cylinder'],
    ['guided-cone', 'cone'],
    ['guided-sphere', 'sphere'],
  ] as const) {
    it(`${id} walks a ${kind} volume problem together with guided parts`, () => {
      const g = byId(id);
      expect(solidOf(id)?.kind).toBe(kind);
      expect((g?.guided ?? []).length).toBeGreaterThan(0);
      for (const part of g!.guided!) {
        expect(part.prompt.length).toBeGreaterThan(0);
      }
    });
  }
});

describe('solids-3d lesson: You-do questions carry solids, answers, feedback', () => {
  for (const id of [
    'q1-cylinder-volume',
    'q2-cone-volume',
    'q3-sphere',
    'q4-cone-radius-volume',
  ]) {
    it(`${id} has a solid, an integer answer, and feedback`, () => {
      const step = byId(id);
      expect(step?.solid).toBeDefined();
      expect(typeof step?.answer).toBe('number');
      expect(Number.isInteger(step?.answer)).toBe(true);
      expect(step?.feedback).toBeDefined();
    });
  }
});

describe('solids-3d lesson: ground-truth correctness', () => {
  it('q1 cylinder volume coefficient equals radius^2 * height', () => {
    const s = solidOf('q1-cylinder-volume')!;
    expect(s.kind).toBe('cylinder');
    expect(byId('q1-cylinder-volume')?.answer).toBe(s.radius! ** 2 * s.height!);
  });

  it('q2 cone volume coefficient equals radius^2 * height / 3 and is an integer', () => {
    const s = solidOf('q2-cone-volume')!;
    expect(s.kind).toBe('cone');
    const coeff = (s.radius! ** 2 * s.height!) / 3;
    expect(Number.isInteger(coeff)).toBe(true);
    expect(byId('q2-cone-volume')?.answer).toBe(coeff);
  });

  it('q3 sphere VOLUME coefficient equals 4 * radius^3 / 3 and is an integer', () => {
    const s = solidOf('q3-sphere')!;
    expect(s.kind).toBe('sphere');
    const coeff = (4 * s.radius! ** 3) / 3;
    expect(Number.isInteger(coeff)).toBe(true);
    expect(byId('q3-sphere')?.answer).toBe(coeff);
  });

  it('q4 cone-radius-volume answer is the Pythagorean radius', () => {
    const s = solidOf('q4-cone-radius-volume')!;
    expect(s.kind).toBe('cone');
    const answer = byId('q4-cone-radius-volume')!.answer!;
    expect(answer ** 2 + s.height! ** 2).toBe(s.slant! ** 2);
    expect(answer).toBe(Math.sqrt(s.slant! ** 2 - s.height! ** 2));
  });

  it('q4 cone-radius-volume volumeAnswer is the cone volume coefficient of pi', () => {
    const step = byId('q4-cone-radius-volume')!;
    const s = step.solid!;
    const radius = step.answer!;
    const coeff = (radius ** 2 * s.height!) / 3;
    expect(Number.isInteger(coeff)).toBe(true);
    expect(typeof step.volumeAnswer).toBe('number');
    expect(Number.isInteger(step.volumeAnswer!)).toBe(true);
    expect(step.volumeAnswer).toBe(coeff);
  });

  it('q4 cone-radius-volume marks the radius as the unknown via a "?" label', () => {
    const s = solidOf('q4-cone-radius-volume')!;
    const rLabel = (s.labels ?? []).find((l) => l.at === 'r');
    expect(rLabel?.text).toBe('?');
  });
});

describe('solids-3d content: style guards', () => {
  it('contains no raw unicode math notation anywhere', () => {
    const banned = /[²³½¼¾√×÷·°₀-₉⁰-⁹]/;
    const offenders = allStrings.filter((s) => banned.test(s));
    expect(offenders).toEqual([]);
  });

  it('has balanced dollar delimiters in every string', () => {
    for (const s of allStrings) {
      const count = (s.match(/\$/g) ?? []).length;
      expect(count % 2, `Unbalanced $ in: ${s}`).toBe(0);
    }
  });

  it('keeps LaTeX commands inside $...$ math spans', () => {
    const latexToken = /(\\frac|\\sqrt|\\pi|\\times|\\text|\^)/g;
    for (const s of allStrings) {
      if (!latexToken.test(s)) continue;
      const outsideMath = s.replace(/\$[^$]*\$/g, '');
      expect(
        /(\\frac|\\sqrt|\\pi|\\times|\\text|\^)/.test(outsideMath),
        `LaTeX outside math in: ${s}`,
      ).toBe(false);
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
    for (const text of allStrings) {
      const lower = text.toLowerCase();
      for (const phrase of banned) {
        expect(lower, `Matched "${phrase}" in: ${text}`).not.toContain(phrase);
      }
    }
  });

  it('asks for the coefficient of pi on each volume question', () => {
    for (const id of ['q1-cylinder-volume', 'q2-cone-volume', 'q3-sphere']) {
      expect(byId(id)?.prompt).toContain('\\pi');
    }
  });
});
