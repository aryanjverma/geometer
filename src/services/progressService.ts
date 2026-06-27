import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/firebase';
import {
  emptyProgress,
  type LessonProgress,
  type UserProfile,
  type UserProgress,
  LESSON_ID,
} from '@/types/progress';
import { bumpStreak, todayString } from './streakService';
import { writeLeaderboardEntry, removeLeaderboardEntry } from './leaderboardService';

function progressDoc(uid: string) {
  return doc(db, 'users', uid, 'data', 'progress');
}

function profileDoc(uid: string) {
  return doc(db, 'users', uid, 'data', 'profile');
}

async function fetchProgress(uid: string): Promise<UserProgress> {
  const snap = await getDoc(progressDoc(uid));
  if (!snap.exists()) return emptyProgress();
  return snap.data() as UserProgress;
}

export function subscribeProgress(
  uid: string,
  onData: (progress: UserProgress) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    progressDoc(uid),
    (snap) => {
      onData(snap.exists() ? (snap.data() as UserProgress) : emptyProgress());
    },
    (err) => onError?.(err),
  );
}

async function saveProgress(uid: string, progress: UserProgress) {
  await setDoc(progressDoc(uid), progress, { merge: true });
}

export async function updateLessonProgress(
  uid: string,
  lessonId: string,
  update: Partial<LessonProgress>,
) {
  const current = await fetchProgress(uid);
  const existing = current.lessonProgress[lessonId] ?? {
    currentStep: 0,
    completed: false,
  };
  const next: UserProgress = {
    ...current,
    lessonProgress: {
      ...current.lessonProgress,
      [lessonId]: { ...existing, ...update },
    },
  };
  await saveProgress(uid, next);
  return next;
}

/**
 * Apply a lesson-progress update and bump the daily streak in a single
 * Firestore write, then mirror the streak into the public leaderboard.
 *
 * Combining both mutations into one document write is what keeps the streak
 * stable: every snapshot the live listener receives already contains
 * `streak`/`lastActivityDate`, so there is no intermediate server state that
 * could revert a freshly-bumped streak back to zero.
 */
export async function recordLessonActivity(
  uid: string,
  lessonId: string,
  update: Partial<LessonProgress>,
  entry: { displayName: string; photoURL: string },
): Promise<UserProgress> {
  const current = await fetchProgress(uid);
  const today = todayString();
  const { streak, lastActivityDate } = bumpStreak(
    current.lastActivityDate,
    today,
    current.streak ?? 0,
  );
  const existing = current.lessonProgress[lessonId] ?? {
    currentStep: 0,
    completed: false,
  };
  const next: UserProgress = {
    ...current,
    lessonProgress: {
      ...current.lessonProgress,
      [lessonId]: { ...existing, ...update },
    },
    streak,
    lastActivityDate,
  };
  await saveProgress(uid, next);
  await writeLeaderboardEntry({
    uid,
    displayName: entry.displayName,
    photoURL: entry.photoURL,
    streak,
  });
  return next;
}

