import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  foldAttempt,
  selectReviewFormats,
  recommendLessons,
  lessonCompletionAttempts,
} from './reviewService';
import { masteryLevel } from './masteryService';
import { CONCEPTS_BY_LESSON } from '@/content/concepts';
import { makeQuestionId } from '@/types/review';
import type {
  ConceptAttempt,
  ConceptMastery,
  ConceptMasteryMap,
  QuestionFormat,
  ReviewResultItem,
} from '@/types/review';

function attempt(over: Partial<ConceptAttempt> = {}): ConceptAttempt {
  return {
    lessonId: 'right-triangles',
    stepId: 'q1-hypotenuse',
    correct: true,
    at: 1000,
    ...over,
  };
}

/** Minimal stub format; selection only reads formatId/lessonId/sourceStepId. */
function fmt(formatId: string, lessonId = 'right-triangles'): QuestionFormat {
  return {
    formatId,
    lessonId,
    // History is keyed by lessonId__sourceStepId; the stubs use the formatId
    // as their step id so records below line up with the lookup.
    sourceStepId: formatId,
    label: formatId,
    generate: () => ({
      formatId,
      lessonId,
      step: { id: 's', type: 'numeric', prompt: '', answer: 0 },
      params: {},
      basePrompt: '',
      answer: 0,
    }),
  };
}

function record(
  stepId: string,
  over: Partial<ConceptMastery> = {},
): ConceptMastery {
  return {
    lessonId: 'right-triangles',
    stepId,
    recentCorrect: [],
    lastReviewedAt: 0,
    ...over,
  };
}

describe('foldAttempt', () => {
  it('creates a fresh record on the first attempt', () => {
    const a = attempt({ correct: false, at: 500 });
    const r = foldAttempt(undefined, a);
    expect(r.lessonId).toBe('right-triangles');
    expect(r.stepId).toBe('q1-hypotenuse');
    expect(r.recentCorrect).toEqual([false]);
    expect(r.lastReviewedAt).toBe(500);
  });

  it('appends the second attempt, newest last', () => {
    const first = foldAttempt(undefined, attempt({ correct: false, at: 500 }));
    const second = foldAttempt(first, attempt({ correct: true, at: 900 }));
    expect(second.recentCorrect).toEqual([false, true]);
    expect(second.lastReviewedAt).toBe(900);
  });

  it('caps recentCorrect at the last 2, dropping the oldest on the third', () => {
    let r = foldAttempt(undefined, attempt({ correct: false, at: 100 }));
    r = foldAttempt(r, attempt({ correct: true, at: 200 }));
    r = foldAttempt(r, attempt({ correct: true, at: 300 }));
    expect(r.recentCorrect).toEqual([true, true]);
    expect(r.lastReviewedAt).toBe(300);
  });
});

describe('selectReviewFormats', () => {
  const now = 10_000_000;
  const day = 86_400_000;

  it('ranks a need-review concept before a mastered one when recency is equal', () => {
    const formats = [fmt('a'), fmt('b')];
    const history: ConceptMasteryMap = {
      [makeQuestionId('right-triangles', 'a')]: record('a', {
        recentCorrect: [true, true], // mastered
        lastReviewedAt: now - day,
      }),
      [makeQuestionId('right-triangles', 'b')]: record('b', {
        recentCorrect: [false, false], // need-review
        lastReviewedAt: now - day,
      }),
    };
    const out = selectReviewFormats(history, formats, { count: 2, now });
    expect(out.map((f) => f.formatId)).toEqual(['b', 'a']);
  });

  it('ranks a learning concept before a mastered one when recency is equal', () => {
    const formats = [fmt('a'), fmt('b')];
    const history: ConceptMasteryMap = {
      [makeQuestionId('right-triangles', 'a')]: record('a', {
        recentCorrect: [true, true], // mastered
        lastReviewedAt: now - day,
      }),
      [makeQuestionId('right-triangles', 'b')]: record('b', {
        recentCorrect: [true, false], // learning
        lastReviewedAt: now - day,
      }),
    };
    const out = selectReviewFormats(history, formats, { count: 2, now });
    expect(out.map((f) => f.formatId)).toEqual(['b', 'a']);
  });

  it('ranks the staler record first among two same-level concepts', () => {
    const formats = [fmt('a'), fmt('b')];
    const history: ConceptMasteryMap = {
      [makeQuestionId('right-triangles', 'a')]: record('a', {
        recentCorrect: [true, true], // mastered, recent
        lastReviewedAt: now - 60 * 1000,
      }),
      [makeQuestionId('right-triangles', 'b')]: record('b', {
        recentCorrect: [true, true], // mastered, stale
        lastReviewedAt: now - 30 * day,
      }),
    };
    const out = selectReviewFormats(history, formats, { count: 2, now });
    expect(out.map((f) => f.formatId)).toEqual(['b', 'a']);
  });

  it('includes never-practiced formats (treated as need-review/max)', () => {
    const formats = [fmt('a'), fmt('b'), fmt('c')];
    const history: ConceptMasteryMap = {
      [makeQuestionId('right-triangles', 'a')]: record('a', {
        recentCorrect: [true, true], // mastered, recent → lowest score
        lastReviewedAt: now - 60 * 1000,
      }),
    };
    const out = selectReviewFormats(history, formats, { count: 3, now });
    expect(out.map((f) => f.formatId)).toContain('c');
    expect(out.map((f) => f.formatId)).toContain('b');
    // The mastered+recent concept ranks last behind the never-practiced ones.
    expect(out.map((f) => f.formatId)).toEqual(['b', 'c', 'a']);
  });

  it('returns at most count, no duplicates, with stable formatId tie-break', () => {
    const formats = [fmt('c'), fmt('a'), fmt('b'), fmt('a')];
    const out = selectReviewFormats({}, formats, { count: 2, now });
    expect(out).toHaveLength(2);
    // All never-practiced => scores tie => deterministic ascending formatId.
    expect(out.map((f) => f.formatId)).toEqual(['a', 'b']);
  });
});

