import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { getLessonMeta } from '@/content/lessons';
import { useProgress } from '@/contexts/ProgressContext';
import { getLessonProgress, isLessonLocked } from '@/services/progressService';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { StepRenderer } from './StepRenderer';

export function LessonView() {
  const { lessonId = '' } = useParams();
  const navigate = useNavigate();
  const { progress, loading, setStep, completeLesson } = useProgress();

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
  const percent = Math.round((currentIndex / steps.length) * 100);

  const handleCorrect = async () => {
    if (isLast) {
      if (!completed) {
        await completeLesson(lessonId);
      } else {
        await setStep(lessonId, 0);
      }
      navigate('/dashboard');
      return;
    }
    await setStep(lessonId, currentIndex + 1);
  };

  return (
    <div className="lesson-page">
      <div className="lesson-topbar">
        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          ← Dashboard
        </Link>
      </div>

      <ProgressBar percent={percent} label={`${title} · Step ${currentIndex + 1} of ${steps.length}`} />

      <StepRenderer key={step.id} step={step} stepIndex={currentIndex} onCorrect={handleCorrect} />
    </div>
  );
}
