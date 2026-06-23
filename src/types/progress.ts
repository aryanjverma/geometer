export interface LessonProgress {
  currentStep: number;
  completed: boolean;
}

export interface UserProgress {
  lessonProgress: Record<string, LessonProgress>;
}

export interface UserProfile {
  displayName: string;
  photoURL: string;
}

export const LESSON_ID = 'right-triangles';

export function emptyProgress(): UserProgress {
  return {
    lessonProgress: {
      [LESSON_ID]: { currentStep: 0, completed: false },
    },
  };
}
