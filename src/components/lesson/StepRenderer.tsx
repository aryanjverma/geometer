import { useState } from 'react';
import type { LessonStep } from '@/types/lesson';
import { InteractiveUnfold } from './InteractiveUnfold';
import { StaticTriangle } from './StaticTriangle';
import { GeneralTriangle } from './GeneralTriangle';
import { SplitTriangle } from './SplitTriangle';
import { Confetti } from './Confetti';
import { DemonstrationStep } from './DemonstrationStep';
import { GuidedStep } from './GuidedStep';
import { TransitionStep } from './TransitionStep';
import { DistanceDemoStep } from './DistanceDemoStep';
import { DistanceProblemStep } from './DistanceProblemStep';
import { TransformStep } from './TransformStep';
import { ShapeMatchStep } from './ShapeMatchStep';
import { GridCheckStep } from './GridCheckStep';
import { StaticGrid, gridShapes } from './StaticGrid';
import { ParallelLinesFigure } from './ParallelLinesFigure';
import { TriangleAngleFigure } from './TriangleAngleFigure';
import { Solid3D } from './Solid3D';
import { SliceCone } from './SliceCone';
import { MathText } from '@/components/MathText';

interface FeedbackState {
  message: string;
  variant: 'correct' | 'wrong' | 'hint';
}

function AnswerFeedback({ message, variant }: FeedbackState) {
  return (
    <p className={`feedback feedback-${variant}`}>
      <MathText>{message}</MathText>
    </p>
  );
}

interface NumericInputProps {
  /** Return true if the answer was correct; the field clears on a wrong answer. */
  onSubmit: (value: number) => boolean;
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
        if (Number.isNaN(n)) return;
        const correct = onSubmit(n);
        if (!correct) setValue('');
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
  /**
   * Optional Phase 2 hook fired on each numeric submission of the step's FINAL
   * answer (for multi-part / distance steps, only the last part/subStep fires).
   * Backward compatible: omitting it preserves all Phase 1 grading and advance
   * behavior. Used by the review runner to persist right/wrong attempts.
   */
  onAttempt?: (correct: boolean, value: number) => void;
}

const CELEBRATE_MS = 1200;

