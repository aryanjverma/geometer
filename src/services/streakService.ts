/**
 * Pure daily-streak logic. Dates are local calendar strings in "YYYY-MM-DD"
 * format; no timezone math beyond the local calendar.
 */

/** Format a Date as its local calendar date "YYYY-MM-DD" (zero-padded). */
export function todayString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Return the calendar date one day before `dateStr` as "YYYY-MM-DD".
 * Parses at local noon so that subtracting a day never crosses a DST boundary.
 */
export function previousDay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  date.setDate(date.getDate() - 1);
  return todayString(date);
}

/** Record an activity occurring on `today`, returning the updated streak. */
export function bumpStreak(
  last: string | undefined,
  today: string,
  current: number,
): { streak: number; lastActivityDate: string } {
  if (last === today) {
    return { streak: Math.max(current, 1), lastActivityDate: today };
  }
  if (last === previousDay(today)) {
    return { streak: current + 1, lastActivityDate: today };
  }
  return { streak: 1, lastActivityDate: today };
}

/**
 * The streak value to display / use for the leaderboard, enforcing
 * "reset if a day is missed" without performing a write.
 */
export function effectiveStreak(
  streak: number | undefined,
  last: string | undefined,
  today: string,
): number {
  if (last === undefined) return 0;
  if (last === today || last === previousDay(today)) return streak ?? 0;
  return 0;
}
