import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Line, Ellipse, Circle, Text, Group } from 'react-konva';
import type { Vector2d } from 'konva/lib/types';

const STAGE_W = 360;
const STAGE_H = 260;
const BASE_Y = 210;
const TOP_PAD = 30;
const MAX_GAP = 26;

interface SliceConeProps {
  /** Base radius. Optional: when omitted it is recovered from slant and height. */
  radius?: number;
  height: number;
  slant: number;
  /** Reveal the radius value on the exposed triangle instead of a `?`. */
  revealRadius?: boolean;
  onSplit?: (split: boolean) => void;
}

/**
 * Konva interactive: the learner swipes a handle down the cone's axis to slice
 * it vertically in half. Once sliced, the exposed right triangle is revealed
 * with legs r and h and hypotenuse l. Mirrors SplitTriangle's drag-handle +
 * ResizeObserver scaling + onSplit gating. Renders with sensible defaults.
 */
export function SliceCone({
  radius,
  height = 8,
  slant = 10,
  revealRadius = false,
  onSplit,
}: SliceConeProps) {
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

  // The radius is either given or recovered from the Pythagorean relationship.
  const r = useMemo(() => {
    if (typeof radius === 'number') return radius;
    const recovered = Math.sqrt(Math.max(0, slant * slant - height * height));
    return recovered > 0 ? recovered : Math.max(1, height / 2);
  }, [radius, slant, height]);

  // Fit the cone into the stage while preserving its aspect ratio.
  const { halfW, centerX, apexY } = useMemo(() => {
    const unit = Math.min((STAGE_W - 120) / (2 * r), (BASE_Y - TOP_PAD) / height);
    const hw = r * unit;
    const ch = height * unit;
    return { halfW: hw, centerX: STAGE_W / 2, apexY: BASE_Y - ch };
  }, [r, height]);

  const apex: [number, number] = [centerX, apexY];
  const baseCenter: [number, number] = [centerX, BASE_Y];
  const baseLeft: [number, number] = [centerX - halfW, BASE_Y];
  const baseRight: [number, number] = [centerX + halfW, BASE_Y];

  const rangeY = BASE_Y - apexY;
  const percentRef = useRef(0);
  const [percent, setPercent] = useState(0);
  const [split, setSplit] = useState(false);
  const [gap, setGap] = useState(0);
  const rafRef = useRef<number | null>(null);

  const cutY = apexY + percent * rangeY;

  useEffect(() => {
    if (!split) return;
    const start = performance.now();
    const duration = 450;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setGap(eased * MAX_GAP);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [split]);

  const doSplit = () => {
    if (split) return;
    setSplit(true);
    onSplit?.(true);
  };

  const boundHandle = (pos: Vector2d): Vector2d => {
    const raw = (pos.y / display - apexY) / rangeY;
    const clamped = Math.max(percentRef.current, Math.min(1, raw));
    percentRef.current = clamped;
    return { x: centerX * display, y: (apexY + clamped * rangeY) * display };
  };

  const onHandleMove = () => {
    setPercent(percentRef.current);
    if (percentRef.current >= 0.96) doSplit();
  };

  const onHandleEnd = () => {
    setPercent(percentRef.current);
    if (percentRef.current >= 0.96) doSplit();
  };

  const radiusLabel = revealRadius ? `r = ${Math.round(r)}` : 'r = ?';
  const heightLabel = `h = ${height}`;
  const slantLabel = `l = ${slant}`;

  // The exposed right half: apex -> base center -> base rim.
  const rightHalf = [
    apex[0], apex[1],
    baseCenter[0], baseCenter[1],
    baseRight[0], baseRight[1],
  ];
  const leftHalf = [
    apex[0], apex[1],
    baseCenter[0], baseCenter[1],
    baseLeft[0], baseLeft[1],
  ];

  return (
    <div className="interactive-stage-wrap" ref={wrapRef}>
      <Stage
        width={STAGE_W * display}
        height={STAGE_H * display}
        scaleX={display}
        scaleY={display}
      >
        <Layer>
          {!split ? (
            <>
              {/* Intact cone: silhouette triangle + base ellipse. */}
              <Line
                points={[baseLeft[0], baseLeft[1], apex[0], apex[1], baseRight[0], baseRight[1]]}
                closed
                fill="rgba(99, 102, 241, 0.12)"
                stroke="#6366f1"
                strokeWidth={3}
                lineJoin="round"
              />
              <Ellipse
                x={centerX}
                y={BASE_Y}
                radiusX={halfW}
                radiusY={14}
                stroke="#a5b4fc"
                strokeWidth={1.5}
                dash={[6, 4]}
              />

              {/* Vertical cut line following the handle. */}
              <Line
                points={[apex[0], apex[1], centerX, cutY]}
                stroke="#f59e0b"
                strokeWidth={2}
                dash={[6, 4]}
              />

              <Circle
                x={centerX}
                y={cutY}
                radius={14}
                fill="#f59e0b"
                stroke="#b45309"
                strokeWidth={2}
                draggable
                dragBoundFunc={boundHandle}
                onDragMove={onHandleMove}
                onDragEnd={onHandleEnd}
              />
              <Text
                x={centerX - 7}
                y={cutY - 8}
                text={'\u2193'}
                fontSize={16}
                fontStyle="bold"
                fontFamily="Space Grotesk"
                fill="#fff"
                listening={false}
              />
            </>
          ) : (
            <>
              {/* Left half slides away to expose the cut face. */}
              <Group x={-gap}>
                <Line
                  points={leftHalf}
                  closed
                  fill="rgba(99, 102, 241, 0.10)"
                  stroke="#a5b4fc"
                  strokeWidth={2}
                  lineJoin="round"
                />
              </Group>

              {/* Right half: the exposed inscribed right triangle. */}
              <Group x={gap}>
                <Line
                  points={rightHalf}
                  closed
                  fill="rgba(99, 102, 241, 0.20)"
                  stroke="#6366f1"
                  strokeWidth={3}
                  lineJoin="round"
                />
                {/* Right-angle marker at the base center. */}
                <Line
                  points={[
                    baseCenter[0] + 12, baseCenter[1],
                    baseCenter[0] + 12, baseCenter[1] - 12,
                    baseCenter[0], baseCenter[1] - 12,
                  ]}
                  stroke="#6366f1"
                  strokeWidth={1.5}
                />
                {/* height (vertical leg) */}
                <Text
                  x={baseCenter[0] - 36}
                  y={(apex[1] + baseCenter[1]) / 2 - 8}
                  text={heightLabel}
                  fontSize={14}
                  fontStyle="bold"
                  fontFamily="Space Grotesk"
                  fill="#312e81"
                />
                {/* radius (horizontal leg) */}
                <Text
                  x={(baseCenter[0] + baseRight[0]) / 2 - 14}
                  y={BASE_Y + 8}
                  text={radiusLabel}
                  fontSize={14}
                  fontStyle="bold"
                  fontFamily="Space Grotesk"
                  fill={revealRadius ? '#312e81' : '#b45309'}
                />
                {/* slant height (hypotenuse) */}
                <Text
                  x={(apex[0] + baseRight[0]) / 2 + 6}
                  y={(apex[1] + baseRight[1]) / 2 - 14}
                  text={slantLabel}
                  fontSize={14}
                  fontStyle="bold"
                  fontFamily="Space Grotesk"
                  fill="#312e81"
                />
              </Group>
            </>
          )}
        </Layer>
      </Stage>

      <div className="unfold-actions">
        {!split ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={doSplit}>
            Slice in half
          </button>
        ) : (
          <span className="success-badge">Sliced!</span>
        )}
      </div>
    </div>
  );
}
