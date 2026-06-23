import { useEffect, useMemo, useState } from 'react';
import { Stage, Layer, Line, Circle, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Vector2d } from 'konva/lib/types';
import {
  computeScale,
  initialAngles,
  isUnfolded,
  midpoint,
  sidePoints,
  STAGE_H,
  STAGE_W,
  unfoldedAngles,
} from './triangleUtils';

interface InteractiveUnfoldProps {
  lengths: [number, number, number];
  labels: [string, string, string];
  onUnfoldedChange: (unfolded: boolean) => void;
  highlightLabels: boolean;
}

export function InteractiveUnfold({
  lengths,
  labels,
  onUnfoldedChange,
  highlightLabels,
}: InteractiveUnfoldProps) {
  const [{ angle2, angle3 }, setAngles] = useState(() => initialAngles(lengths));

  const scale = useMemo(() => computeScale(lengths), [lengths]);

  const points = useMemo(
    () => sidePoints(lengths, angle2, angle3, scale),
    [lengths, angle2, angle3, scale],
  );

  const unfolded = isUnfolded(points);

  useEffect(() => {
    onUnfoldedChange(unfolded);
  }, [unfolded, onUnfoldedChange]);

  const snapUnfold = () => {
    setAngles(unfoldedAngles());
  };

  const radius2 = lengths[1] * scale;
  const radius3 = lengths[2] * scale;

  // Keep the joint (p2) on a fixed-radius circle around the bottom-right pivot (p1).
  const boundJoint = (pos: Vector2d): Vector2d => {
    const pivot = points[1];
    const a = Math.atan2(pos.y - pivot[1], pos.x - pivot[0]);
    return { x: pivot[0] + radius2 * Math.cos(a), y: pivot[1] + radius2 * Math.sin(a) };
  };

  // Keep the free end (p3) on a fixed-radius circle around the joint pivot (p2).
  const boundEnd = (pos: Vector2d): Vector2d => {
    const pivot = points[2];
    const a = Math.atan2(pos.y - pivot[1], pos.x - pivot[0]);
    return { x: pivot[0] + radius3 * Math.cos(a), y: pivot[1] + radius3 * Math.sin(a) };
  };

  const dragJoint = (e: KonvaEventObject<DragEvent>) => {
    const pos = e.target.position();
    const pivot = points[1];
    setAngles((prev) => ({
      ...prev,
      angle2: Math.atan2(pos.y - pivot[1], pos.x - pivot[0]),
    }));
  };

  const dragEnd = (e: KonvaEventObject<DragEvent>) => {
    const pos = e.target.position();
    const pivot = points[2];
    const absolute = Math.atan2(pos.y - pivot[1], pos.x - pivot[0]);
    setAngles((prev) => ({ ...prev, angle3: absolute - prev.angle2 }));
  };

  const resetHandle = (e: KonvaEventObject<DragEvent>, index: 2 | 3) => {
    const node = e.target;
    const p = points[index];
    node.position({ x: p[0], y: p[1] });
  };

  const segLabels = [
    { text: labels[0], at: midpoint(points[0], points[1]) },
    { text: labels[1], at: midpoint(points[1], points[2]) },
    { text: labels[2], at: midpoint(points[2], points[3]) },
  ];

  const [p0, p1, p2, p3] = points;

  // Right-angle marker wedged at the bottom-right vertex (p1), between the
  // horizontal leg (toward p0) and the vertical leg (toward p2). Hidden once unfolded.
  const rightAngleMarker = (() => {
    const size = 12;
    const toP0 = [p0[0] - p1[0], p0[1] - p1[1]];
    const toP2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const len0 = Math.hypot(toP0[0], toP0[1]) || 1;
    const len2 = Math.hypot(toP2[0], toP2[1]) || 1;
    const u0 = [(toP0[0] / len0) * size, (toP0[1] / len0) * size];
    const u2 = [(toP2[0] / len2) * size, (toP2[1] / len2) * size];
    const a = [p1[0] + u0[0], p1[1] + u0[1]];
    const corner = [p1[0] + u0[0] + u2[0], p1[1] + u0[1] + u2[1]];
    const c = [p1[0] + u2[0], p1[1] + u2[1]];
    return [a[0], a[1], corner[0], corner[1], c[0], c[1]];
  })();

  return (
    <div className="interactive-stage-wrap">
      <Stage width={STAGE_W} height={STAGE_H}>
        <Layer>
          <Line
            points={[p0[0], p0[1], p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]]}
            stroke="#6366f1"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />

          {!unfolded && (
            <Line points={rightAngleMarker} stroke="#4338ca" strokeWidth={1.5} />
          )}

          {segLabels.map((seg) => (
            <Text
              key={seg.text}
              x={seg.at[0] - 10}
              y={seg.at[1] - 22}
              text={seg.text}
              fontSize={16}
              fontStyle="bold"
              fill={highlightLabels ? '#f59e0b' : '#312e81'}
            />
          ))}

          {/* Left corner (fixed) */}
          <Circle x={p0[0]} y={p0[1]} radius={6} fill="#312e81" />

          {/* Bottom-right pivot (fixed) */}
          <Circle x={p1[0]} y={p1[1]} radius={6} fill="#312e81" />

          {/* Joint vertex — rotates the vertical leg about the bottom-right pivot */}
          <Circle
            x={p2[0]}
            y={p2[1]}
            radius={14}
            fill="#818cf8"
            stroke="#4338ca"
            strokeWidth={2}
            draggable
            dragBoundFunc={boundJoint}
            onDragMove={dragJoint}
            onDragEnd={(e) => resetHandle(e, 2)}
          />

          {/* Free end vertex — rotates the hypotenuse about the joint pivot */}
          <Circle
            x={p3[0]}
            y={p3[1]}
            radius={14}
            fill="#818cf8"
            stroke="#4338ca"
            strokeWidth={2}
            draggable
            dragBoundFunc={boundEnd}
            onDragMove={dragEnd}
            onDragEnd={(e) => resetHandle(e, 3)}
          />
        </Layer>
      </Stage>

      <div className="unfold-actions">
        {!unfolded && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={snapUnfold}>
            Snap straight
          </button>
        )}
        {unfolded && <span className="success-badge">Unfolded!</span>}
      </div>
    </div>
  );
}
