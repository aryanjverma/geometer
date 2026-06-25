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
  const percent = finishing
    ? 100
    : Math.round((currentIndex / steps.length) * 100);

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
          <StepRenderer key={step.id} step={step} stepIndex={currentIndex} onCorrect={handleCorrect} />
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
