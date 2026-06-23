import type { Lesson } from '@/types/lesson';

export const rightTrianglesLesson: Lesson = {
  lessonId: 'right-triangles',
  title: 'Right Triangles',
  steps: [
    {
      id: 'intro',
      type: 'transition',
      prompt:
        "Hello, I am Geometer, your personal geometry tutor. I'm excited to join you in your geometry learning journey. Today, we're going to be starting with right triangles. I'll start by doing an example first.",
      transition: { emoji: '\u{1F44B}', cta: "Let's begin" },
    },
    {
      id: 'demo-pythagorean',
      type: 'demonstration',
      prompt: 'Watch how to find a missing side with the Pythagorean theorem.',
      triangle: { legs: [6, 8], hypotenuse: 10 },
      demo: {
        intro: 'Reveal each step in order to see the full worked example.',
        reveals: [
          {
            label: 'Step 1 — Identify the legs and hypotenuse',
            body: 'The two sides that form the right angle are the legs: a = 6 and b = 8. The longest side, across from the right angle, is the hypotenuse c (the side we want to find).',
          },
          {
            label: 'Step 2 — Plug them into the formula',
            formula: 'a² + b² = c²',
            body: 'Substitute the leg lengths: 6² + 8² = c².',
          },
          {
            label: 'Step 3 — Solve for the missing piece',
            formula: '36 + 64 = 100,  c = √100 = 10',
            body: 'Square each leg, add them to get c² = 100, then take the square root: c = 10.',
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
      id: 'guided-pythagorean',
      type: 'guided',
      prompt: 'Now let\u2019s work one together.',
      triangle: { legs: [3, 4] },
      guided: [
        {
          id: 'legs',
          prompt: 'First, identify the two legs of this triangle (a and b).',
          inputs: [
            { id: 'a', label: 'a =', answer: 3 },
            { id: 'b', label: 'b =', answer: 4 },
          ],
          acceptAnyOrder: true,
          feedback: {
            wrong: 'The legs are the two shorter sides that form the right angle.',
            hint: 'The legs are 3 and 4 (in either order).',
          },
        },
        {
          id: 'c-squared',
          prompt: 'Plug the legs into a² + b² = c². What does c² equal?',
          answer: 25,
          feedback: {
            wrong: 'Square each leg and add: 3² + 4².',
            hint: '3² + 4² = 9 + 16 = 25.',
          },
        },
        {
          id: 'c',
          prompt: 'Finally, solve for c by taking the square root of c².',
          answer: 5,
          feedback: {
            correct: '√25 = 5 — the hypotenuse is 5.',
            wrong: 'Take the square root of 25.',
            hint: '√25 = 5.',
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
