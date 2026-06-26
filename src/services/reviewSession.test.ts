import { describe, it, expect } from 'vitest';
import {
  IN_SCOPE_LESSONS,
  completedInScopeLessons,
  isReviewUnlocked,
  isSessionQuestionCorrect,
  buildResultItem,
  parseInterests,
  serializeInterests,
} from './reviewSession';
import type { UserProgress } from '@/types/progress';

function progressWith(...completedIds: string[]): UserProgress {
  return {
    lessonProgress: Object.fromEntries(
      completedIds.map((id) => [id, { currentStep: 0, completed: true }]),
    ),
  };
}

describe('isReviewUnlocked / completedInScopeLessons', () => {
  it('is locked when nothing is completed', () => {
    expect(isReviewUnlocked({ lessonProgress: {} })).toBe(false);
    expect(completedInScopeLessons({ lessonProgress: {} })).toEqual([]);
  });

  it('is locked when only an out-of-scope lesson is completed', () => {
    const p = progressWith('some-unknown-lesson', 'another-unknown-lesson');
    expect(isReviewUnlocked(p)).toBe(false);
    expect(completedInScopeLessons(p)).toEqual([]);
  });

  it('is unlocked once any in-scope lesson is completed', () => {
    const p = progressWith('right-triangles');
    expect(isReviewUnlocked(p)).toBe(true);
    expect(completedInScopeLessons(p)).toEqual(['right-triangles']);
  });

  it('does not count an in-scope lesson that is started but not completed', () => {
    const p: UserProgress = {
      lessonProgress: { 'right-triangles': { currentStep: 2, completed: false } },
    };
    expect(isReviewUnlocked(p)).toBe(false);
  });

  it('lists multiple completed in-scope lessons in course order', () => {
    const p = progressWith('distance-coordinate-plane', 'right-triangles');
    expect(completedInScopeLessons(p)).toEqual([
      'right-triangles',
      'distance-coordinate-plane',
    ]);
  });

  it('considers exactly the in-scope lessons in course order', () => {
    expect(IN_SCOPE_LESSONS).toEqual([
      'right-triangles',
      'non-right-triangles',
      'distance-coordinate-plane',
      'transformations',
      'congruence-similarity',
    ]);
  });
});

describe('isSessionQuestionCorrect', () => {
  it('is correct only with no wrong attempt and no hint used', () => {
    expect(isSessionQuestionCorrect({ wrongAttempt: false, hintUsed: false })).toBe(true);
  });

  it('is incorrect when a wrong attempt was made', () => {
    expect(isSessionQuestionCorrect({ wrongAttempt: true, hintUsed: false })).toBe(false);
  });

  it('is incorrect when a hint was used', () => {
    expect(isSessionQuestionCorrect({ wrongAttempt: false, hintUsed: true })).toBe(false);
  });

  it('is incorrect when both happened', () => {
    expect(isSessionQuestionCorrect({ wrongAttempt: true, hintUsed: true })).toBe(false);
  });
});

describe('buildResultItem', () => {
  it('maps the format identity and computes session correctness', () => {
    const format = { formatId: 'rt-hypotenuse', lessonId: 'right-triangles' };
    expect(buildResultItem(format, { wrongAttempt: false, hintUsed: false })).toEqual({
      formatId: 'rt-hypotenuse',
      lessonId: 'right-triangles',
      correct: true,
    });
    expect(buildResultItem(format, { wrongAttempt: true, hintUsed: false })).toEqual({
      formatId: 'rt-hypotenuse',
      lessonId: 'right-triangles',
      correct: false,
    });
  });
});

describe('parseInterests / serializeInterests', () => {
  it('returns an empty list for empty or whitespace text', () => {
    expect(parseInterests('')).toEqual([]);
    expect(parseInterests('   ')).toEqual([]);
    expect(parseInterests(' , , ')).toEqual([]);
  });

  it('splits on commas and trims each entry', () => {
    expect(parseInterests('basketball, video games ,cooking')).toEqual([
      'basketball',
      'video games',
      'cooking',
    ]);
  });

  it('dedupes case-insensitively, keeping the first form', () => {
    expect(parseInterests('Basketball, basketball, BASKETBALL')).toEqual(['Basketball']);
  });

  it('round-trips through serializeInterests', () => {
    const text = 'basketball, video games, cooking';
    expect(serializeInterests(parseInterests(text))).toBe(text);
  });
});
