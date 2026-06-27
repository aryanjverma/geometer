import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Line, Circle, Text } from 'react-konva';
import type { Vector2d } from 'konva/lib/types';

const STAGE_W = 360;
const STAGE_H = 250;
const TOP_Y = 70;
const BOTTOM_Y = 180;
const CENTER_X = STAGE_W / 2;
const LINE_X0 = 24;
const LINE_X1 = STAGE_W - 24;
const RAY = 34;
const EXTEND = 38;

interface SlideAnglesProofProps {
  /** Acute angle (degrees) the transversal makes with the parallel lines. */
  angle?: number;
}

export function SlideAnglesProof({ angle = 55 }: SlideAnglesProofProps) {
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

  const geom = useMemo(() => {
    const theta = (Math.min(80, Math.max(28, angle)) * Math.PI) / 180;
    const gap = BOTTOM_Y - TOP_Y;
    const dxOffset = gap / Math.tan(theta);
    const topX = CENTER_X - dxOffset / 2;
    const bottomX = CENTER_X + dxOffset / 2;
    const len = Math.hypot(dxOffset, gap);
    const ux = dxOffset / len;
    const uy = gap / len;
    return { topX, bottomX, ux, uy, gap, dxOffset };
  }, [angle]);

  const { topX, bottomX, ux, uy } = geom;
  const tEnd: [number, number] = [topX - ux * EXTEND, TOP_Y - uy * EXTEND];
  const bEnd: [number, number] = [bottomX + ux * EXTEND, BOTTOM_Y + uy * EXTEND];

  const percentRef = useRef(0);
  const [percent, setPercent] = useState(0);
  const [aligned, setAligned] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Vertex of the sliding angle, interpolated along the transversal.
  const vx = topX + percent * (bottomX - topX);
  const vy = TOP_Y + percent * (BOTTOM_Y - TOP_Y);

  // A small angle wedge: one ray along the line (to the right) and one ray
  // down the transversal, drawn as a filled triangle from the vertex.
  const wedge = (x: number, y: number): number[] => [
    x + RAY,
    y,
    x,
    y,
    x + ux * RAY,
    y + uy * RAY,
  ];

  const confirm = () => {
    if (percentRef.current >= 0.96) setAligned(true);
  };

  const slideHome = () => {
    if (aligned) return;
    const start = performance.now();
    const from = percentRef.current;
    const duration = 600;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const p = from + (1 - from) * eased;
      percentRef.current = p;
      setPercent(p);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        confirm();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Keep the drag handle on the transversal, only ever progressing downward.
  const boundHandle = (pos: Vector2d): Vector2d => {
    const px = pos.x / display;
    const py = pos.y / display;
    const dx = bottomX - topX;
    const dy = BOTTOM_Y - TOP_Y;
    const raw = ((px - topX) * dx + (py - TOP_Y) * dy) / (dx * dx + dy * dy);
    const clamped = Math.max(percentRef.current, Math.min(1, raw));
    percentRef.current = clamped;
    return {
      x: (topX + clamped * dx) * display,
      y: (TOP_Y + clamped * dy) * display,
    };
  };

  const onHandleMove = () => {
    setPercent(percentRef.current);
    confirm();
  };

  return (
    <div className="interactive-stage-wrap" ref={wrapRef}>
      <Stage
        width={STAGE_W * display}
        height={STAGE_H * display}
        scaleX={display}
        scaleY={display}
      >
        <Layer>
          {/* Two parallel lines. */}
          <Line points={[LINE_X0, TOP_Y, LINE_X1, TOP_Y]} stroke="#6366f1" strokeWidth={3} />
          <Line points={[LINE_X0, BOTTOM_Y, LINE_X1, BOTTOM_Y]} stroke="#6366f1" strokeWidth={3} />

          {/* Transversal. */}
          <Line
            points={[tEnd[0], tEnd[1], bEnd[0], bEnd[1]]}
            stroke="#f59e0b"
            strokeWidth={3}
          />

          {/* Target corresponding angle at the lower intersection. */}
          <Line
            points={wedge(bottomX, BOTTOM_Y)}
            closed
            fill={aligned ? 'rgba(34, 197, 94, 0.28)' : 'rgba(99, 102, 241, 0.12)'}
            stroke={aligned ? '#16a34a' : '#a5b4fc'}
            strokeWidth={2}
            dash={aligned ? undefined : [6, 4]}
          />

          {/* The sliding copy of the upper corresponding angle. */}
          <Line
            points={wedge(vx, vy)}
            closed
            fill="rgba(245, 158, 11, 0.3)"
            stroke="#b45309"
            strokeWidth={2.5}
          />

          {/* Drag handle at the sliding angle's vertex. */}
          <Circle
            x={vx}
            y={vy}
            radius={13}
            fill="#f59e0b"
            stroke="#b45309"
            strokeWidth={2}
            draggable
            dragBoundFunc={boundHandle}
            onDragMove={onHandleMove}
            onDragEnd={onHandleMove}
          />
          <Text
            x={vx - 7}
            y={vy - 8}
            text={'\u2195'}
            fontSize={16}
            fontStyle="bold"
            fontFamily="Space Grotesk"
            fill="#fff"
            listening={false}
          />
        </Layer>
      </Stage>

      <div className="unfold-actions">
        {!aligned ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={slideHome}>
            Slide the angle down
          </button>
        ) : (
          <span className="success-badge">They coincide!</span>
        )}
      </div>
    </div>
  );
}
