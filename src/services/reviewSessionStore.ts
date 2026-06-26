import { REVIEW_FORMATS } from '@/content/reviewFormats';
import type { GeneratedQuestion, ReviewResultItem } from '@/types/review';

/**
 * Phase 2 — localStorage persistence for an in-progress review session.
 *
 * A session is fully prepared up front (numbers generated + reskins resolved)
 * and then frozen here so a reload restores the exact same questions, prompts,
 * and position. We persist only plain JSON: `GeneratedQuestion` and its nested
 * `LessonStep` are data-only, but a `QuestionFormat` carries a `generate()`
 * function and is NOT serializable — so we store its `formatId` and re-resolve
 * the live format from {@link REVIEW_FORMATS} on load.
 *
 * All reads/writes are best-effort: storage can be unavailable (private mode,
 * quota) and a failure here must never break the session, mirroring the
 * best-effort Firestore writes elsewhere in the review flow.
 */

const STORAGE_KEY = 'geometer.review.session';
const VERSION = 1 as const;

/** One frozen question: the format reference (by id), its numbers, the
 * display prompt (an applied reskin or the plain `basePrompt`), and the most
 * recent Ask Geometer hint shown for it (if any). Persisting the hint means a
 * reload mid-question restores the exact guidance the learner already saw —
 * no re-asking and no extra AI call. */
export interface PersistedSessionItem {
  formatId: string;
  question: GeneratedQuestion;
  displayPrompt: string;
  /** The Ask Geometer hint last shown for this question, or null if none. */
  hint?: string | null;
}

/** A complete, resumable review session snapshot. */
export interface PersistedReviewSession {
  version: typeof VERSION;
  uid: string;
  createdAt: number;
  items: PersistedSessionItem[];
  /** Index of the question the learner is currently on. */
  index: number;
  /** Outcomes of the questions already completed (length === index). */
  results: ReviewResultItem[];
}

function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** True when every persisted item maps to a format that still exists. */
function itemsAreValid(items: PersistedSessionItem[]): boolean {
  const known = new Set(REVIEW_FORMATS.map((f) => f.formatId));
  return (
    Array.isArray(items) &&
    items.length > 0 &&
    items.every(
      (it) =>
        it &&
        typeof it.formatId === 'string' &&
        known.has(it.formatId) &&
        it.question != null &&
        typeof it.displayPrompt === 'string' &&
        (it.hint == null || typeof it.hint === 'string'),
    )
  );
}

/**
 * Read the saved session for `uid`, or `null` when there is none usable. Any
 * stale/foreign/malformed blob (wrong version, different user, unknown format,
 * bad shape) is treated as absent and cleared so the caller builds fresh.
 */
export function loadSession(uid: string): PersistedReviewSession | null {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedReviewSession;
    const ok =
      parsed &&
      parsed.version === VERSION &&
      parsed.uid === uid &&
      typeof parsed.index === 'number' &&
      Array.isArray(parsed.results) &&
      itemsAreValid(parsed.items);
    if (!ok) {
      clearSession();
      return null;
    }
    return parsed;
  } catch {
    clearSession();
    return null;
  }
}

/** Persist `session`, swallowing any storage error (best-effort). */
export function saveSession(session: PersistedReviewSession): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable or over quota — the session simply won't survive a
    // reload, which is an acceptable degradation.
  }
}

/** Remove any saved session. */
export function clearSession(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore — nothing actionable if removal fails.
  }
}
