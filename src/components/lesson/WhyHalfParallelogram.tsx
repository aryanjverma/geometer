import { useState } from 'react';
import { MathText } from '@/components/MathText';

interface WhyHalfParallelogramProps {
  /** Base length in lesson units. */
  base: number;
  /** Height in lesson units. */
  height: number;
}

/** Area of a parallelogram: base times height. */
export function parallelogramArea(base: number, height: number): number {
  return base * height;
}

/** Area of a triangle: half of base times height. */
export function triangleArea(base: number, height: number): number {
  return (base * height) / 2;
}

/**
 * An SVG interactive that justifies the triangle-area formula: duplicate the
 * triangle, rotate the copy 180 degrees, and snap the two together into a
 * parallelogram whose area is `bh`. The single triangle is therefore half of
 * it: `bh / 2`. SVG (not Konva) so it is queryable in jsdom for tests.
 */
export function WhyHalfParallelogram({ base, height }: WhyHalfParallelogramProps) {
  const [revealed, setRevealed] = useState(false);

  const unit = 200 / Math.max(base, height);
  const bw = base * unit;
  const hh = height * unit;
  // Apex sits a third of the way across so the triangle is clearly oblique.
  const apexFrac = 0.33;
  const ax = bw * apexFrac;

  const padL = 60;
  const padT = 30;
  const padR = 120;
  const padB = 50;
  const w = bw + padL + padR;
  const h = hh + padT + padB;

  // Original triangle vertices (SVG y grows downward).
  const A: [number, number] = [padL + ax, padT]; // apex (top)
  const B: [number, number] = [padL, padT + hh]; // bottom-left
  const C: [number, number] = [padL + bw, padT + hh]; // bottom-right

  // The copy is rotated 180 degrees about the midpoint of the right side (A-C),
  // which carries it up and to the right so the union is a parallelogram.
  const Mx = (A[0] + C[0]) / 2;
  const My = (A[1] + C[1]) / 2;

  const trianglePoints = `${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]}`;

  // Foot of the altitude: straight down from the apex onto the base line.
  const foot: [number, number] = [A[0], B[1]];
  const m = Math.min(12, hh * 0.4);

  return (
    <div className="why-parallelogram">
      <svg viewBox={`0 0 ${w} ${h}`} className="triangle-svg" aria-hidden="true">
        {/* The duplicate. Hidden and identity-placed until revealed, then it
            rotates 180 about M and fades in, sliding into place via CSS. */}
        <g
          className="why-copy"
          style={{
            transformOrigin: `${Mx}px ${My}px`,
            transform: revealed ? 'rotate(180deg)' : 'rotate(0deg)',
            opacity: revealed ? 1 : 0,
            transition: 'transform 700ms ease, opacity 500ms ease',
          }}
        >
          <polygon
            points={trianglePoints}
            fill="rgba(16, 185, 129, 0.18)"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
        </g>

        {/* The original triangle, always shown. */}
        <polygon
          points={trianglePoints}
          fill="rgba(99, 102, 241, 0.16)"
          stroke="#6366f1"
          strokeWidth="2"
        />

        {/* Dashed perpendicular height with a right-angle marker at its foot.
            Labelled once, on the original triangle only. */}
        <line
          x1={A[0]}
          y1={A[1]}
          x2={foot[0]}
          y2={foot[1]}
          stroke="#6366f1"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <polyline
          points={`${foot[0]},${foot[1] - m} ${foot[0] + m},${foot[1] - m} ${foot[0] + m},${foot[1]}`}
          fill="none"
          stroke="#6366f1"
          strokeWidth="1.5"
        />

        <text x={foot[0] - 6} y={(A[1] + foot[1]) / 2 + 5} textAnchor="end" className="side-label">
          h
        </text>
        <text x={(B[0] + C[0]) / 2} y={C[1] + 22} textAnchor="middle" className="side-label">
          b
        </text>
      </svg>

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setRevealed(true)}
        disabled={revealed}
      >
        {revealed ? 'Parallelogram formed' : 'Form a parallelogram'}
      </button>

      {revealed && (
        <div className="why-explain">
          <p className="why-line" data-testid="parallelogram-area">
            <MathText>{'Two copies tile a parallelogram. You already know its area is base $\\times$ height $= bh$.'}</MathText>
          </p>
          <p className="why-line" data-testid="triangle-half">
            <MathText>{'A single triangle is exactly half of that parallelogram, so its area $= \\frac{bh}{2}$.'}</MathText>
          </p>
        </div>
      )}
    </div>
  );
}
