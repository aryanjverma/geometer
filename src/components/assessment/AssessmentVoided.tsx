import { Link } from 'react-router-dom';

interface AssessmentVoidedProps {
  /** Restart the assessment from scratch with fresh numbers. */
  onRestart: () => void;
}

/**
 * Phase 3 — FR-7 voided screen. Shown when the learner left an active attempt
 * (tab switch / minimize / window blur). The attempt recorded nothing; the only
 * way forward is a fresh restart.
 */
export function AssessmentVoided({ onRestart }: AssessmentVoidedProps) {
  return (
    <div className="assessment-voided">
      <h1>Attempt ended</h1>
      <p className="assessment-voided-lead">
        You left the assessment, so this attempt was discarded and{' '}
        <strong>nothing was saved</strong>. Assessments must be completed in one
        sitting, without switching tabs or leaving the window.
      </p>
      <p className="muted">When you're ready to focus, restart with fresh numbers.</p>
      <button type="button" className="btn btn-primary assessment-voided-restart" onClick={onRestart}>
        Restart
      </button>
      <Link to="/dashboard" className="btn btn-secondary assessment-voided-back">
        Back to dashboard
      </Link>
    </div>
  );
}
