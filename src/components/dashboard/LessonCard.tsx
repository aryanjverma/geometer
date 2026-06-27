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
}

const MASTERY_TEXT: Record<MasteryLevel, string> = {
  'need-review': 'Need to review',
  learning: 'Learning',
  mastered: 'Mastered',
};

/** Order and short summary label for the collapsed count pills. */
const SUMMARY: Array<{ level: MasteryLevel; short: string }> = [
  { level: 'mastered', short: 'Mastered' },
  { level: 'learning', short: 'Learning' },
  { level: 'need-review', short: 'To review' },
];

export function LessonCard({
  lessonId,
  title,
  description,
  buttonState,
  concepts = [],
}: LessonCardProps) {
  const locked = buttonState === 'Locked';
  const [open, setOpen] = useState(false);

  const counts = concepts.reduce(
    (acc, { level }) => {
      acc[level] += 1;
      return acc;
    },
    { 'need-review': 0, learning: 0, mastered: 0 } as Record<MasteryLevel, number>,
  );

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
          <ul className="concept-summary">
            {SUMMARY.filter(({ level }) => counts[level] > 0).map(({ level, short }) => (
              <li key={level} className={`concept-count mastery-${level}`}>
                {counts[level]} {short}
              </li>
            ))}
          </ul>
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
        ) : (
          <Link
            to={`/lesson/${lessonId}`}
            className={`btn btn-lesson btn-${buttonState.toLowerCase()}`}
          >
            {buttonState}
          </Link>
        )}
      </Modal>
    </article>
  );
}
