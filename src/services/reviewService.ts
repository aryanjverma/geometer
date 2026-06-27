import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { LESSONS } from '@/content/lessons';
import { conceptsForLesson } from '@/content/concepts';
import {
  makeQuestionId,
  type ConceptAttempt,
  type ConceptMastery,
  type ConceptMasteryMap,
  type QuestionFormat,
  type ReviewResultItem,
} from '@/types/review';
import { masteryLevel } from './masteryService';

/**
 * Phase 2 — FR-1 / FR-3 review service.
 *
 * Pure functions (`foldAttempt`, `selectReviewFormats`, `recommendLessons`) hold
 * all the rule-based logic and are exhaustively unit-tested. The Firestore
 * wrappers at the bottom mirror `progressService` for persistence.
 */

/** Newest-last correctness log is capped to this many entries. */
const RECENT_CAP = 2;

/**
 * Fold a single attempt into a per-concept mastery record. Pure and
 * side-effect free so it can be unit-tested and reused by the writer.
 */
export function foldAttempt(
  existing: ConceptMastery | undefined,
  attempt: ConceptAttempt,
): ConceptMastery {
  return {
    lessonId: attempt.lessonId,
    stepId: attempt.stepId,
    recentCorrect: [...(existing?.recentCorrect ?? []), attempt.correct].slice(
      -RECENT_CAP,
    ),
    lastReviewedAt: attempt.at,
  };
}

// ---------------------------------------------------------------------------
// Rule-based selection
// ---------------------------------------------------------------------------

/** Days of inactivity at which the staleness signal saturates. */
const STALE_DAYS = 30;
const DAY_MS = 86_400_000;

// Relative weights of the two review signals (higher score = review sooner).
const LEVEL_WEIGHT = 10; // mastery level dominates
const STALENESS_WEIGHT = 1; // long since last reviewed

function clamp01(x: number): number {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

/**
 * Deterministic review priority for one concept.
 *
 * rank: need-review = 2, learning = 1, mastered = 0
 * staleness = record ? clamp01(max(0, now - lastReviewedAt) / (STALE_DAYS*DAY))
 *                     : 1
 * score = LEVEL_WEIGHT * rank + STALENESS_WEIGHT * staleness
 *
 * A never-practiced concept (no record) is treated as need-review (rank 2) and
 * maximally stale, so it always ranks in once its source lesson is complete.
 */
function reviewScore(
  record: ConceptMastery | undefined,
  now: number,
): number {
  const level = masteryLevel(record?.recentCorrect ?? []);
  const rank = level === 'need-review' ? 2 : level === 'learning' ? 1 : 0;
  const staleness = record
    ? clamp01(Math.max(0, now - record.lastReviewedAt) / (STALE_DAYS * DAY_MS))
    : 1;
  return LEVEL_WEIGHT * rank + STALENESS_WEIGHT * staleness;
}

/**
 * Select up to `opts.count` formats to review, prioritizing need-review and
 * learning concepts over mastered ones, then staler over fresher. Deterministic:
 * ties break by `formatId` ascending. Duplicate formats are removed.
 */
export function selectReviewFormats(
  history: ConceptMasteryMap,
  formats: QuestionFormat[],
  opts: { count: number; now: number },
): QuestionFormat[] {
  const seen = new Set<string>();
  const unique: QuestionFormat[] = [];
  for (const f of formats) {
    if (seen.has(f.formatId)) continue;
    seen.add(f.formatId);
    unique.push(f);
  }

  const scored = unique.map((format) => {
    const record = history[makeQuestionId(format.lessonId, format.sourceStepId)];
    return { format, score: reviewScore(record, opts.now) };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.format.formatId.localeCompare(b.format.formatId);
  });

  return scored.slice(0, Math.max(0, opts.count)).map((s) => s.format);
}

// ---------------------------------------------------------------------------
// Rule-based recommendations
// ---------------------------------------------------------------------------

/**
 * Map missed (incorrect) review results to their source lessons, deduplicated
 * and ordered by course position (the order of `LESSONS`).
 */
export function recommendLessons(results: ReviewResultItem[]): string[] {
  const missed = new Set<string>();
  for (const r of results) {
    if (!r.correct) missed.add(r.lessonId);
  }
  return LESSONS.map((l) => l.lessonId).filter((id) => missed.has(id));
}

// ---------------------------------------------------------------------------
// Firestore CRUD (FR-1) — mirrors progressService patterns
// ---------------------------------------------------------------------------

function conceptMasteryCol(uid: string) {
  return collection(db, 'users', uid, 'conceptMastery');
}

function conceptMasteryDoc(uid: string, lessonId: string, stepId: string) {
  return doc(db, 'users', uid, 'conceptMastery', makeQuestionId(lessonId, stepId));
}

function mapFromDocs(docs: {
  forEach: (cb: (d: { id: string; data: () => unknown }) => void) => void;
}): ConceptMasteryMap {
  const map: ConceptMasteryMap = {};
  docs.forEach((d) => {
    map[d.id] = d.data() as ConceptMastery;
  });
  return map;
}

/** Live-subscribe to the learner's concept-mastery history. */
export function subscribeConceptMastery(
  uid: string,
  onData: (mastery: ConceptMasteryMap) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    conceptMasteryCol(uid),
    (snap) => onData(mapFromDocs(snap)),
    (err) => onError?.(err),
  );
}

