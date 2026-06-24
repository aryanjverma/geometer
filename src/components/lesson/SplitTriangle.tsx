import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Line, Circle, Text, Group } from 'react-konva';
import type { Vector2d } from 'konva/lib/types';

const STAGE_W = 360;
const STAGE_H = 250;
const BASE_Y = 200;
const TOP_PAD = 30;
const MAX_GAP = 26;

interface SplitTriangleProps {
  base: number;
  height: number;
  baseHalfLabel: string;
  heightLabel: string;
  sideLabel: string;
  onSplit: (split: boolean) => void;
}

export function SplitTriangle({
  base,
  height,
  baseHalfLabel,
  heightLabel,
  sideLabel,
  onSplit,
}: SplitTriangleProps) {
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

  // Fit the triangle into the stage while preserving its aspect ratio.
  const { bw, centerX, apexY } = useMemo(() => {
    const unit = Math.min((STAGE_W - 80) / base, (BASE_Y - TOP_PAD) / height);
    const bwidth = base * unit;
    const hheight = height * unit;
    return {
      bw: bwidth,
      centerX: STAGE_W / 2,
      apexY: BASE_Y - hheight,
    };
  }, [base, height]);

  const apex: [number, number] = [centerX, apexY];
  const bl: [number, number] = [centerX - bw / 2, BASE_Y];
  const br: [number, number] = [centerX + bw / 2, BASE_Y];
  const foot: [number, number] = [centerX, BASE_Y];

  const rangeY = BASE_Y - apexY;
  // Monotonic 0..1 progress of the cut down the altitude. It never moves back
  // up, so the swipe can't glitch backwards or go negative.
  const percentRef = useRef(0);
  const [percent, setPercent] = useState(0);
  const [split, setSplit] = useState(false);
  const [gap, setGap] = useState(0);
  const rafRef = useRef<number | null>(null);

  const cutY = apexY + percent * rangeY;

  // Animate the two halves apart once a split is triggered.
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
    onSplit(true);
  };

  // Lock the handle to the altitude line and only ever let it move further
  // down. The whole position is resolved here (in absolute stage pixels) so the
  // controlled position and the drag never fight, which was causing jitter.
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

  const leftHalf = [bl[0], bl[1], apex[0], apex[1], foot[0], foot[1]];
  const rightHalf = [foot[0], foot[1], apex[0], apex[1], br[0], br[1]];

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
              <Line
                points={[bl[0], bl[1], apex[0], apex[1], br[0], br[1]]}
                closed
                fill="rgba(99, 102, 241, 0.12)"
                stroke="#6366f1"
                strokeWidth={3}
                lineJoin="round"
              />

              {/* The "cut" line follows the handle down the altitude. */}
              <Line
                points={[apex[0], apex[1], centerX, cutY]}
                stroke="#f59e0b"
                strokeWidth={2}
                dash={[6, 4]}
              />

              <Text
                x={centerX - 60}
                y={BASE_Y + 14}
                width={120}
                align="center"
                text={`base ${base}`}
                fontSize={14}
                fontStyle="bold"
                fontFamily="Space Grotesk"
                fill="#312e81"
              />

              {/* Drag handle the learner swipes down. */}
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
                y={cutY - 7}
                text="↓"
                fontSize={16}
                fontStyle="bold"
                fontFamily="Space Grotesk"
                fill="#fff"
                listening={false}
              />
            </>
          ) : (
            <>
              {/* Left half slides left, right half slides right. */}
              <Group x={-gap}>
                <Line
                  points={leftHalf}
                  closed
                  fill="rgba(99, 102, 241, 0.18)"
                  stroke="#6366f1"
                  strokeWidth={3}
                  lineJoin="round"
                />
                <Text
                  x={(bl[0] + foot[0]) / 2 - 14}
                  y={BASE_Y + 6}
                  text={baseHalfLabel}
                  fontSize={14}
                  fontStyle="bold"
                  fontFamily="Space Grotesk"
                  fill="#000"
                />
                <Text
                  x={foot[0] + 6}
                  y={(apex[1] + foot[1]) / 2 - 8}
                  text={heightLabel}
                  fontSize={14}
                  fontStyle="bold"
                  fontFamily="Space Grotesk"
                  fill="#000"
                />
                <Text
                  x={(bl[0] + apex[0]) / 2 - 24}
                  y={(bl[1] + apex[1]) / 2 - 8}
                  text={sideLabel}
                  fontSize={13}
                  fontStyle="bold"
                  fontFamily="Space Grotesk"
                  fill="#000"
                />
              </Group>

              <Group x={gap}>
                <Line
                  points={rightHalf}
                  closed
                  fill="rgba(99, 102, 241, 0.18)"
                  stroke="#6366f1"
                  strokeWidth={3}
                  lineJoin="round"
                />
                <Text
                  x={(br[0] + foot[0]) / 2 - 4}
                  y={BASE_Y + 6}
                  text={baseHalfLabel}
                  fontSize={14}
                  fontStyle="bold"
                  fontFamily="Space Grotesk"
                  fill="#000"
                />
                <Text
                  x={foot[0] - 18}
                  y={(apex[1] + foot[1]) / 2 - 8}
                  text={heightLabel}
                  fontSize={14}
                  fontStyle="bold"
                  fontFamily="Space Grotesk"
                  fill="#000"
                />
                <Text
                  x={(br[0] + apex[0]) / 2 + 6}
                  y={(br[1] + apex[1]) / 2 - 8}
                  text={sideLabel}
                  fontSize={13}
                  fontStyle="bold"
                  fontFamily="Space Grotesk"
                  fill="#000"
                />
              </Group>
            </>
          )}
        </Layer>
      </Stage>

      <div className="unfold-actions">
        {!split ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={doSplit}>
            Split in half
          </button>
        ) : (
          <span className="success-badge">Split!</span>
        )}
      </div>
    </div>
  );
}
