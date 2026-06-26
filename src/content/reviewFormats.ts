import type { LessonStep } from '@/types/lesson';
import type {
  GeneratedQuestion,
  QuestionFormat,
  QuestionParams,
} from '@/types/review';

/**
 * Phase 2 — FR-2 question format catalog.
 *
 * Each format derives from a Phase 1 "You do" question and produces a fresh,
 * fully-solved {@link GeneratedQuestion} whose `step` is an ephemeral
 * `LessonStep` that the existing StepRenderer renders and grades unchanged.
 *
 * All numbers come from curated sets (Pythagorean triples / verified integer
 * configs) so every generated answer is an exact integer — AI never touches
 * the math.
 */

/** Pick a uniformly-random element using an injectable RNG. */
function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Random integer in [min, max] inclusive. */
function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/**
 * Primitive Pythagorean triples [a, b, c] with a < b < c, plus a few integer
 * multiples for variety. In every triple at least one leg is even, so the
 * right-triangle area a*b/2 is always an integer.
 */
export const PYTHAGOREAN_TRIPLES: ReadonlyArray<[number, number, number]> = [
  [3, 4, 5],
  [6, 8, 10],
  [9, 12, 15],
  [5, 12, 13],
  [10, 24, 26],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
  [12, 35, 37],
  [12, 16, 20],
  [15, 20, 25],
];

/**
 * Curated split-base (non-right) triangles: the altitude `height` is a common
 * leg of two right triangles whose other legs are `leftSplit` / `rightSplit`,
 * giving integer oblique `sides`. base = leftSplit + rightSplit.
 */
export const DERIVE_PERIMETER_CONFIGS: ReadonlyArray<{
  height: number;
  leftSplit: number;
  rightSplit: number;
  sides: [number, number];
}> = [
  { height: 12, leftSplit: 5, rightSplit: 9, sides: [13, 15] },
  { height: 8, leftSplit: 6, rightSplit: 15, sides: [10, 17] },
  { height: 12, leftSplit: 5, rightSplit: 16, sides: [13, 20] },
  { height: 12, leftSplit: 9, rightSplit: 16, sides: [15, 20] },
  { height: 24, leftSplit: 7, rightSplit: 10, sides: [25, 26] },
  { height: 15, leftSplit: 8, rightSplit: 20, sides: [17, 25] },
  { height: 4, leftSplit: 3, rightSplit: 3, sides: [5, 5] },
  { height: 6, leftSplit: 8, rightSplit: 8, sides: [10, 10] },
];

/**
 * Curated integer-coordinate triangles whose three side lengths are all whole
 * numbers (verified via the distance formula). `sides` is [AB, BC, CA].
 */
export const PERIMETER_TRIANGLES: ReadonlyArray<{
  vertices: [[number, number], [number, number], [number, number]];
  sides: [number, number, number];
  perimeter: number;
}> = [
  { vertices: [[0, 0], [8, 0], [4, 3]], sides: [8, 5, 5], perimeter: 18 },
  { vertices: [[0, 0], [3, 0], [0, 4]], sides: [3, 5, 4], perimeter: 12 },
  { vertices: [[0, 0], [6, 0], [0, 8]], sides: [6, 10, 8], perimeter: 24 },
  { vertices: [[0, 0], [8, 0], [8, 6]], sides: [8, 6, 10], perimeter: 24 },
  { vertices: [[0, 0], [9, 0], [0, 12]], sides: [9, 15, 12], perimeter: 36 },
  { vertices: [[1, 1], [13, 1], [13, 6]], sides: [12, 5, 13], perimeter: 30 },
  { vertices: [[12, 0], [24, 9], [0, 16]], sides: [15, 25, 20], perimeter: 60 },
  { vertices: [[0, 0], [16, 0], [16, 12]], sides: [16, 12, 20], perimeter: 48 },
];

const RT = 'right-triangles';
const NRT = 'non-right-triangles';
const DIST = 'distance-coordinate-plane';
const TRANS = 'transformations';
const CS = 'congruence-similarity';

