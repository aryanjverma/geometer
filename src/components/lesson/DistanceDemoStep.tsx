import { useMemo, useState } from 'react';
import type { LessonStep } from '@/types/lesson';
import { GraphPlane } from './GraphPlane';

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
        <span className="step-tag step-tag-ido">I do</span>
        <p className="step-prompt">{step.prompt}</p>
        {demo?.intro && <p className="muted demo-intro">{demo.intro}</p>}
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
                <p className="demo-reveal-label">{reveal.label}</p>
                {shown && (
                  <>
                    {reveal.formula && <p className="formula-box">{reveal.formula}</p>}
                    <p className="demo-reveal-body">{reveal.body}</p>
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