export function StepRenderer({ step, stepIndex, onCorrect, onAttempt }: StepRendererProps) {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [unfolded, setUnfolded] = useState(false);
  const [partADone, setPartADone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // Correct answer that ends the step: reveal, celebrate, then advance.
  const finishStep = (msg: string): boolean => {
    setFeedback({ message: msg, variant: 'correct' });
    setRevealed(true);
    setCelebrate(true);
    setTimeout(onCorrect, CELEBRATE_MS);
    return true;
  };

  const handleWrong = (msg: string, hint?: string): boolean => {
    const attempts = wrongAttempts + 1;
    setWrongAttempts(attempts);
    if (attempts >= 1 && hint) {
      setFeedback({ message: hint, variant: 'hint' });
    } else {
      setFeedback({ message: msg, variant: 'wrong' });
    }
    return false;
  };

  if (step.type === 'transition') {
    return <TransitionStep step={step} onCorrect={onCorrect} />;
  }

  if (step.type === 'demonstration' || step.type === 'congruence-demo' || step.type === 'similarity-demo') {
    return <DemonstrationStep step={step} onCorrect={onCorrect} />;
  }

  if (step.type === 'guided' || step.type === 'congruence-guided' || step.type === 'similarity-guided') {
    return <GuidedStep step={step} onCorrect={onCorrect} />;
  }

  if (
    step.type === 'transform-demo' ||
    step.type === 'transform-guided' ||
    step.type === 'transform-problem'
  ) {
    return <TransformStep step={step} onCorrect={onCorrect} />;
  }

  if (step.type === 'congruence-check' || step.type === 'similarity-check') {
    return <GridCheckStep step={step} onCorrect={onCorrect} />;
  }

  if (step.type === 'shape-match') {
    return <ShapeMatchStep step={step} onCorrect={onCorrect} />;
  }

  if (step.type === 'distance-demo') {
    return <DistanceDemoStep step={step} onCorrect={onCorrect} />;
  }

  if (step.type === 'distance-guided' || step.type === 'distance-problem') {
    return <DistanceProblemStep step={step} onCorrect={onCorrect} onAttempt={onAttempt} />;
  }

  if (step.type === 'interactive-unfold' && step.triangle && 'legs' in step.triangle) {
    const { legs, hypotenuse = 5 } = step.triangle;
    const lengths: [number, number, number] = [legs[0], legs[1], hypotenuse];

    return (
      <div className="step-area">
        {celebrate && <Confetti />}
        <div className="question-box">
          <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
          <InteractiveUnfold
            lengths={lengths}
            labels={[String(legs[0]), String(legs[1]), String(hypotenuse)]}
            onUnfoldedChange={setUnfolded}
            highlightLabels={wrongAttempts >= 1}
          />
        </div>
        <div className="answer-box">
          <NumericInput
            disabled={!unfolded}
            onSubmit={(value) => {
              onAttempt?.(value === step.answer, value);
              return value === step.answer
                ? finishStep(step.feedback?.correct ?? 'Correct!')
                : handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
            }}
          />
          {!unfolded && (
            <p className="muted hint-text">Unfold the triangle first, then enter the perimeter.</p>
          )}
          {feedback && <AnswerFeedback {...feedback} />}
        </div>
      </div>
    );
  }

  if (step.type === 'formula-compute' && step.triangle && 'legs' in step.triangle) {
    const { legs } = step.triangle;
    return (
      <div className="step-area">
        {celebrate && <Confetti />}
        <div className="question-box">
          {step.formula && (
            <p className="formula-box">
              <MathText>{step.formula}</MathText>
            </p>
          )}
          <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
          <StaticTriangle legs={legs} baseLabel={legs[0]} heightLabel={legs[1]} />
        </div>
        <div className="answer-box">
          <NumericInput
            onSubmit={(value) => {
              onAttempt?.(value === step.answer, value);
              if (value === step.answer) {
                return finishStep(step.feedback?.correct ?? 'Correct!');
              }
              if (value === legs[0] * legs[1]) {
                return handleWrong(
                  step.feedback?.hint ??
                    'A triangle is half of the rectangle with the same base and height.',
                  step.feedback?.hint,
                );
              }
              return handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
            }}
          />
          {feedback && <AnswerFeedback {...feedback} />}
        </div>
      </div>
    );
  }

  if (step.type === 'numeric' && step.triangle && 'legs' in step.triangle) {
    const { legs } = step.triangle;
    return (
      <div className="step-area">
        {celebrate && <Confetti />}
        <div className="question-box">
          <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
          <StaticTriangle
            legs={legs}
            baseLabel={legs[0]}
            heightLabel={legs[1]}
            hypLabel={revealed ? step.answer : '?'}
            revealHyp={revealed}
          />
        </div>
        <div className="answer-box">
          <NumericInput
            onSubmit={(value) => {
              onAttempt?.(value === step.answer, value);
              return value === step.answer
                ? finishStep(step.feedback?.correct ?? 'Correct!')
                : handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
            }}
          />
          {feedback && <AnswerFeedback {...feedback} />}
        </div>
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
      <div className="step-area">
        {celebrate && <Confetti />}
        {!partADone ? (
          <>
            <div className="question-box">
              <p className="step-prompt"><MathText>{partA?.prompt ?? ''}</MathText></p>
              <StaticTriangle
                legs={[leg, missingLeg]}
                baseLabel={leg}
                heightLabel="?"
                hypLabel={hypotenuse}
              />
            </div>
            <div className="answer-box">
              <NumericInput
                key="part-a"
                onSubmit={(value) => {
                  if (value === partA?.answer) {
                    setPartADone(true);
                    setFeedback(null);
                    setWrongAttempts(0);
                    setCelebrate(true);
                    setTimeout(() => setCelebrate(false), 1000);
                    return true;
                  }
                  return handleWrong(partA?.feedback?.wrong ?? 'Try again.');
                }}
              />
              {feedback && <AnswerFeedback {...feedback} />}
            </div>
          </>
        ) : (
          <>
            <div className="question-box">
              <p className="step-prompt"><MathText>{partB?.prompt ?? ''}</MathText></p>
              <InteractiveUnfold
                lengths={lengths}
                labels={[String(leg), String(missingLeg), String(hypotenuse)]}
                onUnfoldedChange={setUnfolded}
                highlightLabels={wrongAttempts >= 1}
              />
            </div>
            <div className="answer-box">
              <NumericInput
                key="part-b"
                disabled={!unfolded}
                onSubmit={(value) => {
                  onAttempt?.(value === partB?.answer, value);
                  return value === partB?.answer
                    ? finishStep(partB?.feedback?.correct ?? 'Correct!')
                    : handleWrong(partB?.feedback?.wrong ?? 'Try again.', partB?.feedback?.hint);
                }}
              />
              {!unfolded && (
                <p className="muted hint-text">Unfold the triangle first, then enter the perimeter.</p>
              )}
              {feedback && <AnswerFeedback {...feedback} />}
            </div>
          </>
        )}
      </div>
    );
  }

  if (step.type === 'multi-part-numeric' && step.triangle && 'leg' in step.triangle) {
    const { leg, hypotenuse } = step.triangle;
    const parts = step.parts ?? [];
    const partA = parts[0];
    const partB = parts[1];

    return (
      <div className="step-area">
        {celebrate && <Confetti />}
        <div className="question-box">
          <p className="step-prompt"><MathText>{(partADone ? partB?.prompt : partA?.prompt) ?? ''}</MathText></p>
          <StaticTriangle
            legs={[leg, 6]}
            baseLabel={leg}
            heightLabel={partADone ? partA?.answer : '?'}
            hypLabel={hypotenuse}
            revealHeight={partADone}
          />
        </div>
        <div className="answer-box">
          {!partADone ? (
            <NumericInput
              key="part-a"
              onSubmit={(value) => {
                if (value === partA?.answer) {
                  setPartADone(true);
                  setFeedback(null);
                  setWrongAttempts(0);
                  setCelebrate(true);
                  setTimeout(() => setCelebrate(false), 1000);
                  return true;
                }
                return handleWrong(partA?.feedback?.wrong ?? 'Try again.');
              }}
            />
          ) : (
            <NumericInput
              key="part-b"
              onSubmit={(value) => {
                onAttempt?.(value === partB?.answer, value);
                return value === partB?.answer
                  ? finishStep(partB?.feedback?.correct ?? 'Correct!')
                  : handleWrong(partB?.feedback?.wrong ?? 'Try again.');
              }}
            />
          )}
          {feedback && <AnswerFeedback {...feedback} />}
        </div>
      </div>
    );
  }

  if (step.type === 'area-base-height' && step.triangle && 'base' in step.triangle) {
    const { base, height } = step.triangle;
    return (
      <div className="step-area">
        {celebrate && <Confetti />}
        <div className="question-box">
          {step.formula && (
            <p className="formula-box">
              <MathText>{step.formula}</MathText>
            </p>
          )}
          <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
          <GeneralTriangle
            base={base}
            height={height}
            baseLabel={base}
            heightLabel={height}
            showAltitude
          />
        </div>
        <div className="answer-box">
          <NumericInput
            onSubmit={(value) => {
              onAttempt?.(value === step.answer, value);
              if (value === step.answer) {
                return finishStep(step.feedback?.correct ?? 'Correct!');
              }
              if (value === base * height) {
                return handleWrong(
                  step.feedback?.hint ?? 'Don’t forget the ½.',
                  step.feedback?.hint,
                );
              }
              return handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
            }}
          />
          {feedback && <AnswerFeedback {...feedback} />}
        </div>
      </div>
    );
  }

  if (step.type === 'derive-perimeter' && step.triangle && 'base' in step.triangle) {
    const { base, height, leftSplit, rightSplit, sides } = step.triangle;
    return (
      <div className="step-area">
        {celebrate && <Confetti />}
        <div className="question-box">
          <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
          <GeneralTriangle
            base={base}
            height={height}
            apexSplit={leftSplit}
            heightLabel={height}
            splitLabels={[leftSplit ?? '', rightSplit ?? '']}
            leftSideLabel={revealed && sides ? sides[0] : '?'}
            rightSideLabel={revealed && sides ? sides[1] : '?'}
            revealSides={revealed}
            showAltitude
          />
        </div>
        <div className="answer-box">
          <NumericInput
            onSubmit={(value) => {
              onAttempt?.(value === step.answer, value);
              return value === step.answer
                ? finishStep(step.feedback?.correct ?? 'Correct!')
                : handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
            }}
          />
          {feedback && <AnswerFeedback {...feedback} />}
        </div>
      </div>
    );
  }

  if (step.type === 'interactive-split' && step.triangle && 'base' in step.triangle) {
    const { base, height, leftSplit, sides } = step.triangle;
    return (
      <div className="step-area">
        {celebrate && <Confetti />}
        <div className="question-box">
          <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
          <SplitTriangle
            base={base}
            height={height}
            baseHalfLabel={String(leftSplit ?? base / 2)}
            heightLabel={String(height)}
            sideLabel={sides ? String(sides[0]) : ''}
            onSplit={setUnfolded}
          />
        </div>
        <div className="answer-box">
          <NumericInput
            disabled={!unfolded}
            onSubmit={(value) => {
              onAttempt?.(value === step.answer, value);
              return value === step.answer
                ? finishStep(step.feedback?.correct ?? 'Correct!')
                : handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
            }}
          />
          {!unfolded && (
            <p className="muted hint-text">Swipe the handle down to split the triangle first.</p>
          )}
          {feedback && <AnswerFeedback {...feedback} />}
        </div>
      </div>
    );
  }

  if (step.type === 'perimeter-from-area' && step.triangle && 'base' in step.triangle) {
    const { base, height, leftSplit, sides } = step.triangle;
    return (
      <div className="step-area">
        {celebrate && <Confetti />}
        <div className="question-box">
          <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
          <GeneralTriangle
            base={base}
            height={height}
            apexSplit={leftSplit}
            heightLabel={height}
            baseLabel={revealed ? base : '?'}
            leftSideLabel={revealed && sides ? sides[0] : '?'}
            rightSideLabel={revealed && sides ? sides[1] : '?'}
            revealSides={revealed}
            showAltitude
          />
        </div>
        <div className="answer-box">
          <NumericInput
            onSubmit={(value) => {
              onAttempt?.(value === step.answer, value);
              return value === step.answer
                ? finishStep(step.feedback?.correct ?? 'Correct!')
                : handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
            }}
          />
          {feedback && <AnswerFeedback {...feedback} />}
        </div>
      </div>
    );
  }

  if (step.type === 'coordinate-rule') {
    const shapes = step.grid?.shapes?.length ? gridShapes(step.grid) : [];
    return (
      <div className="step-area">
        {celebrate && <Confetti />}
        <div className="question-box">
          <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
          {step.grid && shapes.length > 0 && (
            <StaticGrid
              xMin={step.grid.xMin}
              xMax={step.grid.xMax}
              yMin={step.grid.yMin}
              yMax={step.grid.yMax}
              shapes={shapes}
            />
          )}
        </div>
        <div className="answer-box">
          <NumericInput
            onSubmit={(value) => {
              onAttempt?.(value === step.answer, value);
              return value === step.answer
                ? finishStep(step.feedback?.correct ?? 'Correct!')
                : handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
            }}
          />
          {feedback && <AnswerFeedback {...feedback} />}
        </div>
      </div>
    );
  }

  if (step.type === 'find-angle' && step.angleFigure) {
    return (
      <div className="step-area">
        {celebrate && <Confetti />}
        <div className="question-box">
          <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
          <ParallelLinesFigure figure={step.angleFigure} />
        </div>
        <div className="answer-box">
          <NumericInput
            onSubmit={(value) => {
              onAttempt?.(value === step.answer, value);
              return value === step.answer
                ? finishStep(step.feedback?.correct ?? 'Correct!')
                : handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
            }}
          />
          {feedback && <AnswerFeedback {...feedback} />}
        </div>
      </div>
    );
  }

  if (step.type === 'triangle-angle' && step.angleFigure) {
    return (
      <div className="step-area">
        {celebrate && <Confetti />}
        <div className="question-box">
          <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
          <TriangleAngleFigure
            figure={step.angleFigure}
            reveal={revealed}
            revealValue={step.answer}
          />
        </div>
        <div className="answer-box">
          <NumericInput
            onSubmit={(value) => {
              onAttempt?.(value === step.answer, value);
              return value === step.answer
                ? finishStep(step.feedback?.correct ?? 'Correct!')
                : handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
            }}
          />
          {feedback && <AnswerFeedback {...feedback} />}
        </div>
      </div>
    );
  }

  if (step.type === 'solid-volume' && step.solid) {
    return (
      <div className="step-area">
        {celebrate && <Confetti />}
        <div className="question-box">
          {step.formula && (
            <p className="formula-box">
              <MathText>{step.formula}</MathText>
            </p>
          )}
          <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
          <Solid3D figure={step.solid} />
        </div>
        <div className="answer-box">
          <NumericInput
            onSubmit={(value) => {
              onAttempt?.(value === step.answer, value);
              return value === step.answer
                ? finishStep(step.feedback?.correct ?? 'Correct!')
                : handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
            }}
          />
          {feedback && <AnswerFeedback {...feedback} />}
        </div>
      </div>
    );
  }

  if (step.type === 'cone-radius-slice' && step.solid) {
    const { height = 8, slant = 10, radius } = step.solid;
    return (
      <div className="step-area">
        {celebrate && <Confetti />}
        <div className="question-box">
          <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
          <SliceCone
            height={height}
            slant={slant}
            radius={radius}
            revealRadius={revealed}
            onSplit={setUnfolded}
          />
        </div>
        <div className="answer-box">
          <NumericInput
            disabled={!unfolded}
            onSubmit={(value) => {
              onAttempt?.(value === step.answer, value);
              return value === step.answer
                ? finishStep(step.feedback?.correct ?? 'Correct!')
                : handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
            }}
          />
          {!unfolded && (
            <p className="muted hint-text">Slice the cone first to reveal the right triangle.</p>
          )}
          {feedback && <AnswerFeedback {...feedback} />}
        </div>
      </div>
    );
  }

  if (step.type === 'cone-radius-volume' && step.solid) {
    const { height = 8, slant = 10, radius } = step.solid;
    return (
      <div className="step-area">
        {celebrate && <Confetti />}
        <div className="question-box">
          <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
          <SliceCone
            height={height}
            slant={slant}
            radius={radius}
            revealRadius={partADone}
            onSplit={setUnfolded}
          />
        </div>
        <div className="answer-box">
          {!partADone ? (
            <>
              <p className="step-prompt">
                <MathText>{'Step 1 \u2014 find the radius of the circular opening.'}</MathText>
              </p>
              <NumericInput
                key="radius"
                disabled={!unfolded}
                onSubmit={(value) => {
                  if (value === step.answer) {
                    setPartADone(true);
                    setFeedback(null);
                    setWrongAttempts(0);
                    setCelebrate(true);
                    setTimeout(() => setCelebrate(false), 1000);
                    return true;
                  }
                  return handleWrong(step.feedback?.wrong ?? 'Try again.', step.feedback?.hint);
                }}
              />
              {!unfolded && (
                <p className="muted hint-text">Slice the cone first to reveal the right triangle.</p>
              )}
            </>
          ) : (
            <>
              <p className="step-prompt">
                <MathText>
                  {'Step 2 \u2014 now find the cone volume as a whole-number coefficient of $\\pi$.'}
                </MathText>
              </p>
              <NumericInput
                key="volume"
                onSubmit={(value) => {
                  onAttempt?.(value === step.volumeAnswer, value);
                  return value === step.volumeAnswer
                    ? finishStep(step.feedback?.correct ?? 'Correct!')
                    : handleWrong(
                        'Compute $\\frac{r^2 h}{3}$ with the radius you just found.',
                        'For a cone, $V = \\frac{1}{3}\\pi r^2 h$; the coefficient of $\\pi$ is $\\frac{r^2 h}{3}$.',
                      );
                }}
              />
            </>
          )}
          {feedback && <AnswerFeedback {...feedback} />}
        </div>
      </div>
    );
  }

  return <p>Unknown step type at index {stepIndex}</p>;
}