export async function fetchProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(profileDoc(uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function saveProfile(uid: string, profile: UserProfile) {
  await setDoc(profileDoc(uid), profile, { merge: true });
}

export async function deleteUserData(uid: string) {
  await Promise.all([
    deleteDoc(progressDoc(uid)),
    deleteDoc(profileDoc(uid)),
    removeLeaderboardEntry(uid),
  ]);
}

export async function resetProgress(uid: string) {
  await Promise.all([deleteDoc(progressDoc(uid)), removeLeaderboardEntry(uid)]);
}

export function getLessonProgress(
  progress: UserProgress,
  lessonId: string = LESSON_ID,
): LessonProgress {
  return (
    progress.lessonProgress[lessonId] ?? { currentStep: 0, completed: false }
  );
}

/** Overall course percent: share of lessons completed across the given ids. */
export function getProgressPercent(
  progress: UserProgress,
  lessonIds: string[],
): number {
  if (lessonIds.length === 0) return 0;
  const done = lessonIds.filter(
    (id) => getLessonProgress(progress, id).completed,
  ).length;
  return Math.round((done / lessonIds.length) * 100);
}

/**
 * Phase 3 — the STRICT mastery signal for a lesson: has its Mastery Quiz
 * actually been passed? This is the only thing that flips a completed lesson's
 * CTA from "Take Mastery Quiz" to "Review" and lights the Mastered chip, so it
 * must NOT be inferred from mere completion — otherwise a learner who finishes a
 * lesson is robbed of ever taking its quiz. Legacy back-compat lives in the
 * separate, lenient {@link isPrereqSatisfied} gate, never here.
 */
export function hasMasteryPassed(
  progress: UserProgress,
  lessonId: string,
): boolean {
  return getLessonProgress(progress, lessonId).masteryPassed === true;
}

/** The Mastery Quiz for a lesson is unlocked only once the lesson is completed. */
export function isMasteryQuizUnlocked(
  progress: UserProgress,
  lessonId: string,
): boolean {
  return getLessonProgress(progress, lessonId).completed === true;
}

/**
 * Phase 3 — the lenient next-lesson UNLOCK gate, deliberately decoupled from
 * {@link hasMasteryPassed}. A prerequisite unlocks the next lesson when the
 * learner has either:
 *  - passed its Mastery Quiz (the real Phase 3 gate), or
 *  - a legacy completion that predates Phase 3 (`legacyCompleted`, back-filled
 *    by the v3 migration) so existing learners are never re-locked, or
 *  - (race window) completed it while still un-migrated, so a legacy learner is
 *    not momentarily re-locked before the migration write lands.
 * A fresh, post-migration completion does NOT satisfy this gate — the learner
 * must pass the quiz first.
 */
function isPrereqSatisfied(progress: UserProgress, lessonId: string): boolean {
  const lp = getLessonProgress(progress, lessonId);
  if (lp.masteryPassed === true) return true;
  if (lp.legacyCompleted === true) return true;
  if (!progress.v3Migrated && lp.completed === true) return true;
  return false;
}

/**
 * The next lesson is locked until the prerequisite's gate is satisfied. This is
 * one-way: once unlocked it never re-locks, even if the Daily Review later
 * un-masters a concept.
 */
export function isLessonLocked(
  progress: UserProgress,
  requires?: string,
): boolean {
  if (!requires) return false;
  return !isPrereqSatisfied(progress, requires);
}

export type LessonButtonState =
  | 'Start'
  | 'Continue'
  | 'Review'
  | 'Locked'
  | 'Take Mastery Quiz';

export function getLessonButtonState(
  progress: UserProgress,
  lessonId: string = LESSON_ID,
  requires?: string,
): LessonButtonState {
  if (isLessonLocked(progress, requires)) return 'Locked';
  const lp = getLessonProgress(progress, lessonId);
  if (lp.completed) {
    return hasMasteryPassed(progress, lessonId) ? 'Review' : 'Take Mastery Quiz';
  }
  if (lp.currentStep > 0) return 'Continue';
  return 'Start';
}

/**
 * One-time back-compat migration: mark every already-`completed` lesson as
 * `legacyCompleted` (which keeps the next lesson unlocked) and set the
 * `v3Migrated` flag. Crucially it does NOT set `masteryPassed`, so legacy
 * learners are never re-locked yet are still offered the Mastery Quiz on
 * lessons they completed before Phase 3. Idempotent — returns the same
 * reference once the flag is set. Pure; the persisted write lives in
 * {@link runV3MigrationIfNeeded}.
 */
export function migrateProgressV3(progress: UserProgress): UserProgress {
  if (progress.v3Migrated) return progress;
  const lessonProgress: Record<string, LessonProgress> = {};
  for (const [id, lp] of Object.entries(progress.lessonProgress)) {
    lessonProgress[id] =
      lp.completed && lp.masteryPassed !== true && lp.legacyCompleted !== true
        ? { ...lp, legacyCompleted: true }
        : lp;
  }
  return { ...progress, lessonProgress, v3Migrated: true };
}

/**
 * Run the v3 back-compat migration once and persist it (merge write). A no-op
 * for already-migrated learners. Best-effort: callers ignore failures.
 */
export async function runV3MigrationIfNeeded(
  uid: string,
): Promise<UserProgress | null> {
  const current = await fetchProgress(uid);
  if (current.v3Migrated) return null;
  const migrated = migrateProgressV3(current);
  await saveProgress(uid, migrated);
  return migrated;
}

/**
 * Persist a Mastery Quiz outcome. On a pass it sets the sticky
 * `masteryPassed`/`masteryPassedAt` gate and counts as a daily activity (streak
 * bump + leaderboard mirror), all in the single combined write that keeps the
 * streak stable. Concept mastery is NOT forced here: a pass records one clean
 * attempt per concept (via `recordConceptAttempt` in the quiz page), so under
 * the last-2 rule a concept moves to `learning` and needs a second correct
 * answer (Daily Review or a retake) to reach `mastered`. A fail is a no-op
 * here — `masteryPassed` is never set back to false.
 */
export async function recordMasteryQuizResult(
  uid: string,
  lessonId: string,
  passed: boolean,
  entry: { displayName: string; photoURL: string },
): Promise<void> {
  if (!passed) return;
  await recordLessonActivity(
    uid,
    lessonId,
    { masteryPassed: true, masteryPassedAt: Date.now() },
    entry,
  );
}

/**
 * Persist a Mastery Test outcome. On a pass it marks the course-level
 * `masteryTestPassed` flag and counts as a daily activity. A fail is a no-op.
 */
export async function recordMasteryTestResult(
  uid: string,
  passed: boolean,
  entry: { displayName: string; photoURL: string },
): Promise<void> {
  if (!passed) return;
  const current = await fetchProgress(uid);
  const today = todayString();
  const { streak, lastActivityDate } = bumpStreak(
    current.lastActivityDate,
    today,
    current.streak ?? 0,
  );
  const next: UserProgress = {
    ...current,
    masteryTestPassed: true,
    masteryTestPassedAt: Date.now(),
    streak,
    lastActivityDate,
  };
  await saveProgress(uid, next);
  await writeLeaderboardEntry({
    uid,
    displayName: entry.displayName,
    photoURL: entry.photoURL,
    streak,
  });
}
