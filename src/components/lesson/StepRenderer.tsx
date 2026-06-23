import { useState } from 'react';
import type { LessonStep } from '@/types/lesson';
import { InteractiveUnfold } from './InteractiveUnfold';
import { StaticTriangle } from './StaticTriangle';
import { Confetti } from './Confetti';

interface FeedbackState {
  message: string;
  variant: 'correct' | 'wrong' | 'hint';
}

function AnswerFeedback({ message, variant }: FeedbackState) {
  return <p className={`feedback feedback-${variant}`}>{message}</p>;
}

interface NumericInputProps {
  onSubmit: (value: number) => void;
  disabled?: boolean;
}

function NumericInput({ onSubmit, disabled }: NumericInputProps) {
  const [value, setValue] = useState('');

  return (
    <form
      className="answer-form"
      onSubmit={(e) => {
        e.preventDefault();
        const n = parseInt(value, 10);
        if (!Number.isNaN(n)) onSubmit(n);
      }}
    >
      <input
        type="number"
        inputMode="numeric"
        className="answer-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder="Your answer"
        aria-label="Numeric answer"
      />
      <button type="submit" className="btn btn-primary" disabled={disabled || value === ''}>
        Check
      </button>
    </form>
  );
}

interface StepRendererProps {
  step: LessonStep;
  stepIndex: number;
  onCorrect: () => void;
}

const CELEBRATE_MS = 1200;

