type StepType =
  | 'interactive-unfold'
  | 'formula-compute'
  | 'numeric'
  | 'multi-part-numeric'
  | 'leg-then-perimeter'
  | 'area-base-height'
  | 'derive-perimeter'
  | 'interactive-split'
  | 'perimeter-from-area'
  | 'demonstration'
  | 'guided'
  | 'transition'
  | 'distance-demo'
  | 'distance-guided'
  | 'distance-problem'
  | 'transform-demo'
  | 'transform-guided'
  | 'transform-problem'
  | 'congruence-demo'
  | 'similarity-demo'
  | 'congruence-guided'
  | 'similarity-guided'
  | 'congruence-check'
  | 'similarity-check'
  | 'shape-match';

interface StepFeedback {
  correct?: string;
  wrong?: string;
  hint?: string;
}

interface TriangleLegs {
  legs: [number, number];
  hypotenuse?: number;
}

interface TrianglePartial {
  leg: number;
  hypotenuse: number;
  missingLeg?: number;
}

interface TriangleGeneral {
  base: number;
  height: number;
  /** Base segment to the left of the altitude foot (for the split visual). */
  leftSplit?: number;
  /** Base segment to the right of the altitude foot. */
  rightSplit?: number;
  /** [left side, right side] — shown once revealed. */
  sides?: [number, number];
}

interface MultiPart {
  id: string;
  prompt: string;
  answer: number;
  feedback?: { correct?: string; wrong?: string; hint?: string };
}

/** A single click-to-reveal step in an "I do" worked demonstration. */
interface DemoReveal {
  label: string;
  body: string;
  formula?: string;
  /** Segment ids to animate onto a GraphPlane when this step is revealed. */
  drawSegmentIds?: string[];
}

/** One numeric field within a guided part. */
export interface GuidedInput {
  id: string;
  label: string;
  answer: number;
}

/** A single phase of a "We do" guided walkthrough. */
export interface GuidedPart {
  id: string;
  prompt: string;
  /** Multi-field parts (e.g. a & b, base & height). */
  inputs?: GuidedInput[];
  /** Single-field parts. */
  answer?: number;
  /** When true, multi-field answers may be entered in any order. */
  acceptAnyOrder?: boolean;
  feedback?: StepFeedback;
}

interface DemoContent {
  intro?: string;
  reveals: DemoReveal[];
  /** Optional embedded interactive widget. */
  interactive?: 'shear' | 'parallelogram';
}

/** A full-slide transition message shown between lesson phases. */
interface TransitionContent {
  emoji: string;
  /** Button label; defaults to "Continue". */
  cta?: string;
}

/** A labeled point on the coordinate plane. */
export interface GraphPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  /** Where the label sits relative to the dot. Defaults to 'tr' (top-right). */
  labelPos?: 'tr' | 'tl' | 'br' | 'bl';
  /** Pixel nudge of the label from the dot. Overrides the labelPos placement. */
  labelOffset?: { dx?: number; dy?: number };
}

/**
 * A segment between two points. `kind` controls how it draws:
 * - 'dx'   horizontal leg (change in x)
 * - 'dy'   vertical leg (change in y)
 * - 'dist' direct distance line between the two points
 */
export interface GraphSegment {
  id: string;
  from: string;
  to: string;
  label?: string;
  kind?: 'dx' | 'dy' | 'dist';
  /** Pixel nudge of the label from the segment midpoint. Overrides the default placement. */
  labelOffset?: { dx?: number; dy?: number };
  /** Text anchor for the label. Used together with labelOffset. */
  labelAnchor?: 'start' | 'middle' | 'end';
}

/** Points and segments rendered on a GraphPlane. The viewBox auto-fits the points. */
interface GraphContent {
  points: GraphPoint[];
  segments: GraphSegment[];
}

/** A single multiple-choice option for a distance sub-step. */
interface DistanceChoice {
  id: string;
  label: string;
}