export const YOU_DO_STEPS: Record<string, string[]> = {
  [RT]: ['q1-hypotenuse', 'q2-area', 'q3-leg-then-perimeter', 'q4-leg-then-area'],
  [NRT]: ['q1-area-base-height', 'q2-derive-perimeter', 'q4-perimeter-from-area'],
  [DIST]: ['q1-distance', 'q2-perimeter', 'q3-right-triangle', 'q4-journey'],
  [TRANS]: ['q5-translate-point', 'q6-reflect-point', 'q7-rotate-point', 'q8-dilate-point'],
  [CS]: ['q5-side-length', 'q6-scale-ratio'],
};

function make(
  format: Omit<QuestionFormat, 'generate'>,
  build: (rng: () => number) => {
    step: LessonStep;
    params: QuestionParams;
    basePrompt: string;
    answer: number;
  },
): QuestionFormat {
  return {
    ...format,
    generate(rng: () => number = Math.random): GeneratedQuestion {
      const { step, params, basePrompt, answer } = build(rng);
      return {
        formatId: format.formatId,
        lessonId: format.lessonId,
        step,
        params,
        basePrompt,
        answer,
      };
    },
  };
}

const rtHypotenuse = make(
  {
    formatId: 'rt-hypotenuse',
    lessonId: RT,
    sourceStepId: 'q1-hypotenuse',
    label: 'Find the hypotenuse',
  },
  (rng) => {
    const [a, b, c] = pick(PYTHAGOREAN_TRIPLES, rng);
    const basePrompt = `A right triangle has legs of length ${a} and ${b}. Use the Pythagorean theorem to find the length of the hypotenuse.`;
    const step: LessonStep = {
      id: 'review-rt-hypotenuse',
      type: 'numeric',
      prompt: 'Find the length of the hypotenuse.',
      triangle: { legs: [a, b] },
      answer: c,
      feedback: {
        correct: `$${a}^2 + ${b}^2 = ${c}^2$`,
        wrong: 'Square each leg, add them, then take the square root.',
        hint: 'Square both legs, add them, then take the square root of that sum.',
      },
    };
    return { step, params: { a, b }, basePrompt, answer: c };
  },
);

const rtArea = make(
  {
    formatId: 'rt-area',
    lessonId: RT,
    sourceStepId: 'q2-area',
    label: 'Area of a right triangle',
  },
  (rng) => {
    const [a, b] = pick(PYTHAGOREAN_TRIPLES, rng);
    const answer = (a * b) / 2;
    const basePrompt = `A right triangle has legs of length ${a} and ${b}. What is its area?`;
    const step: LessonStep = {
      id: 'review-rt-area',
      type: 'formula-compute',
      prompt: 'What is the area of this right triangle?',
      triangle: { legs: [a, b] },
      answer,
      feedback: {
        correct: `$\\frac{1}{2} \\times ${a} \\times ${b} = ${answer}$`,
        wrong: 'Multiply the two legs, then divide by 2.',
        hint: 'A triangle is half of the rectangle with the same base and height.',
      },
    };
    return { step, params: { a, b }, basePrompt, answer };
  },
);

const rtMissingLegPerimeter = make(
  {
    formatId: 'rt-missing-leg-perimeter',
    lessonId: RT,
    sourceStepId: 'q3-leg-then-perimeter',
    label: 'Missing leg, then perimeter',
  },
  (rng) => {
    const [a, b, c] = pick(PYTHAGOREAN_TRIPLES, rng);
    const perimeter = a + b + c;
    const basePrompt = `A right triangle has one leg of length ${a} and a hypotenuse of length ${c}. Find the missing leg, then the perimeter.`;
    const step: LessonStep = {
      id: 'review-rt-missing-leg-perimeter',
      type: 'leg-then-perimeter',
      prompt: 'Find the missing leg, then the perimeter.',
      triangle: { leg: a, hypotenuse: c, missingLeg: b },
      parts: [
        {
          id: 'leg',
          prompt: 'Use the Pythagorean theorem to find the missing leg.',
          answer: b,
          feedback: {
            wrong: 'Subtract the squares, then take the square root to get the missing leg.',
          },
        },
        {
          id: 'perimeter',
          prompt: 'Now unwrap the triangle into a straight line. What is the perimeter?',
          answer: perimeter,
          feedback: {
            correct: `$${a} + ${b} + ${c} = ${perimeter}$`,
            wrong: 'Add all three sides: the two legs and the hypotenuse.',
            hint: 'Once you have all three sides, add them together.',
          },
        },
      ],
    };
    return { step, params: { leg: a, hypotenuse: c }, basePrompt, answer: perimeter };
  },
);

