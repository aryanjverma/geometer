import type { Concept } from '@/types/mastery';

/**
 * Phase 2 — Concept catalog.
 *
 * Each concept maps a human label to a lesson "You do" step id. The stepIds are
 * the contract shared with the lesson content and the question-format catalog
 * (a concept's mastery is computed from the recorded attempts of that stepId).
 */
export const CONCEPTS_BY_LESSON: Record<string, Concept[]> = {
  'right-triangles': [
    { conceptId: 'rt-hypotenuse', lessonId: 'right-triangles', label: 'Find the hypotenuse', stepId: 'q1-hypotenuse' },
    { conceptId: 'rt-area', lessonId: 'right-triangles', label: 'Area of a right triangle', stepId: 'q2-area' },
    { conceptId: 'rt-leg-then-perimeter', lessonId: 'right-triangles', label: 'Missing leg, then perimeter', stepId: 'q3-leg-then-perimeter' },
    { conceptId: 'rt-leg-then-area', lessonId: 'right-triangles', label: 'Missing leg, then area', stepId: 'q4-leg-then-area' },
  ],
  'non-right-triangles': [
    { conceptId: 'nrt-area-base-height', lessonId: 'non-right-triangles', label: 'Area from base and height', stepId: 'q1-area-base-height' },
    { conceptId: 'nrt-derive-perimeter', lessonId: 'non-right-triangles', label: 'Perimeter from split base', stepId: 'q2-derive-perimeter' },
    { conceptId: 'nrt-interactive-split', lessonId: 'non-right-triangles', label: 'Split a triangle', stepId: 'q3-interactive-split' },
    { conceptId: 'nrt-perimeter-from-area', lessonId: 'non-right-triangles', label: 'Perimeter from area', stepId: 'q4-perimeter-from-area' },
  ],
  'distance-coordinate-plane': [
    { conceptId: 'dist-distance', lessonId: 'distance-coordinate-plane', label: 'Distance between two points', stepId: 'q1-distance' },
    { conceptId: 'dist-perimeter', lessonId: 'distance-coordinate-plane', label: 'Perimeter of a coordinate triangle', stepId: 'q2-perimeter' },
    { conceptId: 'dist-right-triangle', lessonId: 'distance-coordinate-plane', label: 'Right triangle on the grid', stepId: 'q3-right-triangle' },
    { conceptId: 'dist-journey', lessonId: 'distance-coordinate-plane', label: 'Multi-leg journey', stepId: 'q4-journey' },
  ],
  transformations: [
    { conceptId: 'transform-translate', lessonId: 'transformations', label: 'Translate a point', stepId: 'q5-translate-point' },
    { conceptId: 'transform-reflect', lessonId: 'transformations', label: 'Reflect a point', stepId: 'q6-reflect-point' },
    { conceptId: 'transform-rotate', lessonId: 'transformations', label: 'Rotate a point', stepId: 'q7-rotate-point' },
    { conceptId: 'transform-dilate', lessonId: 'transformations', label: 'Dilate a point', stepId: 'q8-dilate-point' },
  ],
  'congruence-similarity': [
    { conceptId: 'cs-side-length', lessonId: 'congruence-similarity', label: 'Find a side length', stepId: 'q5-side-length' },
    { conceptId: 'cs-scale-ratio', lessonId: 'congruence-similarity', label: 'Find the scale ratio', stepId: 'q6-scale-ratio' },
  ],
};

/** All concepts for one lesson, or an empty list for an unknown lesson. */
export function conceptsForLesson(lessonId: string): Concept[] {
  return CONCEPTS_BY_LESSON[lessonId] ?? [];
}
