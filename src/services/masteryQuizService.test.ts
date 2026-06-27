import { describe, it, expect } from 'vitest';
import {
  buildMasteryQuiz,
  buildMasteryTest,
  isMasteryQuizPassed,
  masteryQuizFormats,
  interleaveByLesson,
} from './masteryQuizService';
import { REVIEW_FORMATS } from '@/content/reviewFormats';
import { IN_SCOPE_LESSONS } from '@/services/reviewSession';
import type { GeneratedQuestion } from '@/types/review';
import type { LessonStep } from '@/types/lesson';

/** Deterministic PRNG so generation is reproducible across seeds. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The ground-truth final answer the learner must type, by step shape. */
function finalAnswer(step: LessonStep): number {
  switch (step.type) {
    case 'leg-then-perimeter':
    case 'multi-part-numeric':
      return step.parts![step.parts!.length - 1].answer;
    case 'distance-problem':
      return step.subSteps![step.subSteps!.length - 1].answer!;
    default:
      return step.answer!;
  }
}

const SEEDS = Array.from({ length: 60 }, (_, i) => i + 1);

/** Every question grades correctly and is structurally sound. */
function expectWellFormed(q: GeneratedQuestion) {
  expect(Number.isInteger(q.answer)).toBe(true);
  expect(finalAnswer(q.step)).toBe(q.answer);
  expect(typeof q.basePrompt).toBe('string');
  expect(q.basePrompt.length).toBeGreaterThan(0);
}

describe('buildMasteryQuiz — isolated, one-per-concept', () => {
  it('returns exactly one question per format of the lesson and nothing else', () => {
    for (const lessonId of IN_SCOPE_LESSONS) {
      const expected = REVIEW_FORMATS.filter((f) => f.lessonId === lessonId).map(
        (f) => f.formatId,
      );
      expect(expected.length).toBeGreaterThan(0);
      const quiz = buildMasteryQuiz(lessonId, mulberry32(1));
      // Exactly one question per format, in catalog order.
      expect(quiz.map((q) => q.formatId)).toEqual(expected);
      // Isolation: every question belongs to this lesson only.
      for (const q of quiz) expect(q.lessonId).toBe(lessonId);
      // No duplicate formats.
      expect(new Set(quiz.map((q) => q.formatId)).size).toBe(quiz.length);
    }
  });

  it('produces verifiable integer answers that grade through the renderer across seeds', () => {
    for (const lessonId of IN_SCOPE_LESSONS) {
      for (const seed of SEEDS) {
        const quiz = buildMasteryQuiz(lessonId, mulberry32(seed));
        for (const q of quiz) expectWellFormed(q);
      }
    }
  });

  it('is stateless across retakes — fresh numbers can differ between builds', () => {
    // Across many seeds at least one parameter changes, proving regeneration.
    const a = buildMasteryQuiz('right-triangles', mulberry32(1));
    const b = buildMasteryQuiz('right-triangles', mulberry32(999));
    const sameParams = a.every(
      (q, i) => JSON.stringify(q.params) === JSON.stringify(b[i].params),
    );
    expect(sameParams).toBe(false);
  });

  it('returns an empty quiz for an unknown lesson', () => {
    expect(buildMasteryQuiz('made-up-lesson')).toEqual([]);
    expect(masteryQuizFormats('made-up-lesson')).toEqual([]);
  });
});

describe('isMasteryQuizPassed — clean-correct on every concept', () => {
  it('passes only when every concept is correct', () => {
    expect(
      isMasteryQuizPassed([{ correct: true }, { correct: true }]),
    ).toBe(true);
  });

  it('fails when any concept is wrong', () => {
    expect(
      isMasteryQuizPassed([{ correct: true }, { correct: false }]),
    ).toBe(false);
  });

  it('an empty result set is not a pass', () => {
    expect(isMasteryQuizPassed([])).toBe(false);
  });
});

describe('buildMasteryTest — full coverage, interleaved', () => {
  it('includes exactly one fresh question per concept across all lessons', () => {
    const test = buildMasteryTest(mulberry32(7));
    const ids = test.map((q) => q.formatId).sort();
    const expected = REVIEW_FORMATS.map((f) => f.formatId).sort();
    expect(ids).toEqual(expected);
    expect(test.length).toBe(REVIEW_FORMATS.length);
  });

  it('grades correctly across seeds', () => {
    for (const seed of SEEDS) {
      const test = buildMasteryTest(mulberry32(seed));
      for (const q of test) expectWellFormed(q);
    }
  });

  it('interleaves so consecutive questions come from different lessons', () => {
    const test = buildMasteryTest(mulberry32(3));
    for (let i = 1; i < test.length; i += 1) {
      expect(
        test[i].lessonId,
        `questions ${i - 1} and ${i} share lesson ${test[i].lessonId}`,
      ).not.toBe(test[i - 1].lessonId);
    }
  });
});

describe('interleaveByLesson helper', () => {
  it('round-robins items so adjacent entries differ by lesson where possible', () => {
    const items = [
      { lessonId: 'a', id: 'a1' },
      { lessonId: 'a', id: 'a2' },
      { lessonId: 'a', id: 'a3' },
      { lessonId: 'b', id: 'b1' },
      { lessonId: 'c', id: 'c1' },
    ];
    const out = interleaveByLesson(items);
    // Same multiset.
    expect(out.map((x) => x.id).sort()).toEqual(['a1', 'a2', 'a3', 'b1', 'c1']);
    // First three are distinct lessons (round-robin layer 0).
    expect(new Set([out[0].lessonId, out[1].lessonId, out[2].lessonId]).size).toBe(3);
  });
});
