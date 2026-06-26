export const STAGE_W = 400;
export const STAGE_H = 260;
const ORIGIN_X = 40;
const ORIGIN_Y = 200;
const MAX_SCALE = 28;

/** Pixels-per-unit so the unwrapped chain fits the stage for any triple. */
export function computeScale(lengths: [number, number, number]): number {
  const total = lengths[0] + lengths[1] + lengths[2];
  const maxSide = Math.max(...lengths);
  // Width must hold the fully-unwrapped chain; height must hold the tallest
  // side when the triangle is folded (or a handle is swung straight up).
  const scaleW = (STAGE_W - ORIGIN_X - 30) / total;
  const scaleH = (ORIGIN_Y - 30) / maxSide;
  // Cap at MAX_SCALE so small triangles aren't huge, but never floor the value:
  // large triples (e.g. 9-40-41) need to shrink below any minimum to stay on
  // the stage, so the limiting fit dimension always wins.
  return Math.min(MAX_SCALE, scaleW, scaleH);
}

export function sidePoints(
  lengths: [number, number, number],
  angle2: number,
  angle3: number,
  scale: number,
): [number, number][] {
  const [l1, l2, l3] = lengths.map((l) => l * scale);
  const ox = ORIGIN_X;
  const oy = ORIGIN_Y;

  const p0: [number, number] = [ox, oy];
  const p1: [number, number] = [ox + l1, oy];
  const p2: [number, number] = [
    p1[0] + l2 * Math.cos(angle2),
    p1[1] + l2 * Math.sin(angle2),
  ];
  const p3: [number, number] = [
    p2[0] + l3 * Math.cos(angle2 + angle3),
    p2[1] + l3 * Math.sin(angle2 + angle3),
  ];

  return [p0, p1, p2, p3];
}

/** True when all three segments lie on one horizontal line (perimeter unwrapped). */
export function isUnfolded(points: [number, number][]): boolean {
  const [, p1, p2, p3] = points;
  const dy1 = Math.abs(p2[1] - p1[1]);
  const dy2 = Math.abs(p3[1] - p2[1]);
  const dy0 = Math.abs(p1[1] - points[0][1]);
  return dy0 < 8 && dy1 < 8 && dy2 < 8 && p3[0] > p1[0];
}

/** Closed right triangle: horizontal leg, vertical leg up, hypotenuse back to origin. */
export function initialAngles(lengths: [number, number, number]): {
  angle2: number;
  angle3: number;
} {
  const leg1 = lengths[0];
  const leg2 = lengths[1];
  const angle2 = -Math.PI / 2;
  const angle3 = Math.atan2(leg2, -leg1) - angle2;
  return { angle2, angle3 };
}

export function unfoldedAngles(): { angle2: number; angle3: number } {
  return { angle2: 0, angle3: 0 };
}

export function midpoint(a: [number, number], b: [number, number]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}
