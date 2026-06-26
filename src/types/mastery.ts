/**
 * Phase 2 — Concept Mastery shared types.
 *
 * A "concept" is one auto-graded "You do" step in a lesson. Mastery is computed
 * from the last 2 recorded attempts of that concept's question.
 */

/** Mastery state, derived from the last two recorded attempts. */
export type MasteryLevel = 'need-review' | 'learning' | 'mastered';

/** One auto-graded concept within a lesson, tied to a single You-do step. */
export interface Concept {
  conceptId: string;
  lessonId: string;
  label: string;
  /** The lesson "You do" step id whose attempts feed this concept's mastery. */
  stepId: string;
}
