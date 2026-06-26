import type { LessonStep } from './lesson';

/**
 * Phase 2 — Review Session shared type contract.
 *
 * This file is the interface boundary between the review modules:
 * - `src/content/reviewFormats.ts`  (question formats + ground-truth solvers)
 * - `src/services/reviewService.ts` (concept-mastery records, rule-based
 *    selection, and lesson recommendations)
 * - `src/services/aiReviewService.ts` (AI word-problem reskin + Socratic hints)
 *
 * Do not add module-private types here; keep those in their own module.
 */

/** The numbers plugged into a question format (e.g. { a: 3, b: 4, c: 5 }). */
export type QuestionParams = Record<string, number>;

/**
 * A concrete, fully-solved review question produced by a QuestionFormat.
 *
 * `step` is an ephemeral LessonStep so the existing StepRenderer can render and
 * grade it with no new UI. `step` always carries the ground-truth answer(s), so
 * correctness never depends on AI. `basePrompt` is the plain template prompt; an
 * AI reskin may replace only the displayed prompt text, never the numbers.
 */
export interface GeneratedQuestion {
  formatId: string;
  lessonId: string;
  step: LessonStep;
  params: QuestionParams;
  basePrompt: string;
  /** The single ground-truth answer used by the hint answer-leak filter. */
  answer: number;
}

/**
 * A parameterized template derived from a Phase 1 "You do" question. `generate`
 * plugs in numbers (curated set, fully random, or partially random) and returns
 * a solved question. An optional injectable `rng` keeps generation deterministic
 * in tests.
 */
export interface QuestionFormat {
  formatId: string;
  /** Concept/lesson this format reviews (matches a Phase 1 lessonId). */
  lessonId: string;
  /** The Phase 1 You-do step id this format derives from. */
  sourceStepId: string;
  /** Human concept label, e.g. "Find the hypotenuse". */
  label: string;
  /** Produce a fresh, solved question. `rng` defaults to Math.random. */
  generate(rng?: () => number): GeneratedQuestion;
}

/** A single correctness signal to fold into a ConceptMastery record. */
export interface ConceptAttempt {
  lessonId: string;
  stepId: string;
  correct: boolean;
  /** Epoch ms. */
  at: number;
}

/**
 * Per-concept rolling mastery record stored at
 * `users/{uid}/conceptMastery/{lessonId__stepId}`. Only the last two
 * correctness flags (newest last) and the last-reviewed timestamp are kept.
 */
export interface ConceptMastery {
  lessonId: string;
  stepId: string;
  /** Newest last, capped at 2. */
  recentCorrect: boolean[];
  /** Epoch ms of the most recent review. */
  lastReviewedAt: number;
}

/** Concept-mastery history keyed by questionId (`lessonId__stepId`). */
export type ConceptMasteryMap = Record<string, ConceptMastery>;

/** One question's outcome within a finished review session. */
export interface ReviewResultItem {
  formatId: string;
  lessonId: string;
  correct: boolean;
}

/** Stable document/record id for a completed question. */
export function makeQuestionId(lessonId: string, stepId: string): string {
  return `${lessonId}__${stepId}`;
}
