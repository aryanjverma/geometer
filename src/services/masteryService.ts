import { CONCEPTS_BY_LESSON, conceptsForLesson } from '@/content/concepts';
import { getLessonMeta, type LessonMeta } from '@/content/lessons';
import { completedInScopeLessons } from '@/services/reviewSession';
import type { Concept, MasteryLevel } from '@/types/mastery';
import type { UserProgress } from '@/types/progress';
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

/**
 * Phase 3 — display-only aggregate of a lesson's live concept mastery (the
 * dynamic "Mastered" / "Review recommended" chip). All concepts mastered →
 * `mastered`; any concept needs review → `needs-review`; otherwise
 * `in-progress`. This moves up and down with Daily Review performance and does
 * NOT affect the sticky unlock gate (`isLessonLocked`). A lesson with no
 * tracked concepts is `in-progress`.
 */
export function lessonMasteryStatus(
  history: ConceptMasteryMap,
  lessonId: string,
): 'mastered' | 'in-progress' | 'needs-review' {
  const levels = lessonConceptMasteries(lessonId, history).map((m) => m.level);
  if (levels.length === 0) return 'in-progress';
  if (levels.some((l) => l === 'need-review')) return 'needs-review';
  if (levels.every((l) => l === 'mastered')) return 'mastered';
  return 'in-progress';
}

/** Numeric weight of a mastery level: mastered=2, learning=1, need-review=0. */
export function masteryScore(level: MasteryLevel): number {
  if (level === 'mastered') return 2;
  if (level === 'learning') return 1;
  return 0;
}

/** Mastery levels for every concept in the catalog, in lesson/concept order. */
export function allConceptMasteries(
  history: ConceptMasteryMap,
): Array<{ concept: Concept; level: MasteryLevel }> {
  return Object.keys(CONCEPTS_BY_LESSON).flatMap((lessonId) =>
    lessonConceptMasteries(lessonId, history),
  );
}

/**
 * Overall mastery percent across all catalog concepts. Each concept scores 0-2
 * and 100% means every concept is mastered. Returns 0 when there are no
 * concepts.
 */
export function masteryPercent(history: ConceptMasteryMap): number {
  const all = allConceptMasteries(history);
  if (all.length === 0) return 0;
  const sum = all.reduce((n, { level }) => n + masteryScore(level), 0);
  return Math.round((sum / (2 * all.length)) * 100);
}

/**
 * Mastery percent for a single lesson's concepts. Each concept scores 0-2 and
 * 100% means every concept in the lesson is mastered. Returns 0 when the lesson
 * has no tracked concepts.
 */
export function lessonMasteryPercent(
  history: ConceptMasteryMap,
  lessonId: string,
): number {
  const all = lessonConceptMasteries(lessonId, history);
  if (all.length === 0) return 0;
  const sum = all.reduce((n, { level }) => n + masteryScore(level), 0);
  return Math.round((sum / (2 * all.length)) * 100);
}

/** Counts of concepts at each mastery level across the whole catalog. */
export function masteryTotals(history: ConceptMasteryMap): {
  mastered: number;
  learning: number;
  needReview: number;
} {
  return allConceptMasteries(history).reduce(
    (acc, { level }) => {
      if (level === 'mastered') acc.mastered += 1;
      else if (level === 'learning') acc.learning += 1;
      else acc.needReview += 1;
      return acc;
    },
    { mastered: 0, learning: 0, needReview: 0 },
  );
}

/**
 * Among the completed in-scope lessons, the one with the lowest average concept
 * mastery score (ties broken by lesson order). Returns null when no in-scope
 * lesson has been completed yet.
 */
export function lowestMasteryLesson(
  progress: UserProgress,
  history: ConceptMasteryMap,
): LessonMeta | null {
  const completed = completedInScopeLessons(progress);
  let best: { meta: LessonMeta; avg: number } | null = null;
  for (const lessonId of completed) {
    const meta = getLessonMeta(lessonId);
    if (!meta) continue;
    const masteries = lessonConceptMasteries(lessonId, history);
    if (masteries.length === 0) continue;
    const avg =
      masteries.reduce((n, { level }) => n + masteryScore(level), 0) /
      masteries.length;
    if (best === null || avg < best.avg) {
      best = { meta, avg };
    }
  }
  return best?.meta ?? null;
}
