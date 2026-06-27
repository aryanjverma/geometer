import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Phase 3 — FR-7 locked-in assessment guard.
 *
 * Drives the three pre-results phases of a Mastery Quiz / Test:
 *  - `intro`   — the rules-agreement gate (the learner must opt in).
 *  - `active`  — questions are running and the one-sitting lock is armed.
 *  - `voided`  — the learner left (tab switch / minimize / window blur), so the
 *                attempt is discarded; nothing is recorded and they must restart.
 *
 * While `active`, the guard voids the attempt on `visibilitychange` (hidden) and
 * window `blur`, and warns on refresh/close via `beforeunload`. The owning page
 * calls {@link AssessmentGuard.stop} once it reaches the results screen so the
 * listeners detach (leaving the results is fine), and {@link AssessmentGuard.reset}
 * to return to the intro gate (e.g. after a void, before a restart).
 */
export type AssessmentPhase = 'intro' | 'active' | 'voided';

export interface AssessmentGuard {
  phase: AssessmentPhase;
  /** Acknowledge the rules and begin the locked-in attempt. */
  start: () => void;
  /** Discard the in-progress attempt (records nothing; forces a restart). */
  voidAttempt: () => void;
  /** Disarm the lock without voiding — used once the attempt has finished. */
  stop: () => void;
  /** Return to the intro gate (disarms the lock). */
  reset: () => void;
}

export function useAssessmentGuard(): AssessmentGuard {
  const [phase, setPhase] = useState<AssessmentPhase>('intro');
  const [guarding, setGuarding] = useState(false);
  // Mirrors `guarding` for the event handlers so a same-tick blur after stop()
  // can't re-trigger a void off a stale closure.
  const guardingRef = useRef(false);

  const voidAttempt = useCallback(() => {
    if (!guardingRef.current) return;
    guardingRef.current = false;
    setGuarding(false);
    setPhase('voided');
  }, []);

  const start = useCallback(() => {
    guardingRef.current = true;
    setGuarding(true);
    setPhase('active');
  }, []);

  const stop = useCallback(() => {
    guardingRef.current = false;
    setGuarding(false);
  }, []);

  const reset = useCallback(() => {
    guardingRef.current = false;
    setGuarding(false);
    setPhase('intro');
  }, []);

  useEffect(() => {
    if (!guarding) return;

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') voidAttempt();
    };
    const onBlur = () => voidAttempt();
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Legacy browsers require returnValue to be set to trigger the prompt.
      e.returnValue = '';
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [guarding, voidAttempt]);

  return { phase, start, voidAttempt, stop, reset };
}
