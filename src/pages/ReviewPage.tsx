import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonMeta } from '@/content/lessons';
import { REVIEW_FORMATS } from '@/content/reviewFormats';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import {
  fetchConceptMastery,
  recordConceptAttempt,
  recommendLessons,
  selectReviewFormats,
} from '@/services/reviewService';
import { getSocraticHint, reskinQuestion } from '@/services/aiReviewService';
import {
  buildResultItem,
  completedInScopeLessons,
  type QuestionFlags,
} from '@/services/reviewSession';
import {
  clearSession,
  loadSession,
  saveSession,
} from '@/services/reviewSessionStore';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { StepRenderer } from '@/components/lesson/StepRenderer';
import { MathText } from '@/components/MathText';
import type { GeneratedQuestion, QuestionFormat, ReviewResultItem } from '@/types/review';

/** How many questions a single review session presents. */
const SESSION_COUNT = 5;

/**
 * Client-side budgets — a second safety net under the service-level timeout so a
 * stalled AI/network call can never freeze the UI. Kept below the 12s service
 * timeout so this guard wins and the session proceeds with plain prompts.
 */
const RESKIN_BUDGET_MS = 9000;
const HINT_BUDGET_MS = 9000;

/**
 * Up-front reskin preload tuning. Reskins load at most {@link RESKIN_CONCURRENCY}
 * at a time: bursting all five at once overwhelms the local Functions emulator
 * (connection resets) and risks the free-tier rate limit. The whole phase is
 * also capped by {@link RESKIN_PHASE_BUDGET_MS} so a slow or unreachable backend
 * can never leave the learner staring at "Preparing…" — once the deadline passes
 * we proceed with plain prompts for whatever has not resolved.
 */
const RESKIN_CONCURRENCY = 2;
const RESKIN_PHASE_BUDGET_MS = 12000;

/** Resolve with `fallback` if `promise` has not settled within `ms`. */
function withBudget<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}

interface SessionQuestion {
  format: QuestionFormat;
  question: GeneratedQuestion;
  /** Frozen prompt shown to the learner: an applied reskin, or the plain
   * `basePrompt` when no reskin loaded. Resolved once, up front. */
  displayPrompt: string;
  /** The latest Ask Geometer hint shown for this question, persisted so a
   * reload restores it without re-asking. `null` until one is requested. */
  hint?: string | null;
}

/**
 * Resolve the display prompt for every question up front, with bounded
 * concurrency and an overall deadline. Each entry defaults to its `basePrompt`
 * and is upgraded only if a valid reskin returns in time; failures, timeouts,
 * cancellation (`isActive` flips false), and the phase deadline all leave the
 * plain prompt in place. No new calls start after the deadline or a cancel, so
 * a stalled backend cannot extend the wait beyond one in-flight call budget.
 */
async function loadReskins(
  generated: SessionQuestion[],
  interests: string[],
  isActive: () => boolean,
): Promise<SessionQuestion[]> {
  const out = generated.map((q) => ({
    ...q,
    displayPrompt: q.question.basePrompt,
  }));
  const deadline = performance.now() + RESKIN_PHASE_BUDGET_MS;
  let next = 0;

  const worker = async (): Promise<void> => {
    while (isActive() && performance.now() < deadline) {
      const i = next++;
      if (i >= generated.length) return;
      // Coordinate drills (signed coordinates, sign-flipping answers) don't
      // survive the number-preservation validator and aren't word-problem
      // material — skip the AI call entirely and keep the plain prompt.
      if (generated[i].format.reskinnable === false) continue;
      const q = generated[i].question;
      const text = await withBudget(
        reskinQuestion(q, interests),
        RESKIN_BUDGET_MS,
        q.basePrompt,
      );
      out[i] = { ...generated[i], displayPrompt: text };
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(RESKIN_CONCURRENCY, generated.length) }, worker),
  );
  return out;
}

type Status = 'loading' | 'running' | 'results' | 'empty' | 'error';

const freshFlags = (): QuestionFlags => ({ wrongAttempt: false, hintUsed: false });

function TopBar() {
  return (
    <div className="lesson-topbar">
      <Link to="/dashboard" className="btn btn-secondary btn-sm">
        ← Dashboard
      </Link>
    </div>
  );
}

