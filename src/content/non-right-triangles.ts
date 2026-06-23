import type { Lesson } from '@/types/lesson';

export const nonRightTrianglesLesson: Lesson = {
  lessonId: 'non-right-triangles',
  title: 'Non-Right Triangles',
  steps: [
    {
      id: 'intro',
      type: 'transition',
      prompt: "Welcome back to lesson 2! Let's get started with a worked example.",
      transition: { emoji: '\u{1F44B}', cta: "Let's begin" },
    },
    {
      id: 'demo-area',
      type: 'demonstration',
      prompt: 'Watch how to find the area of any triangle.',
      triangle: { base: 4, height: 3 },
      demo: {
        intro:
          'Reveal each step, then drag the top vertex to see why the area never changes.',
        interactive: 'shear',
        reveals: [
          {
            label: 'Step 1 — Find the base and height',
            body: 'Pick any side as the base (here, base = 4). The height is the perpendicular distance straight up from that base to the opposite vertex (height = 3).',
          },
          {
            label: 'Step 2 — Multiply, then divide by 2',
            formula: 'Area = ½ × base × height = ½ × 4 × 3 = 6',
            body: 'Multiply the base by the height and take half. Drag the top vertex sideways: the base and height stay the same, so the area stays 6 no matter how slanted the triangle looks.',
          },
        ],
      },
    },
    {
      id: 'transition-wedo',
      type: 'transition',
      prompt: "Nice job! Let's do one together.",
      transition: { emoji: '\u{1F60A}', cta: "Let's do it" },
    },
    {
      id: 'guided-area',
      type: 'guided',
      prompt: 'Now let\u2019s find an area together.',
      triangle: { base: 5, height: 4 },
      guided: [
        {
          id: 'base-height',
          prompt: 'First, identify the base and the height of this triangle.',
          inputs: [
            { id: 'base', label: 'base =', answer: 5 },
            { id: 'height', label: 'height =', answer: 4 },
          ],
          feedback: {
            wrong: 'The base is the bottom side; the height is the perpendicular distance up to the top vertex.',
            hint: 'base = 5 and height = 4.',
          },
        },
        {
          id: 'area',
          prompt: 'Now calculate the area using ½ × base × height.',
          answer: 10,
          feedback: {
            correct: '½ × 5 × 4 = 10',
            wrong: 'Multiply the base by the height, then take half.',
            hint: '½ × 5 × 4 = 10.',
          },
        },
      ],
    },
    {
      id: 'transition-youdo',
      type: 'transition',
      prompt: "You're doing great! Your turn.",
      transition: { emoji: '\u{1F4AA}', cta: "I'm ready" },
    },
    {
      id: 'q1-area-base-height',
      type: 'area-base-height',
      formula: 'Area = ½ × base × height',
      prompt: 'A triangle has base 4 and height 3. What is its area?',
      triangle: { base: 4, height: 3 },
      answer: 6,
      feedback: {
        correct: '½ × 4 × 3 = 6',
        wrong: 'Multiply the base by the height, then take half.',
        hint: 'Area = ½ × base × height. Don’t forget the ½.',
      },
    },
    {
      id: 'q2-derive-perimeter',
      type: 'derive-perimeter',
      prompt:
        'The height of 8 splits the base of 21 into 6 and 15, making two right triangles. Find the perimeter.',
      triangle: {
        base: 21,
        height: 8,
        leftSplit: 6,
        rightSplit: 15,
        sides: [10, 17],
      },
      answer: 48,
      feedback: {
        correct: '10 + 17 + 21 = 48',
        wrong: 'Find each slanted side first, then add all three sides.',
        hint: 'Solve for the other sides with the Pythagorean theorem: √(6² + 8²) and √(15² + 8²).',
      },
    },
    {
      id: 'q3-interactive-split',
      type: 'interactive-split',
      prompt:
        'Swipe down through the apex to split this isosceles triangle in half, then find its total area.',
      triangle: {
        base: 16,
        height: 6,
        leftSplit: 8,
        rightSplit: 8,
        sides: [10, 10],
      },
      answer: 48,
      feedback: {
        correct: '24 + 24 = 48 — each half is ½ × 8 × 6 = 24.',
        wrong: 'A shape’s area = the sum of its sub-shapes’ areas.',
        hint: 'A shape’s area = the sum of its sub-shapes’ areas.',
      },
    },
    {
      id: 'q4-perimeter-from-area',
      type: 'perimeter-from-area',
      prompt:
        'This isosceles triangle has area 120 and height 8. Find its perimeter.',
      triangle: {
        base: 30,
        height: 8,
        leftSplit: 15,
        rightSplit: 15,
        sides: [17, 17],
      },
      answer: 64,
      feedback: {
        correct: '30 + 17 + 17 = 64',
        wrong: 'Find the base from the area, then each side with the Pythagorean theorem.',
        hint: 'Area = ½ × base × 8 = 120, so base = 30. Each half-base is 15, so a side is √(15² + 8²) = 17.',
      },
    },
  ],
};
