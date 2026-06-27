export interface LessonProgress {
  currentStep: number;
  completed: boolean;
  /**
   * Phase 3 — STICKY mastery-quiz unlock gate: true once the lesson's Mastery
   * Quiz has been passed at least once. Never reverts (review slips do not
   * re-lock). Drives whether the next lesson is accessible.
   */
  masteryPassed?: boolean;
  /** Phase 3 — epoch ms of the first mastery-quiz pass (for milestones). */
  masteryPassedAt?: number;
  /**
   * Phase 3 back-compat — set by the v3 migration on lessons a learner had
   * already `completed` before Phase 3 shipped. It satisfies the next-lesson
   * unlock gate (so legacy learners are never re-locked) WITHOUT counting as a
   * quiz pass, so the learner is still offered the Mastery Quiz on that lesson.
   * Distinct from `masteryPassed`, which is only ever set by passing the quiz.
   */
  legacyCompleted?: boolean;
}

export interface UserProgress {
  lessonProgress: Record<string, LessonProgress>;
  /** Current daily streak count. */
  streak?: number;
  /** Last day the learner did any activity, as a local "YYYY-MM-DD" string. */
  lastActivityDate?: string;
  /** Phase 3 — true once the comprehensive Mastery Test has been passed. */
  masteryTestPassed?: boolean;
  /** Phase 3 — epoch ms of the Mastery Test pass. */
  masteryTestPassedAt?: number;
  /**
   * Phase 3 — set once the one-time v3 back-compat migration has run for this
   * learner (legacy `completed` lessons marked `legacyCompleted` to keep the
   * next lesson unlocked). After it is set, a fresh completion no longer
   * auto-unlocks the next lesson — the learner must pass the Mastery Quiz.
   */
  v3Migrated?: boolean;
}

export interface UserProfile {
  displayName: string;
  photoURL: string;
  /** Interest tags used to theme AI word-problem reskins (Phase 2). */
  interests?: string[];
  /**
   * Explicit AI off-switch. When false, the review session skips every AI call
   * (reskins and Socratic hints) and uses the deterministic template prompts and
   * hand-written hints instead. `undefined` is treated as enabled (the default),
   * so existing profiles keep AI on.
   */
  aiEnabled?: boolean;
}

/** A single row in the streak leaderboard (denormalized for cross-user reads). */
export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  streak: number;
}

export const LESSON_ID = 'right-triangles';

export function emptyProgress(): UserProgress {
  return { lessonProgress: {} };
}
