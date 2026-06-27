import type { AngleFigure, FigureLabel } from '@/types/lesson';

const W = 320;
const H = 260;
const TOP_Y = 90;
const BOTTOM_Y = 180;
const CENTER_X = W / 2;
const LINE_X0 = 18;
const LINE_X1 = W - 18;
/**
 * Angle values sit mostly out to the side of a crossing (a large horizontal
 * offset) and only slightly above/below it (a small vertical offset), so the
 * number never lands on the transversal or a parallel line. The downward
 * offset is a touch larger than the upward one to leave room for the glyphs,
 * which rise from the SVG text baseline.
 */
const LABEL_H = 30;
const LABEL_V_UP = 13;
const LABEL_V_DOWN = 20;
/** How far the transversal runs past each intersection. */
const EXTEND = 46;

/** Diagonal direction (in SVG pixels) for each clockwise-from-top-left slot. */
const QUADRANT: Record<string, { dx: number; dy: number }> = {
  '1': { dx: -1, dy: -1 },
  '2': { dx: 1, dy: -1 },
  '3': { dx: 1, dy: 1 },
  '4': { dx: -1, dy: 1 },
};

interface ParallelLinesFigureProps {
  figure: AngleFigure;
}

export function ParallelLinesFigure({ figure }: ParallelLinesFigureProps) {
  // Acute inclination of the transversal, clamped only so the drawing stays on
  // screen; the labelled relationships do not depend on the exact angle.
  const angle = Math.min(80, Math.max(28, figure.baseAngle ?? 55));
  const theta = (angle * Math.PI) / 180;

  const gap = BOTTOM_Y - TOP_Y;
  const dxOffset = gap / Math.tan(theta);
  const topX = CENTER_X - dxOffset / 2;
  const bottomX = CENTER_X + dxOffset / 2;

  const len = Math.hypot(dxOffset, gap);
  const ux = dxOffset / len;
  const uy = gap / len;
  const tEnd: [number, number] = [topX - ux * EXTEND, TOP_Y - uy * EXTEND];
  const bEnd: [number, number] = [
    bottomX + ux * EXTEND,
    BOTTOM_Y + uy * EXTEND,
  ];

  const intersection = (which: string): { x: number; y: number } | null => {
    if (which === 't') return { x: topX, y: TOP_Y };
    if (which === 'b') return { x: bottomX, y: BOTTOM_Y };
    return null;
  };

  const slotPoint = (slot: string): { x: number; y: number } | null => {
    const which = slot[0];
    const corner = slot.slice(1);
    const q = QUADRANT[corner];
    const center = intersection(which);
    if (!q || !center) return null;
    const vOffset = q.dy < 0 ? LABEL_V_UP : LABEL_V_DOWN;
    return { x: center.x + q.dx * LABEL_H, y: center.y + q.dy * vOffset };
  };

  /**
   * Build an SVG arc symbol marking the angle in a slot's quadrant: a small
   * polyline sweeping the minor arc between the parallel-line ray and the
   * transversal ray that bound that corner.
   */
  const arcPath = (slot: string): string | null => {
    const which = slot[0];
    const corner = slot.slice(1);
    const center = intersection(which);
    if (!center) return null;
    // Ray along the parallel line: left for corners 1/4, right for 2/3.
    const horiz: [number, number] =
      corner === '1' || corner === '4' ? [-1, 0] : [1, 0];
    // Ray along the transversal: up for corners 1/2, down for 3/4.
    const trans: [number, number] =
      corner === '1' || corner === '2' ? [-ux, -uy] : [ux, uy];
    const a1 = Math.atan2(horiz[1], horiz[0]);
    const a2 = Math.atan2(trans[1], trans[0]);
    let delta = a2 - a1;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;
    const r = 15;
    const steps = 14;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const a = a1 + (delta * i) / steps;
      const px = center.x + r * Math.cos(a);
      const py = center.y + r * Math.sin(a);
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`);
    }
    return pts.join(' ');
  };

  const labels = (figure.labels ?? [])
    .map((label: FigureLabel) => {
      const base = slotPoint(label.at);
      const pt = base
        ? { x: base.x + (label.offset?.dx ?? 0), y: base.y + (label.offset?.dy ?? 0) }
        : null;
      return { label, pt, arc: arcPath(label.at) };
    })
    .filter(
      (entry): entry is {
        label: FigureLabel;
        pt: { x: number; y: number };
        arc: string | null;
      } => entry.pt !== null,
    );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="triangle-svg" aria-hidden="true">
      {/* Two parallel lines. */}
      <line x1={LINE_X0} y1={TOP_Y} x2={LINE_X1} y2={TOP_Y} stroke="#6366f1" strokeWidth="2.5" />
      <line x1={LINE_X0} y1={BOTTOM_Y} x2={LINE_X1} y2={BOTTOM_Y} stroke="#6366f1" strokeWidth="2.5" />

      {/* Transversal. */}
      <line
        x1={tEnd[0]}
        y1={tEnd[1]}
        x2={bEnd[0]}
        y2={bEnd[1]}
        stroke="#f59e0b"
        strokeWidth="2.5"
      />

      {/* Intersection dots. */}
      <circle cx={topX} cy={TOP_Y} r={3} fill="#312e81" />
      <circle cx={bottomX} cy={BOTTOM_Y} r={3} fill="#312e81" />

      {labels.map(({ label, pt, arc }, i) => {
        const isUnknown = label.text === '?';
        const highlighted = isUnknown || label.highlight;
        const arcStroke = isUnknown ? '#b45309' : highlighted ? '#4338ca' : '#312e81';
        return (
          <g key={`${label.at}-${i}`}>
            {arc && (
              <path
                d={arc}
                fill="none"
                stroke={arcStroke}
                strokeWidth={highlighted ? 2.5 : 1.8}
                strokeLinecap="round"
              />
            )}
            {highlighted && (
              <circle cx={pt.x} cy={pt.y - 4} r={13} fill={isUnknown ? '#fde68a' : 'rgba(99, 102, 241, 0.18)'} />
            )}
            <text
              x={pt.x}
              y={pt.y}
              textAnchor="middle"
              fontWeight={highlighted ? 700 : 600}
              fill={isUnknown ? '#b45309' : highlighted ? '#4338ca' : '#312e81'}
              className="side-label"
            >
              {isUnknown ? '?' : `${label.text}\u00b0`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
