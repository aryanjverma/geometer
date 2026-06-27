import { REVIEW_FORMATS } from '@/content/reviewFormats';
import type { GeneratedQuestion, QuestionFormat } from '@/types/review';

/**
 * Phase 3 — Mastery Quiz / Test generation (pure, deterministic, AI-free).
 *
 * Both builders reuse the Phase 2 {@link REVIEW_FORMATS} catalog: each format
 * owns a deterministic generator and a ground-truth integer answer, so the
 * existing StepRenderer grades them with no AI and no new UI. A Mastery Quiz is
 * isolated to a single lesson (blocked practice for first-pass mastery); the
 * Mastery Test interleaves every concept across all lessons (the consolidation
 * finale).
 */

/** All formats belonging to one lesson, in catalog order. */
export function masteryQuizFormats(lessonId: string): QuestionFormat[] {
  return REVIEW_FORMATS.filter((f) => f.lessonId === lessonId);
}

/**
 * Build a per-lesson Mastery Quiz: one fresh question per concept in that
 * lesson and nothing from any other lesson. Stateless across retakes — each
 * call regenerates numbers via `format.generate(rng)`.
 */
export function buildMasteryQuiz(
  lessonId: string,
  rng?: () => number,
): GeneratedQuestion[] {
  return masteryQuizFormats(lessonId).map((f) => f.generate(rng));
}

/**
 * Round-robin items by `lessonId` so consecutive entries come from different
 * lessons where possible: take the first item of every lesson, then the second
 * of every lesson, and so on. Lesson order follows first appearance in `items`.
 */
export function interleaveByLesson<T extends { lessonId: string }>(
  items: readonly T[],
): T[] {
  const byLesson = new Map<string, T[]>();
  for (const item of items) {
    const bucket = byLesson.get(item.lessonId);
    if (bucket) bucket.push(item);
    else byLesson.set(item.lessonId, [item]);
  }
  const lessons = [...byLesson.keys()];
  const out: T[] = [];
  let layer = 0;
  let added = true;
  while (added) {
    added = false;
    for (const lessonId of lessons) {
      const bucket = byLesson.get(lessonId)!;
      if (layer < bucket.length) {
        out.push(bucket[layer]);
        added = true;
      }
    }
    layer += 1;
  }
  return out;
}

/**
 * Build the comprehensive Mastery Test: one fresh question per concept across
 * all lessons, interleaved so consecutive questions come from different lessons
 * where possible.
 */
export function buildMasteryTest(rng?: () => number): GeneratedQuestion[] {
  return interleaveByLesson(REVIEW_FORMATS).map((f) => f.generate(rng));
}

/**
 * A Mastery Quiz / Test is passed only when every concept was answered
 * cleanly-correct (no wrong attempt, no hint). The caller derives each result's
 * `correct` flag from {@link QuestionFlags} via `isSessionQuestionCorrect`, so
 * this stays a thin aggregate over those clean-correct outcomes. An empty result
 * set is never a pass.
 */
export function isMasteryQuizPassed(
  results: ReadonlyArray<{ correct: boolean }>,
): boolean {
  return results.length > 0 && results.every((r) => r.correct);
}
