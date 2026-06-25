import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Line, Circle, Text, Rect, Group } from 'react-konva';
import type Konva from 'konva';
import type { GridPoint, GridShape } from '@/types/lesson';
import { snapToGrid, verticesMatch } from './transformGridUtils';

interface GridBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

interface InteractiveGridProps {
  bounds: GridBounds;
  /** The shape whose vertices the learner drags. */
  source: GridShape;
  /** Expected vertices; the step is solved when the dragged shape matches. */
  target: GridPoint[];
  /** Fixed reference shapes drawn for context (not draggable). */
  reference?: GridShape[];
  /** Called whenever the match state changes. */
  onMatch?: (matched: boolean) => void;
  /** Locks dragging once the step is solved. */
  solved?: boolean;
  /** When false, the target outline is hidden so the learner must find it themselves. */
  showTarget?: boolean;
  /**
   * Ordered intermediate vertex positions for multi-step problems (excluding
   * the final target). When the learner lands the shape on the next checkpoint,
   * it locks in: an orange "progress" outline is frozen there so they can build
   * the remaining transformation off it.
   */
  checkpoints?: GridPoint[][];
  /** Called when a checkpoint is first reached, with its 1-based index. */
  onCheckpoint?: (index: number) => void;
}

const DESIGN = 320;
const PAD = 24;

