import { Link } from 'react-router-dom';
import type { LessonButtonState } from '@/services/progressService';

interface LessonCardProps {
  lessonId: string;
  title: string;
  description: string;
  buttonState: LessonButtonState;
}

export function LessonCard({ lessonId, title, description, buttonState }: LessonCardProps) {
  const locked = buttonState === 'Locked';

  return (
    <article className={`lesson-card ${locked ? 'lesson-card-locked' : ''}`}>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      {locked ? (
        <button type="button" className="btn btn-lesson btn-locked" disabled aria-disabled="true">
          🔒 Locked
        </button>
      ) : (
        <Link
          to={`/lesson/${lessonId}`}
          className={`btn btn-lesson btn-${buttonState.toLowerCase()}`}
        >
          {buttonState}
        </Link>
      )}
    </article>
  );
}
