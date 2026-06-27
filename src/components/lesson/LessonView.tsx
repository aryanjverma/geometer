import { useCallback, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { getLessonMeta } from '@/content/lessons';
import { useProgress } from '@/contexts/ProgressContext';
import { getLessonProgress, isLessonLocked } from '@/services/progressService';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { StepRenderer } from './StepRenderer';
import { CongratsSlide } from './CongratsSlide';

export function LessonView() {
  const { lessonId = '' } = useParams();
  const navigate = useNavigate();
  const { progress, loading, setStep, completeLesson } = useProgress();
  const [finishing, setFinishing] = useState(false);
  const [saveError, setSaveError] = useState(false);

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

  // While finishing, the step counter (`currentStep`) is reset to 0 by
  // `completeLesson`/`setStep`, which would make the label read "Step 1 of N".
  // Pin the label to the final step so the congrats slide reads as complete.
  const progressLabel = finishing
    ? `${title} · Complete`
    : `${title} · Step ${currentIndex + 1} of ${steps.length}`;

  const handleCorrect = async () => {
    setSaveError(false);
    try {
      if (isLast) {
        setFinishing(true);
        // Phase 3 — finishing/replaying a lesson sets `completed` (which unlocks
        // this lesson's Mastery Quiz) but no longer writes any mastery. Mastery
        // moves only via the Mastery Quiz, the Mastery Test, and the Daily
        // Review, so replays are unlimited and side-effect-free.
        if (!completed) {
          await completeLesson(lessonId);
        } else {
          await setStep(lessonId, 0);
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

      <ProgressBar percent={percent} label={progressLabel} />

      {finishing ? (
        <CongratsSlide title={title} onContinue={goToDashboard} />
      ) : (
        <>
          <div className="step-enter" key={step.id}>
            <StepRenderer
              step={renderStep}
              stepIndex={currentIndex}
              onCorrect={handleCorrect}
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
