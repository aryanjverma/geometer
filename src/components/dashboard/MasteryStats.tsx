import { Link } from 'react-router-dom';
import { masteryPercent, masteryTotals } from '@/services/masteryService';
import type { ConceptMasteryMap } from '@/types/review';

interface MasteryStatsProps {
  conceptMastery: ConceptMasteryMap;
  streak: number;
}

/**
 * Top dashboard stat strip: overall mastery percent, the per-level concept
 * totals, and a streak tile that links to the leaderboard.
 */
export function MasteryStats({ conceptMastery, streak }: MasteryStatsProps) {
  const percent = masteryPercent(conceptMastery);
  const totals = masteryTotals(conceptMastery);

  return (
    <section className="mastery-stats" aria-label="Your progress">
      <div className="stat-tile stat-tile-mastery">
        <span className="stat-tile-label">Mastery</span>
        <span className="stat-tile-value">{percent}%</span>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Concept mastery"
        >
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="stat-tile stat-tile-counts">
        <div className="stat-count mastery-mastered">
          <span className="stat-count-value">{totals.mastered}</span>
          <span className="stat-count-label">Mastered</span>
        </div>
        <div className="stat-count mastery-learning">
          <span className="stat-count-value">{totals.learning}</span>
          <span className="stat-count-label">Learning</span>
        </div>
        <div className="stat-count mastery-need-review">
          <span className="stat-count-value">{totals.needReview}</span>
          <span className="stat-count-label">To review</span>
        </div>
      </div>

      <Link
        to="/leaderboard"
        className="stat-tile streak-widget"
        aria-label={`${streak} day streak. View leaderboard.`}
      >
        <span className="streak-flame" aria-hidden="true">{'\u{1F525}'}</span>
        <span className="streak-widget-count">{streak}</span>
        <span className="streak-widget-label">
          day{streak === 1 ? '' : 's'} streak
        </span>
        <span className="streak-widget-cta">View leaderboard</span>
      </Link>
    </section>
  );
}
