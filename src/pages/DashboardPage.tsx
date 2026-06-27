import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LessonCard } from '@/components/dashboard/LessonCard';
import { MasteryStats } from '@/components/dashboard/MasteryStats';
import { ReviewSessionCard } from '@/components/dashboard/ReviewSessionCard';
import { SuggestedReviewCard } from '@/components/dashboard/SuggestedReviewCard';
import { LESSONS } from '@/content/lessons';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import {
  getLessonButtonState,
  getProgressPercent,
  hasMasteryPassed,
} from '@/services/progressService';
import { lessonConceptMasteries, lessonMasteryPercent } from '@/services/masteryService';
import { IN_SCOPE_LESSONS } from '@/services/reviewSession';
import { leaderboardStanding, subscribeLeaderboard } from '@/services/leaderboardService';
import { effectiveStreak, todayString } from '@/services/streakService';
import type { LeaderboardEntry } from '@/types/progress';

function firstName(name: string | null | undefined): string {
  return name?.trim().split(/\s+/)[0] || 'there';
}

export function DashboardPage() {
  const { user } = useAuth();
  const { progress, profile, conceptMastery, loading } = useProgress();
  const percent = getProgressPercent(progress, LESSONS.map((l) => l.lessonId));
  const name = firstName(profile?.displayName ?? user?.displayName);
  const streak = effectiveStreak(progress.streak, progress.lastActivityDate, todayString());

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  useEffect(() => {
    const unsub = subscribeLeaderboard(setLeaderboard, () => setLeaderboard([]));
    return unsub;
  }, []);
  const standing = leaderboardStanding(leaderboard, user?.uid);

  if (loading) {
    return (
      <div className="page-center">
        <p className="muted">Loading progress…</p>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <p className="dashboard-greeting">
          {percent > 0 ? 'Welcome back' : 'Hello'}, {name}
        </p>
      </header>

      <MasteryStats
        conceptMastery={conceptMastery}
        streak={streak}
        rank={standing?.rank ?? null}
        totalRanked={standing?.total}
      />

      <div className="review-row">
        <ReviewSessionCard progress={progress} />
        <SuggestedReviewCard progress={progress} conceptMastery={conceptMastery} />
      </div>

      <h2 className="section-heading">Lessons</h2>
      <div className="lesson-list">
        {LESSONS.map((meta) => {
          const buttonState = getLessonButtonState(progress, meta.lessonId, meta.requires);
          return (
            <LessonCard
              key={meta.lessonId}
              lessonId={meta.lessonId}
              title={meta.title}
              description={meta.description}
              buttonState={buttonState}
              concepts={lessonConceptMasteries(meta.lessonId, conceptMastery)}
              masteryPercent={lessonMasteryPercent(conceptMastery, meta.lessonId)}
            />
          );
        })}
      </div>

      <MasteryTestCard
        unlocked={IN_SCOPE_LESSONS.every((id) => hasMasteryPassed(progress, id))}
        passed={progress.masteryTestPassed === true}
      />
    </div>
  );
}

function MasteryTestCard({ unlocked, passed }: { unlocked: boolean; passed: boolean }) {
  return (
    <article className={`lesson-card mastery-test-card ${unlocked ? '' : 'lesson-card-locked'}`}>
      <div className="mastery-test-info">
        <h2>Mastery Test</h2>
        <p className="muted mastery-test-desc">
          {unlocked
            ? 'One question per concept across every lesson, interleaved — pass each on the first try to complete the course.'
            : "Pass every lesson's mastery quiz to unlock the final test."}
        </p>
      </div>
      <div className="mastery-test-action">
        {passed && (
          <span className="mastery-badge mastery-mastered">🏆 Course mastered</span>
        )}
        {unlocked ? (
          <Link to="/mastery-test" className="btn btn-lesson btn-quiz">
            {passed ? 'Retake Mastery Test' : 'Start Mastery Test'}
          </Link>
        ) : (
          <button type="button" className="btn btn-lesson btn-locked" disabled aria-disabled="true">
            🔒 Locked
          </button>
        )}
      </div>
    </article>
  );
}
