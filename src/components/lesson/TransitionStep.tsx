import type { LessonStep } from '@/types/lesson';
import { GeometerAvatar } from '@/components/GeometerAvatar';

interface TransitionStepProps {
  step: LessonStep;
  onCorrect: () => void;
}

export function TransitionStep({ step, onCorrect }: TransitionStepProps) {
  const transition = step.transition;
  const cta = transition?.cta ?? 'Continue';

  return (
    <div className="step-area">
      <div className="question-box transition-slide">
        {transition?.emoji && (
          <span className="transition-emoji" aria-hidden="true">
            {transition.emoji}
          </span>
        )}
        <p className="transition-message">{step.prompt}</p>
        <GeometerAvatar className="transition-avatar" />
        <button type="button" className="btn btn-primary" onClick={onCorrect}>
          {cta}
        </button>
      </div>
    </div>
  );
}
