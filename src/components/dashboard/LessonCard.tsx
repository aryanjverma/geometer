import { Link } from 'react-router-dom';
import type { LessonButtonState } from '@/services/progressService';

interface LessonCardProps {
  title: string;
  description: string;
  buttonState: LessonButtonState;
}

export function LessonCard({ title, description, buttonState }: LessonCardProps) {
  return (
    <article className="lesson-card">
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      <Link to="/lesson/right-triangles" className={`btn btn-lesson btn-${buttonState.toLowerCase()}`}>
        {buttonState}
      </Link>
    </article>
  );
}
