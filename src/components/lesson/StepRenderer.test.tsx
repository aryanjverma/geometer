import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { LessonStep } from '@/types/lesson';

// Konva's node build requires the native `canvas` package, which isn't
// installed in the test environment. The coordinate-rule step under test draws
// no Konva, so stub the react-konva primitives that child components import.
vi.mock('react-konva', () => {
  const Stub = () => null;
  return {
    Stage: Stub,
    Layer: Stub,
    Line: Stub,
    Circle: Stub,
    Text: Stub,
    Arc: Stub,
    Ellipse: Stub,
    Group: Stub,
    Rect: Stub,
  };
});

const { StepRenderer } = await import('./StepRenderer');

function numericStep(): LessonStep {
  return {
    id: 'review-x',
    type: 'coordinate-rule',
    prompt: 'What is the x-coordinate?',
    answer: 5,
    feedback: {
      correct: 'Correct! The answer is 5.',
      wrong: 'Not quite — try the rule again.',
      hint: 'Apply the rule to the x-coordinate.',
    },
  };
}

function answer(value: number) {
  const input = screen.getByLabelText('Numeric answer');
  fireEvent.change(input, { target: { value: String(value) } });
  fireEvent.click(screen.getByRole('button', { name: 'Check' }));
}

describe('StepRenderer — FR-1 Continue button (no auto-advance)', () => {
  it('shows the explanation and a Continue button on a correct answer without auto-advancing', () => {
    const onCorrect = vi.fn();
    render(<StepRenderer step={numericStep()} stepIndex={0} onCorrect={onCorrect} />);

    answer(5);

    // Explanatory feedback is on screen.
    expect(screen.getByText('Correct! The answer is 5.')).toBeTruthy();
    // It does NOT auto-advance.
    expect(onCorrect).not.toHaveBeenCalled();

    // Tapping Continue advances.
    const cont = screen.getByRole('button', { name: 'Continue' });
    fireEvent.click(cont);
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it('does not show a Continue button on a wrong answer', () => {
    const onCorrect = vi.fn();
    render(<StepRenderer step={numericStep()} stepIndex={0} onCorrect={onCorrect} />);
    answer(4);
    expect(screen.queryByRole('button', { name: 'Continue' })).toBeNull();
    expect(onCorrect).not.toHaveBeenCalled();
  });
});

describe('StepRenderer — FR-3 suppressHints', () => {
  it('by default escalates to the hint after a wrong attempt', () => {
    render(<StepRenderer step={numericStep()} stepIndex={0} onCorrect={vi.fn()} />);
    answer(4);
    expect(screen.getByText('Apply the rule to the x-coordinate.')).toBeTruthy();
    expect(screen.queryByText('Not quite — try the rule again.')).toBeNull();
  });

  it('with suppressHints shows only the plain wrong feedback, never the hint', () => {
    render(
      <StepRenderer
        step={numericStep()}
        stepIndex={0}
        onCorrect={vi.fn()}
        suppressHints
      />,
    );
    answer(4);
    expect(screen.getByText('Not quite — try the rule again.')).toBeTruthy();
    expect(screen.queryByText('Apply the rule to the x-coordinate.')).toBeNull();
    // A second wrong attempt also never escalates.
    answer(3);
    expect(screen.getByText('Not quite — try the rule again.')).toBeTruthy();
    expect(screen.queryByText('Apply the rule to the x-coordinate.')).toBeNull();
  });
});

describe('StepRenderer — FR-7 assessmentMode (deferred feedback)', () => {
  it('advances on a single correct submission with no feedback or Continue', () => {
    const onCorrect = vi.fn();
    const onAttempt = vi.fn();
    render(
      <StepRenderer
        step={numericStep()}
        stepIndex={0}
        onCorrect={onCorrect}
        onAttempt={onAttempt}
        assessmentMode
      />,
    );

    answer(5);

    // Correctness is still reported, and the question advances immediately.
    expect(onAttempt).toHaveBeenCalledWith(true, 5);
    expect(onCorrect).toHaveBeenCalledTimes(1);
    // No feedback and no Continue button appear during the assessment.
    expect(screen.queryByText('Correct! The answer is 5.')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Continue' })).toBeNull();
  });

  it('advances on a wrong submission too (single shot), reporting the miss with no feedback', () => {
    const onCorrect = vi.fn();
    const onAttempt = vi.fn();
    render(
      <StepRenderer
        step={numericStep()}
        stepIndex={0}
        onCorrect={onCorrect}
        onAttempt={onAttempt}
        assessmentMode
      />,
    );

    answer(4);

    expect(onAttempt).toHaveBeenCalledWith(false, 4);
    expect(onCorrect).toHaveBeenCalledTimes(1);
    // Neither the wrong message nor the hint is shown.
    expect(screen.queryByText('Not quite — try the rule again.')).toBeNull();
    expect(screen.queryByText('Apply the rule to the x-coordinate.')).toBeNull();
  });
});