const rtMissingLegArea = make(
  {
    formatId: 'rt-missing-leg-area',
    lessonId: RT,
    sourceStepId: 'q4-leg-then-area',
    label: 'Missing leg, then area',
  },
  (rng) => {
    const [a, b, c] = pick(PYTHAGOREAN_TRIPLES, rng);
    const area = (a * b) / 2;
    const basePrompt = `A right triangle has one leg of length ${a} and a hypotenuse of length ${c}. Find the missing leg, then the area.`;
    const step: LessonStep = {
      id: 'review-rt-missing-leg-area',
      type: 'multi-part-numeric',
      prompt: 'Find the missing leg, then the area.',
      triangle: { leg: a, hypotenuse: c },
      parts: [
        {
          id: 'leg',
          prompt: 'Find the missing leg.',
          answer: b,
          feedback: {
            wrong: 'Subtract the squares, then take the square root to get the missing leg.',
          },
        },
        {
          id: 'area',
          prompt: 'Now find the area of this triangle.',
          answer: area,
          feedback: {
            correct: `$\\frac{1}{2} \\times ${a} \\times ${b} = ${area}$`,
            wrong: 'Multiply the two legs, then divide by 2.',
          },
        },
      ],
    };
    return { step, params: { leg: a, hypotenuse: c }, basePrompt, answer: area };
  },
);

const nrtAreaBaseHeight = make(
  {
    formatId: 'nrt-area-base-height',
    lessonId: NRT,
    sourceStepId: 'q1-area-base-height',
    label: 'Area from base and height',
  },
  (rng) => {
    const base = randInt(rng, 4, 15);
    let height = randInt(rng, 3, 12);
    // Guarantee an integer area: make the product even.
    if ((base * height) % 2 !== 0) height += 1;
    const answer = (base * height) / 2;
    const basePrompt = `A triangle has base ${base} and height ${height}. What is its area?`;
    const step: LessonStep = {
      id: 'review-nrt-area-base-height',
      type: 'area-base-height',
      prompt: `A triangle has base $${base}$ and height $${height}$. What is its area?`,
      triangle: { base, height },
      answer,
      feedback: {
        correct: `$\\frac{1}{2} \\times ${base} \\times ${height} = ${answer}$`,
        wrong: 'Multiply the base by the height, then take half.',
        hint: 'Area $= \\frac{bh}{2}$. Do not omit the $\\frac{1}{2}$.',
      },
    };
    return { step, params: { base, height }, basePrompt, answer };
  },
);

const nrtDerivePerimeter = make(
  {
    formatId: 'nrt-derive-perimeter',
    lessonId: NRT,
    sourceStepId: 'q2-derive-perimeter',
    label: 'Perimeter from split base',
  },
  (rng) => {
    const cfg = pick(DERIVE_PERIMETER_CONFIGS, rng);
    const base = cfg.leftSplit + cfg.rightSplit;
    const answer = base + cfg.sides[0] + cfg.sides[1];
    const basePrompt = `A triangle has height ${cfg.height}. The altitude divides the base ${base} into segments of ${cfg.leftSplit} and ${cfg.rightSplit}. Find the perimeter.`;
    const step: LessonStep = {
      id: 'review-nrt-derive-perimeter',
      type: 'derive-perimeter',
      prompt: `The height of $${cfg.height}$ divides the base of $${base}$ into segments of $${cfg.leftSplit}$ and $${cfg.rightSplit}$, forming two right triangles. Find the perimeter of the triangle.`,
      triangle: {
        base,
        height: cfg.height,
        leftSplit: cfg.leftSplit,
        rightSplit: cfg.rightSplit,
        sides: [cfg.sides[0], cfg.sides[1]],
      },
      answer,
      feedback: {
        correct: `$${cfg.sides[0]} + ${cfg.sides[1]} + ${base} = ${answer}$`,
        wrong: 'Determine each oblique side first, then add all three sides.',
        hint: 'Each oblique side is the hypotenuse of a right triangle formed by the height and a base segment — find each with the Pythagorean theorem, then add all three sides.',
      },
    };
    return {
      step,
      params: {
        base,
        height: cfg.height,
        leftSplit: cfg.leftSplit,
        rightSplit: cfg.rightSplit,
      },
      basePrompt,
      answer,
    };
  },
);

