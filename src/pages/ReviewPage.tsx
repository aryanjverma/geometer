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
  // Reskinned prompt text keyed by question index. Filled lazily; a missing
  // entry simply means "show the plain basePrompt".
  const [reskins, setReskins] = useState<Record<number, string>>({});

  const loadedRef = useRef(false);
  const flagsRef = useRef<QuestionFlags>(freshFlags());
  const lastWrongRef = useRef<number | undefined>(undefined);
  // Indices whose reskin has already been requested — dedupes across renders
  // and React StrictMode's double-invoked effects.
  const reskinStartedRef = useRef<Set<number>>(new Set());

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

    (async () => {
      const t0 = performance.now();
      const since = () => `${Math.round(performance.now() - t0)}ms`;
      try {
        console.info('[review] start: fetching concept-mastery records…');
        const history = await fetchConceptMastery(user.uid);
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
        const built: SessionQuestion[] = selected.map((format) => ({
          format,
          question: format.generate(),
        }));
        console.info(`[review] selected ${built.length} questions for this session`);

        if (!active) {
          console.info('[review] load superseded before commit — skipping');
          return;
        }
        loadedRef.current = true;
        if (built.length === 0) {
          console.info('[review] no questions → status: empty');
          setStatus('empty');
          return;
        }
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

  // Lazily reskin the current question and prefetch the next one. This makes at
  // most ~2 AI calls at a time and spreads them across the session, instead of
  // bursting all five up-front and tripping the free-tier rate limit (5 rpm).
  useEffect(() => {
    if (status !== 'running' || questions.length === 0) return;

    const ensureReskin = (i: number) => {
      if (i < 0 || i >= questions.length) return;
      if (reskinStartedRef.current.has(i)) return;
      reskinStartedRef.current.add(i);
      const q = questions[i].question;
      console.info(`[review] reskinning question ${i} (${q.formatId})…`);
      void withBudget(
        reskinQuestion(q, interests),
        RESKIN_BUDGET_MS,
        q.basePrompt,
      ).then((text) => {
        if (text && text !== q.basePrompt) {
          console.info(`[review] reskin applied for question ${i}`);
          setReskins((prev) => ({ ...prev, [i]: text }));
        }
      });
    };

    ensureReskin(index);
    ensureReskin(index + 1);
  }, [status, index, questions, interests]);

  const current = questions[index];

  // Override the displayed prompt with the reskin when one is ready; the graded
  // answer lives elsewhere on the step and is never touched.
  const currentStep = useMemo(() => {
    if (!current) return null;
    const text = reskins[index];
    if (!text) return current.question.step;
    const step = { ...current.question.step, prompt: text };
    if (step.subSteps && step.subSteps.length === 1) {
      step.subSteps = [{ ...step.subSteps[0], prompt: text }];
    }
    return step;
  }, [current, reskins, index]);

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
    setResults((prev) => [...prev, item]);
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
    flagsRef.current = freshFlags();
    lastWrongRef.current = undefined;
    setHint(null);
    setAskOpen(false);
    setStruggle('');
    if (index + 1 >= questions.length) {
      setStatus('results');
    } else {
      setIndex((i) => i + 1);
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
        }),
        HINT_BUDGET_MS,
        'Take it one step at a time — reread the problem and identify what each number represents.',
      );
      console.info(
        `[review] hint ready in ${Math.round(performance.now() - t0)}ms`,
      );
      setHint(text);
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
