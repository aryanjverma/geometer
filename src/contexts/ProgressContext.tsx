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
  recordLessonActivity,
  deleteUserData,
  resetProgress as resetProgressService,
} from '@/services/progressService';
import {
  emptyProgress,
  type UserProfile,
  type UserProgress,
} from '@/types/progress';

interface ProgressContextValue {
  progress: UserProgress;
  profile: UserProfile | null;
  loading: boolean;
  setStep: (lessonId: string, step: number) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  resetProgress: () => Promise<void>;
  wipeUserData: () => Promise<void>;
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
    let progressReady = false;
    let profileReady = false;
    const settle = () => {
      if (progressReady && profileReady) setLoading(false);
    };
    const unsub = subscribeProgress(
      user.uid,
      (p) => {
        setProgress(p);
        progressReady = true;
        settle();
      },
      () => {
        progressReady = true;
        settle();
      },
    );
    fetchProfile(user.uid)
      .then(setProfile)
      .catch(() => {})
      .finally(() => {
        profileReady = true;
        settle();
      });
    return unsub;
  }, [user]);

  const activityEntry = useCallback(
    () => ({
      displayName: profile?.displayName ?? user?.displayName ?? 'Learner',
      photoURL: profile?.photoURL ?? user?.photoURL ?? '',
    }),
    [profile, user],
  );

  const setStep = useCallback(
    async (lessonId: string, step: number) => {
      if (!user) return;
      const next = await recordLessonActivity(
        user.uid,
        lessonId,
        { currentStep: step },
        activityEntry(),
      );
      setProgress(next);
    },
    [user, activityEntry],
  );

  const completeLesson = useCallback(
    async (lessonId: string) => {
      if (!user) return;
      const next = await recordLessonActivity(
        user.uid,
        lessonId,
        { currentStep: 0, completed: true },
        activityEntry(),
      );
      setProgress(next);
    },
    [user, activityEntry],
  );

  const updateProfile = useCallback(
    async (nextProfile: UserProfile) => {
      if (!user) return;
      await saveProfile(user.uid, nextProfile);
      setProfile(nextProfile);
    },
    [user],
  );

  const resetProgress = useCallback(async () => {
    if (!user) return;
    await resetProgressService(user.uid);
    setProgress(emptyProgress());
  }, [user]);

  const wipeUserData = useCallback(async () => {
    if (!user) return;
    await deleteUserData(user.uid);
  }, [user]);

  const value = useMemo(
    () => ({
      progress,
      profile,
      loading,
      setStep,
      completeLesson,
      updateProfile,
      resetProgress,
      wipeUserData,
    }),
    [progress, profile, loading, setStep, completeLesson, updateProfile, resetProgress, wipeUserData],
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