const distTwoPoints = make(
  {
    formatId: 'dist-two-points',
    lessonId: DIST,
    reskinnable: false,
    sourceStepId: 'q1-distance',
    label: 'Distance between two points',
  },
  (rng) => {
    const [a, b, c] = pick(PYTHAGOREAN_TRIPLES, rng);
    const x1 = randInt(rng, 0, 4);
    const y1 = randInt(rng, 0, 4);
    const x2 = x1 + a;
    const y2 = y1 + b;
    const basePrompt = `Find the distance between the points (${x1}, ${y1}) and (${x2}, ${y2}).`;
    const step: LessonStep = {
      id: 'review-dist-two-points',
      type: 'distance-problem',
      prompt: 'Find the distance between the two points.',
      graph: {
        points: [
          { id: 'P', label: `P (${x1}, ${y1})`, x: x1, y: y1 },
          { id: 'Q', label: `Q (${x2}, ${y2})`, x: x2, y: y2, labelPos: 'bl' },
        ],
        segments: [
          { id: 'dx', from: 'P', to: 'Q', kind: 'dx', label: `\u0394x = ${a}` },
          { id: 'dy', from: 'P', to: 'Q', kind: 'dy', label: `\u0394y = ${b}` },
          { id: 'dist', from: 'P', to: 'Q', kind: 'dist', label: `D = ${c}` },
        ],
      },
      subSteps: [
        {
          id: 'distance',
          kind: 'numeric',
          prompt: `Find the distance between (${x1}, ${y1}) and (${x2}, ${y2}).`,
          answer: c,
          drawSegmentIds: ['dx', 'dy', 'dist'],
          feedback: {
            correct: `$\\Delta x = ${a}$, $\\Delta y = ${b}$, so $D = \\sqrt{${a}^2 + ${b}^2} = ${c}$.`,
            wrong: 'Find $\\Delta x$ and $\\Delta y$ first, then use $D = \\sqrt{\\Delta x^2 + \\Delta y^2}$.',
            hint: 'Find $\\Delta x$ and $\\Delta y$ from the coordinates, square each, add them, then take the square root.',
          },
        },
      ],
    };
    return { step, params: { x1, y1, x2, y2 }, basePrompt, answer: c };
  },
);

const distPerimeter = make(
  {
    formatId: 'dist-perimeter',
    lessonId: DIST,
    reskinnable: false,
    sourceStepId: 'q2-perimeter',
    label: 'Perimeter of a coordinate triangle',
  },
  (rng) => {
    const tri = pick(PERIMETER_TRIANGLES, rng);
    const [[ax, ay], [bx, by], [cx, cy]] = tri.vertices;
    const [s1, s2, s3] = tri.sides;
    const perimeter = tri.perimeter;
    const basePrompt = `A triangle has vertices A (${ax}, ${ay}), B (${bx}, ${by}), and C (${cx}, ${cy}). Find its perimeter.`;
    const step: LessonStep = {
      id: 'review-dist-perimeter',
      type: 'distance-problem',
      prompt: 'Find the perimeter of triangle ABC.',
      graph: {
        points: [
          { id: 'A', label: `A (${ax}, ${ay})`, x: ax, y: ay, labelPos: 'br' },
          { id: 'B', label: `B (${bx}, ${by})`, x: bx, y: by },
          { id: 'C', label: `C (${cx}, ${cy})`, x: cx, y: cy },
        ],
        segments: [
          { id: 'ab', from: 'A', to: 'B', kind: 'dist', label: `AB = ${s1}` },
          { id: 'bc', from: 'B', to: 'C', kind: 'dist', label: `BC = ${s2}` },
          { id: 'ca', from: 'C', to: 'A', kind: 'dist', label: `CA = ${s3}` },
        ],
      },
      subSteps: [
        {
          id: 'sides',
          kind: 'multi',
          prompt: `A triangle has vertices A (${ax}, ${ay}), B (${bx}, ${by}), and C (${cx}, ${cy}). Find the length of each side.`,
          inputs: [
            { id: 'ab', label: 'AB =', answer: s1 },
            { id: 'bc', label: 'BC =', answer: s2 },
            { id: 'ca', label: 'CA =', answer: s3 },
          ],
          drawSegmentIds: ['ab', 'bc', 'ca'],
          feedback: {
            wrong: 'Use $D = \\sqrt{\\Delta x^2 + \\Delta y^2}$ on each pair of vertices.',
            hint: 'For each side, find the horizontal and vertical change between its endpoints, then apply the distance formula.',
          },
        },
        {
          id: 'perimeter',
          kind: 'numeric',
          prompt: 'Now add the three side lengths to find the perimeter.',
          answer: perimeter,
          feedback: {
            correct: `$${s1} + ${s2} + ${s3} = ${perimeter}$ — the perimeter is the sum of all three sides.`,
            wrong: 'Add all three sides together.',
            hint: 'Add the three side lengths together.',
          },
        },
      ],
    };
    return {
      step,
      params: { ax, ay, bx, by, cx, cy },
      basePrompt,
      answer: perimeter,
    };
  },
);

