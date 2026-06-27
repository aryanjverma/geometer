import { getLessonProgress } from '@/services/progressService';
import type { UserProgress } from '@/types/progress';
import type { QuestionFormat, ReviewResultItem } from '@/types/review';

/**
 * Phase 2 — pure helpers for the review-session UI layer.
 *
 * These hold the small testable rules the React components consume: review
 * unlock gating, per-question session-outcome scoring, and parsing the
 * comma-separated interests field. The heavy rule-based logic (selection,
 * recommendations, persistence) lives in the frozen `reviewService`.
 */

/** Lessons whose You-do questions have review formats. */
export const IN_SCOPE_LESSONS: string[] = [
  'right-triangles',
  'non-right-triangles',
  'distance-coordinate-plane',
  'transformations',
  'congruence-similarity',
  'angles-lines',
  'triangle-angles',
  'solids-3d',
];

/** In-scope lessons the learner has completed, in `IN_SCOPE_LESSONS` order. */
export function completedInScopeLessons(progress: UserProgress): string[] {
  return IN_SCOPE_LESSONS.filter(
    (id) => getLessonProgress(progress, id).completed,
  );
}

/** Review is available once any in-scope lesson is completed. */
export function isReviewUnlocked(progress: UserProgress): boolean {
  return completedInScopeLessons(progress).length > 0;
}

/** Per-question session flags accumulated while the learner solves it. */
export interface QuestionFlags {
  /** The learner submitted at least one wrong answer for this question. */
  wrongAttempt: boolean;
  /** The learner opened a hint before solving this question. */
  hintUsed: boolean;
}

/**
 * A question counts as correct in the session results only if the learner made
 * NO wrong attempt and used NO hint before solving it.
 */
export function isSessionQuestionCorrect(flags: QuestionFlags): boolean {
  return !flags.wrongAttempt && !flags.hintUsed;
}

/** Build a session result row from a format and its accumulated flags. */
export function buildResultItem(
  format: Pick<QuestionFormat, 'formatId' | 'lessonId'>,
  flags: QuestionFlags,
): ReviewResultItem {
  return {
    formatId: format.formatId,
    lessonId: format.lessonId,
    correct: isSessionQuestionCorrect(flags),
  };
}

/**
 * Parse the comma-separated interests field into a clean string[]: trim each
 * entry, drop blanks, and dedupe case-insensitively (keeping the first form).
 * Empty input yields an empty list, which is valid.
 */
export function parseInterests(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(',')) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

/** Render an interests list back into editable comma-separated text. */
export function serializeInterests(interests: string[]): string {
  return interests.join(', ');
}