describe('recommendLessons', () => {
  it('returns [] when everything was correct', () => {
    const results: ReviewResultItem[] = [
      { formatId: 'rt-hypotenuse', lessonId: 'right-triangles', correct: true },
      { formatId: 'dist-two-points', lessonId: 'distance-coordinate-plane', correct: true },
    ];
    expect(recommendLessons(results)).toEqual([]);
  });

  it('returns missed lessons, deduped, in course order', () => {
    const results: ReviewResultItem[] = [
      { formatId: 'dist-two-points', lessonId: 'distance-coordinate-plane', correct: false },
      { formatId: 'rt-hypotenuse', lessonId: 'right-triangles', correct: false },
      { formatId: 'rt-area', lessonId: 'right-triangles', correct: false },
      { formatId: 'nrt-area-base-height', lessonId: 'non-right-triangles', correct: true },
    ];
    expect(recommendLessons(results)).toEqual([
      'right-triangles',
      'distance-coordinate-plane',
    ]);
  });
});

describe('lessonCompletionAttempts', () => {
  const lessonId = 'right-triangles';
  const concepts = CONCEPTS_BY_LESSON[lessonId];

  it('records every concept correct when none were struggled', () => {
    const out = lessonCompletionAttempts(lessonId, new Set(), 42);
    expect(out.map((a) => a.stepId)).toEqual(concepts.map((c) => c.stepId));
    expect(out.every((a) => a.correct)).toBe(true);
    expect(out.every((a) => a.at === 42)).toBe(true);
  });

  it('records a struggled concept as wrong and clean concepts as correct', () => {
    const struggled = new Set([concepts[1].stepId]);
    const out = lessonCompletionAttempts(lessonId, struggled, 7);
    const byStep = new Map(out.map((a) => [a.stepId, a.correct]));
    expect(byStep.get(concepts[1].stepId)).toBe(false);
    expect(byStep.get(concepts[0].stepId)).toBe(true);
  });

  it('a wrong answer keeps/lowers mastery instead of boosting it', () => {
    const stepId = concepts[0].stepId;
    // Concept currently need-review (two prior wrongs).
    let record = foldAttempt(undefined, attempt({ stepId, correct: false, at: 1 }));
    record = foldAttempt(record, attempt({ stepId, correct: false, at: 2 }));
    expect(masteryLevel(record.recentCorrect)).toBe('need-review');

    // Finishing the lesson while struggling on this concept must NOT boost it.
    const [struggledAttempt] = lessonCompletionAttempts(
      lessonId,
      new Set([stepId]),
      3,
    ).filter((a) => a.stepId === stepId);
    const after = foldAttempt(record, struggledAttempt);
    expect(masteryLevel(after.recentCorrect)).toBe('need-review');
  });

  it('a clean completion boosts mastery by one level', () => {
    const stepId = concepts[0].stepId;
    const record = foldAttempt(undefined, attempt({ stepId, correct: false, at: 1 }));
    expect(masteryLevel(record.recentCorrect)).toBe('need-review');
    const [cleanAttempt] = lessonCompletionAttempts(lessonId, new Set(), 2).filter(
      (a) => a.stepId === stepId,
    );
    const after = foldAttempt(record, cleanAttempt);
    expect(masteryLevel(after.recentCorrect)).toBe('learning');
  });
});

/**
 * Regression guard: persistence silently breaks if the fields `foldAttempt`
 * writes ever diverge from the `hasOnly([...])` allow-list in the deployed
 * `conceptMastery` Firestore rule (a missing/extra key makes the write fail the
 * rule and the catch-all denies it). This pins the two in lockstep.
 */
describe('conceptMastery firestore rules parity', () => {
  it('foldAttempt writes exactly the fields the conceptMastery rule allows', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const rules = readFileSync(resolve(here, '../../firestore.rules'), 'utf8');
    const block = rules.slice(rules.indexOf('conceptMastery'));
    const match = block.match(/hasOnly\(\[([\s\S]*?)\]\)/);
    expect(
      match,
      'conceptMastery hasOnly([...]) not found in firestore.rules',
    ).toBeTruthy();
    const allowed = [...match![1].matchAll(/'([^']+)'/g)]
      .map((m) => m[1])
      .sort();
    const written = Object.keys(foldAttempt(undefined, attempt())).sort();
    expect(written).toEqual(allowed);
  });
});
