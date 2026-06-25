import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Line, Group, Text, Rect } from 'react-konva';
import type Konva from 'konva';
import type { GridPoint, GridShape } from '@/types/lesson';
import { isCongruent, isSimilar } from './congruenceUtils';
import { verticesMatch } from './transformGridUtils';

interface GridBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

interface ShapeMatchProps {
  bounds: GridBounds;
  source: GridShape;
  target: GridShape;
  goal: 'congruent' | 'similar';
  allow: Array<'translate' | 'rotate' | 'dilate'>;
  onMatch?: (matched: boolean) => void;
  solved?: boolean;
}

const DESIGN = 320;
const PAD = 24;
const MAX_FACTOR = 4;

/** Rotate a point 90 degrees clockwise about the origin, `steps` times. */
function rotateCW(p: GridPoint, steps: number): GridPoint {
  let { x, y } = p;
  const n = ((steps % 4) + 4) % 4;
  for (let i = 0; i < n; i += 1) {
    const nx = y;
    const ny = -x;
    x = nx;
    y = ny;
  }
  return { x, y };
}

/**
 * Drag (+ rotate / dilate) a rigid or scalable shape onto a target to prove
 * congruence or similarity. Success when the shape's vertices land on the target.
 */
export function ShapeMatch({
  bounds,
  source,
  target,
  goal,
  allow,
  onMatch,
  solved = false,
}: ShapeMatchProps) {
  const [rotationSteps, setRotationSteps] = useState(0);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<GridPoint>({ x: 0, y: 0 });

  const wrapRef = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(1);

  const { xMin, xMax, yMin, yMax } = bounds;
  const spanX = xMax - xMin;
  const spanY = yMax - yMin;
  const unit = DESIGN / Math.max(spanX, spanY);
  const stageW = spanX * unit + PAD * 2;
  const stageH = spanY * unit + PAD * 2;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = (width: number) => {
      if (width > 0) setDisplay(width / stageW);
    };
    apply(el.clientWidth);
    const ro = new ResizeObserver((entries) => apply(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageW]);

  const sx = (x: number) => PAD + (x - xMin) * unit;
  const sy = (y: number) => PAD + (yMax - y) * unit;

  const anchor = source.vertices[0];

  // Shape after rotation + scale about its anchor, BEFORE the drag offset.
  const transformed = useMemo<GridPoint[]>(
    () =>
      source.vertices.map((v) => {
        const rel = { x: (v.x - anchor.x) * scale, y: (v.y - anchor.y) * scale };
        const rot = rotateCW(rel, rotationSteps);
        return { x: anchor.x + rot.x, y: anchor.y + rot.y };
      }),
    [source.vertices, anchor.x, anchor.y, scale, rotationSteps],
  );

  // Clamp the offset so the whole shape stays within the grid bounds.
  const clampOffset = (cand: GridPoint): GridPoint => {
    const xsList = transformed.map((p) => p.x);
    const ysList = transformed.map((p) => p.y);
    const minDx = xMin - Math.min(...xsList);
    const maxDx = xMax - Math.max(...xsList);
    const minDy = yMin - Math.min(...ysList);
    const maxDy = yMax - Math.max(...ysList);
    return {
      x: Math.max(minDx, Math.min(maxDx, cand.x)),
      y: Math.max(minDy, Math.min(maxDy, cand.y)),
    };
  };

  const current = useMemo<GridPoint[]>(
    () => transformed.map((p) => ({ x: p.x + offset.x, y: p.y + offset.y })),
    [transformed, offset],
  );

  const matched = useMemo(
    () => verticesMatch(current, target.vertices),
    [current, target.vertices],
  );

  useEffect(() => {
    onMatch?.(matched);
  }, [matched, onMatch]);

  // Re-clamp the offset whenever rotation/scale changes the shape's extent.
  useEffect(() => {
    setOffset((prev) => clampOffset(prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotationSteps, scale]);

  const gridXs: number[] = [];
  for (let x = xMin; x <= xMax; x += 1) gridXs.push(x);
  const gridYs: number[] = [];
  for (let y = yMin; y <= yMax; y += 1) gridYs.push(y);

  const showXAxis = yMin <= 0 && yMax >= 0;
  const showYAxis = xMin <= 0 && xMax >= 0;

  const flatten = (vs: GridPoint[]) => vs.flatMap((v) => [sx(v.x), sy(v.y)]);

  // The draggable group position (logical px) corresponds to the offset in cells.
  const groupPos = { x: offset.x * unit, y: -offset.y * unit };

  // Commit only on release. The group's local position is already in unscaled
  // design pixels (the Stage owns the display scale), so we convert straight to
  // cells — no extra /display, which was the bug that made movement hit phantom
  // walls. We snap the node to the committed cell immediately (covering the case
  // where the clamp leaves the offset unchanged) and mirror it into state.
  const commitGroup = (node: Konva.Group) => {
    const cellsX = Math.round(node.x() / unit);
    const cellsY = Math.round(node.y() / unit);
    const next = clampOffset({ x: cellsX, y: -cellsY });
    node.position({ x: next.x * unit, y: -next.y * unit });
    setOffset(next);
  };

  const canRotate = allow.includes('rotate');
  const canDilate = allow.includes('dilate');

  const proven = matched && (goal === 'congruent' ? isCongruent(current, target.vertices) : isSimilar(current, target.vertices));

  return (
    <div className="interactive-stage-wrap grid-stage-wrap" ref={wrapRef}>
      <Stage
        width={stageW * display}
        height={stageH * display}
        scaleX={display}
        scaleY={display}
      >
        <Layer listening={false}>
          <Rect x={PAD} y={PAD} width={spanX * unit} height={spanY * unit} fill="#f8fafc" />
          {gridXs.map((x) => (
            <Line key={`gx-${x}`} points={[sx(x), PAD, sx(x), stageH - PAD]} stroke="#e2e8f0" strokeWidth={1} />
          ))}
          {gridYs.map((y) => (
            <Line key={`gy-${y}`} points={[PAD, sy(y), stageW - PAD, sy(y)]} stroke="#e2e8f0" strokeWidth={1} />
          ))}
          {showXAxis && <Line points={[PAD, sy(0), stageW - PAD, sy(0)]} stroke="#94a3b8" strokeWidth={1.5} />}
          {showYAxis && <Line points={[sx(0), PAD, sx(0), stageH - PAD]} stroke="#94a3b8" strokeWidth={1.5} />}

          {/* Target shape (fixed) */}
          <Line
            points={flatten(target.vertices)}
            closed
            stroke="#22c55e"
            strokeWidth={2.5}
            dash={[6, 6]}
            fill="rgba(34,197,94,0.10)"
          />
        </Layer>

        <Layer>
          <Group
            x={groupPos.x}
            y={groupPos.y}
            draggable={!solved && !matched && allow.includes('translate')}
            onDragEnd={(e) => commitGroup(e.target as Konva.Group)}
          >
            <Line
              points={flatten(transformed)}
              closed
              stroke={matched ? '#16a34a' : '#6366f1'}
              strokeWidth={3}
              fill={matched ? 'rgba(22,163,74,0.20)' : 'rgba(99,102,241,0.18)'}
              lineJoin="round"
            />
          </Group>
        </Layer>

        <Layer listening={false}>
          {gridXs
            .filter((x) => x !== 0)
            .map((x) => (
              <Text key={`tx-${x}`} x={sx(x) - 6} y={stageH - PAD + 4} text={String(x)} fontSize={10} fill="#94a3b8" />
            ))}
          {gridYs
            .filter((y) => y !== 0)
            .map((y) => (
              <Text key={`ty-${y}`} x={PAD - 16} y={sy(y) - 5} text={String(y)} fontSize={10} fill="#94a3b8" />
            ))}
        </Layer>
      </Stage>

      <div className="grid-actions shape-match-actions">
        {canRotate && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setRotationSteps((n) => (n + 1) % 4)}
            disabled={solved || matched}
          >
            Rotate 90 degrees
          </button>
        )}
        {canDilate && (
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setScale((s) => Math.max(1, s - 1))}
              disabled={solved || matched || scale <= 1}
            >
              Shrink
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setScale((s) => Math.min(MAX_FACTOR, s + 1))}
              disabled={solved || matched || scale >= MAX_FACTOR}
            >
              Enlarge (x{scale})
            </button>
          </>
        )}
        {proven ? (
          <span className="success-badge">
            {goal === 'congruent' ? 'Congruent!' : 'Similar!'}
          </span>
        ) : (
          <span className="muted grid-hint">Move the shape onto the dashed target.</span>
        )}
      </div>
    </div>
  );
}
