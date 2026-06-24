import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Line, Circle, Text } from 'react-konva';
import type { Vector2d } from 'konva/lib/types';
import { MathText } from '@/components/MathText';

const STAGE_W = 360;
const STAGE_H = 250;
const BASE_Y = 190;
const TOP_PAD = 40;
/** Fraction of the remaining distance the apex eases each frame (lower = slower/smoother). */
const EASE = 0.12;
/** Side length (lesson px) of the right-angle marker square at the altitude foot. */
const RA_MARKER = 12;

interface ShearTriangleProps {
  /** Base length in lesson units. */
  base: number;
  /** Height in lesson units (kept constant as the apex slides). */
  height: number;
  /** Show the live area readout (gated until the area step is revealed). */
  showArea?: boolean;
}

/**
 * Demonstrates shear invariance: the apex slides horizontally along a line at a
 * fixed height, so the base and height — and therefore the area — never change.
 */
export function ShearTriangle({ base, height, showArea = true }: ShearTriangleProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(1);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = (width: number) => {
      if (width > 0) setDisplay(width / STAGE_W);
    };
    apply(el.clientWidth);
    const ro = new ResizeObserver((entries) => apply(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { unit, bw, baseLeftX } = useMemo(() => {
    const u = Math.min((STAGE_W - 120) / base, (BASE_Y - TOP_PAD) / height);
    const bwidth = base * u;
    return { unit: u, bw: bwidth, baseLeftX: STAGE_W / 2 - bwidth / 2 };
  }, [base, height]);

  const apexY = BASE_Y - height * unit;

  // Constrain the apex to ~90% of the stage width, centered, so it never
  // slides off screen no matter how wide the base is.
  const TRAVEL_SPAN = 0.9;
  const minX = STAGE_W / 2 - (STAGE_W * TRAVEL_SPAN) / 2;
  const maxX = STAGE_W / 2 + (STAGE_W * TRAVEL_SPAN) / 2;

  // The apex eases toward the pointer target instead of snapping, so the motion
  // reads as a slow, smooth slide rather than a jumpy drag.
  const [apexX, setApexX] = useState(baseLeftX);
  const apexXRef = useRef(baseLeftX);
  const targetXRef = useRef(baseLeftX);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const animate = () => {
    const diff = targetXRef.current - apexXRef.current;
    if (Math.abs(diff) < 0.3) {
      apexXRef.current = targetXRef.current;
      setApexX(apexXRef.current);
      rafRef.current = null;
      return;
    }
    apexXRef.current += diff * EASE;
    setApexX(apexXRef.current);
    rafRef.current = requestAnimationFrame(animate);
  };

  const ensureAnim = () => {
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(animate);
  };

  // Lock the handle to the constant-height line and render it at the eased
  // position (lagging the pointer), which produces the slow, smooth motion.
  const boundApex = (pos: Vector2d): Vector2d => {
    const raw = pos.x / display;
    targetXRef.current = Math.max(minX, Math.min(maxX, raw));
    ensureAnim();
    return { x: apexXRef.current * display, y: apexY * display };
  };

  const bl: [number, number] = [baseLeftX, BASE_Y];
  const br: [number, number] = [baseLeftX + bw, BASE_Y];
  const apex: [number, number] = [apexX, apexY];
  const foot: [number, number] = [apexX, BASE_Y];

  const area = (base * height) / 2;

  // Draw the right-angle marker toward stage center: when the apex is on the
  // left half, open it to the right of the altitude, and vice versa.
  const raDir = apex[0] < STAGE_W / 2 ? 1 : -1;

  return (
    <div className="interactive-stage-wrap" ref={wrapRef}>
      <Stage
        width={STAGE_W * display}
        height={STAGE_H * display}
        scaleX={display}
        scaleY={display}
      >
        <Layer>
          {/* The horizontal line the apex glides along (constant height). */}
          <Line
            points={[minX, apexY, maxX, apexY]}
            stroke="#cbd5e1"
            strokeWidth={1.5}
            dash={[4, 4]}
          />

          {/* Horizontal line along the base level, parallel to the apex line.
              Together they bound the constant-height band the apex slides within. */}
          <Line
            points={[minX, BASE_Y, maxX, BASE_Y]}
            stroke="#cbd5e1"
            strokeWidth={1.5}
            dash={[4, 4]}
          />

          <Line
            points={[bl[0], bl[1], apex[0], apex[1], br[0], br[1]]}
            closed
            fill="rgba(99, 102, 241, 0.12)"
            stroke="#6366f1"
            strokeWidth={3}
            lineJoin="round"
          />

          {/* Altitude (height) from apex perpendicularly down to the base line. */}
          <Line
            points={[apex[0], apex[1], foot[0], foot[1]]}
            stroke="#6366f1"
            strokeWidth={1.5}
            dash={[5, 4]}
          />

          {/* Right-angle marker at the foot of the altitude, signalling that the
              height is perpendicular to the base. Two Konva segments form the
              open corner of a small square (mirrors GeneralTriangle's marker). */}
          <Line
            points={[
              foot[0] + raDir * RA_MARKER,
              foot[1],
              foot[0] + raDir * RA_MARKER,
              foot[1] - RA_MARKER,
              foot[0],
              foot[1] - RA_MARKER,
            ]}
            stroke="#6366f1"
            strokeWidth={1.5}
          />

          {/* Base bracket. */}
          <Line
            points={[bl[0], BASE_Y, br[0], BASE_Y]}
            stroke="#312e81"
            strokeWidth={2}
          />

          <Text
            x={(bl[0] + br[0]) / 2 - 40}
            y={BASE_Y + 12}
            width={80}
            align="center"
            text={String(base)}
            fontSize={15}
            fontStyle="bold"
            fill="#312e81"
          />
          <Text
            x={apex[0] + 6}
            y={(apex[1] + foot[1]) / 2 - 8}
            text={String(height)}
            fontSize={15}
            fontStyle="bold"
            fill="#4338ca"
          />

          {/* Draggable apex. */}
          <Circle
            x={apex[0]}
            y={apex[1]}
            radius={14}
            fill="#818cf8"
            stroke="#4338ca"
            strokeWidth={2}
            draggable
            dragBoundFunc={boundApex}
          />
        </Layer>
      </Stage>

      <div className="shear-readout">
        <span className="shear-formula">
          <MathText>{'Area $= \\frac{1}{2}bh$'}</MathText>
        </span>
        <span>base = {base}</span>
        <span>height = {height}</span>
        {showArea && (
          <span className="shear-area">
            <MathText>{`area $= \\frac{1}{2} \\times ${base} \\times ${height} = ${area}$`}</MathText>
          </span>
        )}
      </div>
    </div>
  );
}
