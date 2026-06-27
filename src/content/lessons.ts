import type { Lesson } from '@/types/lesson';
import { rightTrianglesLesson } from './right-triangles';
import { nonRightTrianglesLesson } from './non-right-triangles';
import { distanceLesson } from './distance-coordinate-plane';
import { transformationsLesson } from './transformations';
import { congruenceSimilarityLesson } from './congruence-similarity';
import { anglesLinesLesson } from './angles-lines';
import { triangleAnglesLesson } from './triangle-angles';
import { solids3dLesson } from './solids-3d';

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
      'Use the Pythagorean theorem to measure distance between points, then solve distance, perimeter, and route problems.',
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
  {
    lessonId: 'angles-lines',
    title: 'Angles and Lines',
    description:
      'Parallel lines cut by a transversal — prove the Corresponding Angles Postulate by sliding one angle onto another, then use vertical, linear-pair, and corresponding angles to find missing measures.',
    requires: 'congruence-similarity',
    lesson: anglesLinesLesson,
  },
  {
    lessonId: 'triangle-angles',
    title: 'Triangles with Lines and Angles',
    description:
      'Prove the Triangle Exterior Angle Theorem with a parallel ray, then combine parallel-line relationships with triangles to solve for angles.',
    requires: 'angles-lines',
    lesson: triangleAnglesLesson,
  },
  {
    lessonId: 'solids-3d',
    title: 'Circular 3D Shapes',
    description:
      'Measure cylinders, cones, and spheres through creative word problems, and slice a cone in half to apply the Pythagorean theorem and recover its radius.',
    requires: 'triangle-angles',
    lesson: solids3dLesson,
  },
];

export function getLessonMeta(lessonId: string): LessonMeta | undefined {
  return LESSONS.find((l) => l.lessonId === lessonId);
}