// ---------------------------------------------------------------------------
// Transformations — single-coordinate rule drills (coordinate-rule steps)
// ---------------------------------------------------------------------------

const transformTranslate = make(
  {
    formatId: 'transform-translate',
    lessonId: TRANS,
    reskinnable: false,
    sourceStepId: 'q5-translate-point',
    label: 'Translate a point',
  },
  (rng) => {
    const x = randInt(rng, -6, 6);
    const y = randInt(rng, -6, 6);
    const dx = randInt(rng, -6, 6);
    const dy = randInt(rng, -6, 6);
    const answer = x + dx;
    const basePrompt = `The point (${x}, ${y}) is translated by the vector (${dx}, ${dy}). What is the x-coordinate of its image?`;
    const step: LessonStep = {
      id: 'review-transform-translate',
      type: 'coordinate-rule',
      prompt: basePrompt,
      answer,
      feedback: {
        correct: `Add the shift to the x-coordinate: $${x} + (${dx}) = ${answer}$.`,
        wrong: 'A translation adds the shift to each coordinate; add the x-shift to the x-coordinate.',
        hint: 'To translate, add the horizontal shift to the x-coordinate.',
      },
    };
    return { step, params: { x, y, dx, dy }, basePrompt, answer };
  },
);

const transformReflect = make(
  {
    formatId: 'transform-reflect',
    lessonId: TRANS,
    reskinnable: false,
    sourceStepId: 'q6-reflect-point',
    label: 'Reflect a point',
  },
  (rng) => {
    const x = randInt(rng, -6, 6);
    const y = randInt(rng, -6, 6);
    // Reflect across the y-axis: (x, y) -> (-x, y). Ask the new x-coordinate.
    const answer = -x;
    const basePrompt = `The point (${x}, ${y}) is reflected across the y-axis. What is the x-coordinate of its image?`;
    const step: LessonStep = {
      id: 'review-transform-reflect',
      type: 'coordinate-rule',
      prompt: basePrompt,
      answer,
      feedback: {
        correct: `Reflecting across the y-axis negates x: $(${x}, ${y}) \\rightarrow (${answer}, ${y})$.`,
        wrong: 'Reflecting across the y-axis keeps y the same and negates the x-coordinate.',
        hint: 'Across the y-axis, the x-coordinate changes sign and y stays put.',
      },
    };
    return { step, params: { x, y }, basePrompt, answer };
  },
);

const transformRotate = make(
  {
    formatId: 'transform-rotate',
    lessonId: TRANS,
    reskinnable: false,
    sourceStepId: 'q7-rotate-point',
    label: 'Rotate a point',
  },
  (rng) => {
    const x = randInt(rng, -6, 6);
    const y = randInt(rng, -6, 6);
    const degrees = pick([90, 180, 270] as const, rng);
    // Counterclockwise about the origin: 90 -> (-y, x), 180 -> (-x, -y),
    // 270 -> (y, -x). Ask the new x-coordinate.
    const answer = degrees === 90 ? -y : degrees === 180 ? -x : y;
    const basePrompt = `The point (${x}, ${y}) is rotated ${degrees} degrees counterclockwise about the origin. What is the x-coordinate of its image?`;
    const step: LessonStep = {
      id: 'review-transform-rotate',
      type: 'coordinate-rule',
      prompt: basePrompt,
      answer,
      feedback: {
        correct: `A ${degrees}-degree counterclockwise rotation sends the x-coordinate to ${answer}.`,
        wrong: 'Use the rotation rules: 90 maps (x, y) to (-y, x); 180 to (-x, -y); 270 to (y, -x).',
        hint: 'Apply the quarter-turn rule for the given angle, then read off the new x-coordinate.',
      },
    };
    return { step, params: { x, y, degrees }, basePrompt, answer };
  },
);

