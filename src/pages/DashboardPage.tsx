import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { LessonCard } from '@/components/dashboard/LessonCard';
import { LESSONS } from '@/content/lessons';
import { useProgress } from '@/contexts/ProgressContext';
import { getLessonButtonState, getProgressPercent } from '@/services/progressService';

export function DashboardPage() {
  const { progress, loading } = useProgress();
  const percent = getProgressPercent(progress, LESSONS.map((l) => l.lessonId));

  if (loading) {
    return (
      <div className="page-center">
        <p className="muted">Loading progress…</p>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <h1>Dashboard</h1>
      <ProgressBar percent={percent} label="Course progress" />
      <div className="lesson-list">
        {LESSONS.map((meta) => (
          <LessonCard
            key={meta.lessonId}
            lessonId={meta.lessonId}
            title={meta.title}
            description={meta.description}
            buttonState={getLessonButtonState(progress, meta.lessonId, meta.requires)}
          />
        ))}
      </div>
    </div>
  );
}
