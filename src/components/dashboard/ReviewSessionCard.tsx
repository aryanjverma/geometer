import { Link } from 'react-router-dom';
import { REVIEW_FORMATS } from '@/content/reviewFormats';
import { completedInScopeLessons, isReviewUnlocked } from '@/services/reviewSession';
import type { UserProgress } from '@/types/progress';

interface ReviewSessionCardProps {
  progress: UserProgress;
}

/**
 * Dashboard entry point for the Phase 2 review session. Enabled once any
 * in-scope lesson is completed; otherwise shows a disabled "locked" state.
 */
export function ReviewSessionCard({ progress }: ReviewSessionCardProps) {
  const unlocked = isReviewUnlocked(progress);

  if (!unlocked) {
    return (
      <div className="review-card review-card-locked">
        <div className="review-card-head">
          <span className="review-card-icon" aria-hidden="true">{'\u{1F501}'}</span>
          <h2>Daily Review</h2>
        </div>
        <p className="review-card-summary">Finish a lesson to unlock review.</p>
        <button type="button" className="btn btn-locked" disabled>
          Start review
        </button>
      </div>
    );
  }

  const completed = completedInScopeLessons(progress);
  const conceptCount = REVIEW_FORMATS.filter((f) =>
    completed.includes(f.lessonId),
  ).length;

  return (
    <div className="review-card">
      <div className="review-card-head">
        <span className="review-card-icon" aria-hidden="true">{'\u{1F501}'}</span>
        <h2>Daily Review</h2>
      </div>
      <p className="review-card-summary">
        {conceptCount} concept{conceptCount === 1 ? '' : 's'} ready · fresh numbers every time
      </p>
      <Link to="/review" className="btn btn-primary review-card-cta">
        Start review
      </Link>
    </div>
  );
}