const transformDilate = make(
  {
    formatId: 'transform-dilate',
    lessonId: TRANS,
    reskinnable: false,
    sourceStepId: 'q8-dilate-point',
    label: 'Dilate a point',
  },
  (rng) => {
    const x = randInt(rng, -6, 6);
    const y = randInt(rng, -6, 6);
    const k = randInt(rng, 2, 5);
    const answer = k * x;
    const basePrompt = `The point (${x}, ${y}) is dilated by a factor of ${k} from the origin. What is the x-coordinate of its image?`;
    const step: LessonStep = {
      id: 'review-transform-dilate',
      type: 'coordinate-rule',
      prompt: basePrompt,
      answer,
      feedback: {
        correct: `Multiply the x-coordinate by the scale factor: $${k} \\times ${x} = ${answer}$.`,
        wrong: 'A dilation from the origin multiplies each coordinate by the scale factor.',
        hint: 'Multiply the x-coordinate by the scale factor.',
      },
    };
    return { step, params: { x, y, k }, basePrompt, answer };
  },
);

// ---------------------------------------------------------------------------
// Congruence & similarity — single-answer drills (coordinate-rule steps)
// ---------------------------------------------------------------------------

const csSideLength = make(
  {
    formatId: 'cs-side-length',
    lessonId: CS,
    sourceStepId: 'q5-side-length',
    label: 'Find a side length',
  },
  (rng) => {
    const [a, b, c] = pick(PYTHAGOREAN_TRIPLES, rng);
    const answer = c;
    const basePrompt = `A right triangle has legs of length ${a} and ${b}. How long is its hypotenuse?`;
    const step: LessonStep = {
      id: 'review-cs-side-length',
      type: 'coordinate-rule',
      prompt: basePrompt,
      answer,
      feedback: {
        correct: `By the Pythagorean theorem, $\\sqrt{${a}^2 + ${b}^2} = ${c}$.`,
        wrong: 'Square each leg, add them, then take the square root.',
        hint: 'Use $c = \\sqrt{a^2 + b^2}$ with the two given legs.',
      },
    };
    return { step, params: { a, b }, basePrompt, answer };
  },
);

const csScaleRatio = make(
  {
    formatId: 'cs-scale-ratio',
    lessonId: CS,
    sourceStepId: 'q6-scale-ratio',
    label: 'Find the scale ratio',
  },
  (rng) => {
    const small = randInt(rng, 2, 9);
    const k = randInt(rng, 2, 5);
    const large = small * k;
    const answer = k;
    const basePrompt = `Two similar figures have corresponding sides of length ${small} and ${large}. The larger figure is a scaled copy of the smaller. What is the scale factor?`;
    const step: LessonStep = {
      id: 'review-cs-scale-ratio',
      type: 'coordinate-rule',
      prompt: basePrompt,
      answer,
      feedback: {
        correct: `Divide the larger side by the smaller: $${large} \\div ${small} = ${k}$.`,
        wrong: 'Divide a side of the larger figure by the corresponding side of the smaller figure.',
        hint: 'The scale factor is the larger side divided by the smaller side.',
      },
    };
    return { step, params: { small, large }, basePrompt, answer };
  },
);

export const REVIEW_FORMATS: QuestionFormat[] = [
  rtHypotenuse,
  rtArea,
  rtMissingLegPerimeter,
  rtMissingLegArea,
  nrtAreaBaseHeight,
  nrtDerivePerimeter,
  distTwoPoints,
  distPerimeter,
  transformTranslate,
  transformReflect,
  transformRotate,
  transformDilate,
  csSideLength,
  csScaleRatio,
];

/**
 * Find the question format that randomizes a given lesson "You do" step, or
 * `undefined` if that step has no generator (it stays static in the lesson).
 */
export function getFormatForStep(
  lessonId: string,
  stepId: string,
): QuestionFormat | undefined {
  return REVIEW_FORMATS.find(
    (f) => f.lessonId === lessonId && f.sourceStepId === stepId,
  );
}
