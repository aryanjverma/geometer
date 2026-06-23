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

function progressDoc(uid: string) {
  return doc(db, 'users', uid, 'data', 'progress');
}

function profileDoc(uid: string) {
  return doc(db, 'users', uid, 'data', 'profile');
}

export async function fetchProgress(uid: string): Promise<UserProgress> {
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

export async function saveProgress(uid: string, progress: UserProgress) {
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
    lessonProgress: {
      ...current.lessonProgress,
      [lessonId]: { ...existing, ...update },
    },
  };
  await saveProgress(uid, next);
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
  ]);
}

export async function resetProgress(uid: string) {
  await deleteDoc(progressDoc(uid));
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

export function isLessonLocked(
  progress: UserProgress,
  requires?: string,
): boolean {
  if (!requires) return false;
  return !getLessonProgress(progress, requires).completed;
}

export type LessonButtonState = 'Start' | 'Continue' | 'Review' | 'Locked';

export function getLessonButtonState(
  progress: UserProgress,
  lessonId: string = LESSON_ID,
  requires?: string,
): LessonButtonState {
  if (isLessonLocked(progress, requires)) return 'Locked';
  const lp = getLessonProgress(progress, lessonId);
  if (lp.completed) return 'Review';
  if (lp.currentStep > 0) return 'Continue';
  return 'Start';
}
