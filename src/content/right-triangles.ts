import type { Lesson } from '@/types/lesson';

export const rightTrianglesLesson: Lesson = {
  lessonId: 'right-triangles',
  title: 'Right Triangles',
  steps: [
    {
      id: 'q1-hypotenuse',
      type: 'numeric',
      prompt: 'Use a² + b² = c² to find the hypotenuse.',
      triangle: { legs: [5, 12] },
      answer: 13,
      feedback: {
        correct: '5² + 12² = 25 + 144 = 169 = 13²',
        wrong: 'Square each leg, add them, then take the square root.',
        hint: '5² + 12² = ?',
      },
    },
    {
      id: 'q2-area',
      type: 'formula-compute',
      formula:
        'For a right triangle, the two legs are the base and height. Area = ½ × leg₁ × leg₂',
      prompt: 'What is the area of this right triangle?',
      triangle: { legs: [6, 8], hypotenuse: 10 },
      answer: 24,
      feedback: {
        correct: '½ × 6 × 8 = 24',
        wrong: 'Multiply the two legs, then divide by 2.',
        hint: 'A triangle is half of the rectangle with the same base and height.',
      },
    },
    {
      id: 'q3-leg-then-perimeter',
      type: 'leg-then-perimeter',
      prompt: 'Find the missing leg, then the perimeter.',
      triangle: { leg: 9, hypotenuse: 15, missingLeg: 12 },
      parts: [
        {
          id: 'leg',
          prompt: 'Use the Pythagorean theorem to find the missing leg.',
          answer: 12,
          feedback: {
            wrong: 'Use c² − a² = b² when you know the hypotenuse and one leg.',
          },
        },
        {
          id: 'perimeter',
          prompt: 'Now unwrap the triangle into a straight line. What is the perimeter?',
          answer: 36,
          feedback: {
            correct: '9 + 12 + 15 = 36 — the perimeter is the sum of all three sides.',
            wrong: 'Add all three sides: the two legs and the hypotenuse.',
            hint: 'Perimeter = 9 + 12 + 15.',
          },
        },
      ],
    },
    {
      id: 'q4-leg-then-area',
      type: 'multi-part-numeric',
      prompt: 'Find the missing leg, then the area.',
      triangle: { leg: 8, hypotenuse: 10 },
      parts: [
        {
          id: 'leg',
          prompt: 'Find the missing leg.',
          answer: 6,
          feedback: {
            wrong: 'Use c² − a² = b² when you know the hypotenuse and one leg.',
          },
        },
        {
          id: 'area',
          prompt: 'Now find the area of this triangle.',
          answer: 24,
          feedback: {
            wrong: 'Multiply the two legs, then divide by 2.',
          },
        },
      ],
    },
  ],
};