/** Draggable coordinate grid: move each vertex onto its target cell. */
export function InteractiveGrid({
  bounds,
  source,
  target,
  reference = [],
  onMatch,
  solved = false,
  showTarget = true,
  checkpoints = [],
  onCheckpoint,
}: InteractiveGridProps) {
  const [vertices, setVertices] = useState<GridPoint[]>(() =>
    source.vertices.map((v) => ({ ...v })),
  );

  // The shape's starting position, kept so the learner can always reset to it.
  const initialVertices = useMemo(
    () => source.vertices.map((v) => ({ ...v })),
    [source.vertices],
  );

  const movedFromStart = useMemo(
    () => !verticesMatch(vertices, initialVertices),
    [vertices, initialVertices],
  );

  // How many leading checkpoints the learner has locked in (advances in order).
  const [reachedCount, setReachedCount] = useState(0);

  const resetShape = () => {
    setVertices(initialVertices.map((v) => ({ ...v })));
    setReachedCount(0);
  };

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

  // Logical (unscaled) data <-> screen mapping.
  const sx = (x: number) => PAD + (x - xMin) * unit;
  const sy = (y: number) => PAD + (yMax - y) * unit;
  const gx = (px: number) => xMin + (px - PAD) / unit;
  const gy = (py: number) => yMax - (py - PAD) / unit;

  const matched = useMemo(() => verticesMatch(vertices, target), [vertices, target]);

  useEffect(() => {
    onMatch?.(matched);
  }, [matched, onMatch]);

  // Advance through checkpoints in order whenever the shape lands on the next one.
  useEffect(() => {
    if (matched) return;
    if (reachedCount < checkpoints.length && verticesMatch(vertices, checkpoints[reachedCount])) {
      setReachedCount((c) => c + 1);
      onCheckpoint?.(reachedCount + 1);
    }
  }, [vertices, checkpoints, reachedCount, matched, onCheckpoint]);

  // True when the shape is currently resting on its most recent locked checkpoint.
  const onLatestCheckpoint =
    !matched &&
    reachedCount > 0 &&
    verticesMatch(vertices, checkpoints[reachedCount - 1]);

  const gridXs: number[] = [];
  for (let x = xMin; x <= xMax; x += 1) gridXs.push(x);
  const gridYs: number[] = [];
  for (let y = yMin; y <= yMax; y += 1) gridYs.push(y);

  const showXAxis = yMin <= 0 && yMax >= 0;
  const showYAxis = xMin <= 0 && xMax >= 0;

  const clamp = (value: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, value));

  // While a single vertex is dragged we DON'T touch the Konva node at all — any
  // attempt to clamp or reposition it mid-drag fights Konva's own drag loop and
  // causes the jitter that gets worse the farther you move. We simply mirror the
  // node's live position into the controlled <Circle> (sx(gx(x)) === x, so the
  // re-applied prop matches exactly and never snaps), letting the triangle edge
  // follow smoothly. Bounds are resolved only on release.
  const dragVertex = (index: number, node: Konva.Node) => {
    setVertices((prev) =>
      prev.map((v, i) =>
        i === index ? { x: gx(node.x()), y: gy(node.y()) } : v,
      ),
    );
  };

  // On release, snap to the nearest grid intersection and clamp onto the grid.
  // This is the only place bounds are enforced, so the drag itself stays smooth.
  const dropVertex = (index: number, node: Konva.Node) => {
    const nextX = clamp(snapToGrid(gx(node.x())), xMin, xMax);
    const nextY = clamp(snapToGrid(gy(node.y())), yMin, yMax);
    setVertices((prev) =>
      prev.map((v, i) => (i === index ? { x: nextX, y: nextY } : v)),
    );
  };

  // Grabbing the shape body slides every vertex by the same amount. Konva owns
  // the group's position entirely during the drag (no dragBoundFunc, no per-frame
  // repositioning, no React state churn) so it glides freely in any direction.
  // On release we bake the shared shift into the vertices, snapping to the grid
  // and clamping the shift so the shape lands back on the grid. The reachable
  // resting area therefore depends on the shape's size: a bigger shape has less
  // room to slide before one of its edges would fall off the grid.
  const shapeGroupRef = useRef<Konva.Group>(null);

  const dropShape = (node: Konva.Group) => {
    const xs = vertices.map((v) => v.x);
    const ys = vertices.map((v) => v.y);
    const minDx = xMin - Math.min(...xs);
    const maxDx = xMax - Math.max(...xs);
    const minDy = yMin - Math.min(...ys);
    const maxDy = yMax - Math.max(...ys);
    const dx = clamp(snapToGrid(node.x() / unit), minDx, maxDx);
    const dy = clamp(snapToGrid(-node.y() / unit), minDy, maxDy);
    node.position({ x: 0, y: 0 });
    if (dx === 0 && dy === 0) return;
    setVertices((prev) => prev.map((v) => ({ x: v.x + dx, y: v.y + dy })));
  };

  const flatten = (vs: GridPoint[]) => vs.flatMap((v) => [sx(v.x), sy(v.y)]);

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
            <Line
              key={`gx-${x}`}
              points={[sx(x), PAD, sx(x), stageH - PAD]}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          ))}
          {gridYs.map((y) => (
            <Line
              key={`gy-${y}`}
              points={[PAD, sy(y), stageW - PAD, sy(y)]}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          ))}
          {showXAxis && (
            <Line points={[PAD, sy(0), stageW - PAD, sy(0)]} stroke="#94a3b8" strokeWidth={1.5} />
          )}
          {showYAxis && (
            <Line points={[sx(0), PAD, sx(0), stageH - PAD]} stroke="#94a3b8" strokeWidth={1.5} />
          )}

          {/* Original starting outline — a "home" marker to reset back to. */}
          <Line
            points={flatten(initialVertices)}
            closed
            stroke="#cbd5e1"
            strokeWidth={2}
            dash={[2, 4]}
          />

          {/* Locked checkpoints — frozen orange outlines of completed steps. */}
          {checkpoints.slice(0, reachedCount).map((pts, i) => (
            <Line
              key={`checkpoint-${i}`}
              points={flatten(pts)}
              closed
              stroke="#f97316"
              strokeWidth={2}
              dash={[6, 4]}
              fill="rgba(249,115,22,0.08)"
            />
          ))}

          {/* Reference shapes (context) */}
          {reference.map((shape) => (
            <Line
              key={`ref-${shape.id}`}
              points={flatten(shape.vertices)}
              closed
              stroke="#0ea5e9"
              strokeWidth={2}
              fill="rgba(14,165,233,0.12)"
            />
          ))}

          {/* Target ghost */}
          {showTarget && (
            <Line
              points={flatten(target)}
              closed
              stroke="#22c55e"
              strokeWidth={2}
              dash={[6, 6]}
              fill="rgba(34,197,94,0.08)"
            />
          )}
        </Layer>

        <Layer>
          {/* The whole shape is one draggable group: grab the body to slide
              every vertex together, or grab a single handle to move just it. */}
          <Group
            ref={shapeGroupRef}
            draggable={!solved && !matched}
            onDragEnd={() => {
              const g = shapeGroupRef.current;
              if (g) dropShape(g);
            }}
          >
            <Line
              points={flatten(vertices)}
              closed
              stroke={matched ? '#16a34a' : onLatestCheckpoint ? '#ea580c' : '#6366f1'}
              strokeWidth={3}
              fill={
                matched
                  ? 'rgba(22,163,74,0.18)'
                  : onLatestCheckpoint
                    ? 'rgba(249,115,22,0.18)'
                    : 'rgba(99,102,241,0.15)'
              }
              lineJoin="round"
            />

            {vertices.map((v, i) => (
              <Circle
                key={`v-${i}`}
                x={sx(v.x)}
                y={sy(v.y)}
                radius={11}
                fill={matched ? '#16a34a' : onLatestCheckpoint ? '#fb923c' : '#818cf8'}
                stroke={matched ? '#15803d' : onLatestCheckpoint ? '#c2410c' : '#4338ca'}
                strokeWidth={2}
                draggable={!solved && !matched}
                onDragMove={(e) => dragVertex(i, e.target)}
                onDragEnd={(e) => dropVertex(i, e.target)}
              />
            ))}
          </Group>
        </Layer>

        <Layer listening={false}>
          {gridXs
            .filter((x) => x !== 0)
            .map((x) => (
              <Text
                key={`tx-${x}`}
                x={sx(x) - 6}
                y={stageH - PAD + 4}
                text={String(x)}
                fontSize={10}
                fill="#94a3b8"
              />
            ))}
          {gridYs
            .filter((y) => y !== 0)
            .map((y) => (
              <Text
                key={`ty-${y}`}
                x={PAD - 16}
                y={sy(y) - 5}
                text={String(y)}
                fontSize={10}
                fill="#94a3b8"
              />
            ))}
        </Layer>
      </Stage>

      <div className="grid-actions">
        {matched ? (
          <span className="success-badge">Matched!</span>
        ) : reachedCount > 0 ? (
          <span className="checkpoint-badge">
            {`Step ${reachedCount} done — now apply the next transformation.`}
          </span>
        ) : (
          <span className="muted grid-hint">
            {showTarget
              ? 'Drag each point onto the dashed target.'
              : 'Drag each point to where the image belongs.'}
          </span>
        )}
        {!solved && !matched && movedFromStart && (
          <button type="button" className="btn btn-sm btn-reset" onClick={resetShape}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
