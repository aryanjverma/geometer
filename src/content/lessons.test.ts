import { describe, expect, it } from 'vitest';
import { LESSONS } from './lessons';

/** Demonstration ("I do") step types across all lesson families. */
const isDemo = (type: string) => type.includes('demo');
/** Guided ("We do") step types across all lesson families. */
const isGuided = (type: string) => type.includes('guided');

describe('lesson standard: transition slide between I do and We do', () => {
  for (const { lessonId, lesson } of LESSONS) {
    it(`${lessonId} has a transition-wedo slide between the I do and We do phases`, () => {
      const steps = lesson.steps;

      const wedoIndex = steps.findIndex((s) => s.id === 'transition-wedo');
      expect(wedoIndex, lessonId).toBeGreaterThanOrEqual(0);

      const transition = steps[wedoIndex];
      expect(transition.type, lessonId).toBe('transition');
      expect(transition.transition?.cta, lessonId).toBeTruthy();
      expect(transition.prompt.trim().length, lessonId).toBeGreaterThan(0);

      const firstDemo = steps.findIndex((s) => isDemo(s.type));
      const firstGuided = steps.findIndex((s) => isGuided(s.type));
      expect(firstDemo, lessonId).toBeGreaterThanOrEqual(0);
      expect(firstGuided, lessonId).toBeGreaterThanOrEqual(0);

      // The slide sits after the first demonstration and immediately before the
      // first guided (We do) step.
      expect(wedoIndex, lessonId).toBeGreaterThan(firstDemo);
      expect(wedoIndex, lessonId).toBe(firstGuided - 1);
    });
  }
});