export function ReviewPage() {
  const { user } = useAuth();
  const { progress, profile, loading } = useProgress();
  const interests = useMemo(() => profile?.interests ?? [], [profile]);
  // Explicit AI off-switch (Account page). When false, the session skips all
  // reskin/hint AI calls and uses deterministic prompts + hand-written hints.
  const aiEnabled = profile?.aiEnabled !== false;

  const [status, setStatus] = useState<Status>('loading');
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<ReviewResultItem[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  // Ask Geometer is a single-round, opt-in affordance: the input only appears
  // once tapped and closes again after a hint is shown.
  const [askOpen, setAskOpen] = useState(false);
  const [struggle, setStruggle] = useState('');

  const loadedRef = useRef(false);
  const flagsRef = useRef<QuestionFlags>(freshFlags());
  const lastWrongRef = useRef<number | undefined>(undefined);
  // Interests feed the reskin theming. Read through a ref so the one-shot build
  // effect doesn't list `interests` as a dependency: a later profile/progress
  // snapshot must not restart the build and re-fire AI calls mid-flight.
  const interestsRef = useRef(interests);
  interestsRef.current = interests;
  // Read the AI off-switch through a ref for the same reason: a profile snapshot
  // arriving mid-build must not restart the one-shot load.
  const aiEnabledRef = useRef(aiEnabled);
  aiEnabledRef.current = aiEnabled;

  // The realtime progress listener keeps pushing fresh snapshots, so `progress`
  // changes reference well after the page mounts. We read it through a ref so a
  // mid-flight snapshot can't retrigger (and abort) the one-shot load below.
  const progressRef = useRef(progress);
  progressRef.current = progress;

  // Build the session exactly once. Gated only on `loading`/`user` so that
  // routine progress updates don't tear down an in-flight load. `loadedRef` is
  // set only after we actually commit results, so a run that's cancelled before
  // committing (true unmount, or StrictMode's mount→cleanup→mount in dev) leaves
  // the door open for a clean retry instead of deadlocking on "loading".
  useEffect(() => {
    if (loading || !user || loadedRef.current) return;
    let active = true;
    const uid = user.uid;

    (async () => {
      const t0 = performance.now();
      const since = () => `${Math.round(performance.now() - t0)}ms`;
      try {
        // 1) Instant restore — a saved, unfinished session resumes exactly where
        // the learner left off (same numbers, same reskins, same position) with
        // no regeneration and no AI calls.
        const saved = loadSession(uid);
        if (saved && saved.index < saved.items.length) {
          const byId = new Map(REVIEW_FORMATS.map((f) => [f.formatId, f]));
          const restored: SessionQuestion[] = saved.items.map((it) => ({
            format: byId.get(it.formatId)!,
            question: it.question,
            displayPrompt: it.displayPrompt,
            hint: it.hint ?? null,
          }));
          loadedRef.current = true;
          setQuestions(restored);
          setResults(saved.results);
          setIndex(saved.index);
          // Restore the hint the learner was already shown for the current
          // question (if any) and re-flag it as hint-used so mastery stays
          // accurate across the reload.
          const restoredHint = restored[saved.index]?.hint ?? null;
          if (restoredHint) {
            setHint(restoredHint);
            flagsRef.current.hintUsed = true;
          }
          setStatus('running');
          console.info(
            `[review] restored saved session (question ${saved.index + 1}/${restored.length}) in ${since()}`,
          );
          return;
        }
        if (saved) {
          // A completed session lingered — drop it and build fresh.
          clearSession();
        }

        // 2) Build a new session: select formats and generate all numbers.
        console.info('[review] start: fetching concept-mastery records…');
        const history = await fetchConceptMastery(uid);
        console.info(
          `[review] history fetched in ${since()} (${Object.keys(history).length} records)`,
        );
        const completed = completedInScopeLessons(progressRef.current);
        const inScope = REVIEW_FORMATS.filter((f) => completed.includes(f.lessonId));
        console.info(
          `[review] ${completed.length} completed lessons → ${inScope.length} in-scope formats`,
        );
        const selected = selectReviewFormats(history, inScope, {
          count: SESSION_COUNT,
          now: Date.now(),
        });
        const generated = selected.map((format) => ({
          format,
          question: format.generate(),
        }));
        console.info(`[review] selected ${generated.length} questions for this session`);

        if (generated.length === 0) {
          if (!active) return;
          loadedRef.current = true;
          console.info('[review] no questions → status: empty');
          setStatus('empty');
          return;
        }

        // 3) Load all reskins up front (bounded concurrency + phase deadline).
        // Each resolves to its own basePrompt on timeout/validation-failure/
        // error, so the fallback is decided here — before the learner ever sees
        // the question — and never swaps in later.
        const seeded: SessionQuestion[] = generated.map((q) => ({
          ...q,
          displayPrompt: q.question.basePrompt,
        }));
        // AI off-switch: when disabled, skip the reskin phase entirely (no AI
        // call is attempted) and present the deterministic template prompts.
        let built: SessionQuestion[];
        if (aiEnabledRef.current) {
          console.info(`[review] reskinning all ${generated.length} questions…`);
          built = await loadReskins(seeded, interestsRef.current, () => active);
        } else {
          console.info('[review] AI disabled — using plain template prompts');
          built = seeded;
        }
        const reskinnedCount = built.filter(
          (q) => q.displayPrompt !== q.question.basePrompt,
        ).length;
        console.info(
          `[review] reskins resolved: ${reskinnedCount}/${built.length} applied (${since()})`,
        );

        if (!active) {
          console.info('[review] load superseded before commit — skipping');
          return;
        }

        // 4) Save the finalized session, then let the learner answer.
        saveSession({
          version: 1,
          uid,
          createdAt: Date.now(),
          items: built.map((q) => ({
            formatId: q.format.formatId,
            question: q.question,
            displayPrompt: q.displayPrompt,
            hint: q.hint ?? null,
          })),
          index: 0,
          results: [],
        });
        loadedRef.current = true;
        setQuestions(built);
        setStatus('running');
        console.info(`[review] status: running (total ${since()})`);
      } catch (err) {
        console.error('[review] loading failed → status: error', err);
        if (active) setStatus('error');
      }
    })();

    return () => {
      active = false;
    };
  }, [loading, user]);

  const current = questions[index];

  // The display prompt is frozen on each question at build/restore time, so the
  // shown prompt is stable for the life of the question. The graded answer lives
  // elsewhere on the step and is never touched.
  const currentStep = useMemo(() => {
    if (!current) return null;
    const text = current.displayPrompt;
    if (!text || text === current.question.basePrompt) return current.question.step;
    const step = { ...current.question.step, prompt: text };
    if (step.subSteps && step.subSteps.length === 1) {
      step.subSteps = [{ ...step.subSteps[0], prompt: text }];
    }
    return step;
  }, [current]);

  const handleAttempt = (correct: boolean, value: number) => {
    if (!current) return;
    // Only accumulate in-session flags here; the single mastery record is
    // written once in handleCorrect using the clean-first-try outcome, so a
    // wrong attempt records a wrong flag and can never boost mastery.
    if (!correct) {
      flagsRef.current.wrongAttempt = true;
      lastWrongRef.current = value;
    }
  };

  const handleCorrect = () => {
    if (!current) return;
    const item = buildResultItem(current.format, flagsRef.current);
    const nextResults = [...results, item];
    const nextIndex = index + 1;
    const finished = nextIndex >= questions.length;
    setResults(nextResults);
    // Record exactly one mastery outcome for this concept: correct only if the
    // learner solved it cleanly (no wrong attempt and no hint), matching the
    // results screen. A struggled question records a wrong flag.
    if (user) {
      void recordConceptAttempt(user.uid, {
        lessonId: current.format.lessonId,
        stepId: current.format.sourceStepId,
        correct: item.correct,
        at: Date.now(),
      }).catch(() => {
        // Persistence is best-effort; a failed write must not break the session.
      });
    }
    // Persist progress so a reload resumes in place; clear once finished so the
    // next visit builds a fresh session.
    if (finished) {
      clearSession();
    } else if (user) {
      saveSession({
        version: 1,
        uid: user.uid,
        createdAt: Date.now(),
        items: questions.map((q) => ({
          formatId: q.format.formatId,
          question: q.question,
          displayPrompt: q.displayPrompt,
          hint: q.hint ?? null,
        })),
        index: nextIndex,
        results: nextResults,
      });
    }
    flagsRef.current = freshFlags();
    lastWrongRef.current = undefined;
    setHint(null);
    setAskOpen(false);
    setStruggle('');
    if (finished) {
      setStatus('results');
    } else {
      setIndex(nextIndex);
    }
  };

  // Open the Ask Geometer box; clear any prior hint so each ask is a fresh
  // single round with no leftover answer on screen.
  const openAsk = () => {
    if (hintLoading) return;
    setHint(null);
    setAskOpen(true);
  };

  const handleAsk = async () => {
    if (!current || hintLoading) return;
    setHintLoading(true);
    flagsRef.current.hintUsed = true;
    console.info('[review] Ask Geometer requested for', current.format.formatId);
    const t0 = performance.now();
    try {
      const text = await withBudget(
        getSocraticHint(current.question, {
          lastWrongAnswer: lastWrongRef.current,
          struggle,
          enabled: aiEnabled,
        }),
        HINT_BUDGET_MS,
        'Take it one step at a time — reread the problem and identify what each number represents.',
      );
      console.info(
        `[review] hint ready in ${Math.round(performance.now() - t0)}ms`,
      );
      setHint(text);
      // Attach the hint to its question and persist, so a reload restores the
      // same guidance (and the hint-used flag) without another AI call.
      const withHint = questions.map((q, i) =>
        i === index ? { ...q, hint: text } : q,
      );
      setQuestions(withHint);
      if (user) {
        saveSession({
          version: 1,
          uid: user.uid,
          createdAt: Date.now(),
          items: withHint.map((q) => ({
            formatId: q.format.formatId,
            question: q.question,
            displayPrompt: q.displayPrompt,
            hint: q.hint ?? null,
          })),
          index,
          results,
        });
      }
      // Single round: close the input and drop the struggle text once answered.
      setAskOpen(false);
      setStruggle('');
    } finally {
      setHintLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="review-page">
        <TopBar />
        <div className="page-center">
          <p className="muted">Preparing your review…</p>
        </div>
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div className="review-page">
        <TopBar />
        <div className="review-empty">
          <h1>Nothing to review yet</h1>
          <p className="muted">Finish a lesson to unlock your daily review.</p>
          <Link to="/dashboard" className="btn btn-primary">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="review-page">
        <TopBar />
        <div className="review-empty">
          <h1>Couldn’t load your review</h1>
          <p className="muted">Check your connection and try again.</p>
          <Link to="/dashboard" className="btn btn-primary">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'results') {
    return <ReviewResults questions={questions} results={results} />;
  }

  if (!current || !currentStep) return null;

  const percent = Math.round((index / questions.length) * 100);

  return (
    <div className="review-page">
      <TopBar />
      <ProgressBar
        percent={percent}
        label={`Review · Question ${index + 1} of ${questions.length}`}
      />
      <div className="step-enter" key={index}>
        <StepRenderer
          step={currentStep}
          stepIndex={index}
          onCorrect={handleCorrect}
          onAttempt={handleAttempt}
        />
      </div>
      <div className="review-hint">
        {/* One hint per question: once a hint is shown, the Ask Geometer
            affordance is replaced by the hint until the next question resets it. */}
        {hint ? (
          <p className="feedback feedback-hint">
            <MathText>{hint}</MathText>
          </p>
        ) : !askOpen ? (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={openAsk}
            disabled={hintLoading}
          >
            💡 Ask Geometer
          </button>
        ) : (
          <div className="ask-geometer">
            <textarea
              className="ask-geometer-input"
              placeholder="What are you stuck on?"
              value={struggle}
              onChange={(e) => setStruggle(e.target.value)}
              disabled={hintLoading}
              rows={2}
              autoFocus
            />
            <div className="ask-geometer-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAsk}
                disabled={hintLoading}
              >
                {hintLoading ? 'Thinking…' : 'Ask'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setAskOpen(false)}
                disabled={hintLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ReviewResultsProps {
  questions: SessionQuestion[];
  results: ReviewResultItem[];
}

function ReviewResults({ questions, results }: ReviewResultsProps) {
  const labelByFormat = useMemo(() => {
    const map = new Map<string, string>();
    for (const q of questions) map.set(q.format.formatId, q.format.label);
    return map;
  }, [questions]);

  const correctCount = results.filter((r) => r.correct).length;
  const revisit = recommendLessons(results);

  return (
    <div className="review-page">
      <TopBar />
      <div className="review-results">
        <h1>Review complete</h1>
        <p className="review-score">
          {correctCount} / {results.length} on the first try
        </p>

        <ul className="review-breakdown">
          {results.map((r, i) => (
            <li
              key={`${r.formatId}-${i}`}
              className={`review-row ${r.correct ? 'review-row-correct' : 'review-row-wrong'}`}
            >
              <span className="review-row-icon" aria-hidden="true">
                {r.correct ? '✓' : '✗'}
              </span>
              <span className="review-row-label">
                {labelByFormat.get(r.formatId) ?? r.formatId}
              </span>
            </li>
          ))}
        </ul>

        {revisit.length > 0 && (
          <div className="review-recommend">
            <h2>Revisit these lessons</h2>
            <div className="review-recommend-list">
              {revisit.map((lessonId) => (
                <Link
                  key={lessonId}
                  to={`/lesson/${lessonId}`}
                  className="btn btn-secondary review-revisit"
                >
                  Revisit {getLessonMeta(lessonId)?.title ?? lessonId}
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link to="/dashboard" className="btn btn-primary review-results-cta">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
