import { describe, expect, it } from 'vitest';
import type { GridPoint, TransformOp } from '@/types/lesson';
import {
  translate,
  reflect,
  rotate,
  dilate,
  applyOp,
  applyOps,
  snapToGrid,
  verticesMatch,
} from './transformGridUtils';

describe('translate', () => {
  it('shifts a point by dx and dy', () => {
    expect(translate({ x: 2, y: 3 }, 4, -1)).toEqual({ x: 6, y: 2 });
  });

  it('handles negative shifts', () => {
    expect(translate({ x: 0, y: 0 }, -3, -5)).toEqual({ x: -3, y: -5 });
  });

  it('does not mutate the input point', () => {
    const p = { x: 1, y: 1 };
    translate(p, 5, 5);
    expect(p).toEqual({ x: 1, y: 1 });
  });
});

describe('reflect', () => {
  it('reflects across the x-axis: (x, y) -> (x, -y)', () => {
    expect(reflect({ x: 3, y: 4 }, 'x')).toEqual({ x: 3, y: -4 });
  });

  it('reflects across the y-axis: (x, y) -> (-x, y)', () => {
    expect(reflect({ x: 3, y: 4 }, 'y')).toEqual({ x: -3, y: 4 });
  });

  it('avoids -0 results', () => {
    expect(Object.is(reflect({ x: 0, y: 5 }, 'y').x, -0)).toBe(false);
    expect(Object.is(reflect({ x: 5, y: 0 }, 'x').y, -0)).toBe(false);
  });
});

describe('rotate about the origin', () => {
  const o: GridPoint = { x: 0, y: 0 };

  it('90 ccw maps (1, 0) -> (0, 1)', () => {
    expect(rotate({ x: 1, y: 0 }, o, 90, 'ccw')).toEqual({ x: 0, y: 1 });
  });

  it('90 cw maps (1, 0) -> (0, -1)', () => {
    expect(rotate({ x: 1, y: 0 }, o, 90, 'cw')).toEqual({ x: 0, y: -1 });
  });

  it('180 maps (2, 3) -> (-2, -3) regardless of direction', () => {
    expect(rotate({ x: 2, y: 3 }, o, 180, 'cw')).toEqual({ x: -2, y: -3 });
    expect(rotate({ x: 2, y: 3 }, o, 180, 'ccw')).toEqual({ x: -2, y: -3 });
  });

  it('270 ccw equals 90 cw', () => {
    const p = { x: 4, y: 1 };
    expect(rotate(p, o, 270, 'ccw')).toEqual(rotate(p, o, 90, 'cw'));
  });

  it('270 cw equals 90 ccw', () => {
    const p = { x: 4, y: 1 };
    expect(rotate(p, o, 270, 'cw')).toEqual(rotate(p, o, 90, 'ccw'));
  });
});

describe('rotate about a non-origin center', () => {
  const c: GridPoint = { x: 2, y: 1 };

  it('90 ccw about (2, 1): (4, 1) -> (2, 3)', () => {
    expect(rotate({ x: 4, y: 1 }, c, 90, 'ccw')).toEqual({ x: 2, y: 3 });
  });

  it('90 cw about (2, 1): (4, 1) -> (2, -1)', () => {
    expect(rotate({ x: 4, y: 1 }, c, 90, 'cw')).toEqual({ x: 2, y: -1 });
  });

  it('180 about (2, 1): (4, 1) -> (0, 1)', () => {
    expect(rotate({ x: 4, y: 1 }, c, 180, 'ccw')).toEqual({ x: 0, y: 1 });
  });

  it('270 ccw about (2, 1): (4, 1) -> (2, -1)', () => {
    expect(rotate({ x: 4, y: 1 }, c, 270, 'ccw')).toEqual({ x: 2, y: -1 });
  });

  it('produces clean integers with no -0', () => {
    const r = rotate({ x: 3, y: 1 }, c, 90, 'cw');
    expect(Object.is(r.x, -0)).toBe(false);
    expect(Object.is(r.y, -0)).toBe(false);
    expect(r).toEqual({ x: 2, y: 0 });
  });
});

