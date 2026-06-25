import type { Lesson } from '@/types/lesson';

export const transformationsLesson: Lesson = {
  lessonId: 'transformations',
  title: 'Transformations',
  steps: [
    {
      id: 'intro',
      type: 'transition',
      prompt:
        "Welcome to lesson 4! Today we'll move shapes around the coordinate grid using the four rigid and non-rigid transformations: translations, reflections, rotations, and dilations. I'll demonstrate each one, then we'll practice together.",
      transition: { emoji: '\u{1F4D0}', cta: "Let's begin" },
    },
    {
      id: 'demo-translate',
      type: 'transform-demo',
      tag: 'I do',
      prompt: 'Watch how a translation slides every vertex of the triangle by the same amount.',
      grid: { xMin: -2, xMax: 8, yMin: -2, yMax: 8 },
      transform: {
        kind: 'translate',
        instruction: 'Translate the triangle 3 units right and 2 units up.',
        translate: { dx: 3, dy: 2 },
        source: {
          id: 'tri',
          label: 'Triangle ABC',
          vertices: [
            { x: 1, y: 1 },
            { x: 4, y: 1 },
            { x: 1, y: 3 },
          ],
        },
        target: [
          { x: 4, y: 3 },
          { x: 7, y: 3 },
          { x: 4, y: 5 },
        ],
      },
      demo: {
        intro: 'Reveal each step in order to see how a translation moves the triangle.',
        reveals: [
          {
            label: 'Step 1 — A translation slides the whole shape',
            body: 'A translation moves every point the same distance in the same direction. The shape keeps its size, its angles, and its orientation; only its position changes.',
          },
          {
            label: 'Step 2 — Add the shift to each coordinate',
            formula: '$(x, y) \\rightarrow (x + 3,\\; y + 2)$',
            body: 'To slide 3 units right and 2 units up, add 3 to every x-coordinate and add 2 to every y-coordinate.',
          },
          {
            label: 'Step 3 — Move every vertex',
            body: 'Vertex (1, 1) becomes (4, 3), vertex (4, 1) becomes (7, 3), and vertex (1, 3) becomes (4, 5). Connecting them draws the translated triangle.',
          },
        ],
      },
    },
    {
      id: 'guided-translate',
      type: 'transform-guided',
      tag: 'We do',
      prompt: "Let's translate a triangle together. Slide it down and to the right.",
      grid: { xMin: -1, xMax: 8, yMin: -1, yMax: 8 },
      transform: {
        kind: 'translate',
        instruction: 'Translate the triangle 4 units right and 2 units down.',
        translate: { dx: 4, dy: -2 },
        source: {
          id: 'tri',
          label: 'Triangle',
          vertices: [
            { x: 1, y: 3 },
            { x: 3, y: 3 },
            { x: 1, y: 6 },
          ],
        },
        target: [
          { x: 5, y: 1 },
          { x: 7, y: 1 },
          { x: 5, y: 4 },
        ],
      },
      feedback: {
        wrong: 'Moving right increases x and moving down decreases y, so use $(x, y) \\rightarrow (x + 4,\\; y - 2)$.',
        hint: 'Add 4 to each x-coordinate, then subtract 2 from each y-coordinate.',
      },
    },
    {
      id: 'demo-reflect',
      type: 'transform-demo',
      tag: 'I do',
      prompt: 'Watch how a reflection flips the triangle across the y-axis like a mirror.',
      grid: { xMin: -7, xMax: 7, yMin: -1, yMax: 6 },
      transform: {
        kind: 'reflect',
        instruction: 'Reflect the triangle across the y-axis.',
        reflect: { axis: 'y' },
        source: {
          id: 'tri',
          label: 'Triangle',
          vertices: [
            { x: 2, y: 1 },
            { x: 5, y: 1 },
            { x: 2, y: 4 },
          ],
        },
        target: [
          { x: -2, y: 1 },
          { x: -5, y: 1 },
          { x: -2, y: 4 },
        ],
      },
      demo: {
        intro: 'Reveal each step to see how the y-axis acts as a mirror line.',
        reveals: [
          {
            label: 'Step 1 — The mirror line stays fixed',
            body: 'A reflection across the y-axis flips the shape to the opposite side of that line. Each point lands the same distance from the y-axis, but on the other side.',
          },
          {
            label: 'Step 2 — Negate the x-coordinate',
            formula: '$(x, y) \\rightarrow (-x,\\; y)$',
            body: 'Reflecting across the y-axis changes the sign of each x-coordinate while the y-coordinate stays the same.',
          },
          {
            label: 'Step 3 — Map every vertex',
            body: 'Vertex (2, 1) becomes (-2, 1), vertex (5, 1) becomes (-5, 1), and vertex (2, 4) becomes (-2, 4). The image is a mirror copy of the original.',
          },
        ],
      },
    },
    {
      id: 'guided-reflect',
      type: 'transform-guided',
      tag: 'We do',
      prompt: "Now let's reflect a triangle across the x-axis together.",
      grid: { xMin: -1, xMax: 6, yMin: -7, yMax: 7 },
      transform: {
        kind: 'reflect',
        instruction: 'Reflect the triangle across the x-axis.',
        reflect: { axis: 'x' },
        source: {
          id: 'tri',
          label: 'Triangle',
          vertices: [
            { x: 1, y: 2 },
            { x: 4, y: 2 },
            { x: 1, y: 5 },
          ],
        },
        target: [
          { x: 1, y: -2 },
          { x: 4, y: -2 },
          { x: 1, y: -5 },
        ],
      },
      feedback: {
        wrong: 'Reflecting across the x-axis uses $(x, y) \\rightarrow (x,\\; -y)$, so only the sign of y changes.',
        hint: 'Keep each x-coordinate the same and negate each y-coordinate.',
      },
    },
    {
      id: 'demo-rotate',
      type: 'transform-demo',
      tag: 'I do',
      prompt: 'Watch how a rotation turns the triangle 90 degrees counterclockwise about the origin.',
      grid: { xMin: -4, xMax: 6, yMin: -1, yMax: 6 },
      transform: {
        kind: 'rotate',
        instruction: 'Rotate the triangle 90 degrees counterclockwise about the origin.',
        rotate: { center: { x: 0, y: 0 }, degrees: 90, direction: 'ccw' },
        source: {
          id: 'tri',
          label: 'Triangle',
          vertices: [
            { x: 2, y: 1 },
            { x: 5, y: 1 },
            { x: 2, y: 3 },
          ],
        },
        target: [
          { x: -1, y: 2 },
          { x: -1, y: 5 },
          { x: -3, y: 2 },
        ],
      },
      demo: {
        intro: 'Reveal each step to see how a quarter-turn about the origin moves the triangle.',
        reveals: [
          {
            label: 'Step 1 — Turn about the center',
            body: 'A rotation turns the shape about a fixed center point. Here the center is the origin, and we turn a quarter-turn, which is $90^\\circ$, in the counterclockwise direction.',
          },
          {
            label: 'Step 2 — Use the quarter-turn rule',
            formula: '$(x, y) \\rightarrow (-y,\\; x)$',
            body: 'A $90^\\circ$ counterclockwise rotation about the origin swaps the coordinates and negates the new x-coordinate.',
          },
          {
            label: 'Step 3 — Map every vertex',
            body: 'Vertex (2, 1) becomes (-1, 2), vertex (5, 1) becomes (-1, 5), and vertex (2, 3) becomes (-3, 2). The triangle has turned a quarter-turn around the origin.',
          },
        ],
      },
    },
    {
      id: 'guided-rotate',
      type: 'transform-guided',
      tag: 'We do',
      prompt: "Let's rotate a triangle 180 degrees about the origin together.",
      grid: { xMin: -5, xMax: 5, yMin: -4, yMax: 4 },
      transform: {
        kind: 'rotate',
        instruction: 'Rotate the triangle 180 degrees about the origin.',
        rotate: { center: { x: 0, y: 0 }, degrees: 180, direction: 'ccw' },
        source: {
          id: 'tri',
          label: 'Triangle',
          vertices: [
            { x: 1, y: 1 },
            { x: 4, y: 1 },
            { x: 1, y: 3 },
          ],
        },
        target: [
          { x: -1, y: -1 },
          { x: -4, y: -1 },
          { x: -1, y: -3 },
        ],
      },
      feedback: {
        wrong: 'A half-turn about the origin uses $(x, y) \\rightarrow (-x,\\; -y)$, so negate both coordinates.',
        hint: 'A $180^\\circ$ rotation sends each vertex to the opposite side of the origin: change the sign of both x and y.',
      },
    },
    {
      id: 'demo-dilate',
      type: 'transform-demo',
      tag: 'I do',
      prompt: 'Watch how a dilation enlarges the triangle by a scale factor of 2 from the origin.',
      grid: { xMin: -1, xMax: 7, yMin: -1, yMax: 5 },
      transform: {
        kind: 'dilate',
        instruction: 'Dilate the triangle by a scale factor of 2 from the origin.',
        dilate: { center: { x: 0, y: 0 }, factor: 2 },
        source: {
          id: 'tri',
          label: 'Triangle',
          vertices: [
            { x: 1, y: 1 },
            { x: 3, y: 1 },
            { x: 1, y: 2 },
          ],
        },
        target: [
          { x: 2, y: 2 },
          { x: 6, y: 2 },
          { x: 2, y: 4 },
        ],
      },
      demo: {
        intro: 'Reveal each step to see how a dilation resizes the triangle from a center point.',
        reveals: [
          {
            label: 'Step 1 — A dilation changes size, not shape',
            body: 'A dilation enlarges or reduces a shape from a fixed center. The image stays similar to the original: the angles are unchanged and the side lengths scale by the same factor.',
          },
          {
            label: 'Step 2 — Multiply each coordinate by the scale factor',
            formula: '$(x, y) \\rightarrow (2x,\\; 2y)$',
            body: 'With center at the origin and a scale factor of 2, multiply every coordinate by 2 to move each vertex twice as far from the origin.',
          },
          {
            label: 'Step 3 — Map every vertex',
            body: 'Vertex (1, 1) becomes (2, 2), vertex (3, 1) becomes (6, 2), and vertex (1, 2) becomes (2, 4). The image is twice the size of the original.',
          },
        ],
      },
    },
    {
      id: 'guided-dilate',
      type: 'transform-guided',
      tag: 'We do',
      prompt: "Let's dilate a triangle by a scale factor of 3 from the origin together.",
      grid: { xMin: -1, xMax: 7, yMin: -1, yMax: 7 },
      transform: {
        kind: 'dilate',
        instruction: 'Dilate the triangle by a scale factor of 3 from the origin.',
        dilate: { center: { x: 0, y: 0 }, factor: 3 },
        source: {
          id: 'tri',
          label: 'Triangle',
          vertices: [
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 1, y: 2 },
          ],
        },
        target: [
          { x: 3, y: 3 },
          { x: 6, y: 3 },
          { x: 3, y: 6 },
        ],
      },
      feedback: {
        wrong: 'With center at the origin, a dilation uses $(x, y) \\rightarrow (3x,\\; 3y)$.',
        hint: 'Multiply each coordinate by the scale factor of 3.',
      },
    },
    {
      id: 'transition-youdo',
      type: 'transition',
      prompt:
        "You've seen all four transformations. Now your turn — these problems combine two transformations, applied one after the other.",
      transition: { emoji: '\u{1F4AA}', cta: "I'm ready" },
    },
    {
      id: 'q1-combo',
      type: 'transform-problem',
      tag: 'You do',
      prompt: 'Apply two transformations in order: a translation, then a reflection.',
      grid: { xMin: -6, xMax: 6, yMin: -1, yMax: 6 },
      transform: {
        kind: 'translate',
        instruction:
          'First translate the triangle 2 units right and 1 unit up, then reflect the result across the y-axis.',
        source: {
          id: 'tri',
          label: 'Triangle',
          vertices: [
            { x: 1, y: 1 },
            { x: 3, y: 1 },
            { x: 1, y: 4 },
          ],
        },
        steps: [
          { kind: 'translate', translate: { dx: 2, dy: 1 } },
          { kind: 'reflect', reflect: { axis: 'y' } },
        ],
        target: [
          { x: -3, y: 2 },
          { x: -5, y: 2 },
          { x: -3, y: 5 },
        ],
      },
      feedback: {
        wrong:
          'Translate first with $(x, y) \\rightarrow (x + 2,\\; y + 1)$, then reflect that image across the y-axis with $(x, y) \\rightarrow (-x,\\; y)$.',
        hint: 'Do the translation completely first, then apply the reflection to the translated vertices.',
      },
    },
    {
      id: 'q2-combo',
      type: 'transform-problem',
      tag: 'You do',
      prompt: 'Apply two transformations in order: a rotation, then a translation.',
      grid: { xMin: -1, xMax: 6, yMin: -4, yMax: 6 },
      transform: {
        kind: 'rotate',
        instruction:
          'First rotate the triangle 90 degrees clockwise about the origin, then translate the result 2 units right and 5 units up.',
        source: {
          id: 'tri',
          label: 'Triangle',
          vertices: [
            { x: 1, y: 1 },
            { x: 3, y: 1 },
            { x: 1, y: 2 },
          ],
        },
        steps: [
          { kind: 'rotate', rotate: { center: { x: 0, y: 0 }, degrees: 90, direction: 'cw' } },
          { kind: 'translate', translate: { dx: 2, dy: 5 } },
        ],
        target: [
          { x: 3, y: 4 },
          { x: 3, y: 2 },
          { x: 4, y: 4 },
        ],
      },
      feedback: {
        wrong:
          'A $90^\\circ$ clockwise rotation about the origin uses $(x, y) \\rightarrow (y,\\; -x)$; then add 2 to x and 5 to y.',
        hint: 'Rotate every vertex first, then translate those rotated vertices 2 right and 5 up.',
      },
    },
    {
      id: 'q3-combo',
      type: 'transform-problem',
      tag: 'You do',
      prompt: 'Apply two transformations in order: a dilation, then a translation.',
      grid: { xMin: -1, xMax: 6, yMin: -1, yMax: 7 },
      transform: {
        kind: 'dilate',
        instruction:
          'First dilate the triangle by a scale factor of 2 from the origin, then translate the result 1 unit right and 1 unit down.',
        source: {
          id: 'tri',
          label: 'Triangle',
          vertices: [
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 1, y: 3 },
          ],
        },
        steps: [
          { kind: 'dilate', dilate: { center: { x: 0, y: 0 }, factor: 2 } },
          { kind: 'translate', translate: { dx: 1, dy: -1 } },
        ],
        target: [
          { x: 3, y: 1 },
          { x: 5, y: 1 },
          { x: 3, y: 5 },
        ],
      },
      feedback: {
        wrong:
          'Dilate first with $(x, y) \\rightarrow (2x,\\; 2y)$, then translate with $(x, y) \\rightarrow (x + 1,\\; y - 1)$.',
        hint: 'Multiply each coordinate by 2 first, then shift those vertices 1 right and 1 down.',
      },
    },
  ],
};
