import { useState } from 'react';
import type { DistanceSubStep, GuidedInput, LessonStep } from '@/types/lesson';
import { StaticGrid, gridShapes } from './StaticGrid';
import { Confetti } from './Confetti';
import { MathText } from '@/components/MathText';

interface FeedbackState {
  message: string;
  variant: 'correct' | 'wrong' | 'hint';
}

interface GridCheckStepProps {
  step: LessonStep;
  onCorrect: () => void;
}

function fieldsFor(sub: DistanceSubStep): GuidedInput[] {
  if (sub.inputs && sub.inputs.length > 0) return sub.inputs;
  return [{ id: sub.id, label: '', answer: sub.answer ?? 0 }];
}

function numericMatches(sub: DistanceSubStep, values: number[]): boolean {
  const fields = fieldsFor(sub);
  if (values.length !== fields.length) return false;
  return fields.every((f, i) => values[i] === f.answer);
}

/** A "You do" check on a coordinate grid: ordered numeric/choice sub-steps. */
export function GridCheckStep({ step, onCorrect }: GridCheckStepProps) {
  const subSteps = step.subSteps ?? [];
  const grid = step.grid;

  const [partIndex, setPartIndex] = useState(0);
  const [values, setValues] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [solved, setSolved] = useState(false);

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

  const advanceAfterCorrect = () => {
    if (isLast) {
      setFeedback({ message: sub.feedback?.correct ?? 'Correct!', variant: 'correct' });
      setCelebrate(true);
      setSolved(true);
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
    if (numericMatches(sub, parsed)) {
      advanceAfterCorrect();
    } else {
      handleWrong();
    }
  };

  const handleChoice = (choiceId: string) => {
    if (choiceId === sub.correctChoice) {
      advanceAfterCorrect();
    } else {
      handleWrong();
    }
  };

  return (
    <div className="step-area">
      {celebrate && <Confetti />}
      <div className="question-box">
        <p className="step-prompt"><MathText>{sub.prompt}</MathText></p>
        {grid && <StaticGrid {...grid} shapes={gridShapes(grid)} />}
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
                disabled={solved}
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
                  disabled={solved}
                />
              </label>
            ))}
            <button type="submit" className="btn btn-primary" disabled={solved}>
              Check
            </button>
          </form>
        )}
        {feedback && (
          <p className={`feedback feedback-${feedback.variant}`}>
            <MathText>{feedback.message}</MathText>
          </p>
        )}
        {solved && (
          <button type="button" className="continue-btn" onClick={onCorrect}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
