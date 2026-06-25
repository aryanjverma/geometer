import { useEffect, useState } from 'react';
import { GeometerAvatar } from '@/components/GeometerAvatar';
import { Confetti } from './Confetti';

interface CongratsSlideProps {
  title: string;
  /** Seconds before the auto-redirect fires. */
  redirectSeconds?: number;
  onContinue: () => void;
}

export function CongratsSlide({ title, redirectSeconds = 5, onContinue }: CongratsSlideProps) {
  const [remaining, setRemaining] = useState(redirectSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      onContinue();
      return;
    }
    const timer = setTimeout(() => setRemaining((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onContinue]);

  return (
    <div className="step-area">
      <Confetti />
      <div className="question-box congrats-slide">
        <span className="congrats-emoji" aria-hidden="true">
          🎉
        </span>
        <GeometerAvatar className="congrats-avatar" />
        <h2 className="congrats-title">Lesson complete!</h2>
        <p className="congrats-message">
          Nice work finishing <strong>{title}</strong>.
        </p>
        <button type="button" className="btn btn-primary" onClick={onContinue}>
          Back to Dashboard
        </button>
        <p className="muted congrats-countdown">
          Redirecting in {remaining}s…
        </p>
      </div>
    </div>
  );
}
