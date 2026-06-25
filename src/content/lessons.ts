import type { Lesson } from '@/types/lesson';
import { rightTrianglesLesson } from './right-triangles';
import { nonRightTrianglesLesson } from './non-right-triangles';
import { distanceLesson } from './distance-coordinate-plane';
import { transformationsLesson } from './transformations';
import { congruenceSimilarityLesson } from './congruence-similarity';

export interface LessonMeta {
  lessonId: string;
  title: string;
  description: string;
  /** Lesson that must be completed before this one unlocks. */
  requires?: string;
  lesson: Lesson;
}

export const LESSONS: LessonMeta[] = [
  {
    lessonId: 'right-triangles',
    title: 'Right Triangles',
    description:
      'Perimeter, area, and the Pythagorean theorem — watch a worked example, try one together, then solve on your own.',
    lesson: rightTrianglesLesson,
  },
  {
    lessonId: 'non-right-triangles',
    title: 'Non-Right Triangles',
    description:
      'Area, perimeter, and the height trick — see it demonstrated, work one together, then split tricky triangles on your own.',
    requires: 'right-triangles',
    lesson: nonRightTrianglesLesson,
  },
  {
    lessonId: 'distance-coordinate-plane',
    title: 'Distance on the Coordinate Plane',
    description:
      'Use the Pythagorean theorem to measure distance between points — watch the right triangle draw itself on the grid, then solve distance, perimeter, and route problems.',
    requires: 'non-right-triangles',
    lesson: distanceLesson,
  },
  {
    lessonId: 'transformations',
    title: 'Transformations',
    description:
      'Translate, reflect, rotate, and dilate shapes on the coordinate grid — watch each move demonstrated, then drag the vertices into place to perform two-step transformations yourself.',
    requires: 'distance-coordinate-plane',
    lesson: transformationsLesson,
  },
  {
    lessonId: 'congruence-similarity',
    title: 'Congruence and Similarity',
    description:
      'Decide when figures are congruent or similar by comparing sides and ratios, then drag one shape onto another to prove it.',
    requires: 'transformations',
    lesson: congruenceSimilarityLesson,
  },
];

export function getLessonMeta(lessonId: string): LessonMeta | undefined {
  return LESSONS.find((l) => l.lessonId === lessonId);
}
