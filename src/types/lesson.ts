export type StepType =
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
  | 'transition';

export interface StepFeedback {
  correct?: string;
  wrong?: string;
  hint?: string;
}

export interface TriangleLegs {
  legs: [number, number];
  hypotenuse?: number;
}

export interface TrianglePartial {
  leg: number;
  hypotenuse: number;
  missingLeg?: number;
}

export interface TriangleGeneral {
  base: number;
  height: number;
  /** Base segment to the left of the altitude foot (for the split visual). */
  leftSplit?: number;
  /** Base segment to the right of the altitude foot. */
  rightSplit?: number;
  /** [left side, right side] — shown once revealed. */
  sides?: [number, number];
}

export interface MultiPart {
  id: string;
  prompt: string;
  answer: number;
  feedback?: { correct?: string; wrong?: string; hint?: string };
}

/** A single click-to-reveal step in an "I do" worked demonstration. */
export interface DemoReveal {
  label: string;
  body: string;
  formula?: string;
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

export interface DemoContent {
  intro?: string;
  reveals: DemoReveal[];
  /** Optional embedded interactive widget. */
  interactive?: 'shear';
}

/** A full-slide transition message shown between lesson phases. */
export interface TransitionContent {
  emoji: string;
  /** Button label; defaults to "Continue". */
  cta?: string;
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
}

export interface Lesson {
  lessonId: string;
  title: string;
  steps: LessonStep[];
}
