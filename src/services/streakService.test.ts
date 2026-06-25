import { describe, expect, it } from 'vitest';
import {
  todayString,
  previousDay,
  bumpStreak,
  effectiveStreak,
} from './streakService';

describe('todayString', () => {
  it('formats a date as zero-padded YYYY-MM-DD', () => {
    expect(todayString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('zero-pads both month and day', () => {
    expect(todayString(new Date(2026, 8, 9))).toBe('2026-09-09');
  });

  it('handles two-digit month and day without extra padding', () => {
    expect(todayString(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('previousDay', () => {
  it('subtracts one day within a month', () => {
    expect(previousDay('2026-06-24')).toBe('2026-06-23');
  });

  it('handles a month boundary', () => {
    expect(previousDay('2026-03-01')).toBe('2026-02-28');
  });

  it('handles a leap-year month boundary', () => {
    expect(previousDay('2024-03-01')).toBe('2024-02-29');
  });

  it('handles a year boundary', () => {
    expect(previousDay('2026-01-01')).toBe('2025-12-31');
  });
});

describe('bumpStreak', () => {
  it('keeps the streak unchanged on the same day', () => {
    expect(bumpStreak('2026-06-24', '2026-06-24', 3)).toEqual({
      streak: 3,
      lastActivityDate: '2026-06-24',
    });
  });

  it('keeps a same-day streak at least 1', () => {
    expect(bumpStreak('2026-06-24', '2026-06-24', 0)).toEqual({
      streak: 1,
      lastActivityDate: '2026-06-24',
    });
  });

  it('increments on a consecutive day', () => {
    expect(bumpStreak('2026-06-23', '2026-06-24', 3)).toEqual({
      streak: 4,
      lastActivityDate: '2026-06-24',
    });
  });

  it('starts at 1 when there is no prior activity', () => {
    expect(bumpStreak(undefined, '2026-06-24', 0)).toEqual({
      streak: 1,
      lastActivityDate: '2026-06-24',
    });
  });

  it('resets to 1 after a gap of two or more days', () => {
    expect(bumpStreak('2026-06-21', '2026-06-24', 3)).toEqual({
      streak: 1,
      lastActivityDate: '2026-06-24',
    });
  });
});

describe('effectiveStreak', () => {
  it('returns 0 when there is no last activity', () => {
    expect(effectiveStreak(5, undefined, '2026-06-24')).toBe(0);
  });

  it('returns the streak when last activity was today', () => {
    expect(effectiveStreak(5, '2026-06-24', '2026-06-24')).toBe(5);
  });

  it('returns the streak when last activity was yesterday', () => {
    expect(effectiveStreak(5, '2026-06-23', '2026-06-24')).toBe(5);
  });

  it('returns 0 when stale by two or more days', () => {
    expect(effectiveStreak(5, '2026-06-21', '2026-06-24')).toBe(0);
  });

  it('treats an undefined streak as 0 when still active', () => {
    expect(effectiveStreak(undefined, '2026-06-24', '2026-06-24')).toBe(0);
  });
});
