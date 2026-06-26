import { LessonCard } from '@/components/dashboard/LessonCard';
import { MasteryStats } from '@/components/dashboard/MasteryStats';
import { ReviewSessionCard } from '@/components/dashboard/ReviewSessionCard';
import { SuggestedReviewCard } from '@/components/dashboard/SuggestedReviewCard';
import { LESSONS } from '@/content/lessons';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import { getLessonButtonState, getProgressPercent } from '@/services/progressService';
import { lessonConceptMasteries } from '@/services/masteryService';
import { effectiveStreak, todayString } from '@/services/streakService';

function firstName(name: string | null | undefined): string {
  return name?.trim().split(/\s+/)[0] || 'there';
}

export function DashboardPage() {
  const { user } = useAuth();
  const { progress, profile, conceptMastery, loading } = useProgress();
  const percent = getProgressPercent(progress, LESSONS.map((l) => l.lessonId));
  const name = firstName(profile?.displayName ?? user?.displayName);
  const streak = effectiveStreak(progress.streak, progress.lastActivityDate, todayString());

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

      <MasteryStats conceptMastery={conceptMastery} streak={streak} />

      <div className="review-row">
        <ReviewSessionCard progress={progress} />
        <SuggestedReviewCard progress={progress} conceptMastery={conceptMastery} />
      </div>

      <h2 className="section-heading">Lessons</h2>
      <div className="lesson-list">
        {LESSONS.map((meta) => (
          <LessonCard
            key={meta.lessonId}
            lessonId={meta.lessonId}
            title={meta.title}
            description={meta.description}
            buttonState={getLessonButtonState(progress, meta.lessonId, meta.requires)}
            concepts={lessonConceptMasteries(meta.lessonId, conceptMastery)}
          />
        ))}
      </div>
    </div>
  );
}
