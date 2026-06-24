import { useMemo, useState } from 'react';
import type { LessonStep } from '@/types/lesson';
import { GraphPlane } from './GraphPlane';
import { MathText } from '@/components/MathText';

interface DistanceDemoStepProps {
  step: LessonStep;
  onCorrect: () => void;
}

export function DistanceDemoStep({ step, onCorrect }: DistanceDemoStepProps) {
  const demo = step.demo;
  const reveals = demo?.reveals ?? [];
  const graph = step.graph;
  const [revealedCount, setRevealedCount] = useState(0);

  const allRevealed = revealedCount >= reveals.length;

  // Segments accumulate as each step is revealed, so Geometer's lines draw onto
  // the graph the moment that piece is calculated.
  const activeSegmentIds = useMemo(() => {
    const ids: string[] = [];
    for (let i = 0; i < revealedCount; i += 1) {
      const drawn = reveals[i]?.drawSegmentIds;
      if (drawn) ids.push(...drawn);
    }
    return ids;
  }, [revealedCount, reveals]);

  return (
    <div className="step-area">
      <div className="question-box">
        <p className="step-prompt"><MathText>{step.prompt}</MathText></p>
        {demo?.intro && (
          <p className="muted demo-intro">
            <MathText>{demo.intro}</MathText>
          </p>
        )}
        {graph && (
          <GraphPlane
            points={graph.points}
            segments={graph.segments}
            activeSegmentIds={activeSegmentIds}
          />
        )}
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
                      <p className="formula-box">
                        <MathText>{reveal.formula}</MathText>
                      </p>
                    )}
                    <p className="demo-reveal-body"><MathText>{reveal.body}</MathText></p>
                  </>
                )}
              </li>
            );
          })}
        </ol>

        {!allRevealed ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setRevealedCount((c) => c + 1)}
          >
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
