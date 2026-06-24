import type { Lesson } from '@/types/lesson';

export const distanceLesson: Lesson = {
  lessonId: 'distance-coordinate-plane',
  title: 'Distance on the Coordinate Plane',
  steps: [
    {
      id: 'intro',
      type: 'transition',
      prompt:
        "Welcome to lesson 3! Today we'll measure the straight-line distance between two points on a grid using the Pythagorean theorem. Watch me work one first.",
      transition: { emoji: '\u{1F4CD}', cta: "Let's begin" },
    },
    {
      id: 'demo-distance',
      type: 'distance-demo',
      prompt: 'Find the distance between A (1, 2) and B (5, 5).',
      graph: {
        points: [
          { id: 'A', label: 'A (1, 2)', x: 1, y: 2 },
          { id: 'B', label: 'B (5, 5)', x: 5, y: 5 },
        ],
        segments: [
          { id: 'dx', from: 'A', to: 'B', kind: 'dx', label: '\u0394x = 4' },
          { id: 'dy', from: 'A', to: 'B', kind: 'dy', label: '\u0394y = 3' },
          { id: 'dist', from: 'A', to: 'B', kind: 'dist', label: 'D = 5' },
        ],
      },
      demo: {
        intro: 'Reveal each step in order to watch the right triangle build itself on the grid.',
        reveals: [
          {
            label: 'Step 1 \u2014 Find $\\Delta x$ and $\\Delta y$',
            body: '$\\Delta x$ is the change in $x$ from one point to the other: $5 - 1 = 4$. $\\Delta y$ is the change in $y$: $5 - 2 = 3$. These two changes form the legs of a right triangle.',
            drawSegmentIds: ['dx', 'dy'],
          },
          {
            label: 'Step 2 \u2014 Substitute them into the formula',
            formula: '$\\Delta x^2 + \\Delta y^2 = D^2$',
            body: 'The distance $D$ is the hypotenuse of that right triangle, so substitute the legs: $4^2 + 3^2 = D^2$.',
          },
          {
            label: 'Step 3 \u2014 Solve for $D$',
            formula: '$D = \\sqrt{\\Delta x^2 + \\Delta y^2} = \\sqrt{16 + 9} = \\sqrt{25} = 5$',
            body: 'Square each leg, add them to obtain $D^2 = 25$, then take the square root: $D = 5$.',
            drawSegmentIds: ['dist'],
          },
        ],
      },
    },
    {
      id: 'transition-wedo',
      type: 'transition',
      prompt: "Nice! Let's find a distance together, one step at a time.",
      transition: { emoji: '\u{1F60A}', cta: "Let's do it" },
    },
    {
      id: 'guided-distance',
      type: 'distance-guided',
      prompt: 'Find the distance between C (2, 1) and D (10, 7).',
      graph: {
        points: [
          { id: 'C', label: 'C (2, 1)', x: 2, y: 1 },
          { id: 'D', label: 'D (10, 7)', x: 10, y: 7 },
        ],
        segments: [
          { id: 'dx', from: 'C', to: 'D', kind: 'dx', label: '\u0394x = 8' },
          { id: 'dy', from: 'C', to: 'D', kind: 'dy', label: '\u0394y = 6' },
          { id: 'dist', from: 'C', to: 'D', kind: 'dist', label: 'D = 10' },
        ],
      },
      subSteps: [
        {
          id: 'deltas',
          kind: 'multi',
          prompt: 'First, find $\\Delta x$ and $\\Delta y$ \u2014 the change in $x$ and the change in $y$ between C and D.',
          inputs: [
            { id: 'dx', label: '\u0394x =', answer: 8 },
            { id: 'dy', label: '\u0394y =', answer: 6 },
          ],
          drawSegmentIds: ['dx', 'dy'],
          feedback: {
            wrong: '$\\Delta x = 10 - 2$ and $\\Delta y = 7 - 1$.',
            hint: 'Subtract the $x$-coordinates of the two points for $\\Delta x$, and the $y$-coordinates for $\\Delta y$.',
          },
        },
        {
          id: 'd-squared',
          kind: 'numeric',
          prompt: 'Substitute the legs into $\\Delta x^2 + \\Delta y^2 = D^2$. What does $D^2$ equal?',
          answer: 100,
          feedback: {
            wrong: 'Square each leg and add: $8^2 + 6^2$.',
            hint: 'Square each leg, then add the two squares to obtain $D^2$.',
          },
        },
        {
          id: 'd',
          kind: 'numeric',
          prompt: 'Finally, solve for $D$ by taking the square root of $D^2$.',
          answer: 10,
          drawSegmentIds: ['dist'],
          feedback: {
            correct: '$\\sqrt{100} = 10$ \u2014 the distance is 10.',
            wrong: 'Take the square root of 100.',
            hint: 'Since $D^2$ is a perfect square, take its square root to find $D$.',
          },
        },
      ],
    },
    {
      id: 'transition-youdo',
      type: 'transition',
      prompt: "You've got this! Your turn \u2014 four problems.",
      transition: { emoji: '\u{1F4AA}', cta: "I'm ready" },
    },
    {
      id: 'q1-distance',
      type: 'distance-problem',
      prompt: 'Find the distance between E and F.',
      graph: {
        points: [
          { id: 'E', label: 'E (2, 3)', x: 2, y: 3 },
          { id: 'F', label: 'F (14, 8)', x: 14, y: 8, labelPos: 'bl' },
        ],
        segments: [
          { id: 'dx', from: 'E', to: 'F', kind: 'dx', label: '\u0394x = 12' },
          { id: 'dy', from: 'E', to: 'F', kind: 'dy', label: '\u0394y = 5' },
          { id: 'dist', from: 'E', to: 'F', kind: 'dist', label: 'D = 13' },
        ],
      },
      subSteps: [
        {
          id: 'distance',
          kind: 'numeric',
          prompt: 'Find the distance between E (2, 3) and F (14, 8).',
          answer: 13,
          drawSegmentIds: ['dx', 'dy', 'dist'],
          feedback: {
            correct: '$\\Delta x = 12$, $\\Delta y = 5$, so $D = \\sqrt{12^2 + 5^2} = \\sqrt{169} = 13$.',
            wrong: 'Find $\\Delta x$ and $\\Delta y$ first, then use $D = \\sqrt{\\Delta x^2 + \\Delta y^2}$.',
            hint: 'Find $\\Delta x$ and $\\Delta y$ from the coordinates, square each, add them, then take the square root.',
          },
        },
      ],
    },
    {
      id: 'q2-perimeter',
      type: 'distance-problem',
      prompt: 'Find the perimeter of triangle PQR.',
      graph: {
        points: [
          { id: 'P', label: 'P (1, 1)', x: 1, y: 1, labelPos: 'br' },
          { id: 'Q', label: 'Q (9, 1)', x: 9, y: 1 },
          { id: 'R', label: 'R (5, 4)', x: 5, y: 4 },
        ],
        segments: [
          { id: 'pq', from: 'P', to: 'Q', kind: 'dist', label: 'PQ = 8' },
          {
            id: 'qr',
            from: 'Q',
            to: 'R',
            kind: 'dist',
            label: 'QR = 5',
            labelOffset: { dx: 14, dy: 4 },
            labelAnchor: 'start',
          },
          { id: 'rp', from: 'R', to: 'P', kind: 'dist', label: 'RP = 5' },
        ],
      },
      subSteps: [
        {
          id: 'sides',
          kind: 'multi',
          prompt:
            'A triangle has vertices P (1, 1), Q (9, 1), and R (5, 4). First, find the length of each side.',
          inputs: [
            { id: 'pq', label: 'PQ =', answer: 8 },
            { id: 'qr', label: 'QR =', answer: 5 },
            { id: 'rp', label: 'RP =', answer: 5 },
          ],
          drawSegmentIds: ['pq', 'qr', 'rp'],
          feedback: {
            wrong: 'Use $D = \\sqrt{\\Delta x^2 + \\Delta y^2}$ on each pair of vertices.',
            hint: 'For each side, find the horizontal and vertical change between its endpoints, then apply the distance formula.',
          },
        },
        {
          id: 'perimeter',
          kind: 'numeric',
          prompt: 'Now add the three side lengths to find the perimeter.',
          answer: 18,
          feedback: {
            correct: '8 + 5 + 5 = 18 \u2014 the perimeter is the sum of all three sides.',
            wrong: 'Add all three sides together.',
            hint: 'Add the three side lengths together.',
          },
        },
      ],
    },
    {
      id: 'q3-right-triangle',
      type: 'distance-problem',
      prompt: 'Is triangle ABC a right triangle?',
      graph: {
        points: [
          { id: 'A', label: 'A (12, 0)', x: 12, y: 0 },
          { id: 'B', label: 'B (24, 9)', x: 24, y: 9, labelPos: 'bl' },
          { id: 'C', label: 'C (0, 16)', x: 0, y: 16 },
        ],
        segments: [
          { id: 'ab', from: 'A', to: 'B', kind: 'dist', label: 'AB = 15' },
          { id: 'ac', from: 'A', to: 'C', kind: 'dist', label: 'AC = 20' },
          { id: 'bc', from: 'B', to: 'C', kind: 'dist', label: 'BC = 25' },
        ],
      },
      subSteps: [
        {
          id: 'sides',
          kind: 'multi',
          prompt:
            'This triangle has vertices A (12, 0), B (24, 9), and C (0, 16). Find the length of each side.',
          inputs: [
            { id: 'ab', label: 'AB =', answer: 15 },
            { id: 'ac', label: 'AC =', answer: 20 },
            { id: 'bc', label: 'BC =', answer: 25 },
          ],
          drawSegmentIds: ['ab', 'ac', 'bc'],
          feedback: {
            wrong: 'Use $D = \\sqrt{\\Delta x^2 + \\Delta y^2}$ on each pair of vertices.',
            hint: 'For each side, find the horizontal and vertical change between its endpoints, then apply the distance formula.',
          },
        },
        {
          id: 'is-right',
          kind: 'choice',
          prompt:
            'A triangle is right when $a^2 + b^2 = c^2$ (the two shorter sides squared add up to the longest side squared). Does $15^2 + 20^2 = 25^2$? Is this a right triangle?',
          choices: [
            { id: 'yes', label: 'Yes, it is a right triangle' },
            { id: 'no', label: 'No, it is not' },
          ],
          correctChoice: 'yes',
          feedback: {
            correct:
              '$15^2 + 20^2 = 225 + 400 = 625 = 25^2$. Since $a^2 + b^2 = c^2$, it is a right triangle.',
            wrong: 'Check the two shorter sides against the longest: does $15^2 + 20^2$ equal $25^2$?',
            hint: 'Square the two shorter sides and add them, then compare that total to the longest side squared \u2014 equality means it is a right triangle.',
          },
        },
      ],
    },
    {
      id: 'q4-journey',
      type: 'distance-problem',
      prompt: 'A car drives from Houston to Austin to Dallas. How far does it travel in total?',
      carPath: ['H', 'Au', 'Da'],
      graph: {
        points: [
          { id: 'H', label: 'Houston (1, 1)', x: 1, y: 1, labelOffset: { dx: 20, dy: 5 } },
          { id: 'Au', label: 'Austin (5, 4)', x: 5, y: 4, labelOffset: { dx: 16, dy: -9 } },
          { id: 'Da', label: 'Dallas (11, 12)', x: 11, y: 12, labelOffset: { dx: -16, dy: 9 } },
        ],
        segments: [
          { id: 'leg1', from: 'H', to: 'Au', kind: 'dist', label: '5' },
          { id: 'leg2', from: 'Au', to: 'Da', kind: 'dist', label: '10' },
        ],
      },
      subSteps: [
        {
          id: 'leg1',
          kind: 'numeric',
          prompt: 'First, how far is it from Houston (1, 1) to Austin (5, 4)?',
          answer: 5,
          drawSegmentIds: ['leg1'],
          feedback: {
            wrong: '$\\Delta x = 4$ and $\\Delta y = 3$, so use $D = \\sqrt{\\Delta x^2 + \\Delta y^2}$.',
            hint: 'Find the horizontal and vertical change between the two cities, then apply the distance formula.',
          },
        },
        {
          id: 'leg2',
          kind: 'numeric',
          prompt: 'Next, how far is it from Austin (5, 4) to Dallas (11, 12)?',
          answer: 10,
          drawSegmentIds: ['leg2'],
          feedback: {
            wrong: '$\\Delta x = 6$ and $\\Delta y = 8$, so use $D = \\sqrt{\\Delta x^2 + \\Delta y^2}$.',
            hint: 'Find the horizontal and vertical change between the two cities, then apply the distance formula.',
          },
        },
        {
          id: 'total',
          kind: 'numeric',
          prompt: 'If the car goes from Houston to Austin to Dallas, what is the total distance the car travels?',
          answer: 15,
          feedback: {
            correct: '5 + 10 = 15 \u2014 add the two legs of the trip together.',
            wrong: 'Add the Houston\u2192Austin leg and the Austin\u2192Dallas leg.',
            hint: 'Add the two legs of the trip together.',
          },
        },
      ],
    },
  ],
};
