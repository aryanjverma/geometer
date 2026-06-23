export type StepType =
  | 'interactive-unfold'
  | 'formula-compute'
  | 'numeric'
  | 'multi-part-numeric'
  | 'leg-then-perimeter';

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

export interface MultiPart {
  id: string;
  prompt: string;
  answer: number;
  feedback?: { correct?: string; wrong?: string; hint?: string };
}

export interface LessonStep {
  id: string;
  type: StepType;
  prompt: string;
  answer?: number;
  formula?: string;
  triangle?: TriangleLegs | TrianglePartial;
  parts?: MultiPart[];
  feedback?: StepFeedback;
}

export interface Lesson {
  lessonId: string;
  title: string;
  steps: LessonStep[];
}
