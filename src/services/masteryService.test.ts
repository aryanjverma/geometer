import { describe, it, expect } from 'vitest';
import { masteryLevel, lessonConceptMasteries, lessonMasteryStatus } from './masteryService';
import { foldAttempt } from './reviewService';
import { conceptsForLesson } from '@/content/concepts';
import { CONCEPTS_BY_LESSON } from '@/content/concepts';
import {
  makeQuestionId,
  type ConceptAttempt,
  type ConceptMastery,
  type ConceptMasteryMap,
} from '@/types/review';

/** Build a minimal ConceptMastery carrying just a `recentCorrect` log. */
function record(
  lessonId: string,
  stepId: string,
  recentCorrect: boolean[],
): ConceptMastery {
  return {
    lessonId,
    stepId,
    recentCorrect,
    lastReviewedAt: 0,
  };
}

describe('masteryLevel — last-2 rule', () => {
  it('no attempts → need-review', () => {
    expect(masteryLevel([])).toBe('need-review');
  });

  it('one wrong attempt → need-review', () => {
    expect(masteryLevel([false])).toBe('need-review');
  });

  it('one correct attempt → learning', () => {
    expect(masteryLevel([true])).toBe('learning');
  });

  it('wrong then correct → learning (1 of last 2)', () => {
    expect(masteryLevel([false, true])).toBe('learning');
  });

  it('two correct → mastered', () => {
    expect(masteryLevel([true, true])).toBe('mastered');
  });

  it('correct then wrong → learning (last 2 = [correct, wrong] = 1)', () => {
    expect(masteryLevel([true, false])).toBe('learning');
  });

  it('two wrong → need-review', () => {
    expect(masteryLevel([false, false])).toBe('need-review');
  });

  it('only the last two attempts matter', () => {
    expect(masteryLevel([true, true, false, false])).toBe('need-review');
    expect(masteryLevel([false, false, true, true])).toBe('mastered');
  });
});

describe('lesson completion levels a concept up', () => {
  const correct: ConceptAttempt = {
    lessonId: 'right-triangles',
    stepId: 'q1-hypotenuse',
    correct: true,
    at: 1,
  };

  it('first completion (one correct) → learning', () => {
    const next = foldAttempt(undefined, correct);
    expect(masteryLevel(next.recentCorrect)).toBe('learning');
  });

  it('a second completion (two corrects) → mastered', () => {
    const after1 = foldAttempt(undefined, correct);
    const after2 = foldAttempt(after1, correct);
    expect(masteryLevel(after2.recentCorrect)).toBe('mastered');
  });

  it('a correct completion after a prior wrong attempt → learning', () => {
    const wrong: ConceptAttempt = { ...correct, correct: false };
    const after = foldAttempt(foldAttempt(undefined, wrong), correct);
    expect(masteryLevel(after.recentCorrect)).toBe('learning');
  });
});

describe('lessonConceptMasteries', () => {
  it('returns one entry per concept in lesson order with computed levels', () => {
    const lessonId = 'right-triangles';
    const concepts = CONCEPTS_BY_LESSON[lessonId];
    expect(concepts.length).toBeGreaterThan(0);

    const history: ConceptMasteryMap = {
      [makeQuestionId(lessonId, concepts[0].stepId)]: record(lessonId, concepts[0].stepId, [
        true,
        true,
      ]),
      [makeQuestionId(lessonId, concepts[1].stepId)]: record(lessonId, concepts[1].stepId, [
        true,
        false,
      ]),
    };

    const result = lessonConceptMasteries(lessonId, history);
    expect(result.map((r) => r.concept.stepId)).toEqual(concepts.map((c) => c.stepId));
    expect(result[0].level).toBe('mastered');
    expect(result[1].level).toBe('learning');
    // A concept with no recorded history defaults to need-review.
    expect(result[2].level).toBe('need-review');
  });

  it('returns an empty array for an unknown lesson', () => {
    expect(lessonConceptMasteries('made-up-lesson', {})).toEqual([]);
  });
});

describe('lessonMasteryStatus — dynamic aggregate (display only)', () => {
  const lessonId = 'right-triangles';
  const concepts = conceptsForLesson(lessonId);

  function historyOf(levels: ReadonlyArray<boolean[]>): ConceptMasteryMap {
    const map: ConceptMasteryMap = {};
    levels.forEach((recentCorrect, i) => {
      map[makeQuestionId(lessonId, concepts[i].stepId)] = record(
        lessonId,
        concepts[i].stepId,
        recentCorrect,
      );
    });
    return map;
  }

  it('mastered when every concept is mastered', () => {
    const history = historyOf(concepts.map(() => [true, true]));
    expect(lessonMasteryStatus(history, lessonId)).toBe('mastered');
  });

  it('needs-review when any concept needs review (un-master)', () => {
    const levels = concepts.map(() => [true, true]);
    levels[0] = [false, false];
    expect(lessonMasteryStatus(historyOf(levels), lessonId)).toBe('needs-review');
  });

  it('in-progress when concepts are mixed but none need review', () => {
    const levels = concepts.map(() => [true, true]);
    levels[0] = [true]; // learning
    expect(lessonMasteryStatus(historyOf(levels), lessonId)).toBe('in-progress');
  });

  it('an unmastered concept re-masters when answered correctly again', () => {
    // Drop concept 0 to needs-review, then push two corrects → mastered again.
    const dropped = historyOf(concepts.map((_, i) => (i === 0 ? [false, false] : [true, true])));
    expect(lessonMasteryStatus(dropped, lessonId)).toBe('needs-review');
    const restored = historyOf(concepts.map(() => [true, true]));
    expect(lessonMasteryStatus(restored, lessonId)).toBe('mastered');
  });

  it('a lesson with no concepts is in-progress', () => {
    expect(lessonMasteryStatus({}, 'made-up-lesson')).toBe('in-progress');
  });
});
