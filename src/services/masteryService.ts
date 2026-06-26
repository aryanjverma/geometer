import { conceptsForLesson } from '@/content/concepts';
import type { Concept, MasteryLevel } from '@/types/mastery';
import { makeQuestionId, type ConceptMasteryMap } from '@/types/review';

/**
 * Phase 2 — Concept Mastery service (pure).
 *
 * Mastery is computed from the last 2 recorded correctness flags of a concept's
 * question: 2 correct → mastered, exactly 1 → learning, 0 → need-review.
 * Missing/empty history counts as not-correct.
 */

/** Mastery level from a correctness log, using only the last two entries. */
export function masteryLevel(
  recentCorrect: ReadonlyArray<boolean>,
): MasteryLevel {
  const last2 = recentCorrect.slice(-2);
  const correct = last2.reduce((n, c) => n + (c ? 1 : 0), 0);
  if (correct >= 2) return 'mastered';
  if (correct === 1) return 'learning';
  return 'need-review';
}

/**
 * For each concept in a lesson, read its recorded correctness flags from the
 * history map and compute its mastery level. Returns entries in lesson concept
 * order.
 */
export function lessonConceptMasteries(
  lessonId: string,
  history: ConceptMasteryMap,
): Array<{ concept: Concept; level: MasteryLevel }> {
  return conceptsForLesson(lessonId).map((concept) => {
    const recentCorrect =
      history[makeQuestionId(lessonId, concept.stepId)]?.recentCorrect ?? [];
    return { concept, level: masteryLevel(recentCorrect) };
  });
}
