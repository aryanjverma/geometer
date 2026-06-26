import { Link } from 'react-router-dom';
import { lowestMasteryLesson } from '@/services/masteryService';
import type { UserProgress } from '@/types/progress';
import type { ConceptMasteryMap } from '@/types/review';

interface SuggestedReviewCardProps {
  progress: UserProgress;
  conceptMastery: ConceptMasteryMap;
}

/**
 * Suggests the completed lesson with the lowest average concept mastery, so the
 * learner can revisit their weakest topic. Sits beside the daily review card.
 */
export function SuggestedReviewCard({
  progress,
  conceptMastery,
}: SuggestedReviewCardProps) {
  const lesson = lowestMasteryLesson(progress, conceptMastery);

  if (!lesson) {
    return (
      <div className="review-card suggested-review-card suggested-review-empty">
        <div className="review-card-head">
          <span className="review-card-icon" aria-hidden="true">{'\u{1F3AF}'}</span>
          <h2>Suggested review</h2>
        </div>
        <p className="review-card-summary">
          Complete a lesson to get a personalized suggestion.
        </p>
      </div>
    );
  }

  return (
    <div className="review-card suggested-review-card">
      <div className="review-card-head">
        <span className="review-card-icon" aria-hidden="true">{'\u{1F3AF}'}</span>
        <h2>Suggested review</h2>
      </div>
      <p className="review-card-summary">
        Your lowest mastery is in <strong>{lesson.title}</strong>.
      </p>
      <Link
        to={`/lesson/${lesson.lessonId}`}
        className="btn btn-primary review-card-cta"
      >
        Review {lesson.title}
      </Link>
    </div>
  );
}
