import { MathText } from '@/components/MathText';
import type { GeneratedQuestion } from '@/types/review';
import type { LessonStep } from '@/types/lesson';

/** One answered question captured during a locked-in attempt, for the end review. */
export interface AssessmentReviewItem {
  formatId: string;
  /** Human concept label, e.g. "Find the hypotenuse". */
  label: string;
  /** Whether the learner got it clean-correct (no wrong submission). */
  correct: boolean;
  /** The learner's final submitted answer, or null if none was captured. */
  userAnswer: number | null;
  /** The generated question (prompt, ground-truth answer, explanation). */
  question: GeneratedQuestion;
}

/**
 * The worked explanation for a question. For multi-step problems (parts /
 * subSteps) this returns one entry per step so the review shows how to do
 * EVERY step, not just the final answer. Falls back to a step's `wrong`
 * guidance when it has no `correct` worked line.
 */
function explanationSteps(step: LessonStep): string[] {
  const pick = (fb?: { correct?: string; wrong?: string }): string | undefined =>
    fb?.correct ?? fb?.wrong;
  if (step.parts && step.parts.length > 0) {
    return step.parts.map((p) => pick(p.feedback)).filter((s): s is string => !!s);
  }
  if (step.subSteps && step.subSteps.length > 0) {
    return step.subSteps.map((s) => pick(s.feedback)).filter((s): s is string => !!s);
  }
  const single = pick(step.feedback);
  return single ? [single] : [];
}

interface AssessmentReviewProps {
  items: AssessmentReviewItem[];
}

/**
 * Phase 3 — FR-7 end-of-assessment review. A scroll-through of every question:
 * ✓/✗, the prompt, the learner's answer, the correct answer, and the
 * explanation. All right/wrong feedback is deferred here so the attempt itself
 * stays a distraction-free, hint-free evaluation.
 */
export function AssessmentReview({ items }: AssessmentReviewProps) {
  return (
    <ul className="review-breakdown assessment-review">
      {items.map((item, i) => {
        const steps = explanationSteps(item.question.step);
        return (
          <li
            key={`${item.formatId}-${i}`}
            className={`review-row review-row-detail ${
              item.correct ? 'review-row-correct' : 'review-row-wrong'
            }`}
          >
            <div className="review-row-head">
              <span className="review-row-icon" aria-hidden="true">
                {item.correct ? '✓' : '✗'}
              </span>
              <span className="review-row-label">{item.label}</span>
            </div>
            <p className="review-detail-prompt">
              <MathText>{item.question.basePrompt}</MathText>
            </p>
            <p className="review-detail-answers">
              <span
                className={`review-detail-your ${
                  item.correct ? 'is-correct' : 'is-wrong'
                }`}
              >
                Your answer: {item.userAnswer ?? '—'}
              </span>
              {!item.correct && (
                <span className="review-detail-correct">
                  Correct answer: {item.question.answer}
                </span>
              )}
            </p>
            {steps.length > 0 && (
              <div className="review-detail-explanation">
                {steps.map((s, j) => (
                  <p key={j}>
                    <MathText>{s}</MathText>
                  </p>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
