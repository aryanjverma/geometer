import { describe, it, expect } from 'vitest';
import {
  REVIEW_FORMATS,
  YOU_DO_STEPS,
  DERIVE_PERIMETER_CONFIGS,
  PERIMETER_TRIANGLES,
  getFormatForStep,
} from './reviewFormats';
import type { GeneratedQuestion, QuestionFormat } from '@/types/review';
import type { LessonStep } from '@/types/lesson';

/** Deterministic PRNG so generation is reproducible across seeds. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const IN_SCOPE = [
  'right-triangles',
  'non-right-triangles',
  'distance-coordinate-plane',
  'transformations',
  'congruence-similarity',
];

/** The ground-truth final answer the learner must type, by step shape. */
function finalAnswer(step: LessonStep): number {
  switch (step.type) {
    case 'leg-then-perimeter':
    case 'multi-part-numeric':
      return step.parts![step.parts!.length - 1].answer;
    case 'distance-problem':
      return step.subSteps![step.subSteps!.length - 1].answer!;
    default:
      return step.answer!;
  }
}

/**
 * The "right answer" bubble (`feedback.correct`) the renderer reveals once the
 * final graded part is answered. Mirrors the branch the UI takes per step shape.
 */
function correctFeedback(step: LessonStep): string | undefined {
  switch (step.type) {
    case 'leg-then-perimeter':
    case 'multi-part-numeric':
      return step.parts![step.parts!.length - 1].feedback?.correct;
    case 'distance-problem':
      return step.subSteps![step.subSteps!.length - 1].feedback?.correct;
    default:
      return step.feedback?.correct;
  }
}

const SEEDS = Array.from({ length: 250 }, (_, i) => i + 1);

/** Per-format independent recomputation of the ground-truth answer. */
const verifiers: Record<string, (q: GeneratedQuestion) => void> = {
  'rt-hypotenuse': (q) => {
    const { a, b } = q.params;
    expect(a * a + b * b).toBe(q.answer * q.answer);
  },
  'rt-area': (q) => {
    const { a, b } = q.params;
    expect(Number.isInteger((a * b) / 2)).toBe(true);
    expect(q.answer).toBe((a * b) / 2);
  },
  'rt-missing-leg-perimeter': (q) => {
    const { leg, hypotenuse } = q.params;
    const missing = Math.sqrt(hypotenuse * hypotenuse - leg * leg);
    expect(Number.isInteger(missing)).toBe(true);
    expect(q.answer).toBe(leg + missing + hypotenuse);
  },
  'rt-missing-leg-area': (q) => {
    const { leg, hypotenuse } = q.params;
    const missing = Math.sqrt(hypotenuse * hypotenuse - leg * leg);
    expect(Number.isInteger(missing)).toBe(true);
    expect(Number.isInteger((leg * missing) / 2)).toBe(true);
    expect(q.answer).toBe((leg * missing) / 2);
  },
  'nrt-area-base-height': (q) => {
    const { base, height } = q.params;
    expect(Number.isInteger((base * height) / 2)).toBe(true);
    expect(q.answer).toBe((base * height) / 2);
  },
  'nrt-derive-perimeter': (q) => {
    const { base, height, leftSplit, rightSplit } = q.params;
    const l = Math.sqrt(leftSplit * leftSplit + height * height);
    const r = Math.sqrt(rightSplit * rightSplit + height * height);
    expect(Number.isInteger(l)).toBe(true);
    expect(Number.isInteger(r)).toBe(true);
    expect(base).toBe(leftSplit + rightSplit);
    expect(q.answer).toBe(base + l + r);
    const tri = q.step.triangle as { sides?: [number, number] };
    expect(tri.sides).toEqual([l, r]);
  },
  'dist-two-points': (q) => {
    const { x1, y1, x2, y2 } = q.params;
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const c = Math.sqrt(dx * dx + dy * dy);
    expect(Number.isInteger(c)).toBe(true);
    expect(q.answer).toBe(c);
  },
  'dist-perimeter': (q) => {
    const { ax, ay, bx, by, cx, cy } = q.params;
    const d = (x1: number, y1: number, x2: number, y2: number) =>
      Math.hypot(x2 - x1, y2 - y1);
    const s1 = d(ax, ay, bx, by);
    const s2 = d(bx, by, cx, cy);
    const s3 = d(cx, cy, ax, ay);
    [s1, s2, s3].forEach((s) => expect(Number.isInteger(s)).toBe(true));
    expect(q.answer).toBe(s1 + s2 + s3);
  },
  'transform-translate': (q) => {
    const { x, dx } = q.params;
    expect(Number.isInteger(q.answer)).toBe(true);
    // Translation adds the x-shift to the x-coordinate.
    expect(q.answer).toBe(x + dx);
  },
  'transform-reflect': (q) => {
    const { x } = q.params;
    expect(Number.isInteger(q.answer)).toBe(true);
    // Reflection across the y-axis negates x.
    expect(q.answer).toBe(-x);
  },
  'transform-rotate': (q) => {
    const { x, y, degrees } = q.params;
    expect([90, 180, 270]).toContain(degrees);
    // Counterclockwise about the origin: 90 -> -y, 180 -> -x, 270 -> y (new x).
    const expected = degrees === 90 ? -y : degrees === 180 ? -x : y;
    expect(Number.isInteger(q.answer)).toBe(true);
    expect(q.answer).toBe(expected);
  },
  'transform-dilate': (q) => {
    const { x, k } = q.params;
    expect(Number.isInteger(q.answer)).toBe(true);
    // Dilation from the origin scales the x-coordinate by k.
    expect(q.answer).toBe(k * x);
  },
  'cs-side-length': (q) => {
    const { a, b } = q.params;
    expect(Number.isInteger(q.answer)).toBe(true);
    // The hypotenuse satisfies a^2 + b^2 = c^2 exactly.
    expect(a * a + b * b).toBe(q.answer * q.answer);
  },
  'cs-scale-ratio': (q) => {
    const { small, large } = q.params;
    expect(large % small).toBe(0);
    expect(Number.isInteger(q.answer)).toBe(true);
    expect(q.answer).toBe(large / small);
  },
};

