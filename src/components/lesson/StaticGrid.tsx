import type { GridContent, GridPoint } from '@/types/lesson';

export interface StaticGridShape {
  id: string;
  vertices: GridPoint[];
  label?: string;
  /** Visual style: two solid palettes plus a dashed ghost outline. */
  variant?: 'a' | 'b' | 'ghost';
}

interface StaticGridProps {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  shapes: StaticGridShape[];
}

const DESIGN = 300;
const PAD = 22;

const STYLES: Record<NonNullable<StaticGridShape['variant']>, { stroke: string; fill: string; dash?: string }> = {
  a: { stroke: '#6366f1', fill: 'rgba(99,102,241,0.16)' },
  b: { stroke: '#0ea5e9', fill: 'rgba(14,165,233,0.16)' },
  ghost: { stroke: '#22c55e', fill: 'rgba(34,197,94,0.08)', dash: '6 6' },
};

/** Read-only SVG coordinate grid that draws labeled polygons. */
export function StaticGrid({ xMin, xMax, yMin, yMax, shapes }: StaticGridProps) {
  const spanX = xMax - xMin;
  const spanY = yMax - yMin;
  const unit = DESIGN / Math.max(spanX, spanY);
  const plotW = spanX * unit;
  const plotH = spanY * unit;
  const w = plotW + PAD * 2;
  const h = plotH + PAD * 2;

  const sx = (x: number) => PAD + (x - xMin) * unit;
  const sy = (y: number) => PAD + (yMax - y) * unit;

  const gridXs: number[] = [];
  for (let x = xMin; x <= xMax; x += 1) gridXs.push(x);
  const gridYs: number[] = [];
  for (let y = yMin; y <= yMax; y += 1) gridYs.push(y);

  const showXAxis = yMin <= 0 && yMax >= 0;
  const showYAxis = xMin <= 0 && xMax >= 0;
  const tickStep = Math.max(spanX, spanY) > 14 ? 2 : 1;

  const centroid = (vs: GridPoint[]): GridPoint => ({
    x: vs.reduce((s, p) => s + p.x, 0) / vs.length,
    y: vs.reduce((s, p) => s + p.y, 0) / vs.length,
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="graph-svg static-grid-svg" aria-hidden="true">
      {gridXs.map((x) => (
        <line key={`gx-${x}`} x1={sx(x)} y1={PAD} x2={sx(x)} y2={h - PAD} className="graph-grid" />
      ))}
      {gridYs.map((y) => (
        <line key={`gy-${y}`} x1={PAD} y1={sy(y)} x2={w - PAD} y2={sy(y)} className="graph-grid" />
      ))}

      {showXAxis && <line x1={PAD} y1={sy(0)} x2={w - PAD} y2={sy(0)} className="graph-axis" />}
      {showYAxis && <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={h - PAD} className="graph-axis" />}

      {gridXs
        .filter((x) => x !== 0 && x % tickStep === 0)
        .map((x) => (
          <text key={`tx-${x}`} x={sx(x)} y={h - PAD + 14} textAnchor="middle" className="graph-tick">
            {x}
          </text>
        ))}
      {gridYs
        .filter((y) => y !== 0 && y % tickStep === 0)
        .map((y) => (
          <text key={`ty-${y}`} x={PAD - 6} y={sy(y) + 4} textAnchor="end" className="graph-tick">
            {y}
          </text>
        ))}

      {shapes.map((shape) => {
        const style = STYLES[shape.variant ?? 'a'];
        const pts = shape.vertices.map((v) => `${sx(v.x)},${sy(v.y)}`).join(' ');
        const c = centroid(shape.vertices);
        // Place the label below the shape (just under its lowest vertex) to
        // avoid overlapping the polygon or other shapes.
        const labelY = Math.max(...shape.vertices.map((v) => sy(v.y))) + 16;
        return (
          <g key={shape.id}>
            <polygon
              points={pts}
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={2}
              strokeDasharray={style.dash}
              strokeLinejoin="round"
            />
            {shape.label && (
              <text x={sx(c.x)} y={labelY} textAnchor="middle" className="static-grid-label" fill={style.stroke}>
                {shape.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Maps a content GridContent (reference shapes) to StaticGrid shapes. */
export function gridShapes(grid: GridContent): StaticGridShape[] {
  return (grid.shapes ?? []).map((s, i) => ({
    id: s.id,
    vertices: s.vertices,
    label: s.label,
    variant: i === 0 ? 'a' : 'b',
  }));
}
