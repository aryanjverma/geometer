import { useState } from 'react';
import type { DistanceSubStep, GuidedInput, LessonStep } from '@/types/lesson';
import { GraphPlane } from './GraphPlane';
import { Confetti } from './Confetti';
import { MathText } from '@/components/MathText';

interface FeedbackState {
  message: string;
  variant: 'correct' | 'wrong' | 'hint';
}

interface DistanceProblemStepProps {
  step: LessonStep;
  onCorrect: () => void;
  /**
   * Optional Phase 2 hook fired on each numeric submission of the FINAL
   * subStep (the step's graded final answer). Backward compatible: omitting it
   * leaves all Phase 1 grading and advance behavior untouched.
   */
  onAttempt?: (correct: boolean, value: number) => void;
}

const CELEBRATE_MS = 1200;
const CAR_MS_PER_UNIT = 200;
const CAR_END_BUFFER_MS = 500;

function fieldsFor(sub: DistanceSubStep): GuidedInput[] {
  if (sub.inputs && sub.inputs.length > 0) return sub.inputs;
  return [{ id: sub.id, label: '', answer: sub.answer ?? 0 }];
}

function numericMatches(sub: DistanceSubStep, values: number[]): boolean {
  const fields = fieldsFor(sub);
  if (values.length !== fields.length) return false;
  return fields.every((f, i) => values[i] === f.answer);
}

export function DistanceProblemStep({ step, onCorrect, onAttempt }: DistanceProblemStepProps) {
  const subSteps = step.subSteps ?? [];
  const graph = step.graph;

  const [partIndex, setPartIndex] = useState(0);
  const [values, setValues] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [drawnSegmentIds, setDrawnSegmentIds] = useState<string[]>([]);
  const [carIndex, setCarIndex] = useState(0);
  const [carLegMs, setCarLegMs] = useState(0);

  const sub = subSteps[partIndex];
  if (!sub) return null;

  const isLast = partIndex === subSteps.length - 1;
  const fields = fieldsFor(sub);

  const setField = (i: number, value: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  };

  // Drive the car along carPath, one leg at a time, then finish the lesson.
  const runJourney = (path: string[]) => {
    const byId = new Map((graph?.points ?? []).map((p) => [p.id, p]));
    let acc = 0;
    for (let i = 1; i < path.length; i += 1) {
      const a = byId.get(path[i - 1]);
      const b = byId.get(path[i]);
      const dist = a && b ? Math.hypot(b.x - a.x, b.y - a.y) : 1;
      const legMs = Math.max(300, dist * CAR_MS_PER_UNIT);
      setTimeout(() => {
        setCarLegMs(legMs);
        setCarIndex(i);
      }, acc);
      acc += legMs;
    }
    setTimeout(onCorrect, acc + CAR_END_BUFFER_MS);
  };

  const advanceAfterCorrect = (segmentIds?: string[]) => {
    if (segmentIds && segmentIds.length > 0) {
      setDrawnSegmentIds((prev) => [...prev, ...segmentIds]);
    }
    if (isLast) {
      setFeedback({ message: sub.feedback?.correct ?? 'Correct!', variant: 'correct' });
      setCelebrate(true);
      if (step.carPath && step.carPath.length > 1) {
        runJourney(step.carPath);
      } else {
        setTimeout(onCorrect, CELEBRATE_MS);
      }
      return;
    }
    setPartIndex((p) => p + 1);
    setValues([]);
    setFeedback(null);
    setWrongAttempts(0);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 1000);
  };

  const handleWrong = () => {
    const attempts = wrongAttempts + 1;
    setWrongAttempts(attempts);
    if (attempts >= 1 && sub.feedback?.hint) {
      setFeedback({ message: sub.feedback.hint, variant: 'hint' });
    } else {
      setFeedback({ message: sub.feedback?.wrong ?? 'Try again.', variant: 'wrong' });
    }
    setValues([]);
  };

  const handleNumericSubmit = () => {
    const parsed = fields.map((_, i) => parseInt(values[i] ?? '', 10));
    if (parsed.some((n) => Number.isNaN(n))) return;
    const correct = numericMatches(sub, parsed);
    // Only the final subStep carries the question's graded answer, so attempts
    // are reported there (and never for intermediate parts).
    if (isLast) onAttempt?.(correct, parsed[parsed.length - 1]);
    if (correct) {
      advanceAfterCorrect(sub.drawSegmentIds);
    } else {
      handleWrong();
    }
  };

  const handleChoice = (choiceId: string) => {
    if (choiceId === sub.correctChoice) {
      advanceAfterCorrect(sub.drawSegmentIds);
    } else {
      handleWrong();
    }
  };

  return (
    <div className="step-area">
      {celebrate && <Confetti />}
      <div className="question-box">
        <p className="step-prompt"><MathText>{sub.prompt}</MathText></p>
        {graph && (
          <GraphPlane
            points={graph.points}
            segments={graph.segments}
            activeSegmentIds={drawnSegmentIds}
            carPath={step.carPath}
            carIndex={carIndex}
            carLegMs={carLegMs}
          />
        )}
      </div>

      <div className="answer-box">
        {sub.kind === 'choice' ? (
          <div className="choice-group">
            {(sub.choices ?? []).map((choice) => (
              <button
                key={choice.id}
                type="button"
                className="btn btn-secondary choice-btn"
                onClick={() => handleChoice(choice.id)}
              >
                <MathText>{choice.label}</MathText>
              </button>
            ))}
          </div>
        ) : (
          <form
            className="answer-form guided-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleNumericSubmit();
            }}
          >
            {fields.map((field, i) => (
              <label key={field.id} className="guided-field">
                {field.label && <span className="guided-field-label">{field.label}</span>}
                <input
                  type="number"
                  inputMode="numeric"
                  className="answer-input"
                  value={values[i] ?? ''}
                  onChange={(e) => setField(i, e.target.value)}
                  placeholder="?"
                  aria-label={field.label || 'Numeric answer'}
                />
              </label>
            ))}
            <button type="submit" className="btn btn-primary">
              Check
            </button>
          </form>
        )}
        {feedback && (
          <p className={`feedback feedback-${feedback.variant}`}>
            <MathText>{feedback.message}</MathText>
          </p>
        )}
      </div>
    </div>
  );
}
