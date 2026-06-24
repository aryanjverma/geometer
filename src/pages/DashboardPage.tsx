import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { LessonCard } from '@/components/dashboard/LessonCard';
import { GeometerAvatar } from '@/components/GeometerAvatar';
import { LESSONS } from '@/content/lessons';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import { getLessonButtonState, getProgressPercent } from '@/services/progressService';

function firstName(name: string | null | undefined): string {
  return name?.trim().split(/\s+/)[0] || 'there';
}

export function DashboardPage() {
  const { user } = useAuth();
  const { progress, profile, loading } = useProgress();
  const percent = getProgressPercent(progress, LESSONS.map((l) => l.lessonId));
  const name = firstName(profile?.displayName ?? user?.displayName);

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
        <GeometerAvatar size={56} />
        <h1 className="brand-wordmark">Geometer</h1>
        <p className="dashboard-greeting">{percent > 0 ? 'Welcome back' : 'Hello'}, {name}</p>
      </header>
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