const EXPECTED_FORMAT_IDS = [
  'rt-hypotenuse',
  'rt-area',
  'rt-missing-leg-perimeter',
  'rt-missing-leg-area',
  'nrt-area-base-height',
  'nrt-derive-perimeter',
  'dist-two-points',
  'dist-perimeter',
  'transform-translate',
  'transform-reflect',
  'transform-rotate',
  'transform-dilate',
  'cs-side-length',
  'cs-scale-ratio',
];

describe('REVIEW_FORMATS catalog', () => {
  it('exports exactly the in-scope computational formats', () => {
    expect(REVIEW_FORMATS.map((f) => f.formatId).sort()).toEqual(
      [...EXPECTED_FORMAT_IDS].sort(),
    );
  });

  it('every format targets one of the in-scope lessons', () => {
    for (const f of REVIEW_FORMATS) {
      expect(IN_SCOPE).toContain(f.lessonId);
    }
  });

  it('every format has a matching in-test verifier', () => {
    for (const f of REVIEW_FORMATS) {
      expect(typeof verifiers[f.formatId]).toBe('function');
    }
  });
});

describe('format generation is correct across many seeds', () => {
  for (const format of REVIEW_FORMATS) {
    it(`${format.formatId}: produces verifiable integer answers`, () => {
      const verify = verifiers[format.formatId];
      for (const seed of SEEDS) {
        const q = format.generate(mulberry32(seed));

        // Shared invariants.
        expect(q.formatId).toBe(format.formatId);
        expect(q.lessonId).toBe(format.lessonId);
        expect(IN_SCOPE).toContain(q.lessonId);
        expect(Number.isInteger(q.answer)).toBe(true);
        expect(finalAnswer(q.step)).toBe(q.answer);
        expect(typeof q.basePrompt).toBe('string');
        expect(q.basePrompt.length).toBeGreaterThan(0);
        for (const value of Object.values(q.params)) {
          expect(
            q.basePrompt.includes(String(value)),
            `basePrompt "${q.basePrompt}" missing param ${value}`,
          ).toBe(true);
        }

        // Format-specific ground-truth recomputation.
        verify(q);

        // The revealed "right answer" bubble must reflect THIS question's
        // random numbers — it must exist and contain the actual final answer,
        // never a stale hardcoded value.
        const bubble = correctFeedback(q.step);
        expect(
          bubble,
          `${format.formatId}: final part is missing a correct-feedback bubble`,
        ).toBeTruthy();
        expect(
          bubble!.includes(String(q.answer)),
          `${format.formatId}: correct bubble "${bubble}" omits answer ${q.answer}`,
        ).toBe(true);
      }
    });
  }
});

