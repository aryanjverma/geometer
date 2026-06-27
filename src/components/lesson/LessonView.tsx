import { useCallback, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { getLessonMeta } from '@/content/lessons';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import { getLessonProgress, isLessonLocked } from '@/services/progressService';
import { recordLessonCompletionAttempts } from '@/services/reviewService';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { StepRenderer } from './StepRenderer';
import { CongratsSlide } from './CongratsSlide';

export function LessonView() {
  const { lessonId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, loading, setStep, completeLesson } = useProgress();
  const [finishing, setFinishing] = useState(false);
  const [saveError, setSaveError] = useState(false);
  // Concept step ids the learner answered wrong at least once this lesson run.
  // A struggled concept records a wrong flag on completion so a wrong answer
  // never boosts mastery.
  const struggledRef = useRef<Set<string>>(new Set());

  const meta = getLessonMeta(lessonId);

  if (loading) {
    return (
      <div className="page-center">
        <p className="muted">Loading lesson…</p>
      </div>
    );
  }

  if (!meta || isLessonLocked(progress, meta.requires)) {
    return <Navigate to="/dashboard" replace />;
  }

  const { steps, title } = meta.lesson;
  const lessonProgress = getLessonProgress(progress, lessonId);
  const completed = lessonProgress.completed;

  const currentIndex = Math.min(lessonProgress.currentStep, steps.length - 1);
  const step = steps[currentIndex];
  const isLast = currentIndex === steps.length - 1;

  // "You do" steps render exactly as authored in the lesson content.
  const renderStep = step;
  const percent = finishing
    ? 100
    : Math.round((currentIndex / steps.length) * 100);

  // Fired on every numeric submission of the current step; a wrong answer marks
  // this step's concept as struggled for the completion record below.
  const recordStruggle = (correct: boolean) => {
    if (!correct) struggledRef.current.add(step.id);
  };

  const handleCorrect = async () => {
    setSaveError(false);
    try {
      if (isLast) {
        setFinishing(true);
        if (!completed) {
          await completeLesson(lessonId);
        } else {
          await setStep(lessonId, 0);
        }
        // Finishing the lesson records one attempt per concept — correct only
        // for concepts answered without a wrong attempt, so struggled concepts
        // are held back. Best-effort: never block the congrats flow on this write.
        if (user) {
          void recordLessonCompletionAttempts(
            user.uid,
            lessonId,
            struggledRef.current,
          ).catch(() => {});
        }
        return;
      }
      await setStep(lessonId, currentIndex + 1);
    } catch {
      // A rejected write (e.g. Firestore rules) rolls the optimistic step
      // back; surface it instead of silently appearing to "go back".
      setFinishing(false);
      setSaveError(true);
    }
  };

  const goToDashboard = useCallback(() => navigate('/dashboard'), [navigate]);

  return (
    <div className="lesson-page">
      <div className="lesson-topbar">
        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          ← Dashboard
        </Link>
      </div>

      <ProgressBar percent={percent} label={`${title} · Step ${currentIndex + 1} of ${steps.length}`} />

      {finishing ? (
        <CongratsSlide title={title} onContinue={goToDashboard} />
      ) : (
        <>
          <div className="step-enter" key={step.id}>
            <StepRenderer
              step={renderStep}
              stepIndex={currentIndex}
              onCorrect={handleCorrect}
              onAttempt={recordStruggle}
            />
          </div>
          {saveError && (
            <p className="feedback feedback-wrong" role="alert">
              Couldn’t save your progress. Check your connection and try again.
            </p>
          )}
        </>
      )}
    </div>
  );
}
