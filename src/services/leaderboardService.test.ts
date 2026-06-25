import { describe, expect, it } from 'vitest';
import { rankEntries } from './leaderboardService';
import type { LeaderboardEntry } from '@/types/progress';

function entry(overrides: Partial<LeaderboardEntry> & { uid: string }): LeaderboardEntry {
  return {
    displayName: overrides.uid,
    photoURL: '',
    streak: 0,
    ...overrides,
  };
}

describe('rankEntries', () => {
  it('returns an empty array for empty input', () => {
    expect(rankEntries([])).toEqual([]);
  });

  it('excludes entries with streak of 0 or negative', () => {
    const entries = [
      entry({ uid: 'a', displayName: 'Alice', streak: 5 }),
      entry({ uid: 'b', displayName: 'Bob', streak: 0 }),
      entry({ uid: 'c', displayName: 'Cara', streak: -3 }),
    ];
    const ranked = rankEntries(entries);
    expect(ranked.map((e) => e.uid)).toEqual(['a']);
  });

  it('sorts by streak descending', () => {
    const entries = [
      entry({ uid: 'a', displayName: 'Alice', streak: 3 }),
      entry({ uid: 'b', displayName: 'Bob', streak: 10 }),
      entry({ uid: 'c', displayName: 'Cara', streak: 7 }),
    ];
    const ranked = rankEntries(entries);
    expect(ranked.map((e) => e.uid)).toEqual(['b', 'c', 'a']);
    expect(ranked.map((e) => e.rank)).toEqual([1, 2, 3]);
  });

  it('breaks ties by displayName ascending using localeCompare', () => {
    const entries = [
      entry({ uid: 'z', displayName: 'Zara', streak: 5 }),
      entry({ uid: 'a', displayName: 'Adam', streak: 5 }),
      entry({ uid: 'm', displayName: 'Mona', streak: 5 }),
    ];
    const ranked = rankEntries(entries);
    expect(ranked.map((e) => e.displayName)).toEqual(['Adam', 'Mona', 'Zara']);
    expect(ranked.map((e) => e.rank)).toEqual([1, 2, 3]);
  });

  it('assigns medals to the top three and null beyond', () => {
    const entries = [
      entry({ uid: 'a', displayName: 'A', streak: 50 }),
      entry({ uid: 'b', displayName: 'B', streak: 40 }),
      entry({ uid: 'c', displayName: 'C', streak: 30 }),
      entry({ uid: 'd', displayName: 'D', streak: 20 }),
    ];
    const ranked = rankEntries(entries);
    expect(ranked.map((e) => e.medal)).toEqual(['gold', 'silver', 'bronze', null]);
  });

  it('does not throw when an entry is missing a displayName', () => {
    const entries = [
      entry({ uid: 'a', displayName: 'Alice', streak: 5 }),
      { uid: 'b', photoURL: '', streak: 8 } as LeaderboardEntry,
    ];
    expect(() => rankEntries(entries)).not.toThrow();
    const ranked = rankEntries(entries);
    expect(ranked.map((e) => e.uid)).toEqual(['b', 'a']);
  });

  it('does not mutate the input array', () => {
    const entries = [
      entry({ uid: 'a', displayName: 'Alice', streak: 3 }),
      entry({ uid: 'b', displayName: 'Bob', streak: 10 }),
    ];
    const snapshot = entries.map((e) => ({ ...e }));
    rankEntries(entries);
    expect(entries).toEqual(snapshot);
  });
});
