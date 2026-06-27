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

const OPEN_LABEL = 'View lesson';

function renderCard(props: Partial<Parameters<typeof LessonCard>[0]> = {}) {
  return render(
    <MemoryRouter>
      <LessonCard
        lessonId="right-triangles"
        title="Right Triangles"
        description="Master the Pythagorean theorem."
        buttonState="Review"
        concepts={CONCEPTS}
        masteryPercent={50}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('LessonCard face', () => {
  it('shows the title, the mastery percentage, and a single open-modal button', () => {
    renderCard();
    // Title.
    expect(screen.getByRole('heading', { name: 'Right Triangles' })).toBeTruthy();
    // Single per-lesson mastery percentage (no count pills, no chip).
    expect(screen.getByText('50%')).toBeTruthy();
    expect(screen.queryByText('1 Mastered')).toBeNull();
    expect(screen.queryByText('1 Learning')).toBeNull();
    expect(screen.queryByText('1 To review')).toBeNull();
    // The single button that opens the expanded lesson view.
    expect(screen.getByRole('button', { name: OPEN_LABEL })).toBeTruthy();
  });

  it('renders no mastery chip on the face', () => {
    const { container } = renderCard();
    expect(container.querySelector('.lesson-mastery-chip')).toBeNull();
  });

  it('shows the percentage even at 0%', () => {
    renderCard({ buttonState: 'Locked', masteryPercent: 0 });
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('does not render the description or a lesson-launch link on the face while closed', () => {
    renderCard();
    expect(screen.queryByRole('dialog')).toBeNull();
    // Description lives in the modal, not on the card face.
    expect(screen.queryByText('Master the Pythagorean theorem.')).toBeNull();
    // The launch control is moved into the modal: no link on the closed face.
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('LessonCard modal', () => {
  it('opens a dialog with the description and every concept + badge', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: OPEN_LABEL }));
    const dialog = screen.getByRole('dialog');

    // Description.
    expect(within(dialog).getByText('Master the Pythagorean theorem.')).toBeTruthy();

    // Full concept list with mastery badges.
    expect(within(dialog).getByText('Find the hypotenuse')).toBeTruthy();
    expect(within(dialog).getByText('Area of a right triangle')).toBeTruthy();
    expect(within(dialog).getByText('Missing leg, then perimeter')).toBeTruthy();
    expect(within(dialog).getByText('Mastered')).toBeTruthy();
    expect(within(dialog).getByText('Learning')).toBeTruthy();
    expect(within(dialog).getByText('Need to review')).toBeTruthy();
  });

  it('closes the dialog on Escape and on the close button', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: OPEN_LABEL }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();

    // Reopen, then close via the close button.
    fireEvent.click(screen.getByRole('button', { name: OPEN_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('LessonCard mastery region', () => {
  it('always renders a body wrapper with the open button as a sibling after it', () => {
    const { container } = renderCard();
    const article = container.querySelector('article.lesson-card');
    const body = container.querySelector('.lesson-card-body');
    expect(body).not.toBeNull();
    const btn = screen.getByRole('button', { name: OPEN_LABEL });
    // Button is a direct child of the article (not nested in the body).
    expect(btn.parentElement).toBe(article);
    // Button comes after the body in document order.
    expect(body!.compareDocumentPosition(btn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders the empty placeholder inside the body when there are no concepts', () => {
    const { container } = renderCard({ concepts: [] });
    expect(screen.getByRole('button', { name: OPEN_LABEL })).toBeTruthy();
    const empty = container.querySelector('.concept-summary-empty');
    expect(empty).not.toBeNull();
    // Placeholder lives inside the body, replacing the percentage block.
    expect(container.querySelector('.lesson-card-body .concept-summary-empty')).not.toBeNull();
    expect(container.querySelector('.lesson-percent')).toBeNull();
  });

  it('renders the percentage block (not the placeholder) when concepts exist', () => {
    const { container } = renderCard();
    expect(container.querySelector('.lesson-percent')).not.toBeNull();
    expect(container.querySelector('.concept-summary-empty')).toBeNull();
  });
});

describe('LessonCard modal CTAs', () => {
  it('shows Review lesson + Retake Mastery Quiz once mastery is passed (Review state)', () => {
    renderCard({ buttonState: 'Review' });
    fireEvent.click(screen.getByRole('button', { name: OPEN_LABEL }));
    const dialog = screen.getByRole('dialog');

    const review = within(dialog).getByRole('link', { name: 'Review lesson' });
    expect(review.getAttribute('href')).toBe('/lesson/right-triangles');

    const quiz = within(dialog).getByRole('link', { name: 'Retake Mastery Quiz' });
    expect(quiz.getAttribute('href')).toBe('/quiz/right-triangles');
  });

  it('shows Review lesson + Take Mastery Quiz when completed but not yet passed', () => {
    renderCard({ buttonState: 'Take Mastery Quiz' });
    fireEvent.click(screen.getByRole('button', { name: OPEN_LABEL }));
    const dialog = screen.getByRole('dialog');

    const review = within(dialog).getByRole('link', { name: 'Review lesson' });
    expect(review.getAttribute('href')).toBe('/lesson/right-triangles');

    const quiz = within(dialog).getByRole('link', { name: 'Take Mastery Quiz' });
    expect(quiz.getAttribute('href')).toBe('/quiz/right-triangles');
  });

  it('shows only a single launch link before completion (Start / Continue)', () => {
    renderCard({ buttonState: 'Start' });
    fireEvent.click(screen.getByRole('button', { name: OPEN_LABEL }));
    const dialog = screen.getByRole('dialog');

    const links = within(dialog).getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe('/lesson/right-triangles');
    expect(links[0].textContent).toBe('Start');

    // No mastery-quiz launch before completion.
    expect(within(dialog).queryByRole('link', { name: /Mastery Quiz/ })).toBeNull();
  });
});

describe('LessonCard locked', () => {
  it('shows a Locked badge on the face only when locked', () => {
    const { container } = renderCard({ buttonState: 'Locked' });
    // Modal stays closed, so the only Locked match is the face badge.
    expect(screen.queryByRole('dialog')).toBeNull();
    const badge = container.querySelector('.lesson-locked-badge');
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toMatch(/Locked/);
  });

  it('does not show the Locked badge when unlocked', () => {
    const { container } = renderCard();
    expect(container.querySelector('.lesson-locked-badge')).toBeNull();
  });

  it('marks the face open button with lesson-open-btn-locked when locked', () => {
    renderCard({ buttonState: 'Locked' });
    const btn = screen.getByRole('button', { name: OPEN_LABEL });
    expect(btn.classList.contains('lesson-open-btn')).toBe(true);
    expect(btn.classList.contains('lesson-open-btn-locked')).toBe(true);
  });

  it('does not mark the face open button as locked when unlocked', () => {
    renderCard();
    const btn = screen.getByRole('button', { name: OPEN_LABEL });
    expect(btn.classList.contains('lesson-open-btn-locked')).toBe(false);
  });

  it('still shows the open-modal button on the face', () => {
    renderCard({ buttonState: 'Locked' });
    expect(screen.getByRole('button', { name: OPEN_LABEL })).toBeTruthy();
    // No enabled launch link on the closed face.
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('opens a modal with a disabled Locked control and no launch link', () => {
    renderCard({ buttonState: 'Locked' });
    fireEvent.click(screen.getByRole('button', { name: OPEN_LABEL }));
    const dialog = screen.getByRole('dialog');

    const locked = within(dialog).getByRole('button', { name: /Locked/ });
    expect(locked.hasAttribute('disabled')).toBe(true);
    // No enabled launch link for a locked lesson.
    expect(within(dialog).queryByRole('link')).toBeNull();
  });
});
