import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MasteryStats } from './MasteryStats';
import type { ConceptMasteryMap } from '@/types/review';

const EMPTY_MASTERY: ConceptMasteryMap = {};

function normalize(text: string | null | undefined): string {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

function renderStats(props: Partial<Parameters<typeof MasteryStats>[0]> = {}) {
  return render(
    <MemoryRouter>
      <MasteryStats conceptMastery={EMPTY_MASTERY} streak={5} {...props} />
    </MemoryRouter>,
  );
}

describe('MasteryStats leaderboard rank', () => {
  it('renders rank and total when ranked', () => {
    const { container } = renderStats({ rank: 3, totalRanked: 12 });
    const rankEl = container.querySelector('.streak-rank');
    expect(rankEl).not.toBeNull();
    expect(normalize(rankEl?.textContent)).toBe('#3 of 12');
    expect(screen.getByText('View leaderboard')).toBeTruthy();
  });

  it('renders "Not ranked yet" when rank is null', () => {
    const { container } = renderStats({ rank: null });
    const rankEl = container.querySelector('.streak-rank');
    expect(rankEl).not.toBeNull();
    expect(normalize(rankEl?.textContent)).toBe('Not ranked yet');
  });

  it('renders "Not ranked yet" when rank is omitted', () => {
    const { container } = renderStats();
    const rankEl = container.querySelector('.streak-rank');
    expect(normalize(rankEl?.textContent)).toBe('Not ranked yet');
  });

  it('keeps streak count and day label intact', () => {
    const { container } = renderStats({ rank: 3, totalRanked: 12 });
    expect(screen.getByText('5')).toBeTruthy();
    expect(normalize(container.querySelector('.streak-widget-label')?.textContent)).toBe(
      'days streak',
    );
  });
});
