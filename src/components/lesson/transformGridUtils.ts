import type { GridPoint, TransformOp } from '@/types/lesson';

const EPSILON = 1e-6;

/** Normalize a coordinate so that -0 reads as 0. */
function clean(value: number): number {
  return value === 0 ? 0 : value;
}

/** Shift a point by (dx, dy). */
export function translate(p: GridPoint, dx: number, dy: number): GridPoint {
  return { x: p.x + dx, y: p.y + dy };
}

/**
 * Reflect a point across an axis.
 * - 'x': across the x-axis, (x, y) -> (x, -y)
 * - 'y': across the y-axis, (x, y) -> (-x, y)
 */
export function reflect(p: GridPoint, axis: 'x' | 'y'): GridPoint {
  if (axis === 'x') return { x: p.x, y: clean(-p.y) };
  return { x: clean(-p.x), y: p.y };
}

/** Rotate a point by 90/180/270 degrees about `center`. */
export function rotate(
  p: GridPoint,
  center: GridPoint,
  degrees: 90 | 180 | 270,
  direction: 'cw' | 'ccw',
): GridPoint {
  const X = p.x - center.x;
  const Y = p.y - center.y;

  // Reduce every case to an effective 90 ccw / 180 / 90 cw rotation.
  let rx: number;
  let ry: number;
  if (degrees === 180) {
    rx = -X;
    ry = -Y;
  } else {
    // 270 is the opposite turn of 90.
    const ccw = degrees === 90 ? direction === 'ccw' : direction === 'cw';
    if (ccw) {
      rx = -Y;
      ry = X;
    } else {
      rx = Y;
      ry = -X;
    }
  }

  return {
    x: Math.round(rx + center.x),
    y: Math.round(ry + center.y),
  };
}

/** Scale a point away from `center` by `factor`. */
export function dilate(p: GridPoint, center: GridPoint, factor: number): GridPoint {
  return {
    x: center.x + (p.x - center.x) * factor,
    y: center.y + (p.y - center.y) * factor,
  };
}

/** Apply a single transformation op to a point, dispatching on `op.kind`. */
export function applyOp(p: GridPoint, op: TransformOp): GridPoint {
  switch (op.kind) {
    case 'translate': {
      const { dx, dy } = op.translate!;
      return translate(p, dx, dy);
    }
    case 'reflect':
      return reflect(p, op.reflect!.axis);
    case 'rotate': {
      const { center, degrees, direction } = op.rotate!;
      return rotate(p, center, degrees, direction);
    }
    case 'dilate': {
      const { center, factor } = op.dilate!;
      return dilate(p, center, factor);
    }
  }
}

/** Apply each op (in order) to every vertex. */
export function applyOps(vertices: GridPoint[], ops: TransformOp[]): GridPoint[] {
  return vertices.map((vertex) =>
    ops.reduce((point, op) => applyOp(point, op), vertex),
  );
}

/** Snap a continuous value onto the integer grid. */
export function snapToGrid(value: number): number {
  return Math.round(value);
}

/**
 * Order-independent comparison of two vertex lists. Returns true when both
 * contain the same multiset of points (within epsilon), false otherwise.
 */
export function verticesMatch(a: GridPoint[], b: GridPoint[]): boolean {
  if (a.length !== b.length) return false;

  const remaining = b.map((p) => ({ ...p, used: false }));
  for (const point of a) {
    const idx = remaining.findIndex(
      (cand) =>
        !cand.used &&
        Math.abs(cand.x - point.x) < EPSILON &&
        Math.abs(cand.y - point.y) < EPSILON,
    );
    if (idx === -1) return false;
    remaining[idx].used = true;
  }
  return true;
}
