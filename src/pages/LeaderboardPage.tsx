import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  rankEntries,
  subscribeLeaderboard,
  type RankedEntry,
} from '@/services/leaderboardService';
import type { LeaderboardEntry } from '@/types/progress';

const MEDAL_EMOJI: Record<string, string> = {
  gold: '\u{1F947}',
  silver: '\u{1F948}',
  bronze: '\u{1F949}',
};

function avatarFor(photoURL: string): string {
  if (photoURL?.startsWith('emoji:')) return photoURL.slice(6);
  return '\u{1F4D0}';
}

export function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeLeaderboard(
      (rows) => {
        setEntries(rows);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, []);

  const ranked: RankedEntry[] = useMemo(() => rankEntries(entries), [entries]);

  return (
    <div className="page leaderboard-page">
      <header className="leaderboard-header">
        <h1>Streak Leaderboard</h1>
        <p className="muted">Keep your streak alive to climb the ranks.</p>
      </header>

      {loading ? (
        <p className="muted">Loading leaderboard…</p>
      ) : ranked.length === 0 ? (
        <p className="muted">No streaks yet — complete a lesson to get on the board!</p>
      ) : (
        <ol className="leaderboard-list">
          {ranked.map((entry) => {
            const isMe = entry.uid === user?.uid;
            return (
              <li
                key={entry.uid}
                className={`leaderboard-row${entry.medal ? ` medal-${entry.medal}` : ''}${isMe ? ' leaderboard-me' : ''}`}
              >
                <span className="leaderboard-rank">
                  {entry.medal ? MEDAL_EMOJI[entry.medal] : entry.rank}
                </span>
                <span className="leaderboard-avatar" aria-hidden="true">
                  {avatarFor(entry.photoURL)}
                </span>
                <span className="leaderboard-name">
                  {entry.displayName || 'Learner'}
                  {isMe && <span className="leaderboard-you"> (you)</span>}
                </span>
                <span className="leaderboard-streak">
                  {'\u{1F525}'} {entry.streak}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
