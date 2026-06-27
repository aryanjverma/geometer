import { useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getLessonMeta, LESSONS } from '@/content/lessons';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import { recordConceptAttempt } from '@/services/reviewService';
import { recordMasteryQuizResult, isMasteryQuizUnlocked } from '@/services/progressService';
import {
  buildMasteryQuiz,
  isMasteryQuizPassed,
  masteryQuizFormats,
} from '@/services/masteryQuizService';
import { buildResultItem, type QuestionFlags } from '@/services/reviewSession';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { StepRenderer } from '@/components/lesson/StepRenderer';
import { useAssessmentGuard } from '@/components/assessment/useAssessmentGuard';
import { AssessmentIntro } from '@/components/assessment/AssessmentIntro';
import { AssessmentVoided } from '@/components/assessment/AssessmentVoided';
import {
  AssessmentReview,
  type AssessmentReviewItem,
} from '@/components/assessment/AssessmentReview';
import type { GeneratedQuestion, ReviewResultItem } from '@/types/review';

const freshFlags = (): QuestionFlags => ({ wrongAttempt: false, hintUsed: false });

function TopBar({ showBack }: { showBack: boolean }) {
  return (
    <div className="lesson-topbar">
      {showBack && (
        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          ← Dashboard
        </Link>
      )}
    </div>
  );
}

/** The next lesson in the course (the one gated on this lesson's mastery). */
function nextLessonId(lessonId: string): string | null {
  return LESSONS.find((l) => l.requires === lessonId)?.lessonId ?? null;
}

