import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  WhyHalfParallelogram,
  parallelogramArea,
  triangleArea,
} from './WhyHalfParallelogram';

describe('parallelogram helpers', () => {
  it('computes parallelogram area as base times height', () => {
    expect(parallelogramArea(4, 3)).toBe(12);
  });

  it('computes triangle area as half of base times height', () => {
    expect(triangleArea(4, 3)).toBe(6);
  });
});

describe('WhyHalfParallelogram component', () => {
  it('renders without throwing', () => {
    const { container } = render(<WhyHalfParallelogram base={4} height={3} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('reveals the parallelogram and half labels after the button is pressed', () => {
    render(<WhyHalfParallelogram base={4} height={3} />);

    expect(screen.queryByTestId('parallelogram-area')).toBeNull();

    fireEvent.click(screen.getByRole('button'));

    const paraLabel = screen.getByTestId('parallelogram-area');
    const halfLabel = screen.getByTestId('triangle-half');
    expect(paraLabel.querySelector('.katex')).not.toBeNull();
    expect(halfLabel.querySelector('.katex')).not.toBeNull();
  });
});
