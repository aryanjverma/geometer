import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LessonCard } from './LessonCard';
import type { Concept, MasteryLevel } from '@/types/mastery';

function concept(id: string, label: string, level: MasteryLevel) {
  const c: Concept = { conceptId: id, lessonId: 'l', label, stepId: id };
  return { concept: c, level };
}

const CONCEPTS = [
  concept('a', 'Find the hypotenuse', 'mastered'),
  concept('b', 'Area of a right triangle', 'learning'),
  concept('c', 'Missing leg, then perimeter', 'need-review'),
];

function renderCard(props: Partial<Parameters<typeof LessonCard>[0]> = {}) {
  return render(
    <MemoryRouter>
      <LessonCard
        lessonId="right-triangles"
        title="Right Triangles"
        description="desc"
        buttonState="Review"
        concepts={CONCEPTS}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('LessonCard concept overview', () => {
  it('shows a compact count summary and a button, not the full chip list', () => {
    renderCard();
    // Summary count pills are present.
    expect(screen.getByText('1 Mastered')).toBeTruthy();
    expect(screen.getByText('1 Learning')).toBeTruthy();
    expect(screen.getByText('1 To review')).toBeTruthy();
    // The button is present...
    expect(screen.getByRole('button', { name: 'View concepts' })).toBeTruthy();
    // ...but the dialog and its full concept labels are not yet shown.
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText('Find the hypotenuse')).toBeNull();
  });

  it('opens a dialog listing every concept when the button is clicked', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: 'View concepts' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Find the hypotenuse')).toBeTruthy();
    expect(within(dialog).getByText('Area of a right triangle')).toBeTruthy();
    expect(within(dialog).getByText('Missing leg, then perimeter')).toBeTruthy();
  });

  it('closes the dialog on Escape and on the close button', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: 'View concepts' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();

    // Reopen, then close via the close button.
    fireEvent.click(screen.getByRole('button', { name: 'View concepts' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders no concept summary or button when the lesson is locked', () => {
    renderCard({ buttonState: 'Locked' });
    expect(screen.queryByRole('button', { name: 'View concepts' })).toBeNull();
    expect(screen.queryByText('1 Mastered')).toBeNull();
  });
});