export function MasteryQuizPage() {
  const { lessonId = '' } = useParams();
  const { user } = useAuth();
  const { progress, profile, loading } = useProgress();
  const guard = useAssessmentGuard();

  const meta = getLessonMeta(lessonId);
  const labelByFormat = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of masteryQuizFormats(lessonId)) map.set(f.formatId, f.label);
    return map;
  }, [lessonId]);

  const [questions, setQuestions] = useState<GeneratedQuestion[]>(() =>
    buildMasteryQuiz(lessonId),
  );
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<ReviewResultItem[]>([]);
  const [details, setDetails] = useState<AssessmentReviewItem[]>([]);
  const [finished, setFinished] = useState(false);
  const flagsRef = useRef<QuestionFlags>(freshFlags());
  const lastValueRef = useRef<number | null>(null);
  const recordedRef = useRef(false);

  if (loading) {
    return (
      <div className="review-page">
        <TopBar showBack />
        <div className="page-center">
          <p className="muted">Preparing your quiz…</p>
        </div>
      </div>
    );
  }

  // Hard access gate: the quiz is unreachable until the lesson is completed.
  if (!meta || !isMasteryQuizUnlocked(progress, lessonId)) {
    return <Navigate to="/dashboard" replace />;
  }

  const entry = {
    displayName: profile?.displayName ?? user?.displayName ?? 'Learner',
    photoURL: profile?.photoURL ?? user?.photoURL ?? '',
  };

  const current = questions[index];

  const handleAttempt = (correct: boolean, value: number) => {
    if (!correct) flagsRef.current.wrongAttempt = true;
    lastValueRef.current = value;
  };

  const finalize = (allResults: ReviewResultItem[]) => {
    if (recordedRef.current) return;
    recordedRef.current = true;
    const passed = isMasteryQuizPassed(allResults);
    if (user) {
      // Per-concept attempts feed the Daily Review's spaced-retrieval signal.
      allResults.forEach((r) => {
        void recordConceptAttempt(user.uid, {
          lessonId,
          stepId: masteryQuizFormats(lessonId).find((f) => f.formatId === r.formatId)
            ?.sourceStepId ?? r.formatId,
          correct: r.correct,
          at: Date.now(),
        }).catch(() => {});
      });
      if (passed) {
        void recordMasteryQuizResult(user.uid, lessonId, true, entry).catch(() => {});
      }
    }
  };

  const handleCorrect = () => {
    if (!current) return;
    const item = buildResultItem(
      { formatId: current.formatId, lessonId: current.lessonId },
      flagsRef.current,
    );
    const detail: AssessmentReviewItem = {
      formatId: current.formatId,
      label: labelByFormat.get(current.formatId) ?? current.formatId,
      correct: item.correct,
      userAnswer: lastValueRef.current,
      question: current,
    };
    const nextResults = [...results, item];
    const nextDetails = [...details, detail];
    const nextIndex = index + 1;
    const done = nextIndex >= questions.length;
    setResults(nextResults);
    setDetails(nextDetails);
    flagsRef.current = freshFlags();
    lastValueRef.current = null;
    if (done) {
      finalize(nextResults);
      guard.stop();
      setFinished(true);
    } else {
      setIndex(nextIndex);
    }
  };

  const resetAttempt = () => {
    recordedRef.current = false;
    flagsRef.current = freshFlags();
    lastValueRef.current = null;
    setResults([]);
    setDetails([]);
    setIndex(0);
    setFinished(false);
    setQuestions(buildMasteryQuiz(lessonId));
  };

  // From the results screen (fail path): a fresh attempt back at the intro gate.
  const retake = () => {
    resetAttempt();
    guard.reset();
  };

  // From the voided screen: rebuild and re-arm the lock immediately.
  const restart = () => {
    resetAttempt();
    guard.start();
  };

  if (finished) {
    const passed = isMasteryQuizPassed(results);
    const nextId = nextLessonId(lessonId);
    return (
      <div className="review-page">
        <TopBar showBack />
        <div className="review-results">
          <h1>{passed ? 'Mastery quiz passed!' : 'Not quite yet'}</h1>
          <p className="review-score">
            {results.filter((r) => r.correct).length} / {results.length} concepts on the first try
          </p>

          <AssessmentReview items={details} />

          {passed ? (
            <>
              <p className="muted">
                {nextId
                  ? 'The next lesson is unlocked.'
                  : 'You have mastered the final lesson of the course.'}
              </p>
              {nextId ? (
                <Link to={`/lesson/${nextId}`} className="btn btn-primary review-results-cta">
                  Continue to next lesson
                </Link>
              ) : (
                <Link to="/dashboard" className="btn btn-primary review-results-cta">
                  Back to dashboard
                </Link>
              )}
            </>
          ) : (
            <>
              <p className="muted">
                Pass requires every concept correct on the first try. Retake with fresh numbers.
              </p>
              <button type="button" className="btn btn-primary review-results-cta" onClick={retake}>
                Retake quiz
              </button>
              <Link to={`/lesson/${lessonId}`} className="btn btn-secondary review-revisit">
                Revisit lesson
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  if (guard.phase === 'intro') {
    return (
      <div className="review-page">
        <TopBar showBack />
        <AssessmentIntro
          title={`${meta.title} · Mastery Quiz`}
          questionCount={questions.length}
          onStart={guard.start}
        />
      </div>
    );
  }

  if (guard.phase === 'voided') {
    return (
      <div className="review-page">
        <TopBar showBack />
        <AssessmentVoided onRestart={restart} />
      </div>
    );
  }

  if (!current) return <Navigate to="/dashboard" replace />;

  const percent = Math.round((index / questions.length) * 100);

  return (
    <div className="review-page">
      <TopBar showBack={false} />
      <ProgressBar
        percent={percent}
        label={`${meta.title} · Mastery Quiz · Question ${index + 1} of ${questions.length}`}
      />
      {/* Assessment mode: no Ask Geometer, no hints, no per-question feedback. */}
      <div className="step-enter" key={index}>
        <StepRenderer
          step={current.step}
          stepIndex={index}
          onCorrect={handleCorrect}
          onAttempt={handleAttempt}
          assessmentMode
        />
      </div>
    </div>
  );
}
