import type { Lesson } from '@/types/lesson';
import { rightTrianglesLesson } from './right-triangles';
import { nonRightTrianglesLesson } from './non-right-triangles';

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
];

export function getLessonMeta(lessonId: string): LessonMeta | undefined {
  return LESSONS.find((l) => l.lessonId === lessonId);
}
