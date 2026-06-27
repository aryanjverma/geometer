import { useState } from 'react';
import type { LessonStep } from '@/types/lesson';
import { ShapeMatch } from './ShapeMatch';
import { Confetti } from './Confetti';
import { MathText } from '@/components/MathText';

interface ShapeMatchStepProps {
  step: LessonStep;
  onCorrect: () => void;
}

export function ShapeMatchStep({ step, onCorrect }: ShapeMatchStepProps) {
  const match = step.match;
  const grid = step.grid;
  const [matched, setMatched] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [done, setDone] = useState(false);

  if (!match || !grid) {
    return <p>Missing shape-match data.</p>;
  }

  const handleMatch = (isMatch: boolean) => {
    setMatched(isMatch);
    if (isMatch && !done) {
      setDone(true);
      setCelebrate(true);
    }
  };

  return (
    <div className="step-area">
      {celebrate && <Confetti />}
      <div className="question-box">
        <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
        <ShapeMatch
          bounds={grid}
          source={match.source}
          target={match.target}
          goal={match.goal}
          allow={match.allow}
          onMatch={handleMatch}
          solved={done}
        />
      </div>

      <div className="answer-box">
        {matched ? (
          <>
            <p className="feedback feedback-correct">
              <MathText>{step.feedback?.correct ?? 'The shapes match.'}</MathText>
            </p>
            <button type="button" className="continue-btn" onClick={onCorrect}>
              Continue
            </button>
          </>
        ) : (
          step.feedback?.hint && (
            <p className="muted hint-text"><MathText>{step.feedback.hint}</MathText></p>
          )
        )}
      </div>
    </div>
  );
}
