import { describe, it, expect } from 'vitest';
import {
  isLessonLocked,
  isMasteryQuizUnlocked,
  hasMasteryPassed,
  getLessonButtonState,
  migrateProgressV3,
} from './progressService';
import type { LessonProgress, UserProgress } from '@/types/progress';

function progress(
  lessons: Record<string, Partial<LessonProgress>>,
  extra: Partial<UserProgress> = {},
): UserProgress {
  const lessonProgress: Record<string, LessonProgress> = {};
  for (const [id, lp] of Object.entries(lessons)) {
    lessonProgress[id] = { currentStep: 0, completed: false, ...lp };
  }
  return { lessonProgress, ...extra };
}

describe('isLessonLocked — sticky mastery gate', () => {
  it('a lesson with no prerequisite is never locked', () => {
    expect(isLessonLocked(progress({}), undefined)).toBe(false);
  });

  it('is locked when the prerequisite has not passed its mastery quiz', () => {
    // Completing the prerequisite is NOT enough once migrated to v3.
    const p = progress({ a: { completed: true } }, { v3Migrated: true });
    expect(isLessonLocked(p, 'a')).toBe(true);
  });

  it('unlocks once the prerequisite mastery quiz is passed', () => {
    const p = progress(
      { a: { completed: true, masteryPassed: true } },
      { v3Migrated: true },
    );
    expect(isLessonLocked(p, 'a')).toBe(false);
  });

  it('never re-locks: stays unlocked regardless of later state (sticky)', () => {
    // masteryPassed is sticky and does not depend on live concept mastery.
    const p = progress(
      { a: { completed: false, masteryPassed: true } },
      { v3Migrated: true },
    );
    expect(isLessonLocked(p, 'a')).toBe(false);
  });
});

describe('back-compat: legacy completed lessons are treated as unlocked', () => {
  it('an un-migrated legacy completion unlocks the next lesson', () => {
    // No v3Migrated flag, no masteryPassed — a Phase 2 learner.
    const p = progress({ a: { completed: true } });
    expect(isLessonLocked(p, 'a')).toBe(false);
  });

  it('migrateProgressV3 unlocks completed lessons WITHOUT marking them quiz-passed', () => {
    const p = progress({
      a: { completed: true },
      b: { completed: false, currentStep: 2 },
    });
    const migrated = migrateProgressV3(p);
    expect(migrated.v3Migrated).toBe(true);
    // The legacy completion unlocks the next lesson...
    expect(migrated.lessonProgress.a.legacyCompleted).toBe(true);
    // ...but it must NOT be treated as a quiz pass, so the learner is still
    // offered the Mastery Quiz on the lesson they already completed.
    expect(migrated.lessonProgress.a.masteryPassed).toBeUndefined();
    // An incomplete lesson is neither unlocked-as-legacy nor mastered.
    expect(migrated.lessonProgress.b.legacyCompleted).toBeUndefined();
    expect(migrated.lessonProgress.b.masteryPassed).toBeUndefined();
  });

  it('migrateProgressV3 is idempotent once the flag is set', () => {
    const once = migrateProgressV3(progress({ a: { completed: true } }));
    const twice = migrateProgressV3(once);
    expect(twice).toBe(once);
  });

  it('after migration, a fresh completion alone does NOT unlock the next lesson', () => {
    const migrated = migrateProgressV3(progress({}));
    const afterCompleting = progress(
      { a: { completed: true } },
      { v3Migrated: migrated.v3Migrated },
    );
    expect(isLessonLocked(afterCompleting, 'a')).toBe(true);
  });
});

describe('isMasteryQuizUnlocked — locked until the lesson is completed', () => {
  it('is locked while the lesson is not completed', () => {
    expect(isMasteryQuizUnlocked(progress({ a: { currentStep: 3 } }), 'a')).toBe(false);
    expect(isMasteryQuizUnlocked(progress({}), 'a')).toBe(false);
  });

  it('is unlocked once the lesson is completed', () => {
    expect(
      isMasteryQuizUnlocked(progress({ a: { completed: true } }), 'a'),
    ).toBe(true);
  });
});

describe('hasMasteryPassed', () => {
  it('is true only with the sticky masteryPassed flag', () => {
    expect(
      hasMasteryPassed(progress({ a: { masteryPassed: true } }, { v3Migrated: true }), 'a'),
    ).toBe(true);
    expect(
      hasMasteryPassed(progress({ a: { completed: true } }, { v3Migrated: true }), 'a'),
    ).toBe(false);
  });

  it('is strict: a completed lesson is NOT mastery-passed even before migration', () => {
    // Regression: the old back-compat shim conflated completion with passing the
    // quiz while v3Migrated was unset, which hid the "Take Mastery Quiz" CTA.
    expect(hasMasteryPassed(progress({ a: { completed: true } }), 'a')).toBe(false);
    // A legacy-unlocked lesson is unlocked-as-prereq but still not quiz-passed.
    expect(
      hasMasteryPassed(progress({ a: { completed: true, legacyCompleted: true } }), 'a'),
    ).toBe(false);
  });
});

describe('completing a lesson always offers its Mastery Quiz (bug regression)', () => {
  it('a freshly completed lesson shows Take Mastery Quiz even before migration lands', () => {
    // No v3Migrated yet (migration write may not have persisted). The card must
    // still flip to the quiz, never straight to Review.
    const p = progress({ a: { completed: true } });
    expect(getLessonButtonState(p, 'a')).toBe('Take Mastery Quiz');
  });

  it('a legacy completion offers its quiz yet keeps the next lesson unlocked after migration', () => {
    const migrated = migrateProgressV3(
      progress({ a: { completed: true }, b: { completed: true } }),
    );
    // The learner can still take the quiz on lessons they completed in Phase 2...
    expect(getLessonButtonState(migrated, 'a')).toBe('Take Mastery Quiz');
    expect(getLessonButtonState(migrated, 'b')).toBe('Take Mastery Quiz');
    // ...and they are NOT re-locked: the lesson after `a` stays open.
    expect(isLessonLocked(migrated, 'a')).toBe(false);
  });

  it('passing the quiz on a legacy lesson flips it to Review', () => {
    const migrated = migrateProgressV3(progress({ a: { completed: true } }));
    const passed: UserProgress = {
      ...migrated,
      lessonProgress: {
        ...migrated.lessonProgress,
        a: { ...migrated.lessonProgress.a, masteryPassed: true },
      },
    };
    expect(getLessonButtonState(passed, 'a')).toBe('Review');
  });
});

describe('getLessonButtonState — quiz-aware CTAs', () => {
  const migrated = { v3Migrated: true } as const;

  it('Locked when the prerequisite has not passed its quiz', () => {
    const p = progress({ a: { completed: true } }, migrated);
    expect(getLessonButtonState(p, 'b', 'a')).toBe('Locked');
  });

  it('Start for an untouched, unlocked lesson', () => {
    expect(getLessonButtonState(progress({}), 'a')).toBe('Start');
  });

  it('Continue for an in-progress lesson', () => {
    expect(getLessonButtonState(progress({ a: { currentStep: 2 } }), 'a')).toBe('Continue');
  });

  it('Take Mastery Quiz when completed but not yet passed', () => {
    const p = progress({ a: { completed: true } }, migrated);
    expect(getLessonButtonState(p, 'a')).toBe('Take Mastery Quiz');
  });

  it('Review once the mastery quiz is passed', () => {
    const p = progress({ a: { completed: true, masteryPassed: true } }, migrated);
    expect(getLessonButtonState(p, 'a')).toBe('Review');
  });
});