describe('curated configs satisfy their geometric invariants', () => {
  it('every derive-perimeter config has Pythagorean split sides', () => {
    expect(DERIVE_PERIMETER_CONFIGS.length).toBeGreaterThan(0);
    for (const c of DERIVE_PERIMETER_CONFIGS) {
      expect(c.leftSplit * c.leftSplit + c.height * c.height).toBe(
        c.sides[0] * c.sides[0],
      );
      expect(c.rightSplit * c.rightSplit + c.height * c.height).toBe(
        c.sides[1] * c.sides[1],
      );
    }
  });

  it('every perimeter triangle has integer side lengths summing to its perimeter', () => {
    expect(PERIMETER_TRIANGLES.length).toBeGreaterThan(0);
    for (const t of PERIMETER_TRIANGLES) {
      const [a, b, c] = t.vertices;
      const d = (p: [number, number], q: [number, number]) =>
        Math.hypot(q[0] - p[0], q[1] - p[1]);
      const s1 = d(a, b);
      const s2 = d(b, c);
      const s3 = d(c, a);
      [s1, s2, s3].forEach((s) => expect(Number.isInteger(s)).toBe(true));
      expect(t.sides).toEqual([s1, s2, s3]);
      expect(t.perimeter).toBe(s1 + s2 + s3);
    }
  });
});

describe('YOU_DO_STEPS registry', () => {
  it('only references the in-scope lessons', () => {
    expect(Object.keys(YOU_DO_STEPS).sort()).toEqual([...IN_SCOPE].sort());
  });

  it('lists the expected You-do step ids per lesson', () => {
    expect(YOU_DO_STEPS['right-triangles']).toEqual([
      'q1-hypotenuse',
      'q2-area',
      'q3-leg-then-perimeter',
      'q4-leg-then-area',
    ]);
    expect(YOU_DO_STEPS['non-right-triangles']).toEqual([
      'q1-area-base-height',
      'q2-derive-perimeter',
      'q4-perimeter-from-area',
    ]);
    expect(YOU_DO_STEPS['distance-coordinate-plane']).toEqual([
      'q1-distance',
      'q2-perimeter',
      'q3-right-triangle',
      'q4-journey',
    ]);
    expect(YOU_DO_STEPS['transformations']).toEqual([
      'q5-translate-point',
      'q6-reflect-point',
      'q7-rotate-point',
      'q8-dilate-point',
    ]);
    expect(YOU_DO_STEPS['congruence-similarity']).toEqual([
      'q5-side-length',
      'q6-scale-ratio',
    ]);
  });
});

describe('getFormatForStep', () => {
  const COVERED: ReadonlyArray<[string, string, string]> = [
    ['right-triangles', 'q1-hypotenuse', 'rt-hypotenuse'],
    ['right-triangles', 'q2-area', 'rt-area'],
    ['right-triangles', 'q3-leg-then-perimeter', 'rt-missing-leg-perimeter'],
    ['right-triangles', 'q4-leg-then-area', 'rt-missing-leg-area'],
    ['non-right-triangles', 'q1-area-base-height', 'nrt-area-base-height'],
    ['non-right-triangles', 'q2-derive-perimeter', 'nrt-derive-perimeter'],
    ['distance-coordinate-plane', 'q1-distance', 'dist-two-points'],
    ['distance-coordinate-plane', 'q2-perimeter', 'dist-perimeter'],
    ['transformations', 'q5-translate-point', 'transform-translate'],
    ['transformations', 'q6-reflect-point', 'transform-reflect'],
    ['transformations', 'q7-rotate-point', 'transform-rotate'],
    ['transformations', 'q8-dilate-point', 'transform-dilate'],
    ['congruence-similarity', 'q5-side-length', 'cs-side-length'],
    ['congruence-similarity', 'q6-scale-ratio', 'cs-scale-ratio'],
  ];

  it('returns the matching format for every covered You-do step', () => {
    for (const [lessonId, stepId, formatId] of COVERED) {
      const fmt = getFormatForStep(lessonId, stepId);
      expect(fmt?.formatId).toBe(formatId);
      expect(fmt?.lessonId).toBe(lessonId);
      expect(fmt?.sourceStepId).toBe(stepId);
    }
  });

  it('returns undefined for You-do steps that have no generator', () => {
    expect(getFormatForStep('non-right-triangles', 'q3-interactive-split')).toBeUndefined();
    expect(getFormatForStep('non-right-triangles', 'q4-perimeter-from-area')).toBeUndefined();
    expect(getFormatForStep('distance-coordinate-plane', 'q3-right-triangle')).toBeUndefined();
    expect(getFormatForStep('distance-coordinate-plane', 'q4-journey')).toBeUndefined();
  });

  it('returns undefined for unknown lessons or steps', () => {
    expect(getFormatForStep('right-triangles', 'intro')).toBeUndefined();
    expect(getFormatForStep('made-up-lesson', 'q1-hypotenuse')).toBeUndefined();
  });
});

// Type guard: REVIEW_FORMATS conforms to QuestionFormat[].
const _typecheck: QuestionFormat[] = REVIEW_FORMATS;
void _typecheck;
