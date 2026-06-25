import type { GridPoint } from '@/types/lesson';

const DEFAULT_EPSILON = 1e-6;

/** Euclidean distance between two grid points. */
export function distance(a: GridPoint, b: GridPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

/**
 * Lengths of each side of a polygon, in order, including the closing side
 * from the last vertex back to the first. Returns [] for fewer than 2 vertices.
 */
export function sideLengths(vertices: GridPoint[]): number[] {
  if (vertices.length < 2) return [];
  const lengths: number[] = [];
  for (let i = 0; i < vertices.length; i++) {
    const next = vertices[(i + 1) % vertices.length];
    lengths.push(distance(vertices[i], next));
  }
  return lengths;
}

function sortedSides(vertices: GridPoint[]): number[] {
  return sideLengths(vertices).slice().sort((a, b) => a - b);
}

/**
 * Side-length congruence heuristic: both polygons must have the same number of
 * sides and the same multiset of side lengths (compared within epsilon).
 */
export function isCongruent(
  a: GridPoint[],
  b: GridPoint[],
  epsilon: number = DEFAULT_EPSILON,
): boolean {
  const sa = sortedSides(a);
  const sb = sortedSides(b);
  if (sa.length === 0 || sa.length !== sb.length) return false;
  return sa.every((len, i) => Math.abs(len - sb[i]) <= epsilon);
}

/**
 * Element-wise ratios b[i]/a[i] of each polygon's ascending-sorted side
 * lengths. Returns [] when the side counts differ.
 */
export function sideRatios(a: GridPoint[], b: GridPoint[]): number[] {
  const sa = sortedSides(a);
  const sb = sortedSides(b);
  if (sa.length === 0 || sa.length !== sb.length) return [];
  return sa.map((len, i) => sb[i] / len);
}

/**
 * Similarity heuristic: both polygons must have the same number of sides and
 * all sorted side-length ratios (b/a) must be equal within epsilon.
 */
export function isSimilar(
  a: GridPoint[],
  b: GridPoint[],
  epsilon: number = DEFAULT_EPSILON,
): boolean {
  const ratios = sideRatios(a, b);
  if (ratios.length === 0) return false;
  const first = ratios[0];
  return ratios.every((r) => Math.abs(r - first) <= epsilon);
}
