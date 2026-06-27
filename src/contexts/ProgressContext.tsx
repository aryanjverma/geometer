import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchProfile,
  saveProfile,
  subscribeProgress,
  recordLessonActivity,
  runV3MigrationIfNeeded,
  deleteUserData,
  resetProgress as resetProgressService,
} from '@/services/progressService';
import {
  subscribeConceptMastery,
  deleteAllConceptMastery,
} from '@/services/reviewService';
import {
  emptyProgress,
  type UserProfile,
  type UserProgress,
} from '@/types/progress';
import type { ConceptMasteryMap } from '@/types/review';

interface ProgressContextValue {
  progress: UserProgress;
  profile: UserProfile | null;
  /** Live concept-mastery records, keyed by questionId. Updates independently. */
  conceptMastery: ConceptMasteryMap;
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
  const [conceptMastery, setConceptMastery] = useState<ConceptMasteryMap>({});
  const [loading, setLoading] = useState(true);
  // Guards the one-time Phase 3 back-compat migration so it runs at most once
  // per signed-in session even though progress snapshots stream in repeatedly.
  const migrationStartedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setProgress(emptyProgress());
      setProfile(null);
      setConceptMastery({});
      setLoading(false);
      return;
    }

    setLoading(true);
    migrationStartedRef.current = false;
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
        // Mark legacy completions as `legacyCompleted` exactly once, before the
        // learner can complete anything new, so the sticky quiz gate is correct
        // for fresh learners and never re-locks existing ones (without robbing
        // them of the Mastery Quiz on lessons they already completed).
        if (!p.v3Migrated && !migrationStartedRef.current) {
          migrationStartedRef.current = true;
          runV3MigrationIfNeeded(user.uid).catch(() => {});
        }
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
    // Concept-mastery records stream in independently and never gate the
    // initial loading state: they start empty and fill in live.
    const unsubQuestions = subscribeConceptMastery(
      user.uid,
      setConceptMastery,
      () => {},
    );
    return () => {
      unsub();
      unsubQuestions();
    };
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
    // Reset both stores: the progress/profile doc AND the separate
    // conceptMastery collection (the "question progress"). Clearing only the
    // former leaves mastery chips and Daily Review reflecting old data, which
    // makes the reset look like it did nothing.
    await Promise.all([
      resetProgressService(user.uid),
      deleteAllConceptMastery(user.uid),
    ]);
    setProgress(emptyProgress());
    setConceptMastery({});
  }, [user]);

  const wipeUserData = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      deleteUserData(user.uid),
      deleteAllConceptMastery(user.uid),
    ]);
  }, [user]);

  const value = useMemo(
    () => ({
      progress,
      profile,
      conceptMastery,
      loading,
      setStep,
      completeLesson,
      updateProfile,
      resetProgress,
      wipeUserData,
    }),
    [progress, profile, conceptMastery, loading, setStep, completeLesson, updateProfile, resetProgress, wipeUserData],
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
