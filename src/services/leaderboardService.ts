import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { LeaderboardEntry } from '@/types/progress';

export type Medal = 'gold' | 'silver' | 'bronze' | null;

export interface RankedEntry extends LeaderboardEntry {
  /** 1-based position among ranked (streak > 0) entries. */
  rank: number;
  /** rank 1 -> 'gold', 2 -> 'silver', 3 -> 'bronze', otherwise null. */
  medal: Medal;
}

const MEDALS: Medal[] = ['gold', 'silver', 'bronze'];

export function rankEntries(entries: LeaderboardEntry[]): RankedEntry[] {
  return entries
    .filter((entry) => typeof entry.streak === 'number' && entry.streak > 0)
    .slice()
    .sort((a, b) => {
      if (b.streak !== a.streak) return b.streak - a.streak;
      return (a.displayName ?? '').localeCompare(b.displayName ?? '');
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      medal: MEDALS[index] ?? null,
    }));
}

function leaderboardDoc(uid: string) {
  return doc(db, 'leaderboard', uid);
}

/** Mirror a user's current streak into the public leaderboard collection. */
export async function writeLeaderboardEntry(entry: LeaderboardEntry) {
  await setDoc(leaderboardDoc(entry.uid), entry, { merge: true });
}

export async function removeLeaderboardEntry(uid: string) {
  await deleteDoc(leaderboardDoc(uid));
}

/** Live subscription to every leaderboard row (ranked client-side). */
export function subscribeLeaderboard(
  onData: (entries: LeaderboardEntry[]) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    collection(db, 'leaderboard'),
    (snap) => onData(snap.docs.map((d) => d.data() as LeaderboardEntry)),
    (err) => onError?.(err),
  );
}
