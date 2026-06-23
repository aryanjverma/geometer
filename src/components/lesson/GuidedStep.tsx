import { useState } from 'react';
import type { GuidedPart, LessonStep } from '@/types/lesson';
import { StaticTriangle } from './StaticTriangle';
import { GeneralTriangle } from './GeneralTriangle';
import { Confetti } from './Confetti';

interface FeedbackState {
  message: string;
  variant: 'correct' | 'wrong' | 'hint';
}

interface GuidedStepProps {
  step: LessonStep;
  onCorrect: () => void;
}

const CELEBRATE_MS = 1200;

function matches(part: GuidedPart, values: number[]): boolean {
  if (part.inputs && part.inputs.length > 0) {
    const expected = part.inputs.map((i) => i.answer);
    if (values.length !== expected.length) return false;
    if (part.acceptAnyOrder) {
      const sortNum = (a: number, b: number) => a - b;
      const got = [...values].sort(sortNum);
      const want = [...expected].sort(sortNum);
      return got.every((v, i) => v === want[i]);
    }
    return expected.every((v, i) => values[i] === v);
  }
  return part.answer != null && values[0] === part.answer;
}

export function GuidedStep({ step, onCorrect }: GuidedStepProps) {
  const parts = step.guided ?? [];
  const [partIndex, setPartIndex] = useState(0);
  const [values, setValues] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  const part = parts[partIndex];
  const fields = part?.inputs ?? [{ id: part?.id ?? 'value', label: '', answer: part?.answer ?? 0 }];
  const isLastPart = partIndex === parts.length - 1;
  const triangle = step.triangle;

  const setField = (i: number, value: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  };

  const handleSubmit = () => {
    const parsed = fields.map((_, i) => parseInt(values[i] ?? '', 10));
    if (parsed.some((n) => Number.isNaN(n))) return;

    if (matches(part, parsed)) {
      if (isLastPart) {
        setFeedback({ message: part.feedback?.correct ?? 'Correct!', variant: 'correct' });
        setCelebrate(true);
        setTimeout(onCorrect, CELEBRATE_MS);
        return;
      }
      setPartIndex((p) => p + 1);
      setValues([]);
      setFeedback(null);
      setWrongAttempts(0);
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1000);
      return;
    }

    const attempts = wrongAttempts + 1;
    setWrongAttempts(attempts);
    if (attempts >= 1 && part.feedback?.hint) {
      setFeedback({ message: part.feedback.hint, variant: 'hint' });
    } else {
      setFeedback({ message: part.feedback?.wrong ?? 'Try again.', variant: 'wrong' });
    }
    setValues([]);
  };

  const renderVisual = () => {
    if (triangle && 'legs' in triangle) {
      const { legs } = triangle;
      return (
        <StaticTriangle legs={legs} baseLabel={legs[0]} heightLabel={legs[1]} hypLabel="?" />
      );
    }
    if (triangle && 'base' in triangle) {
      return (
        <GeneralTriangle
          base={triangle.base}
          height={triangle.height}
          baseLabel={triangle.base}
          heightLabel={triangle.height}
          showAltitude
        />
      );
    }
    return null;
  };

  if (!part) return null;

  return (
    <div className="step-area">
      {celebrate && <Confetti />}
      <div className="question-box">
        <span className="step-tag step-tag-wedo">We do</span>
        <p className="step-prompt">{part.prompt}</p>
        {renderVisual()}
      </div>

      <div className="answer-box">
        <form
          className="answer-form guided-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
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
        {feedback && <p className={`feedback feedback-${feedback.variant}`}>{feedback.message}</p>}
      </div>
    </div>
  );
}
