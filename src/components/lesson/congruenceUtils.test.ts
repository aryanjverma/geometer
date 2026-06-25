import { describe, it, expect } from 'vitest';
import type { GridPoint } from '@/types/lesson';
import {
  distance,
  sideLengths,
  isCongruent,
  sideRatios,
  isSimilar,
} from './congruenceUtils';

// A right triangle with legs 3 and 4 (sides 3, 4, 5).
const triangle345: GridPoint[] = [
  { x: 0, y: 0 },
  { x: 3, y: 0 },
  { x: 0, y: 4 },
];

// A translated copy of triangle345 (+10, +10) — congruent and similar.
const triangle345Translated: GridPoint[] = [
  { x: 10, y: 10 },
  { x: 13, y: 10 },
  { x: 10, y: 14 },
];

// triangle345 scaled by 2 (sides 6, 8, 10) — similar but not congruent.
const triangle345Scaled: GridPoint[] = [
  { x: 0, y: 0 },
  { x: 6, y: 0 },
  { x: 0, y: 8 },
];

// A 5,5,6 isosceles triangle — neither congruent nor similar to 3-4-5.
const triangle556: GridPoint[] = [
  { x: 0, y: 0 },
  { x: 6, y: 0 },
  { x: 3, y: 4 },
];

const square2: GridPoint[] = [
  { x: 0, y: 0 },
  { x: 2, y: 0 },
  { x: 2, y: 2 },
  { x: 0, y: 2 },
];

describe('distance', () => {
  it('computes the Euclidean distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5);
  });

  it('is zero for coincident points', () => {
    expect(distance({ x: 2, y: 7 }, { x: 2, y: 7 })).toBe(0);
  });

  it('handles negative coordinates', () => {
    expect(distance({ x: -3, y: -4 }, { x: 0, y: 0 })).toBeCloseTo(5);
  });
});

describe('sideLengths', () => {
  it('returns consecutive side lengths including the closing side', () => {
    expect(sideLengths(triangle345)).toEqual([3, 5, 4]);
  });

  it('returns four equal sides for a square', () => {
    expect(sideLengths(square2)).toEqual([2, 2, 2, 2]);
  });

  it('returns [] for fewer than two vertices', () => {
    expect(sideLengths([])).toEqual([]);
    expect(sideLengths([{ x: 1, y: 1 }])).toEqual([]);
  });

  it('returns a single (doubled) side for two vertices', () => {
    expect(sideLengths([{ x: 0, y: 0 }, { x: 3, y: 0 }])).toEqual([3, 3]);
  });
});

describe('isCongruent', () => {
  it('is true for a translated copy', () => {
    expect(isCongruent(triangle345, triangle345Translated)).toBe(true);
  });

  it('is true regardless of vertex ordering (same multiset of sides)', () => {
    const reordered: GridPoint[] = [
      { x: 0, y: 4 },
      { x: 0, y: 0 },
      { x: 3, y: 0 },
    ];
    expect(isCongruent(triangle345, reordered)).toBe(true);
  });

  it('is false for a scaled copy', () => {
    expect(isCongruent(triangle345, triangle345Scaled)).toBe(false);
  });

  it('is false for a differently-shaped triangle', () => {
    expect(isCongruent(triangle345, triangle556)).toBe(false);
  });

  it('is false when side counts differ', () => {
    expect(isCongruent(triangle345, square2)).toBe(false);
  });
});

describe('sideRatios', () => {
  it('returns element-wise ratios of sorted side lengths (b/a)', () => {
    expect(sideRatios(triangle345, triangle345Scaled)).toEqual([2, 2, 2]);
  });

  it('returns all ones for congruent shapes', () => {
    const ratios = sideRatios(triangle345, triangle345Translated);
    expect(ratios).toHaveLength(3);
    ratios.forEach((r) => expect(r).toBeCloseTo(1));
  });

  it('returns [] when side counts differ', () => {
    expect(sideRatios(triangle345, square2)).toEqual([]);
  });
});

describe('isSimilar', () => {
  it('is true for a congruent (translated) copy', () => {
    expect(isSimilar(triangle345, triangle345Translated)).toBe(true);
  });

  it('is true for a scaled copy', () => {
    expect(isSimilar(triangle345, triangle345Scaled)).toBe(true);
  });

  it('is false for a differently-shaped triangle', () => {
    expect(isSimilar(triangle345, triangle556)).toBe(false);
  });

  it('is false when side counts differ', () => {
    expect(isSimilar(triangle345, square2)).toBe(false);
  });
});
