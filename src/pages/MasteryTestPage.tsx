import { useMemo, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { REVIEW_FORMATS } from '@/content/reviewFormats';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import { recordConceptAttempt } from '@/services/reviewService';
import { recordMasteryTestResult, hasMasteryPassed } from '@/services/progressService';
import { buildMasteryTest, isMasteryQuizPassed } from '@/services/masteryQuizService';
import { IN_SCOPE_LESSONS, buildResultItem, type QuestionFlags } from '@/services/reviewSession';
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

const FORMAT_BY_ID = new Map(REVIEW_FORMATS.map((f) => [f.formatId, f]));

export function MasteryTestPage() {
  const { user } = useAuth();
  const { progress, profile, loading } = useProgress();
  const guard = useAssessmentGuard();

  const [questions, setQuestions] = useState<GeneratedQuestion[]>(() => buildMasteryTest());
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<ReviewResultItem[]>([]);
  const [details, setDetails] = useState<AssessmentReviewItem[]>([]);
  const [finished, setFinished] = useState(false);
  const flagsRef = useRef<QuestionFlags>(freshFlags());
  const lastValueRef = useRef<number | null>(null);
  const recordedRef = useRef(false);

  const allPassed = useMemo(
    () => IN_SCOPE_LESSONS.every((id) => hasMasteryPassed(progress, id)),
    [progress],
  );

  if (loading) {
    return (
      <div className="review-page">
        <TopBar showBack />
        <div className="page-center">
          <p className="muted">Preparing the mastery test…</p>
        </div>
      </div>
    );
  }

  // Gated: every in-scope lesson's Mastery Quiz must be passed first.
  if (!allPassed) {
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
      allResults.forEach((r) => {
        const fmt = FORMAT_BY_ID.get(r.formatId);
        void recordConceptAttempt(user.uid, {
          lessonId: r.lessonId,
          stepId: fmt?.sourceStepId ?? r.formatId,
          correct: r.correct,
          at: Date.now(),
        }).catch(() => {});
      });
      if (passed) {
        void recordMasteryTestResult(user.uid, true, entry).catch(() => {});
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
      label: FORMAT_BY_ID.get(current.formatId)?.label ?? current.formatId,
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
    setQuestions(buildMasteryTest());
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
    return (
      <div className="review-page">
        <TopBar showBack />
        <div className="review-results">
          <h1>{passed ? 'Course mastered! 🎉' : 'Almost there'}</h1>
          <p className="review-score">
            {results.filter((r) => r.correct).length} / {results.length} concepts on the first try
          </p>

          <AssessmentReview items={details} />

          {passed ? (
            <>
              <p className="muted">
                You answered every concept across all lessons correctly on the first try.
              </p>
              <Link to="/dashboard" className="btn btn-primary review-results-cta">
                Back to dashboard
              </Link>
            </>
          ) : (
            <>
              <p className="muted">
                Pass requires every concept correct on the first try. Retake with fresh numbers.
              </p>
              <button type="button" className="btn btn-primary review-results-cta" onClick={retake}>
                Retake test
              </button>
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
          title="Mastery Test"
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
        label={`Mastery Test · Question ${index + 1} of ${questions.length}`}
      />
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