/** One-shot read of the learner's concept-mastery history. */
export async function fetchConceptMastery(
  uid: string,
): Promise<ConceptMasteryMap> {
  const snap = await getDocs(conceptMasteryCol(uid));
  return mapFromDocs(snap);
}

/**
 * Delete every concept-mastery record for a learner. Concept mastery is the
 * "question progress" that drives the Daily Review and the per-lesson Mastered
 * chips, so resetting/wiping a learner must clear it too — otherwise mastery
 * survives a reset and the progress wipe looks like it did nothing.
 */
export async function deleteAllConceptMastery(uid: string): Promise<void> {
  const snap = await getDocs(conceptMasteryCol(uid));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

/**
 * Persist one concept attempt: read the existing record, fold in the attempt,
 * and write it back (merge) at the stable question-id doc path.
 */
export async function recordConceptAttempt(
  uid: string,
  attempt: ConceptAttempt,
): Promise<void> {
  const ref = conceptMasteryDoc(uid, attempt.lessonId, attempt.stepId);
  const snap = await getDoc(ref);
  const existing = snap.exists()
    ? (snap.data() as ConceptMastery)
    : undefined;
  const next = foldAttempt(existing, attempt);
  await setDoc(ref, next, { merge: true });
}

/**
 * Build the per-concept attempts to record when a lesson is finished. A concept
 * counts as correct ONLY if the learner did not struggle on its step (i.e. its
 * stepId is not in `struggledStepIds`); a struggled concept records a wrong flag
 * so getting a concept wrong can never boost mastery. Concepts whose step never
 * reports a wrong attempt (e.g. drag interactions that don't surface one)
 * default to correct. Pure and side-effect free for unit testing.
 */
export function lessonCompletionAttempts(
  lessonId: string,
  struggledStepIds: ReadonlySet<string>,
  at: number,
): ConceptAttempt[] {
  return conceptsForLesson(lessonId).map((concept) => ({
    lessonId,
    stepId: concept.stepId,
    correct: !struggledStepIds.has(concept.stepId),
    at,
  }));
}

/**
 * Persist one attempt per concept when the learner finishes a lesson, marking a
 * concept wrong if they struggled on it (see {@link lessonCompletionAttempts}).
 * Under the last-2 rule this means a clean concept levels up while a struggled
 * one is held back or lowered. Best-effort: a failed write must never block
 * lesson completion.
 */
export async function recordLessonCompletionAttempts(
  uid: string,
  lessonId: string,
  struggledStepIds: ReadonlySet<string> = new Set(),
): Promise<void> {
  const attempts = lessonCompletionAttempts(lessonId, struggledStepIds, Date.now());
  await Promise.all(
    attempts.map(async (attempt) => {
      const ref = conceptMasteryDoc(uid, attempt.lessonId, attempt.stepId);
      const snap = await getDoc(ref);
      const existing = snap.exists()
        ? (snap.data() as ConceptMastery)
        : undefined;
      const next = foldAttempt(existing, attempt);
      await setDoc(ref, next, { merge: true });
    }),
  );
}
