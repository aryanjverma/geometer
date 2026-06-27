import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Line, Text, Arc } from 'react-konva';

const STAGE_W = 380;
const STAGE_H = 280;

interface ExteriorAngleProofProps {
  /** Remote interior angle at vertex A (degrees). */
  angleA?: number;
  /** Remote interior angle at vertex B (degrees). */
  angleB?: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smooth ease-in-out so the angles swoop rather than move linearly. */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Konva proof of the Triangle Exterior Angle Theorem. Triangle ABC is drawn as a
 * clean 60-60-60 equilateral triangle, with its base BC extended to D and a ray
 * through C parallel to side AB. Every angle is marked with a curved arc symbol.
 * Pressing the button swoops a copy of angle B (corresponding) and a copy of
 * angle A (alternate interior) up out of the triangle and tiles them exactly into
 * exterior angle ACD, showing exterior = A + B. With the default equilateral
 * geometry the two 60 degree pieces land precisely on ray CA.
 */
export function ExteriorAngleProof({
  angleA = 60,
  angleB = 60,
}: ExteriorAngleProofProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(1);
  const [phase, setPhase] = useState<'idle' | 'animating' | 'done'>('idle');
  const [t, setT] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = (width: number) => {
      if (width > 0) setDisplay(width / STAGE_W);
    };
    apply(el.clientWidth);
    const ro = new ResizeObserver((entries) =>
      apply(entries[0].contentRect.width),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  // Triangle geometry in stage pixels. Base BC is horizontal; D extends it.
  // Apex A is centered above BC at the equilateral height so all interior
  // angles are 60 degrees and ray CA sits 120 degrees up from ray CD.
  const geo = useMemo(() => {
    const B: [number, number] = [70, 210];
    const C: [number, number] = [230, 210];
    const D: [number, number] = [340, 210];
    const halfBase = (C[0] - B[0]) / 2; // 80
    const A: [number, number] = [
      (B[0] + C[0]) / 2,
      C[1] - halfBase * Math.sqrt(3),
    ];
    return { A, B, C, D };
  }, []);

  const { A, B, C, D } = geo;

  // Konva arc angles measure clockwise from the +x axis. The exterior angle ACD
  // opens from ray CD (0 deg, pointing right) up toward ray CA at -(A+B) deg.
  // The parallel ray through C splits it: lower piece = B, upper = A.
  const lowerStart = -angleB; // arc swept clockwise back to 0 (ray CD)
  const upperStart = -(angleA + angleB); // ray CA, lands on the apex direction

  // Marker radii. Interior markers stay small; the exterior pieces are larger so
  // they visibly tile the whole exterior angle.
  const interiorR = 24;
  const extR = 60;

  // Interior arc orientations (where each copy lifts off from).
  const interiorBRot = -angleB; // arc at B spans -angleB .. 0
  const interiorARot = 60; // arc at A spans 60 .. 60 + angleA

  const runAnimation = () => {
    if (phase !== 'idle') return;
    setPhase('animating');
    const start = performance.now();
    const DURATION = 1200;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      setT(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase('done');
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const e = easeInOutCubic(t);

  // Copy of angle B: corresponding angle, slides straight up the base from B to
  // C keeping its orientation, growing as it goes.
  const moveB = {
    x: lerp(B[0], C[0], e),
    y: lerp(B[1], C[1], e),
    r: lerp(interiorR, extR, e),
    rotation: interiorBRot, // == lowerStart, so no rotation needed
  };

  // Copy of angle A: alternate interior angle, swoops over from A to C and
  // rotates a half-turn into the upper slot (a point reflection).
  const moveA = {
    x: lerp(A[0], C[0], e),
    y: lerp(A[1], C[1], e),
    r: lerp(interiorR, extR, e),
    rotation: lerp(interiorARot, upperStart, e),
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
          {/* Extended base line B -> C -> D. */}
          <Line
            points={[B[0], B[1], D[0], D[1]]}
            stroke="#94a3b8"
            strokeWidth={2}
          />

          {/* Ray through C parallel to side AB (slope of AB applied at C). */}
          <Line
            points={[
              C[0],
              C[1],
              C[0] + (A[0] - B[0]) * 0.8,
              C[1] + (A[1] - B[1]) * 0.8,
            ]}
            stroke="#10b981"
            strokeWidth={2}
            dash={[6, 4]}
          />

          {/* Exterior-angle arc symbols, revealed once the copies land. */}
          {phase === 'done' && (
            <>
              <Arc
                x={C[0]}
                y={C[1]}
                innerRadius={0}
                outerRadius={extR}
                angle={angleB}
                rotation={lowerStart}
                fill="rgba(245, 158, 11, 0.30)"
                stroke="#b45309"
                strokeWidth={1.5}
              />
              <Arc
                x={C[0]}
                y={C[1]}
                innerRadius={0}
                outerRadius={extR}
                angle={angleA}
                rotation={upperStart}
                fill="rgba(99, 102, 241, 0.30)"
                stroke="#4338ca"
                strokeWidth={1.5}
              />
            </>
          )}

          {/* The swooping copies in flight. */}
          {phase === 'animating' && (
            <>
              <Arc
                x={moveB.x}
                y={moveB.y}
                innerRadius={0}
                outerRadius={moveB.r}
                angle={angleB}
                rotation={moveB.rotation}
                fill="rgba(245, 158, 11, 0.45)"
                stroke="#b45309"
                strokeWidth={1.5}
              />
              <Arc
                x={moveA.x}
                y={moveA.y}
                innerRadius={0}
                outerRadius={moveA.r}
                angle={angleA}
                rotation={moveA.rotation}
                fill="rgba(99, 102, 241, 0.45)"
                stroke="#4338ca"
                strokeWidth={1.5}
              />
            </>
          )}

          {/* Triangle ABC. */}
          <Line
            points={[A[0], A[1], B[0], B[1], C[0], C[1]]}
            closed
            fill="rgba(99, 102, 241, 0.10)"
            stroke="#6366f1"
            strokeWidth={3}
            lineJoin="round"
          />

          {/* Interior angle arc symbols at A and B (each 60 degrees). */}
          <Arc
            x={A[0]}
            y={A[1]}
            innerRadius={0}
            outerRadius={interiorR}
            angle={angleA}
            rotation={interiorARot}
            fill="rgba(99, 102, 241, 0.22)"
            stroke="#4338ca"
            strokeWidth={1.5}
          />
          <Arc
            x={B[0]}
            y={B[1]}
            innerRadius={0}
            outerRadius={interiorR}
            angle={angleB}
            rotation={interiorBRot}
            fill="rgba(245, 158, 11, 0.22)"
            stroke="#b45309"
            strokeWidth={1.5}
          />

          {/* Vertex labels. */}
          <Text x={A[0] - 18} y={A[1] - 22} text="A" fontSize={18} fontStyle="bold" fontFamily="Space Grotesk" fill="#312e81" />
          <Text x={B[0] - 20} y={B[1] + 6} text="B" fontSize={18} fontStyle="bold" fontFamily="Space Grotesk" fill="#312e81" />
          <Text x={C[0] - 4} y={C[1] + 6} text="C" fontSize={18} fontStyle="bold" fontFamily="Space Grotesk" fill="#312e81" />
          <Text x={D[0] + 4} y={D[1] - 4} text="D" fontSize={18} fontStyle="bold" fontFamily="Space Grotesk" fill="#64748b" />
        </Layer>
      </Stage>

      <div className="unfold-actions">
        {phase === 'done' ? (
          <span className="success-badge">
            Exterior angle = A + B = {angleA + angleB} degrees
          </span>
        ) : (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={runAnimation}
            disabled={phase === 'animating'}
          >
            Move the angles
          </button>
        )}
      </div>
    </div>
  );
}