/** One solve step inside a distance problem. */
export interface DistanceSubStep {
  id: string;
  prompt: string;
  kind: 'numeric' | 'multi' | 'choice';
  /** Multi-field input (e.g. Δx and Δy together). */
  inputs?: GuidedInput[];
  /** Single numeric answer. */
  answer?: number;
  /** Choice options (for kind === 'choice'). */
  choices?: DistanceChoice[];
  /** Id of the correct choice. */
  correctChoice?: string;
  /** Segment ids to animate onto the graph once this step is solved. */
  drawSegmentIds?: string[];
  feedback?: StepFeedback;
}

/** An integer-grid coordinate point used by transformation/match interactives. */
export interface GridPoint {
  x: number;
  y: number;
}

/** A labeled polygon on the interactive grid, defined by ordered vertices. */
export interface GridShape {
  id: string;
  vertices: GridPoint[];
  label?: string;
}

/**
 * Viewport + reference geometry for an interactive coordinate grid.
 * The grid renders integer gridlines from xMin..xMax and yMin..yMax.
 */
export interface GridContent {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  /** Fixed reference shapes (not draggable). */
  shapes?: GridShape[];
}

/** A single transformation operation, used standalone or chained in `steps`. */
export interface TransformOp {
  kind: 'translate' | 'reflect' | 'rotate' | 'dilate';
  translate?: { dx: number; dy: number };
  reflect?: { axis: 'x' | 'y' };
  rotate?: { center: GridPoint; degrees: 90 | 180 | 270; direction: 'cw' | 'ccw' };
  dilate?: { center: GridPoint; factor: number };
}

/**
 * Describes a transformation problem on the interactive grid: the learner
 * manipulates `source` and is correct when the result matches `target`.
 */
export interface TransformContent {
  /** Primary transformation kind (for single-step demos/problems). */
  kind: 'translate' | 'reflect' | 'rotate' | 'dilate';
  /** The starting shape the learner moves. */
  source: GridShape;
  /** Expected resulting vertices after the transformation. */
  target: GridPoint[];
  /** Human-readable instruction, e.g. "Translate 4 right and 5 up". */
  instruction?: string;
  translate?: { dx: number; dy: number };
  reflect?: { axis: 'x' | 'y' };
  rotate?: { center: GridPoint; degrees: 90 | 180 | 270; direction: 'cw' | 'ccw' };
  dilate?: { center: GridPoint; factor: number };
  /** Ordered ops for 2-step combination problems (applied in sequence). */
  steps?: TransformOp[];
}

/**
 * Describes a "drag a shape onto another" proof problem. Congruence allows
 * translate + rotate; similarity adds dilate to scale the shape onto the target.
 */
export interface MatchContent {
  goal: 'congruent' | 'similar';
  /** The shape the learner manipulates. */
  source: GridShape;
  /** The fixed target shape to land on. */
  target: GridShape;
  /** Manipulations the learner is allowed to use. */
  allow: Array<'translate' | 'rotate' | 'dilate'>;
}

export interface LessonStep {
  id: string;
  type: StepType;
  prompt: string;
  /** On-screen phase label for the gradual-release arc. */
  tag?: 'I do' | 'We do' | 'You do';
  answer?: number;
  formula?: string;
  triangle?: TriangleLegs | TrianglePartial | TriangleGeneral;
  parts?: MultiPart[];
  demo?: DemoContent;
  guided?: GuidedPart[];
  transition?: TransitionContent;
  feedback?: StepFeedback;
  /** Coordinate-plane visual for distance steps. */
  graph?: GraphContent;
  /** Ordered solve steps for distance-guided / distance-problem. */
  subSteps?: DistanceSubStep[];
  /** Optional intro line shown above the graph (distance-demo). */
  intro?: string;
  /** Ordered point ids a car drives along once the final answer is solved. */
  carPath?: string[];
  /** Interactive coordinate grid (transformations / congruence / similarity). */
  grid?: GridContent;
  /** Transformation problem data (transform-demo/guided/problem). */
  transform?: TransformContent;
  /** Drag-to-match proof data (shape-match). */
  match?: MatchContent;
}

export interface Lesson {
  lessonId: string;
  title: string;
  steps: LessonStep[];
}
