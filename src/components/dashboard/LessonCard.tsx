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

  const showConcepts = !locked && concepts.length > 0;

  return (
    <article className={`lesson-card ${locked ? 'lesson-card-locked' : ''}`}>
      <h2>{title}</h2>
      <p className="muted lesson-card-desc">{description}</p>

      {showConcepts && (
        <div className="concept-overview">
          <ul className="concept-summary">
            {SUMMARY.filter(({ level }) => counts[level] > 0).map(({ level, short }) => (
              <li key={level} className={`concept-count mastery-${level}`}>
                {counts[level]} {short}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn-secondary btn-sm concept-view-btn"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            View concepts
          </button>
        </div>
      )}

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

      {showConcepts && (
        <Modal open={open} onClose={() => setOpen(false)} title={`${title} — concepts`}>
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
        </Modal>
      )}
    </article>
  );
}
