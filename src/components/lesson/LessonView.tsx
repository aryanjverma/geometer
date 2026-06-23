import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { rightTrianglesLesson } from '@/content/right-triangles';
import { useProgress } from '@/contexts/ProgressContext';
import { StepRenderer } from './StepRenderer';

export function LessonView() {
  const navigate = useNavigate();
  const { lessonProgress, setStep, completeLesson } = useProgress();
  const { steps, title } = rightTrianglesLesson;

  // In review mode (lesson already completed) the persisted currentStep is fixed,
  // so we track the displayed step locally instead of deriving it from progress.
  const reviewing = lessonProgress.completed;
  const [reviewIndex, setReviewIndex] = useState(0);

  const currentIndex = reviewing
    ? Math.min(reviewIndex, steps.length - 1)
    : Math.min(lessonProgress.currentStep, steps.length - 1);
  const step = steps[currentIndex];
  const isLast = currentIndex === steps.length - 1;

  const handleCorrect = async () => {
    if (isLast) {
      if (!reviewing) await completeLesson();
      navigate('/dashboard');
      return;
    }
    if (reviewing) {
      setReviewIndex(currentIndex + 1);
    } else {
      await setStep(currentIndex + 1);
    }
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <Link to="/dashboard" className="back-link">
          ← Dashboard
        </Link>
        <h1>{title}</h1>
        <p className="muted">
          Step {currentIndex + 1} of {steps.length}
        </p>
      </header>

      <div className="step-progress-dots">
        {steps.map((s, i) => (
          <span
            key={s.id}
            className={`dot ${i < currentIndex ? 'done' : ''} ${i === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>

      <StepRenderer key={step.id} step={step} stepIndex={currentIndex} onCorrect={handleCorrect} />
    </div>
  );
}
