import { describe, expect, it } from 'vitest';
import { transformationsLesson } from './transformations';
import type {
  GridPoint,
  LessonStep,
  TransformContent,
  TransformOp,
} from '@/types/lesson';

/** The exact ordered structure the lesson must declare. */
const EXPECTED_STEPS: Array<{ id: string; type: string }> = [
  { id: 'intro', type: 'transition' },
  { id: 'demo-translate', type: 'transform-demo' },
  { id: 'guided-translate', type: 'transform-guided' },
  { id: 'demo-reflect', type: 'transform-demo' },
  { id: 'guided-reflect', type: 'transform-guided' },
  { id: 'demo-rotate', type: 'transform-demo' },
  { id: 'guided-rotate', type: 'transform-guided' },
  { id: 'demo-dilate', type: 'transform-demo' },
  { id: 'guided-dilate', type: 'transform-guided' },
  { id: 'transition-youdo', type: 'transition' },
  { id: 'q1-combo', type: 'transform-problem' },
  { id: 'q2-combo', type: 'transform-problem' },
  { id: 'q3-combo', type: 'transform-problem' },
  { id: 'q5-translate-point', type: 'coordinate-rule' },
  { id: 'q6-reflect-point', type: 'coordinate-rule' },
  { id: 'q7-rotate-point', type: 'coordinate-rule' },
  { id: 'q8-dilate-point', type: 'coordinate-rule' },
];

const EXPECTED_KIND: Record<string, TransformOp['kind']> = {
  'demo-translate': 'translate',
  'guided-translate': 'translate',
  'demo-reflect': 'reflect',
  'guided-reflect': 'reflect',
  'demo-rotate': 'rotate',
  'guided-rotate': 'rotate',
  'demo-dilate': 'dilate',
  'guided-dilate': 'dilate',
};

// --- Self-contained transform math (does NOT import transformGridUtils) ---

function applyOp(p: GridPoint, op: TransformOp): GridPoint {
  switch (op.kind) {
    case 'translate': {
      const { dx, dy } = op.translate!;
      return { x: p.x + dx, y: p.y + dy };
    }
    case 'reflect': {
      return op.reflect!.axis === 'x'
        ? { x: p.x, y: -p.y }
        : { x: -p.x, y: p.y };
    }
    case 'rotate': {
      const { center, degrees, direction } = op.rotate!;
      const X = p.x - center.x;
      const Y = p.y - center.y;
      let ccw = direction === 'ccw' ? degrees : 360 - degrees;
      ccw = ((ccw % 360) + 360) % 360;
      let nx = X;
      let ny = Y;
      if (ccw === 90) {
        nx = -Y;
        ny = X;
      } else if (ccw === 180) {
        nx = -X;
        ny = -Y;
      } else if (ccw === 270) {
        nx = Y;
        ny = -X;
      }
      return { x: nx + center.x, y: ny + center.y };
    }
    case 'dilate': {
      const { center, factor } = op.dilate!;
      return {
        x: center.x + (p.x - center.x) * factor,
        y: center.y + (p.y - center.y) * factor,
      };
    }
  }
}

/** Build the single op described directly on a demo/guided transform. */
function singleOp(t: TransformContent): TransformOp {
  return {
    kind: t.kind,
    translate: t.translate,
    reflect: t.reflect,
    rotate: t.rotate,
    dilate: t.dilate,
  };
}

/** Ordered op list for a transform: chained `steps` or the single declared op. */
function opsFor(t: TransformContent): TransformOp[] {
  return t.steps && t.steps.length > 0 ? t.steps : [singleOp(t)];
}

/**
 * Apply the ops in order, returning every vertex set encountered (source,
 * each intermediate, and final) so callers can bounds-check all of them.
 */
function allStages(t: TransformContent): GridPoint[][] {
  const ops = opsFor(t);
  const stages: GridPoint[][] = [t.source.vertices];
  let current = t.source.vertices;
  for (const op of ops) {
    current = current.map((p) => applyOp(p, op));
    stages.push(current);
  }
  return stages;
}

const byId = (id: string): LessonStep | undefined =>
  transformationsLesson.steps.find((s) => s.id === id);

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

/** Gather every learner-facing math/teaching string in the lesson. */
function collectMathStrings(steps: LessonStep[]): string[] {
  const strings: string[] = [];
  for (const step of steps) {
    if (step.prompt) strings.push(step.prompt);
    if (step.transform?.instruction) strings.push(step.transform.instruction);
    for (const reveal of step.demo?.reveals ?? []) {
      strings.push(reveal.label, reveal.body);
      if (reveal.formula) strings.push(reveal.formula);
    }
  }
  return strings;
}

