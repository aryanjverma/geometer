import type { SolidFigure } from '@/types/lesson';

interface Solid3DProps {
  figure: SolidFigure;
}

const STROKE = '#6366f1';
const FILL = 'rgba(99, 102, 241, 0.12)';
const HIDDEN = '#a5b4fc';

/** Look up a label's display text by slot, if present. */
function labelText(figure: SolidFigure, at: string): string | undefined {
  return figure.labels?.find((l) => l.at === at)?.text;
}

function isHighlight(figure: SolidFigure, at: string): boolean {
  return Boolean(figure.labels?.find((l) => l.at === at)?.highlight);
}

/** A dimension label, emphasized when it marks the unknown (`?`) or is flagged. */
function DimLabel({
  figure,
  at,
  x,
  y,
  anchor = 'middle',
}: {
  figure: SolidFigure;
  at: string;
  x: number;
  y: number;
  anchor?: 'start' | 'middle' | 'end';
}) {
  const text = labelText(figure, at);
  if (text == null) return null;
  const emphasize = text === '?' || isHighlight(figure, at);
  const unit = figure.unit && text !== '?' ? ` ${figure.unit}` : '';
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className="side-label"
      fill={emphasize ? '#b45309' : '#312e81'}
      fontWeight={emphasize ? 700 : 600}
    >
      {`${text}${unit}`}
    </text>
  );
}

/**
 * Static pseudo-3D figure for a cylinder, cone, or sphere. Dimension labels are
 * drawn from `figure.labels` at the slots r / h / l, with the unknown (`?`)
 * highlighted. Plain responsive SVG, sized like GeneralTriangle.
 */
export function Solid3D({ figure }: Solid3DProps) {
  const W = 240;
  const H = 240;

  if (figure.kind === 'cylinder') {
    const cx = W / 2;
    const bodyW = 120;
    const bodyH = 130;
    const ry = 20;
    const top = 50;
    const bottom = top + bodyH;
    const left = cx - bodyW / 2;
    const right = cx + bodyW / 2;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="triangle-svg" aria-hidden="true">
        <path
          d={`M ${left} ${top} L ${left} ${bottom} A ${bodyW / 2} ${ry} 0 0 0 ${right} ${bottom} L ${right} ${top}`}
          fill={FILL}
          stroke={STROKE}
          strokeWidth="2"
        />
        <ellipse
          cx={cx}
          cy={bottom}
          rx={bodyW / 2}
          ry={ry}
          fill="none"
          stroke={HIDDEN}
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <ellipse
          cx={cx}
          cy={top}
          rx={bodyW / 2}
          ry={ry}
          fill={FILL}
          stroke={STROKE}
          strokeWidth="2"
        />
        <line
          x1={cx}
          y1={top}
          x2={right}
          y2={top}
          stroke={STROKE}
          strokeWidth="1.5"
        />
        <line
          x1={right}
          y1={top}
          x2={right}
          y2={bottom}
          stroke={STROKE}
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <DimLabel figure={figure} at="r" x={(cx + right) / 2} y={top - 8} />
        <DimLabel figure={figure} at="h" x={right + 8} y={(top + bottom) / 2} anchor="start" />
      </svg>
    );
  }

  if (figure.kind === 'sphere') {
    const cx = W / 2;
    const cy = H / 2;
    const r = 90;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="triangle-svg" aria-hidden="true">
        <circle cx={cx} cy={cy} r={r} fill={FILL} stroke={STROKE} strokeWidth="2" />
        <ellipse
          cx={cx}
          cy={cy}
          rx={r}
          ry={r / 3.2}
          fill="none"
          stroke={HIDDEN}
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={STROKE} strokeWidth="1.5" />
        <DimLabel figure={figure} at="r" x={cx + r / 2} y={cy - 8} />
      </svg>
    );
  }

  // Cone: triangle silhouette + base ellipse.
  const cx = W / 2;
  const apexY = 30;
  const baseY = 200;
  const rx = 70;
  const left = cx - rx;
  const right = cx + rx;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="triangle-svg" aria-hidden="true">
      <path
        d={`M ${cx} ${apexY} L ${left} ${baseY} A ${rx} 18 0 0 0 ${right} ${baseY} Z`}
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2"
      />
      <ellipse
        cx={cx}
        cy={baseY}
        rx={rx}
        ry={18}
        fill="none"
        stroke={HIDDEN}
        strokeWidth="1.5"
        strokeDasharray="5 4"
      />
      {/* Height (apex to base center) and radius (base center to rim). */}
      <line
        x1={cx}
        y1={apexY}
        x2={cx}
        y2={baseY}
        stroke={STROKE}
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <line x1={cx} y1={baseY} x2={right} y2={baseY} stroke={STROKE} strokeWidth="1.5" />
      <DimLabel figure={figure} at="r" x={(cx + right) / 2} y={baseY + 12} />
      <DimLabel figure={figure} at="h" x={cx - 8} y={(apexY + baseY) / 2} anchor="end" />
      <DimLabel
        figure={figure}
        at="l"
        x={(cx + right) / 2 + 12}
        y={(apexY + baseY) / 2 - 6}
        anchor="start"
      />
    </svg>
  );
}
