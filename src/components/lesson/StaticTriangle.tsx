import type { ReactNode } from 'react';

interface StaticTriangleProps {
  /** Drawing proportions: [horizontal leg, vertical leg]. */
  legs: [number, number];
  baseLabel?: ReactNode;
  heightLabel?: ReactNode;
  hypLabel?: ReactNode;
  revealHyp?: boolean;
  revealHeight?: boolean;
}

export function StaticTriangle({
  legs,
  baseLabel,
  heightLabel,
  hypLabel,
  revealHyp,
  revealHeight,
}: StaticTriangleProps) {
  const w = 280;
  const h = 200;
  const pad = 40;
  const scale = Math.min((w - pad * 2) / legs[0], (h - pad * 2) / legs[1]);
  const legW = legs[0] * scale;
  const legH = legs[1] * scale;

  // Right-angle corner is the bottom-left; legs go up and to the right.
  const rx = pad;
  const ry = h - pad;
  const tx = rx;
  const ty = ry - legH;
  const cx = rx + legW;
  const cy = ry;

  const m = 13;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="triangle-svg" aria-hidden="true">
      <polygon
        points={`${rx},${ry} ${tx},${ty} ${cx},${cy}`}
        fill="rgba(99, 102, 241, 0.12)"
        stroke="#6366f1"
        strokeWidth="2"
      />

      {/* Right-angle marker, wedged inside between the vertical and horizontal legs */}
      <polyline
        points={`${rx},${ry - m} ${rx + m},${ry - m} ${rx + m},${ry}`}
        fill="none"
        stroke="#6366f1"
        strokeWidth="1.5"
      />

      {baseLabel != null && (
        <text x={rx + legW / 2} y={ry + 20} textAnchor="middle" className="side-label">
          {baseLabel}
        </text>
      )}
      {heightLabel != null && (
        <text
          x={rx - 16}
          y={ry - legH / 2}
          textAnchor="middle"
          className={`side-label ${revealHeight ? 'reveal' : ''}`}
        >
          {heightLabel}
        </text>
      )}
      {hypLabel != null && (
        <text
          x={(tx + cx) / 2 + 14}
          y={(ty + cy) / 2 - 6}
          textAnchor="middle"
          className={`side-label ${revealHyp ? 'reveal' : ''}`}
        >
          {hypLabel}
        </text>
      )}
    </svg>
  );
}
