import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchProfile,
  saveProfile,
  subscribeProgress,
  updateLessonProgress,
  deleteUserData,
  getLessonProgress,
} from '@/services/progressService';
import {
  emptyProgress,
  type LessonProgress,
  type UserProfile,
  type UserProgress,
  LESSON_ID,
} from '@/types/progress';

interface ProgressContextValue {
  progress: UserProgress;
  profile: UserProfile | null;
  loading: boolean;
  setStep: (step: number) => Promise<void>;
  completeLesson: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  wipeUserData: () => Promise<void>;
  lessonProgress: LessonProgress;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(emptyProgress());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProgress(emptyProgress());
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeProgress(user.uid, setProgress, () => setLoading(false));
    fetchProfile(user.uid).then(setProfile).finally(() => setLoading(false));
    return unsub;
  }, [user]);

  const setStep = useCallback(
    async (step: number) => {
      if (!user) return;
      const next = await updateLessonProgress(user.uid, LESSON_ID, {
        currentStep: step,
      });
      setProgress(next);
    },
    [user],
  );

  const completeLesson = useCallback(async () => {
    if (!user) return;
    const next = await updateLessonProgress(user.uid, LESSON_ID, {
      currentStep: 3,
      completed: true,
    });
    setProgress(next);
  }, [user]);

  const updateProfile = useCallback(
    async (nextProfile: UserProfile) => {
      if (!user) return;
      await saveProfile(user.uid, nextProfile);
      setProfile(nextProfile);
    },
    [user],
  );

  const wipeUserData = useCallback(async () => {
    if (!user) return;
    await deleteUserData(user.uid);
  }, [user]);

  const lessonProgress = getLessonProgress(progress);

  const value = useMemo(
    () => ({
      progress,
      profile,
      loading,
      setStep,
      completeLesson,
      updateProfile,
      wipeUserData,
      lessonProgress,
    }),
    [
      progress,
      profile,
      loading,
      setStep,
      completeLesson,
      updateProfile,
      wipeUserData,
      lessonProgress,
    ],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
