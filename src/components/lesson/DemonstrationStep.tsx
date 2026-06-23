import { useState } from 'react';
import type { LessonStep } from '@/types/lesson';
import { StaticTriangle } from './StaticTriangle';
import { GeneralTriangle } from './GeneralTriangle';
import { ShearTriangle } from './ShearTriangle';

interface DemonstrationStepProps {
  step: LessonStep;
  onCorrect: () => void;
}

export function DemonstrationStep({ step, onCorrect }: DemonstrationStepProps) {
  const demo = step.demo;
  const reveals = demo?.reveals ?? [];
  const [revealedCount, setRevealedCount] = useState(0);

  const allRevealed = revealedCount >= reveals.length;
  const triangle = step.triangle;

  const renderVisual = () => {
    if (demo?.interactive === 'shear' && triangle && 'base' in triangle) {
      return (
        <ShearTriangle
          base={triangle.base}
          height={triangle.height}
          showArea={revealedCount >= 2}
        />
      );
    }
    if (triangle && 'legs' in triangle) {
      const { legs, hypotenuse } = triangle;
      const hypRevealed = revealedCount >= 3;
      return (
        <StaticTriangle
          legs={legs}
          baseLabel={legs[0]}
          heightLabel={legs[1]}
          hypLabel={hypRevealed ? (hypotenuse ?? '?') : '?'}
          revealHyp={hypRevealed}
        />
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

  return (
    <div className="step-area">
      <div className="question-box">
        <span className="step-tag step-tag-ido">I do</span>
        <p className="step-prompt">{step.prompt}</p>
        {demo?.intro && <p className="muted demo-intro">{demo.intro}</p>}
        {renderVisual()}
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
