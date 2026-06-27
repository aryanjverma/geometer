import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '@/components/Modal';
import type { LessonButtonState } from '@/services/progressService';
import type { Concept, MasteryLevel } from '@/types/mastery';

interface LessonCardProps {
  lessonId: string;
  title: string;
  description: string;
  buttonState: LessonButtonState;
  concepts?: Array<{ concept: Concept; level: MasteryLevel }>;
  /** Per-lesson mastery percent (0-100) shown on the card face. */
  masteryPercent: number;
}

const MASTERY_TEXT: Record<MasteryLevel, string> = {
  'need-review': 'Need to review',
  learning: 'Learning',
  mastered: 'Mastered',
};

/**
 * Band a 0-100 lesson mastery percent into a level so the progress bar can take
 * the matching colour. Mirrors the per-concept scale (2 pts each): the upper
 * third reads as mastered, the middle as learning, the lower as need-review.
 */
function percentLevel(percent: number): MasteryLevel {
  if (percent >= 67) return 'mastered';
  if (percent >= 34) return 'learning';
  return 'need-review';
}

export function LessonCard({
  lessonId,
  title,
  description,
  buttonState,
  concepts = [],
  masteryPercent,
}: LessonCardProps) {
  const locked = buttonState === 'Locked';
  const completed = buttonState === 'Review' || buttonState === 'Take Mastery Quiz';
  const masteryPassed = buttonState === 'Review';
  const [open, setOpen] = useState(false);

  const hasConcepts = concepts.length > 0;

  return (
    <article className={`lesson-card ${locked ? 'lesson-card-locked' : ''}`}>
      <div className="lesson-card-body">
        <h2>{title}</h2>

        {locked && (
          <span className="lesson-locked-badge">
            <span aria-hidden="true">🔒</span> Locked
          </span>
        )}

        {hasConcepts ? (
          <div className="lesson-percent">
            <div className="lesson-percent-head">
              <span className="lesson-percent-label">Mastery</span>
              <span className="lesson-percent-value">{masteryPercent}%</span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={masteryPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Lesson mastery"
            >
              <div
                className={`progress-fill progress-fill-${percentLevel(masteryPercent)}`}
                style={{ width: `${masteryPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="concept-summary-empty muted">No concepts tracked yet</p>
        )}
      </div>

      <button
        type="button"
        className={`btn btn-secondary btn-sm lesson-open-btn${locked ? ' lesson-open-btn-locked' : ''}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        View lesson
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <p className="muted lesson-card-desc">{description}</p>

        {hasConcepts && (
          <ul className="concept-chips">
            {concepts.map(({ concept, level }) => (
              <li key={concept.conceptId} className="concept-chip">
                <span className="concept-chip-label">{concept.label}</span>
                <span className={`mastery-badge mastery-${level}`}>
                  {MASTERY_TEXT[level]}
                </span>
              </li>
            ))}
          </ul>
        )}

        {locked ? (
          <button
            type="button"
            className="btn btn-lesson btn-locked"
            disabled
            aria-disabled="true"
          >
            🔒 Locked
          </button>
        ) : completed ? (
          <div className="lesson-actions">
            <Link
              to={`/lesson/${lessonId}`}
              className={`btn btn-lesson ${masteryPassed ? '' : 'lesson-action-secondary'}`}
            >
              Review lesson
            </Link>
            <Link
              to={`/quiz/${lessonId}`}
              className={`btn btn-lesson ${masteryPassed ? 'lesson-action-secondary' : 'btn-quiz'}`}
            >
              {masteryPassed ? 'Retake Mastery Quiz' : 'Take Mastery Quiz'}
            </Link>
          </div>
        ) : (
          <Link to={`/lesson/${lessonId}`} className="btn btn-lesson">
            {buttonState}
          </Link>
        )}
      </Modal>
    </article>
  );
}
