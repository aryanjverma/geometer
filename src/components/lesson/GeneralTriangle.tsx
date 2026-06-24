import type { ReactNode } from 'react';

interface GeneralTriangleProps {
  /** Base length in lesson units (used for proportions). */
  base: number;
  /** Height in lesson units. */
  height: number;
  /** Distance of the altitude foot from the left base vertex (drawing only). Defaults to centered. */
  apexSplit?: number;
  baseLabel?: ReactNode;
  heightLabel?: ReactNode;
  leftSideLabel?: ReactNode;
  rightSideLabel?: ReactNode;
  /** Labels for the two base segments either side of the altitude foot. */
  splitLabels?: [ReactNode, ReactNode];
  /** Draw the dashed altitude with a right-angle marker at its foot. */
  showAltitude?: boolean;
  /** Animate the side labels in (used when revealing previously hidden sides). */
  revealSides?: boolean;
}

export function GeneralTriangle({
  base,
  height,
  apexSplit,
  baseLabel,
  heightLabel,
  leftSideLabel,
  rightSideLabel,
  splitLabels,
  showAltitude,
  revealSides,
}: GeneralTriangleProps) {
  const foot = apexSplit ?? base / 2;

  // Scale so the largest dimension renders at a fixed size, keeping the aspect ratio.
  const unit = 200 / Math.max(base, height);
  const bw = base * unit;
  const hh = height * unit;
  const footX = foot * unit;

  const padL = 44;
  const padR = 44;
  const padT = 24;
  const padB = 40;
  const w = bw + padL + padR;
  const h = hh + padT + padB;

  const baseY = padT + hh;
  const bl: [number, number] = [padL, baseY];
  const br: [number, number] = [padL + bw, baseY];
  const apex: [number, number] = [padL + footX, padT];
  const footPt: [number, number] = [padL + footX, baseY];

  const m = Math.min(12, hh * 0.4, Math.min(footX, bw - footX) * 0.4);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="triangle-svg" aria-hidden="true">
      <polygon
        points={`${bl[0]},${bl[1]} ${apex[0]},${apex[1]} ${br[0]},${br[1]}`}
        fill="rgba(99, 102, 241, 0.12)"
        stroke="#6366f1"
        strokeWidth="2"
      />

      {showAltitude && (
        <>
          <line
            x1={apex[0]}
            y1={apex[1]}
            x2={footPt[0]}
            y2={footPt[1]}
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />
          {/* Right-angle marker on the right side of the foot. */}
          <polyline
            points={`${footPt[0]},${footPt[1] - m} ${footPt[0] + m},${footPt[1] - m} ${footPt[0] + m},${footPt[1]}`}
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.5"
          />
        </>
      )}

      {heightLabel != null && (
        <text x={footPt[0] - 4} y={(apex[1] + footPt[1]) / 2 + 6} textAnchor="end" className="side-label">
          {heightLabel}
        </text>
      )}

      {splitLabels ? (
        <>
          <text x={(bl[0] + footPt[0]) / 2} y={baseY + 22} textAnchor="middle" className="side-label">
            {splitLabels[0]}
          </text>
          <text x={(br[0] + footPt[0]) / 2} y={baseY + 22} textAnchor="middle" className="side-label">
            {splitLabels[1]}
          </text>
        </>
      ) : (
        baseLabel != null && (
          <text
            x={(bl[0] + br[0]) / 2}
            y={baseY + 24}
            textAnchor="middle"
            className={`side-label ${revealSides ? 'reveal' : ''}`}
          >
            {baseLabel}
          </text>
        )
      )}

      {leftSideLabel != null && (
        <text
          x={(bl[0] + apex[0]) / 2 - 14}
          y={(bl[1] + apex[1]) / 2}
          textAnchor="middle"
          className={`side-label ${revealSides ? 'reveal' : ''}`}
        >
          {leftSideLabel}
        </text>
      )}
      {rightSideLabel != null && (
        <text
          x={(br[0] + apex[0]) / 2 + 14}
          y={(br[1] + apex[1]) / 2}
          textAnchor="middle"
          className={`side-label ${revealSides ? 'reveal' : ''}`}
        >
          {rightSideLabel}
        </text>
      )}
    </svg>
  );
}
