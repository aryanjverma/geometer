import type { AngleFigure, FigureLabel } from '@/types/lesson';

interface TriangleAngleFigureProps {
  figure: AngleFigure;
  /**
   * When true, the unknown angle is revealed: labels flagged `revealOnSolve`
   * show their own value, and a `?` placeholder shows `revealValue` instead.
   * Either way the revealed label pops in with the shared reveal animation.
   */
  reveal?: boolean;
  /** Answer (in degrees) substituted for the `?` placeholder once revealed. */
  revealValue?: number;
}

/**
 * Convert the simple inline LaTeX used in figure labels (e.g. `$40^\circ$`,
 * `$A + B$`) into plain text suitable for an SVG `<text>` element, since KaTeX
 * cannot render inside raw SVG.
 */
function toDisplay(text: string): string {
  return text
    .replace(/\$/g, '')
    .replace(/\^\{?\\circ\}?/g, '\u00b0')
    .replace(/\\circ/g, '\u00b0')
    .replace(/\\,/g, ' ')
    .trim();
}

/**
 * Static labeled triangle for the triangle-angle lesson. Draws triangle ABC and,
 * when `figure.kind === 'exterior-triangle'`, extends base BC past C to D to show
 * the exterior angle at the `ext` slot. Labels are placed from `figure.labels`;
 * the unknown (`?`) or any highlighted label is emphasized.
 */
export function TriangleAngleFigure({
  figure,
  reveal,
  revealValue,
}: TriangleAngleFigureProps) {
  const W = 320;
  const H = 230;

  // Triangle vertices, chosen so the base sits low and the apex is up-left,
  // leaving room on the right to extend the base for the exterior angle.
  const A: [number, number] = [120, 40];
  const B: [number, number] = [50, 180];
  const C: [number, number] = [210, 180];
  const D: [number, number] = [290, 180];

  const isExterior = figure.kind === 'exterior-triangle';

  // Exterior angle arc at C: sweep from ray CD (the extended base, pointing
  // right) round to side CA, so the marker sits in the exterior angle above the
  // base rather than dipping below it.
  const extArcPath = (() => {
    const r = 24;
    const a0 = Math.atan2(D[1] - C[1], D[0] - C[0]); // ray CD (along the base)
    const a1 = Math.atan2(A[1] - C[1], A[0] - C[0]); // side CA (up toward apex)
    const steps = 18;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const a = a0 + ((a1 - a0) * i) / steps;
      const px = C[0] + r * Math.cos(a);
      const py = C[1] + r * Math.sin(a);
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`);
    }
    return pts.join(' ');
  })();

  const labelBy = (slot: string): FigureLabel | undefined =>
    figure.labels?.find((l) => l.at === slot);

  // Place each vertex/exterior label just inside or beside its corner.
  const slotPos: Record<string, [number, number]> = {
    A: [A[0] + 3, A[1] + 40],
    B: [B[0] + 30, B[1] - 14],
    // Sit inside the interior angle at C (along the CB/CA bisector), clear of the
    // CA edge and the exterior-angle arc that wraps the vertex.
    C: [C[0] - 30, C[1] - 14],
    ext: [(C[0] + D[0]) / 2, C[1] - 22],
  };

  const renderLabel = (slot: string) => {
    const label = labelBy(slot);
    if (!label) return null;
    const [x, y] = slotPos[slot];

    // Two reveal cases, both popping in via the shared `.side-label.reveal`
    // animation once `reveal` is true:
    //  - `revealOnSolve` labels carry their own value and show `?` until solved.
    //  - a `?` placeholder is replaced with `revealValue` (the step's answer).
    const hiddenUntilSolved = label.revealOnSolve === true;
    const isPlaceholder = label.text === '?';

    let display: string;
    let popIn = false;
    if (hiddenUntilSolved) {
      display = reveal ? toDisplay(label.text) : '?';
      popIn = reveal === true;
    } else if (isPlaceholder && reveal && revealValue != null) {
      display = `${revealValue}\u00b0`;
      popIn = true;
    } else {
      display = toDisplay(label.text);
    }

    const emphasized = label.highlight || display === '?';

    return (
      <text
        key={popIn ? `${slot}-revealed` : slot}
        x={x}
        y={y}
        textAnchor="middle"
        className={popIn ? 'side-label reveal' : `angle-label ${emphasized ? 'angle-label-unknown' : ''}`}
        fill={popIn ? undefined : emphasized ? '#b45309' : '#312e81'}
        fontSize={16}
        fontWeight="bold"
        fontFamily="Space Grotesk, sans-serif"
      >
        {display}
      </text>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="triangle-angle-svg"
      role="img"
      aria-label="Labeled triangle figure"
    >
      {isExterior && (
        <line
          x1={B[0]}
          y1={B[1]}
          x2={D[0]}
          y2={D[1]}
          stroke="#94a3b8"
          strokeWidth={2}
          strokeDasharray="6 4"
        />
      )}

      <polygon
        points={`${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]}`}
        fill="rgba(99, 102, 241, 0.12)"
        stroke="#6366f1"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {isExterior && (
        <path d={extArcPath} fill="none" stroke="#f59e0b" strokeWidth={2.5} />
      )}

      {(['A', 'B', 'C', 'ext'] as const).map((slot) => renderLabel(slot))}
    </svg>
  );
}
