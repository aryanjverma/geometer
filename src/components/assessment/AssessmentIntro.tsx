import { Link } from 'react-router-dom';

interface AssessmentIntroProps {
  /** e.g. "Right Triangles · Mastery Quiz" or "Mastery Test". */
  title: string;
  /** Number of questions in this attempt. */
  questionCount: number;
  /** Begin the locked-in attempt. */
  onStart: () => void;
}

/**
 * Phase 3 — FR-7 rules-agreement gate shown before any question. The learner
 * must acknowledge the one-sitting rules before the attempt arms its lock.
 */
export function AssessmentIntro({ title, questionCount, onStart }: AssessmentIntroProps) {
  return (
    <div className="assessment-intro">
      <h1>{title}</h1>
      <p className="assessment-intro-lead">
        This is a graded assessment of your own best effort. Read the rules, then
        start when you are ready to focus.
      </p>
      <ul className="assessment-intro-rules">
        <li>
          <strong>One sitting.</strong> Answer all {questionCount} questions without
          leaving. If you switch tabs, minimize, or close this window, your attempt
          ends and <strong>nothing is saved</strong>.
        </li>
        <li>
          <strong>No help.</strong> There are no hints and no Ask Geometer — this is
          your unaided work.
        </li>
        <li>
          <strong>Answers are final.</strong> Each question takes one answer, then
          moves on. You won't see right or wrong as you go.
        </li>
        <li>
          <strong>Review at the end.</strong> After the last question you'll scroll
          through every question to see what you got right and wrong, with the
          correct answers and explanations.
        </li>
      </ul>
      <button type="button" className="btn btn-primary assessment-intro-start" onClick={onStart}>
        I'm ready — start
      </button>
      <Link to="/dashboard" className="btn btn-secondary assessment-intro-back">
        Not now
      </Link>
    </div>
  );
}
