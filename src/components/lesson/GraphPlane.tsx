import type { GraphPoint, GraphSegment } from '@/types/lesson';

interface GraphPlaneProps {
  points: GraphPoint[];
  segments: GraphSegment[];
  /** Ids of segments that should be drawn (animated in). */
  activeSegmentIds: string[];
  highlight?: boolean;
  /** Ordered point ids a car marker drives along. */
  carPath?: string[];
  /** Index along carPath the car currently sits at / moves toward. */
  carIndex?: number;
  /** Duration of the current car move, in ms. */
  carLegMs?: number;
}

/** Pick a tick-label interval that keeps wide grids readable. */
function tickStepFor(span: number): number {
  if (span <= 14) return 1;
  if (span <= 30) return 2;
  return 5;
}

export function GraphPlane({
  points,
  segments,
  activeSegmentIds,
  carPath,
  carIndex = 0,
  carLegMs = 0,
}: GraphPlaneProps) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs) - 1;
  const xMax = Math.max(...xs) + 1;
  const yMin = Math.min(...ys) - 1;
  const yMax = Math.max(...ys) + 1;

  const spanX = xMax - xMin;
  const spanY = yMax - yMin;
  // Keep the plot a roughly fixed square footprint and let each axis pick its
  // own unit size, so lopsided point ranges (e.g. a tall, narrow span) still
  // fill a readable square instead of collapsing into a thin strip.
  const PLOT = 300;
  const unitX = PLOT / spanX;
  const unitY = PLOT / spanY;
  const pad = 26;

  const plotW = spanX * unitX;
  const plotH = spanY * unitY;
  const w = plotW + pad * 2;
  const h = plotH + pad * 2;

  // Data -> screen mapping (SVG y grows downward, so invert).
  const sx = (x: number) => pad + (x - xMin) * unitX;
  const sy = (y: number) => pad + (yMax - y) * unitY;

  const byId = new Map(points.map((p) => [p.id, p]));

  const xTickStep = tickStepFor(spanX);
  const yTickStep = tickStepFor(spanY);

  const gridXs: number[] = [];
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 1) gridXs.push(x);
  const gridYs: number[] = [];
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += 1) gridYs.push(y);

  const showXAxis = yMin <= 0 && yMax >= 0;
  const showYAxis = xMin <= 0 && xMax >= 0;

  const carPointId = carPath ? carPath[Math.min(carIndex, carPath.length - 1)] : undefined;
  const carPoint = carPointId ? byId.get(carPointId) : undefined;

  const renderSegment = (seg: GraphSegment) => {
    const from = byId.get(seg.from);
    const to = byId.get(seg.to);
    if (!from || !to) return null;

    const kind = seg.kind ?? 'dist';
    let x1: number;
    let y1: number;
    let x2: number;
    let y2: number;

    if (kind === 'dx') {
      // Horizontal leg along the "from" row.
      x1 = sx(from.x);
      y1 = sy(from.y);
      x2 = sx(to.x);
      y2 = sy(from.y);
    } else if (kind === 'dy') {
      // Vertical leg up to the "to" row, at the "to" column.
      x1 = sx(to.x);
      y1 = sy(from.y);
      x2 = sx(to.x);
      y2 = sy(to.y);
    } else {
      x1 = sx(from.x);
      y1 = sy(from.y);
      x2 = sx(to.x);
      y2 = sy(to.y);
    }

    const len = Math.hypot(x2 - x1, y2 - y1);
    const active = activeSegmentIds.includes(seg.id);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    let lx = mx;
    let ly = my;
    let labelAnchor: 'middle' | 'start' | 'end' = 'middle';
    if (kind === 'dx') {
      ly = my + 18;
    } else if (kind === 'dy') {
      lx = mx - 10;
      ly = my + 4;
      labelAnchor = 'end';
    } else {
      lx = mx - 12;
      ly = my - 8;
    }

    if (seg.labelOffset) {
      lx = mx + (seg.labelOffset.dx ?? 0);
      ly = my + (seg.labelOffset.dy ?? 0);
    }
    if (seg.labelAnchor) {
      labelAnchor = seg.labelAnchor;
    }

    return (
      <g key={seg.id}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          className={`graph-seg graph-seg-${kind} ${active ? 'graph-seg-active' : ''}`}
          style={{ strokeDasharray: len, strokeDashoffset: active ? 0 : len }}
        />
        {seg.label != null && active && (
          <text x={lx} y={ly} textAnchor={labelAnchor} className={`graph-seg-label graph-seg-label-${kind}`}>
            {seg.label}
          </text>
        )}
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="graph-svg" aria-hidden="true">
      {/* Gridlines */}
      {gridXs.map((x) => (
        <line key={`gx-${x}`} x1={sx(x)} y1={pad} x2={sx(x)} y2={h - pad} className="graph-grid" />
      ))}
      {gridYs.map((y) => (
        <line key={`gy-${y}`} x1={pad} y1={sy(y)} x2={w - pad} y2={sy(y)} className="graph-grid" />
      ))}

      {/* Axes */}
      {showXAxis && (
        <line x1={pad} y1={sy(0)} x2={w - pad} y2={sy(0)} className="graph-axis" />
      )}
      {showYAxis && (
        <line x1={sx(0)} y1={pad} x2={sx(0)} y2={h - pad} className="graph-axis" />
      )}

      {/* Tick labels along the bottom and left edges */}
      {gridXs
        .filter((x) => x % xTickStep === 0 && x !== 0)
        .map((x) => (
          <text key={`tx-${x}`} x={sx(x)} y={h - pad + 16} textAnchor="middle" className="graph-tick">
            {x}
          </text>
        ))}
      {gridYs
        .filter((y) => y % yTickStep === 0 && y !== 0)
        .map((y) => (
          <text key={`ty-${y}`} x={pad - 8} y={sy(y) + 4} textAnchor="end" className="graph-tick">
            {y}
          </text>
        ))}

      {/* Segments */}
      {segments.map(renderSegment)}

      {/* Points */}
      {points.map((p) => {
        const pos = p.labelPos ?? 'tr';
        const left = pos === 'tl' || pos === 'bl';
        const below = pos === 'br' || pos === 'bl';
        const lx = sx(p.x) + (p.labelOffset?.dx ?? (left ? -9 : 9));
        const ly = sy(p.y) + (p.labelOffset?.dy ?? (below ? 16 : -9));
        const anchor = p.labelOffset
          ? (p.labelOffset.dx ?? 0) < 0
            ? 'end'
            : 'start'
          : left
            ? 'end'
            : 'start';
        return (
          <g key={p.id}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r="5" className="graph-point" />
            <text x={lx} y={ly} textAnchor={anchor} className="graph-point-label">
              {p.label}
            </text>
          </g>
        );
      })}

      {/* Car marker that drives along carPath */}
      {carPoint && (
        <g
          className="graph-car"
          style={{
            transform: `translate(${sx(carPoint.x)}px, ${sy(carPoint.y)}px)`,
            transition: `transform ${carLegMs}ms linear`,
          }}
        >
          <text textAnchor="middle" dominantBaseline="central" transform="scale(-1, 1)">
            {'\u{1F697}'}
          </text>
        </g>
      )}
    </svg>
  );
}
