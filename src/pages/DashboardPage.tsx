import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { LessonCard } from '@/components/dashboard/LessonCard';
import { useProgress } from '@/contexts/ProgressContext';
import { getLessonButtonState, getProgressPercent } from '@/services/progressService';

export function DashboardPage() {
  const { progress, loading } = useProgress();
  const percent = getProgressPercent(progress);
  const buttonState = getLessonButtonState(progress);

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
      <ProgressBar percent={percent} />
      <LessonCard
        title="Right Triangles"
        description="Perimeter, area, and the Pythagorean theorem — four interactive steps."
        buttonState={buttonState}
      />
    </div>
  );
}
