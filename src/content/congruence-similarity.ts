import type { Lesson, LessonStep } from '@/types/lesson';

/** `tag` labels the I do / We do / You do phase; not part of the shared type. */
type AuthoredStep = LessonStep & { tag?: 'I do' | 'We do' | 'You do' };

const GRID = { xMin: -8, xMax: 8, yMin: -8, yMax: 8 };

const steps: AuthoredStep[] = [
  {
    id: 'intro',
    type: 'transition',
    prompt:
      "Welcome to lesson 5! Today we will decide when two figures are congruent (identical in size and shape) and when they are merely similar (the same shape at a different size). Watch me work the first comparison.",
    transition: { emoji: '\u{1F4D0}', cta: "Let's begin" },
  },
  {
    id: 'demo-congruence',
    type: 'congruence-demo',
    tag: 'I do',
    prompt:
      'Are triangle ABC and triangle DEF congruent? I will compare their side lengths.',
    grid: {
      ...GRID,
      shapes: [
        {
          id: 'abc',
          label: 'ABC',
          vertices: [
            { x: -6, y: -3 },
            { x: -3, y: -3 },
            { x: -6, y: 1 },
          ],
        },
        {
          id: 'def',
          label: 'DEF',
          vertices: [
            { x: 2, y: -1 },
            { x: 5, y: -1 },
            { x: 2, y: 3 },
          ],
        },
      ],
    },
    demo: {
      intro:
        'Two figures are congruent when every pair of corresponding sides has the same length. Reveal each step to see the comparison.',
      reveals: [
        {
          label: 'Step 1 \u2014 Measure each side of triangle ABC',
          body: 'Using $D = \\sqrt{\\Delta x^2 + \\Delta y^2}$, the legs are $3$ and $4$, and the longest side is $\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$. So triangle ABC has sides $3$, $4$, and $5$.',
        },
        {
          label: 'Step 2 \u2014 Measure each side of triangle DEF',
          body: 'Triangle DEF is positioned farther to the right, yet its legs are also $3$ and $4$, and its longest side is $\\sqrt{3^2 + 4^2} = 5$. So triangle DEF has sides $3$, $4$, and $5$.',
        },
        {
          label: 'Step 3 \u2014 Compare and conclude',
          formula: '$3 = 3, \\quad 4 = 4, \\quad 5 = 5$',
          body: 'Every pair of corresponding sides is equal, so the triangles are congruent. One can be moved directly onto the other without resizing.',
        },
      ],
    },
  },
  {
    id: 'transition-wedo',
    type: 'transition',
    prompt: "Now let's test a pair together.",
    transition: { emoji: '\u{1F60A}', cta: "Let's do it" },
  },
  {
    id: 'guided-congruence',
    type: 'congruence-guided',
    tag: 'We do',
    prompt:
      "Let's check this pair together. Measure the legs of each triangle, then compare.",
    grid: {
      ...GRID,
      shapes: [
        {
          id: 'abc',
          label: 'ABC',
          vertices: [
            { x: -7, y: -4 },
            { x: -1, y: -4 },
            { x: -7, y: 4 },
          ],
        },
        {
          id: 'def',
          label: 'DEF',
          vertices: [
            { x: 1, y: -4 },
            { x: 7, y: -4 },
            { x: 1, y: 4 },
          ],
        },
      ],
    },
    guided: [
      {
        id: 'sides-abc',
        prompt: 'First, find the two legs of triangle ABC.',
        inputs: [
          { id: 'short', label: 'shorter leg =', answer: 6 },
          { id: 'long', label: 'longer leg =', answer: 8 },
        ],
        acceptAnyOrder: true,
        feedback: {
          hint: 'Count the horizontal and vertical change between the endpoints of each leg.',
          correct: 'Triangle ABC has legs $6$ and $8$.',
        },
      },
      {
        id: 'sides-def',
        prompt: 'Now find the two legs of triangle DEF.',
        inputs: [
          { id: 'short', label: 'shorter leg =', answer: 6 },
          { id: 'long', label: 'longer leg =', answer: 8 },
        ],
        acceptAnyOrder: true,
        feedback: {
          hint: 'Triangle DEF is the same shape moved to a new location; measure its legs the same way.',
          correct: 'Triangle DEF also has legs $6$ and $8$.',
        },
      },
      {
        id: 'ratio',
        prompt:
          'Divide each side of DEF by its corresponding side of ABC. What single ratio results?',
        answer: 1,
        feedback: {
          correct:
            'Every corresponding side has the ratio $1$, so the triangles are congruent.',
          wrong: 'Compute $\\frac{6}{6}$, $\\frac{8}{8}$, and $\\frac{10}{10}$.',
          hint: 'When corresponding sides are identical, each quotient equals $1$.',
        },
      },
    ],
  },
  {
    id: 'demo-similarity',
    type: 'similarity-demo',
    tag: 'I do',
    prompt:
      'Are triangle ABC and triangle GHI congruent, similar, or neither? I will compare their sides again.',
    grid: {
      ...GRID,
      shapes: [
        {
          id: 'abc',
          label: 'ABC',
          vertices: [
            { x: -6, y: -3 },
            { x: -3, y: -3 },
            { x: -6, y: 1 },
          ],
        },
        {
          id: 'ghi',
          label: 'GHI',
          vertices: [
            { x: 0, y: -6 },
            { x: 6, y: -6 },
            { x: 0, y: 2 },
          ],
        },
      ],
    },
    demo: {
      intro:
        'Two figures are similar when their corresponding sides share one common ratio. Reveal each step to compare.',
      reveals: [
        {
          label: 'Step 1 \u2014 Measure each triangle',
          body: 'Triangle ABC has sides $3$, $4$, and $5$. Triangle GHI has legs $6$ and $8$, with longest side $\\sqrt{6^2 + 8^2} = \\sqrt{100} = 10$. So triangle GHI has sides $6$, $8$, and $10$.',
        },
        {
          label: 'Step 2 \u2014 Form the ratios of corresponding sides',
          formula: '$\\frac{6}{3} = 2, \\quad \\frac{8}{4} = 2, \\quad \\frac{10}{5} = 2$',
          body: 'Each side of triangle GHI is exactly twice the corresponding side of triangle ABC, so the common ratio is $2$.',
        },
        {
          label: 'Step 3 \u2014 Conclude',
          body: 'The ratios are equal but not $1$, so the triangles are similar yet not congruent. Triangle GHI is the same shape as ABC enlarged by a factor of $2$.',
        },
      ],
    },
  },
  {
    id: 'guided-similarity',
    type: 'similarity-guided',
    tag: 'We do',
    prompt:
      "Let's confirm similarity together. Measure both triangles, then compare the ratios.",
    grid: {
      ...GRID,
      shapes: [
        {
          id: 'abc',
          label: 'ABC',
          vertices: [
            { x: -7, y: -3 },
            { x: -4, y: -3 },
            { x: -7, y: 2 },
          ],
        },
        {
          id: 'ghi',
          label: 'GHI',
          vertices: [
            { x: -2, y: -5 },
            { x: 4, y: -5 },
            { x: -2, y: 5 },
          ],
        },
      ],
    },
    guided: [
      {
        id: 'sides-abc',
        prompt: 'Find the two legs of the smaller triangle ABC.',
        inputs: [
          { id: 'short', label: 'shorter leg =', answer: 3 },
          { id: 'long', label: 'longer leg =', answer: 5 },
        ],
        acceptAnyOrder: true,
        feedback: {
          hint: 'Measure the horizontal and vertical legs of triangle ABC.',
          correct: 'Triangle ABC has legs $3$ and $5$.',
        },
      },
      {
        id: 'sides-ghi',
        prompt: 'Now find the two legs of the larger triangle GHI.',
        inputs: [
          { id: 'short', label: 'shorter leg =', answer: 6 },
          { id: 'long', label: 'longer leg =', answer: 10 },
        ],
        acceptAnyOrder: true,
        feedback: {
          hint: 'Measure the horizontal and vertical legs of triangle GHI.',
          correct: 'Triangle GHI has legs $6$ and $10$.',
        },
      },
      {
        id: 'ratio',
        prompt:
          'Divide each side of GHI by its corresponding side of ABC. What common ratio results?',
        answer: 2,
        feedback: {
          correct:
            'Every corresponding side has the ratio $2$, so the triangles are similar but not congruent.',
          wrong: 'Compute $\\frac{6}{3}$ and $\\frac{10}{5}$.',
          hint: 'Each side of GHI is the same multiple of the matching side of ABC.',
        },
      },
    ],
  },
  {
    id: 'transition-youdo',
    type: 'transition',
    prompt:
      "Your turn! You will judge two pairs of triangles, then drag a shape onto a target to prove your conclusion.",
    transition: { emoji: '\u{1F4AA}', cta: "I'm ready" },
  },
  {
    id: 'q1-congruence-check',
    type: 'congruence-check',
    tag: 'You do',
    prompt: 'Decide whether triangle ABC and triangle DEF are congruent.',
    grid: {
      ...GRID,
      shapes: [
        {
          id: 'abc',
          label: 'ABC',
          vertices: [
            { x: -6, y: -3 },
            { x: -3, y: -3 },
            { x: -6, y: 1 },
          ],
        },
        {
          id: 'def',
          label: 'DEF',
          vertices: [
            { x: 2, y: -2 },
            { x: 6, y: -2 },
            { x: 6, y: 1 },
          ],
        },
      ],
    },
    subSteps: [
      {
        id: 'sides-abc',
        kind: 'multi',
        prompt: 'Find the three side lengths of triangle ABC.',
        inputs: [
          { id: 'a', label: 'shorter leg =', answer: 3 },
          { id: 'b', label: 'longer leg =', answer: 4 },
          { id: 'c', label: 'longest side =', answer: 5 },
        ],
        feedback: {
          hint: 'Use $D = \\sqrt{\\Delta x^2 + \\Delta y^2}$ for the longest side.',
        },
      },
      {
        id: 'sides-def',
        kind: 'multi',
        prompt: 'Find the three side lengths of triangle DEF.',
        inputs: [
          { id: 'a', label: 'shorter leg =', answer: 3 },
          { id: 'b', label: 'longer leg =', answer: 4 },
          { id: 'c', label: 'longest side =', answer: 5 },
        ],
        feedback: {
          hint: 'Triangle DEF has been rotated, so match each side carefully.',
        },
      },
      {
        id: 'is-congruent',
        kind: 'choice',
        prompt:
          'Both triangles have sides $3$, $4$, and $5$. Are they congruent?',
        choices: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
        ],
        correctChoice: 'yes',
        feedback: {
          correct:
            'Every pair of corresponding sides is equal, so the triangles are congruent.',
          wrong:
            'Compare the side lengths: when all corresponding sides match, the figures are congruent.',
          hint: 'Equal corresponding side lengths mean the figures are congruent.',
        },
      },
    ],
  },
  {
    id: 'q2-similarity-check',
    type: 'similarity-check',
    tag: 'You do',
    prompt: 'Decide whether triangle ABC and triangle GHI are similar.',
    grid: {
      ...GRID,
      shapes: [
        {
          id: 'abc',
          label: 'ABC',
          vertices: [
            { x: -6, y: -3 },
            { x: -3, y: -3 },
            { x: -6, y: 1 },
          ],
        },
        {
          id: 'ghi',
          label: 'GHI',
          vertices: [
            { x: 0, y: -6 },
            { x: 6, y: -6 },
            { x: 0, y: 2 },
          ],
        },
      ],
    },
    subSteps: [
      {
        id: 'sides-abc',
        kind: 'multi',
        prompt: 'Find the three side lengths of triangle ABC.',
        inputs: [
          { id: 'a', label: 'shorter leg =', answer: 3 },
          { id: 'b', label: 'longer leg =', answer: 4 },
          { id: 'c', label: 'longest side =', answer: 5 },
        ],
        feedback: {
          hint: 'Triangle ABC has the same sides as before: $3$, $4$, and $5$.',
        },
      },
      {
        id: 'sides-ghi',
        kind: 'multi',
        prompt: 'Find the three side lengths of triangle GHI.',
        inputs: [
          { id: 'a', label: 'shorter leg =', answer: 6 },
          { id: 'b', label: 'longer leg =', answer: 8 },
          { id: 'c', label: 'longest side =', answer: 10 },
        ],
        feedback: {
          hint: 'The longest side is $\\sqrt{6^2 + 8^2} = 10$.',
        },
      },
      {
        id: 'ratio',
        kind: 'numeric',
        prompt:
          'Divide each side of GHI by its corresponding side of ABC. What common ratio results?',
        answer: 2,
        feedback: {
          correct: 'Each side of GHI is twice the matching side of ABC.',
          wrong: 'Compute $\\frac{6}{3}$, $\\frac{8}{4}$, and $\\frac{10}{5}$.',
          hint: 'Divide a side of GHI by the corresponding side of ABC.',
        },
      },
      {
        id: 'is-similar',
        kind: 'choice',
        prompt:
          'The corresponding sides all share the ratio $2$. Are they similar?',
        choices: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
        ],
        correctChoice: 'yes',
        feedback: {
          correct:
            'A single common ratio of $2$ means the triangles are similar (the same shape at a larger size).',
          wrong:
            'When all corresponding sides share one ratio, the figures are similar.',
          hint: 'Equal side ratios mean the figures are similar.',
        },
      },
    ],
  },
  {
    id: 'q3-match-congruent',
    type: 'shape-match',
    tag: 'You do',
    prompt:
      'Prove these triangles are congruent: move and rotate the source triangle until it lands exactly on the target.',
    grid: { ...GRID },
    match: {
      goal: 'congruent',
      allow: ['translate', 'rotate'],
      source: {
        id: 'source',
        label: 'Source',
        vertices: [
          { x: -6, y: 2 },
          { x: -3, y: 2 },
          { x: -6, y: 6 },
        ],
      },
      target: {
        id: 'target',
        label: 'Target',
        vertices: [
          { x: 3, y: -6 },
          { x: 7, y: -6 },
          { x: 7, y: -3 },
        ],
      },
    },
    feedback: {
      hint: 'Both triangles have sides $3$, $4$, and $5$; a translation and a rotation will align them.',
      correct:
        'The source covers the target exactly, confirming the triangles are congruent.',
    },
  },
  {
    id: 'q4-match-similar',
    type: 'shape-match',
    tag: 'You do',
    prompt:
      'Prove these triangles are similar: move and dilate the source triangle until it lands exactly on the larger target.',
    grid: { ...GRID },
    match: {
      goal: 'similar',
      allow: ['translate', 'dilate'],
      source: {
        id: 'source',
        label: 'Source',
        vertices: [
          { x: -6, y: 2 },
          { x: -3, y: 2 },
          { x: -6, y: 6 },
        ],
      },
      target: {
        id: 'target',
        label: 'Target',
        vertices: [
          { x: 0, y: -6 },
          { x: 6, y: -6 },
          { x: 0, y: 2 },
        ],
      },
    },
    feedback: {
      hint: 'The target is the source enlarged by a factor of $2$; translate, then dilate to match it.',
      correct:
        'After dilating by $2$ and translating, the source matches the target, confirming the triangles are similar.',
    },
  },
  {
    id: 'q5-side-length',
    type: 'coordinate-rule',
    tag: 'You do',
    prompt: 'A right triangle has legs of length 3 and 4. How long is its hypotenuse?',
    answer: 5,
    feedback: {
      correct: 'By the Pythagorean theorem, $\\sqrt{3^2 + 4^2} = 5$.',
      wrong: 'Square each leg, add them, then take the square root.',
      hint: 'Use $c = \\sqrt{a^2 + b^2}$ with the two given legs.',
    },
  },
  {
    id: 'q6-scale-ratio',
    type: 'coordinate-rule',
    tag: 'You do',
    prompt:
      'Two similar figures have corresponding sides of length 4 and 12. The larger figure is a scaled copy of the smaller. What is the scale factor?',
    answer: 3,
    feedback: {
      correct: 'Divide the larger side by the smaller: $12 \\div 4 = 3$.',
      wrong: 'Divide a side of the larger figure by the corresponding side of the smaller figure.',
      hint: 'The scale factor is the larger side divided by the smaller side.',
    },
  },
];

export const congruenceSimilarityLesson: Lesson = {
  lessonId: 'congruence-similarity',
  title: 'Congruence and Similarity',
  steps,
};
