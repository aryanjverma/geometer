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

export function getLessonProgress(
  progress: UserProgress,
  lessonId: string = LESSON_ID,
): LessonProgress {
  return (
    progress.lessonProgress[lessonId] ?? { currentStep: 0, completed: false }
  );
}

export function getProgressPercent(progress: UserProgress): number {
  const lp = getLessonProgress(progress);
  return lp.completed ? 100 : 0;
}

export type LessonButtonState = 'Start' | 'Continue' | 'Review';

export function getLessonButtonState(progress: UserProgress): LessonButtonState {
  const lp = getLessonProgress(progress);
  if (lp.completed) return 'Review';
  if (lp.currentStep > 0) return 'Continue';
  return 'Start';
}