export function StepRenderer({ step, stepIndex, onCorrect }: StepRendererProps) {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [unfolded, setUnfolded] = useState(false);
  const [partADone, setPartADone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // Correct answer that ends the step: reveal, celebrate, then advance.
  const finishStep = (msg: string) => {
    setFeedback({ message: msg, variant: 'correct' });
    setRevealed(true);
    setCelebrate(true);
    setTimeout(onCorrect, CELEBRATE_MS);
  };

  const handleWrong = (msg: string, hint?: string) => {
    const attempts = wrongAttempts + 1;
    setWrongAttempts(attempts);
    if (attempts >= 1 && hint) {
      setFeedback({ message: hint, variant: 'hint' });
    } else {
      setFeedback({ message: msg, variant: 'wrong' });
    }
  };

  if (step.type === 'interactive-unfold' && step.triangle && 'legs' in step.triangle) {
    const { legs, hypotenuse = 5 } = step.triangle;
    const lengths: [number, number, number] = [legs[0], legs[1], hypotenuse];

    return (
      <div className="step-content">
        {celebrate && <Confetti />}
        <p className="step-prompt">{step.prompt}</p>
        <InteractiveUnfold
          lengths={lengths}
          labels={[String(legs[0]), String(legs[1]), String(hypotenuse)]}
          onUnfoldedChange={setUnfolded}
          highlightLabels={wrongAttempts >= 1}
        />
        <NumericInput
          disabled={!unfolded}
          onSubmit={(value) => {
            if (value === step.answer) {
              finishStep(step.feedback?.correct ?? 'Correct!');
            } else {
              handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
            }
          }}
        />
        {!unfolded && (
          <p className="muted hint-text">Unfold the triangle first, then enter the perimeter.</p>
        )}
        {feedback && <AnswerFeedback {...feedback} />}
      </div>
    );
  }

  if (step.type === 'formula-compute' && step.triangle && 'legs' in step.triangle) {
    const { legs } = step.triangle;
    return (
      <div className="step-content">
        {celebrate && <Confetti />}
        {step.formula && <p className="formula-box">{step.formula}</p>}
        <p className="step-prompt">{step.prompt}</p>
        <StaticTriangle legs={legs} baseLabel={legs[0]} heightLabel={legs[1]} />
        <NumericInput
          onSubmit={(value) => {
            if (value === step.answer) {
              finishStep(step.feedback?.correct ?? 'Correct!');
            } else if (value === legs[0] * legs[1]) {
              handleWrong(
                step.feedback?.hint ??
                  'A triangle is half of the rectangle with the same base and height.',
                step.feedback?.hint,
              );
            } else {
              handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
            }
          }}
        />
        {feedback && <AnswerFeedback {...feedback} />}
      </div>
    );
  }

  if (step.type === 'numeric' && step.triangle && 'legs' in step.triangle) {
    const { legs } = step.triangle;
    return (
      <div className="step-content">
        {celebrate && <Confetti />}
        <p className="step-prompt">{step.prompt}</p>
        <StaticTriangle
          legs={legs}
          baseLabel={legs[0]}
          heightLabel={legs[1]}
          hypLabel={revealed ? step.answer : '?'}
          revealHyp={revealed}
        />
        <NumericInput
          onSubmit={(value) => {
            if (value === step.answer) {
              finishStep(step.feedback?.correct ?? 'Correct!');
            } else {
              handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
            }
          }}
        />
        {feedback && <AnswerFeedback {...feedback} />}
      </div>
    );
  }

  if (step.type === 'leg-then-perimeter' && step.triangle && 'leg' in step.triangle) {
    const { leg, hypotenuse, missingLeg = 0 } = step.triangle;
    const parts = step.parts ?? [];
    const partA = parts[0];
    const partB = parts[1];
    const lengths: [number, number, number] = [leg, missingLeg, hypotenuse];

    return (
      <div className="step-content">
        {celebrate && <Confetti />}
        {!partADone ? (
          <>
            <StaticTriangle
              legs={[leg, missingLeg]}
              baseLabel={leg}
              heightLabel="?"
              hypLabel={hypotenuse}
            />
            <p className="step-prompt">{partA?.prompt}</p>
            <NumericInput
              onSubmit={(value) => {
                if (value === partA?.answer) {
                  setPartADone(true);
                  setFeedback(null);
                  setWrongAttempts(0);
                  setCelebrate(true);
                  setTimeout(() => setCelebrate(false), 1000);
                } else {
                  handleWrong(partA?.feedback?.wrong ?? 'Try again.');
                }
              }}
            />
          </>
        ) : (
          <>
            <InteractiveUnfold
              lengths={lengths}
              labels={[String(leg), String(missingLeg), String(hypotenuse)]}
              onUnfoldedChange={setUnfolded}
              highlightLabels={wrongAttempts >= 1}
            />
            <p className="step-prompt">{partB?.prompt}</p>
            <NumericInput
              disabled={!unfolded}
              onSubmit={(value) => {
                if (value === partB?.answer) {
                  finishStep(partB?.feedback?.correct ?? 'Correct!');
                } else {
                  handleWrong(partB?.feedback?.wrong ?? 'Try again.', partB?.feedback?.hint);
                }
              }}
            />
            {!unfolded && (
              <p className="muted hint-text">Unfold the triangle first, then enter the perimeter.</p>
            )}
          </>
        )}
        {feedback && <AnswerFeedback {...feedback} />}
      </div>
    );
  }

  if (step.type === 'multi-part-numeric' && step.triangle && 'leg' in step.triangle) {
    const { leg, hypotenuse } = step.triangle;
    const parts = step.parts ?? [];
    const partA = parts[0];
    const partB = parts[1];

    return (
      <div className="step-content">
        {celebrate && <Confetti />}
        <StaticTriangle
          legs={[leg, 6]}
          baseLabel={leg}
          heightLabel={partADone ? partA?.answer : '?'}
          hypLabel={hypotenuse}
          revealHeight={partADone}
        />
        {!partADone ? (
          <>
            <p className="step-prompt">{partA?.prompt}</p>
            <NumericInput
              onSubmit={(value) => {
                if (value === partA?.answer) {
                  setPartADone(true);
                  setFeedback(null);
                  setWrongAttempts(0);
                  setCelebrate(true);
                  setTimeout(() => setCelebrate(false), 1000);
                } else {
                  handleWrong(partA?.feedback?.wrong ?? 'Try again.');
                }
              }}
            />
          </>
        ) : (
          <>
            <p className="step-prompt">{partB?.prompt}</p>
            <NumericInput
              onSubmit={(value) => {
                if (value === partB?.answer) {
                  finishStep('½ × 8 × 6 = 24');
                } else {
                  handleWrong(partB?.feedback?.wrong ?? 'Try again.');
                }
              }}
            />
          </>
        )}
        {feedback && <AnswerFeedback {...feedback} />}
      </div>
    );
  }

  return <p>Unknown step type at index {stepIndex}</p>;
}
