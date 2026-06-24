import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MathText, tokenizeMath } from './MathText';

describe('MathText', () => {
  it('renders a KaTeX node for a $...$ span', () => {
    const { container } = render(<MathText>{'Area $\\frac{1}{2}bh$'}</MathText>);
    expect(container.querySelector('.katex')).not.toBeNull();
  });

  it('leaves surrounding prose intact', () => {
    const { container } = render(<MathText>{'The area is $\\frac{1}{2}bh$ exactly'}</MathText>);
    expect(container.textContent).toContain('The area is');
    expect(container.textContent).toContain('exactly');
  });

  it('renders plain text without any math node', () => {
    const { container } = render(<MathText>{'No math here'}</MathText>);
    expect(container.querySelector('.katex')).toBeNull();
    expect(container.textContent).toBe('No math here');
  });
});

describe('tokenizeMath', () => {
  it('splits text and math tokens in order', () => {
    const tokens = tokenizeMath('a $x$ b');
    expect(tokens.map((t) => t.type)).toEqual(['text', 'math', 'text']);
  });

  it('returns a single text token when there is no math', () => {
    const tokens = tokenizeMath('plain');
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toEqual({ type: 'text', value: 'plain' });
  });
});
