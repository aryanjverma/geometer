import type { Lesson } from '@/types/lesson';

export const nonRightTrianglesLesson: Lesson = {
  lessonId: 'non-right-triangles',
  title: 'Non-Right Triangles',
  steps: [
    {
      id: 'intro',
      type: 'transition',
      prompt: "Welcome back to lesson 2! Let's begin with a worked example.",
      transition: { emoji: '\u{1F44B}', cta: "Let's begin" },
    },
    {
      id: 'demo-area',
      type: 'demonstration',
      prompt: 'Observe how to determine the area of any triangle.',
      triangle: { base: 4, height: 3 },
      demo: {
        intro:
          'Reveal each step, then drag the apex horizontally to see why the area is invariant.',
        interactive: 'shear',
        reveals: [
          {
            label: 'Step 1 — Identify the base and the height',
            body: 'Choose any side as the base (here, $base = 4$). The height is the perpendicular distance from that base up to the opposite vertex (here, $height = 3$).',
          },
          {
            label: 'Step 2 — Multiply, then divide by two',
            formula: 'Area $= \\frac{bh}{2} = \\frac{1}{2} \\times 4 \\times 3 = 6$',
            body: 'Multiply the base by the height and take half. Drag the apex horizontally: the base and height are unchanged, so the area remains $6$ no matter how oblique the triangle appears.',
          },
        ],
      },
    },
    {
      id: 'demo-why',
      type: 'demonstration',
      prompt: 'But why do we divide by two? Let us justify the formula.',
      triangle: { base: 4, height: 3 },
      demo: {
        intro:
          'Press the button to duplicate the triangle and rotate the copy into place.',
        interactive: 'parallelogram',
        reveals: [
          {
            label: 'Step 1 — Duplicate and rotate',
            body: 'Take a second, identical copy of the triangle and rotate it $180^\\circ$. The two triangles fit together perfectly along a shared side to form a parallelogram.',
          },
          {
            label: 'Step 2 — Recall the parallelogram area',
            formula: 'Parallelogram area $= b \\times h = bh$',
            body: 'You already know that a parallelogram\u2019s area is its base times its height, so this combined figure has area $bh$.',
          },
          {
            label: 'Step 3 — Take half',
            formula: 'Triangle area $= \\frac{bh}{2}$',
            body: 'The original triangle is exactly one of the two congruent halves of that parallelogram. Hence a triangle\u2019s area is $\\frac{bh}{2}$ \u2014 half of base times height.',
          },
        ],
      },
    },
    {
      id: 'transition-wedo',
      type: 'transition',
      prompt: "Well done! Let's work through one together.",
      transition: { emoji: '\u{1F60A}', cta: "Let's do it" },
    },
    {
      id: 'guided-area',
      type: 'guided',
      prompt: 'Now let\u2019s determine an area together.',
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
            wrong: 'The base is the lower side; the height is the perpendicular distance up to the opposite vertex.',
            hint: 'The base is the side you measure from; the height is the perpendicular distance to the opposite vertex.',
          },
        },
        {
          id: 'area',
          prompt: 'Now compute the area using $\\frac{bh}{2}$.',
          answer: 10,
          feedback: {
            correct: '$\\frac{1}{2} \\times 5 \\times 4 = 10$',
            wrong: 'Multiply the base by the height, then take half.',
            hint: 'Multiply the base by the height, then take half.',
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
      formula: 'Area $= \\frac{bh}{2}$',
      prompt: 'A triangle has base $4$ and height $3$. What is its area?',
      triangle: { base: 4, height: 3 },
      answer: 6,
      feedback: {
        correct: '$\\frac{1}{2} \\times 4 \\times 3 = 6$',
        wrong: 'Multiply the base by the height, then take half.',
        hint: 'Area $= \\frac{bh}{2}$. Do not omit the $\\frac{1}{2}$.',
      },
    },
    {
      id: 'q2-derive-perimeter',
      type: 'derive-perimeter',
      prompt:
        'The height of $8$ divides the base of $21$ into segments of $6$ and $15$, forming two right triangles. Find the perimeter of the triangle.',
      triangle: {
        base: 21,
        height: 8,
        leftSplit: 6,
        rightSplit: 15,
        sides: [10, 17],
      },
      answer: 48,
      feedback: {
        correct: '$10 + 17 + 21 = 48$',
        wrong: 'Determine each oblique side first, then add all three sides.',
        hint: 'Each oblique side is the hypotenuse of a right triangle formed by the height and a base segment \u2014 find each with the Pythagorean theorem, then add all three sides.',
      },
    },
    {
      id: 'q3-interactive-split',
      type: 'interactive-split',
      prompt:
        'Swipe down through the apex to divide this isosceles triangle in half, then find its total area.',
      triangle: {
        base: 16,
        height: 6,
        leftSplit: 8,
        rightSplit: 8,
        sides: [10, 10],
      },
      answer: 48,
      feedback: {
        correct: '$24 + 24 = 48$ \u2014 each half is $\\frac{1}{2} \\times 8 \\times 6 = 24$.',
        wrong: 'A figure\u2019s area equals the sum of its sub-figures\u2019 areas.',
        hint: 'A figure\u2019s area equals the sum of its sub-figures\u2019 areas.',
      },
    },
    {
      id: 'q4-perimeter-from-area',
      type: 'perimeter-from-area',
      prompt:
        'This isosceles triangle has area $120$ and height $8$. Find its perimeter.',
      triangle: {
        base: 30,
        height: 8,
        leftSplit: 15,
        rightSplit: 15,
        sides: [17, 17],
      },
      answer: 64,
      feedback: {
        correct: '$30 + 17 + 17 = 64$',
        wrong: 'Recover the base from the area, then find each side with the Pythagorean theorem.',
        hint: 'Work backward from the area to recover the base, then apply the Pythagorean theorem to each half to obtain the oblique sides.',
      },
    },
  ],
};