describe('dilate', () => {
  it('scales by factor 2 about the origin', () => {
    expect(dilate({ x: 3, y: -2 }, { x: 0, y: 0 }, 2)).toEqual({ x: 6, y: -4 });
  });

  it('scales by factor 3 about a non-origin center', () => {
    expect(dilate({ x: 4, y: 5 }, { x: 1, y: 2 }, 3)).toEqual({ x: 10, y: 11 });
  });

  it('keeps the center fixed', () => {
    expect(dilate({ x: 2, y: 2 }, { x: 2, y: 2 }, 5)).toEqual({ x: 2, y: 2 });
  });
});

describe('applyOp', () => {
  it('dispatches translate', () => {
    const op: TransformOp = { kind: 'translate', translate: { dx: 1, dy: 2 } };
    expect(applyOp({ x: 0, y: 0 }, op)).toEqual({ x: 1, y: 2 });
  });

  it('dispatches reflect', () => {
    const op: TransformOp = { kind: 'reflect', reflect: { axis: 'y' } };
    expect(applyOp({ x: 3, y: 4 }, op)).toEqual({ x: -3, y: 4 });
  });

  it('dispatches rotate', () => {
    const op: TransformOp = {
      kind: 'rotate',
      rotate: { center: { x: 0, y: 0 }, degrees: 90, direction: 'ccw' },
    };
    expect(applyOp({ x: 1, y: 0 }, op)).toEqual({ x: 0, y: 1 });
  });

  it('dispatches dilate', () => {
    const op: TransformOp = {
      kind: 'dilate',
      dilate: { center: { x: 0, y: 0 }, factor: 2 },
    };
    expect(applyOp({ x: 2, y: 3 }, op)).toEqual({ x: 4, y: 6 });
  });
});

describe('applyOps', () => {
  it('applies a translate then a reflect to every vertex of a triangle', () => {
    const triangle: GridPoint[] = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 3 },
    ];
    const ops: TransformOp[] = [
      { kind: 'translate', translate: { dx: 1, dy: 1 } },
      { kind: 'reflect', reflect: { axis: 'x' } },
    ];
    // After translate: (1,1) (3,1) (1,4); after reflect across x: negate y.
    expect(applyOps(triangle, ops)).toEqual([
      { x: 1, y: -1 },
      { x: 3, y: -1 },
      { x: 1, y: -4 },
    ]);
  });

  it('returns the vertices unchanged when no ops are given', () => {
    const verts: GridPoint[] = [{ x: 5, y: 7 }];
    expect(applyOps(verts, [])).toEqual([{ x: 5, y: 7 }]);
  });
});

describe('snapToGrid', () => {
  it('rounds to the nearest integer', () => {
    expect(snapToGrid(2.4)).toBe(2);
    expect(snapToGrid(2.5)).toBe(3);
    expect(snapToGrid(-2.5)).toBe(-2);
    expect(snapToGrid(4)).toBe(4);
  });
});

describe('verticesMatch', () => {
  const tri: GridPoint[] = [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 3 },
  ];

  it('matches identical vertex lists', () => {
    expect(verticesMatch(tri, [...tri])).toBe(true);
  });

  it('matches regardless of order', () => {
    const shuffled: GridPoint[] = [
      { x: 0, y: 3 },
      { x: 0, y: 0 },
      { x: 2, y: 0 },
    ];
    expect(verticesMatch(tri, shuffled)).toBe(true);
  });

  it('returns false when a point differs', () => {
    const off: GridPoint[] = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 4 },
    ];
    expect(verticesMatch(tri, off)).toBe(false);
  });

  it('returns false when lengths differ', () => {
    expect(verticesMatch(tri, tri.slice(0, 2))).toBe(false);
  });

  it('tolerates tiny floating-point error within epsilon', () => {
    const nudged: GridPoint[] = [
      { x: 0, y: 0 },
      { x: 2 + 1e-9, y: 0 },
      { x: 0, y: 3 - 1e-9 },
    ];
    expect(verticesMatch(tri, nudged)).toBe(true);
  });

  it('matches duplicated points as a multiset (not just as a set)', () => {
    const a: GridPoint[] = [
      { x: 1, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ];
    const b: GridPoint[] = [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 2 },
    ];
    expect(verticesMatch(a, b)).toBe(false);
  });
});
