import { useMemo, useState } from 'react';
import type { GridPoint, LessonStep } from '@/types/lesson';
import { InteractiveGrid } from './InteractiveGrid';
import { StaticGrid } from './StaticGrid';
import type { StaticGridShape } from './StaticGrid';
import { Confetti } from './Confetti';
import { applyOp } from './transformGridUtils';
import { MathText } from '@/components/MathText';

interface TransformStepProps {
  step: LessonStep;
  onCorrect: () => void;
}

const CELEBRATE_MS = 1200;

export function TransformStep({ step, onCorrect }: TransformStepProps) {
  const transform = step.transform;
  const grid = step.grid;
  const isDemo = step.type === 'transform-demo';

  const reveals = step.demo?.reveals ?? [];
  const [revealedCount, setRevealedCount] = useState(0);
  const [matched, setMatched] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [done, setDone] = useState(false);

  // Intermediate positions after each step except the last, so multi-step
  // problems can lock in progress one transformation at a time.
  const checkpoints = useMemo<GridPoint[][]>(() => {
    const ops = transform?.steps;
    if (!transform || !ops || ops.length < 2) return [];
    const result: GridPoint[][] = [];
    let pts = transform.source.vertices.map((v) => ({ ...v }));
    for (let i = 0; i < ops.length - 1; i += 1) {
      pts = pts.map((p) => applyOp(p, ops[i]));
      result.push(pts);
    }
    return result;
  }, [transform]);

  if (!transform || !grid) {
    return <p>Missing transformation data.</p>;
  }

  const allRevealed = revealedCount >= reveals.length;

  const handleMatch = (isMatch: boolean) => {
    setMatched(isMatch);
    if (isMatch && !done) {
      setDone(true);
      setCelebrate(true);
      setTimeout(onCorrect, CELEBRATE_MS);
    }
  };

  if (isDemo) {
    const showResult = allRevealed;
    const demoShapes: StaticGridShape[] = [
      { id: transform.source.id, vertices: transform.source.vertices, label: 'Original', variant: 'a' },
    ];
    if (showResult) {
      demoShapes.push({ id: 'image', vertices: transform.target, label: 'Image', variant: 'ghost' });
    }

    return (
      <div className="step-area">
        <div className="question-box">
          <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
          {transform.instruction && (
            <p className="transform-instruction"><MathText>{transform.instruction}</MathText></p>
          )}
          <StaticGrid {...grid} shapes={demoShapes} />
        </div>

        <div className="answer-box">
          <ol className="demo-reveal-list">
            {reveals.map((reveal, i) => {
              const shown = i < revealedCount;
              return (
                <li
                  key={reveal.label}
                  className={`demo-reveal ${shown ? 'demo-reveal-shown' : 'demo-reveal-hidden'}`}
                  aria-hidden={!shown}
                >
                  <p className="demo-reveal-label"><MathText>{reveal.label}</MathText></p>
                  {shown && (
                    <>
                      {reveal.formula && (
                        <p className="formula-box"><MathText>{reveal.formula}</MathText></p>
                      )}
                      <p className="demo-reveal-body"><MathText>{reveal.body}</MathText></p>
                    </>
                  )}
                </li>
              );
            })}
          </ol>

          {!allRevealed ? (
            <button type="button" className="btn btn-primary" onClick={() => setRevealedCount((c) => c + 1)}>
              {revealedCount === 0 ? 'Show first step' : 'Reveal next step'}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={onCorrect}>
              Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  // transform-guided / transform-problem: learner drags vertices onto the target.
  return (
    <div className="step-area">
      {celebrate && <Confetti />}
      <div className="question-box">
        <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
        {transform.instruction && (
          <p className="transform-instruction"><MathText>{transform.instruction}</MathText></p>
        )}
        <InteractiveGrid
          bounds={grid}
          source={transform.source}
          target={transform.target}
          onMatch={handleMatch}
          solved={done}
          showTarget={step.type !== 'transform-problem'}
          checkpoints={checkpoints}
        />
      </div>

      <div className="answer-box">
        {matched ? (
          <p className="feedback feedback-correct">
            <MathText>{step.feedback?.correct ?? 'That is the correct image.'}</MathText>
          </p>
        ) : (
          step.feedback?.hint && (
            <p className="muted hint-text"><MathText>{step.feedback.hint}</MathText></p>
          )
        )}
      </div>
    </div>
  );
}
