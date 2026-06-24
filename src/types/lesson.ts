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
  | 'distance-problem';

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

export interface LessonStep {
  id: string;
  type: StepType;
  prompt: string;
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
}

export interface Lesson {
  lessonId: string;
  title: string;
  steps: LessonStep[];
}
