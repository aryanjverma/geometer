export interface LessonProgress {
  currentStep: number;
  completed: boolean;
}

export interface UserProgress {
  lessonProgress: Record<string, LessonProgress>;
  /** Current daily streak count. */
  streak?: number;
  /** Last day the learner did any activity, as a local "YYYY-MM-DD" string. */
  lastActivityDate?: string;
}

export interface UserProfile {
  displayName: string;
  photoURL: string;
  /** Interest tags used to theme AI word-problem reskins (Phase 2). */
  interests?: string[];
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