describe('transformations content', () => {
  it('declares the correct lesson identity', () => {
    expect(transformationsLesson.lessonId).toBe('transformations');
    expect(transformationsLesson.title).toBe('Transformations');
  });

  it('has the exact ordered list of step ids and types', () => {
    const actual = transformationsLesson.steps.map((s) => ({
      id: s.id,
      type: s.type,
    }));
    expect(actual).toEqual(EXPECTED_STEPS);
  });

  it('gives every step a non-empty prompt', () => {
    for (const step of transformationsLesson.steps) {
      expect(typeof step.prompt).toBe('string');
      expect(step.prompt.trim().length).toBeGreaterThan(0);
    }
  });

  it('demo/guided steps carry the expected transform kind and a grid', () => {
    for (const [id, kind] of Object.entries(EXPECTED_KIND)) {
      const step = byId(id);
      expect(step, `step ${id} should exist`).toBeDefined();
      expect(step?.transform, `step ${id} needs a transform`).toBeDefined();
      expect(step?.transform?.kind).toBe(kind);
      expect(step?.grid, `step ${id} needs a grid`).toBeDefined();
    }
  });

  it('tags the I do / We do / You do phases correctly', () => {
    for (const id of ['demo-translate', 'demo-reflect', 'demo-rotate', 'demo-dilate']) {
      expect(byId(id)?.tag).toBe('I do');
    }
    for (const id of [
      'guided-translate',
      'guided-reflect',
      'guided-rotate',
      'guided-dilate',
    ]) {
      expect(byId(id)?.tag).toBe('We do');
    }
    for (const id of [
      'q1-combo',
      'q2-combo',
      'q3-combo',
      'q5-translate-point',
      'q6-reflect-point',
      'q7-rotate-point',
      'q8-dilate-point',
    ]) {
      expect(byId(id)?.tag).toBe('You do');
    }
  });

  it('demo steps include 2-4 reveals and an instruction', () => {
    for (const id of ['demo-translate', 'demo-reflect', 'demo-rotate', 'demo-dilate']) {
      const step = byId(id);
      const reveals = step?.demo?.reveals ?? [];
      expect(reveals.length).toBeGreaterThanOrEqual(2);
      expect(reveals.length).toBeLessThanOrEqual(4);
      expect(step?.transform?.instruction?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  it('guided steps include feedback with wrong + hint', () => {
    for (const id of [
      'guided-translate',
      'guided-reflect',
      'guided-rotate',
      'guided-dilate',
    ]) {
      const fb = byId(id)?.feedback;
      expect(fb?.wrong?.trim().length ?? 0).toBeGreaterThan(0);
      expect(fb?.hint?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  it('problem steps chain exactly two ops and provide an instruction', () => {
    for (const id of ['q1-combo', 'q2-combo', 'q3-combo']) {
      const t = byId(id)?.transform;
      expect(t?.steps?.length).toBe(2);
      expect(t?.instruction?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  it('computes the declared target correctly for every transform', () => {
    for (const step of transformationsLesson.steps) {
      const t = step.transform;
      if (!t) continue;
      const stages = allStages(t);
      const computed = stages[stages.length - 1];
      expect(computed, `target mismatch on ${step.id}`).toEqual(t.target);
    }
  });

  it('keeps every source, intermediate, and target vertex inside the grid', () => {
    for (const step of transformationsLesson.steps) {
      const t = step.transform;
      if (!t) continue;
      const grid = step.grid!;
      expect(grid, `step ${step.id} needs a grid`).toBeDefined();
      for (const stage of allStages(t)) {
        for (const v of stage) {
          expect(v.x, `${step.id} x=${v.x} out of bounds`).toBeGreaterThanOrEqual(grid.xMin);
          expect(v.x, `${step.id} x=${v.x} out of bounds`).toBeLessThanOrEqual(grid.xMax);
          expect(v.y, `${step.id} y=${v.y} out of bounds`).toBeGreaterThanOrEqual(grid.yMin);
          expect(v.y, `${step.id} y=${v.y} out of bounds`).toBeLessThanOrEqual(grid.yMax);
        }
      }
    }
  });

  it('uses LaTeX for math (no banned unicode math glyphs)', () => {
    const strings = collectMathStrings(transformationsLesson.steps);
    expect(strings.length).toBeGreaterThan(0);
    for (const text of strings) {
      expect(text, `banned glyph in: ${text}`).not.toMatch(/[²√½×÷·]/);
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
    for (const text of collectStrings(transformationsLesson)) {
      const lower = text.toLowerCase();
      for (const phrase of banned) {
        expect(lower, `banned phrase "${phrase}" in: ${text}`).not.toContain(phrase);
      }
    }
  });
});
