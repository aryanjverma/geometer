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
const AL = 'angles-lines';
const TA = 'triangle-angles';
const S3 = 'solids-3d';

/**
 * Curated cone (radius, height) pairs whose volume coefficient r^2*h/3 is a
 * whole number, so the pi-coefficient answer stays an exact integer.
 */
export const CONE_VOLUME_CONFIGS: ReadonlyArray<{ r: number; h: number }> = [
  { r: 3, h: 7 },
  { r: 3, h: 5 },
  { r: 3, h: 4 },
  { r: 3, h: 8 },
  { r: 6, h: 2 },
  { r: 6, h: 4 },
];

/** Sphere radii whose volume coefficient 4*r^3/3 is a whole number. */
export const SPHERE_VOLUME_RADII: ReadonlyArray<number> = [3, 6];

export const YOU_DO_STEPS: Record<string, string[]> = {
  [RT]: ['q1-hypotenuse', 'q2-area', 'q3-leg-then-perimeter', 'q4-leg-then-area'],
  [NRT]: ['q1-area-base-height', 'q2-derive-perimeter', 'q4-perimeter-from-area'],
  [DIST]: ['q1-distance', 'q2-perimeter', 'q3-right-triangle', 'q4-journey'],
  [TRANS]: ['q5-translate-point', 'q6-reflect-point', 'q7-rotate-point', 'q8-dilate-point'],
  [CS]: ['q5-side-length', 'q6-scale-ratio'],
  [AL]: ['q1-vertical-angles', 'q2-linear-pair', 'q3-corresponding-angle', 'q4-missing-angle'],
  [TA]: ['q1-exterior-sum', 'q2-remote-interior', 'q3-parallel-triangle', 'q4-parallel-triangle-x'],
  [S3]: ['q1-cylinder-volume', 'q2-cone-volume', 'q3-sphere', 'q4-cone-radius-volume'],
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

// ---------------------------------------------------------------------------
// Angles and lines — find-angle drills (integer degrees)
// ---------------------------------------------------------------------------

const alVerticalAngles = make(
  {
    formatId: 'al-vertical-angles',
    lessonId: AL,
    reskinnable: false,
    sourceStepId: 'q1-vertical-angles',
    label: 'Vertical angles',
  },
  (rng) => {
    const given = randInt(rng, 20, 160);
    const basePrompt = `Two lines cross. One angle measures ${given} degrees. Use the Vertical Angles Theorem to find the angle directly opposite it.`;
    const step: LessonStep = {
      id: 'review-al-vertical-angles',
      type: 'find-angle',
      prompt: basePrompt,
      angleFigure: {
        kind: 'parallel-lines',
        baseAngle: 50,
        labels: [
          { at: 't1', text: String(given), offset: { dx: -8, dy: 8 } },
          { at: 't3', text: '?', highlight: true, offset: { dx: 7 } },
        ],
      },
      answer: given,
      feedback: {
        correct: `Vertical angles are equal, so the angle is $${given}^\\circ$.`,
        wrong: 'Angles directly opposite each other at a crossing are equal.',
        hint: 'The unknown angle is vertical to the given one, so it has the same measure.',
      },
    };
    return { step, params: { given }, basePrompt, answer: given };
  },
);

const alLinearPair = make(
  {
    formatId: 'al-linear-pair',
    lessonId: AL,
    reskinnable: false,
    sourceStepId: 'q2-linear-pair',
    label: 'Linear pair',
  },
  (rng) => {
    const given = randInt(rng, 20, 160);
    const answer = 180 - given;
    const basePrompt = `Two angles form a linear pair on a straight line. One measures ${given} degrees. Find the other angle.`;
    const step: LessonStep = {
      id: 'review-al-linear-pair',
      type: 'find-angle',
      prompt: basePrompt,
      angleFigure: {
        kind: 'parallel-lines',
        baseAngle: 60,
        labels: [
          { at: 't1', text: String(given) },
          { at: 't2', text: '?', highlight: true },
        ],
      },
      answer,
      feedback: {
        correct: `A linear pair is supplementary, so $180 - ${given} = ${answer}$.`,
        wrong: 'The two angles lie on one line, so they add to $180^\\circ$.',
        hint: 'Subtract the given angle from $180^\\circ$.',
      },
    };
    return { step, params: { given }, basePrompt, answer };
  },
);

const alCorresponding = make(
  {
    formatId: 'al-corresponding-angle',
    lessonId: AL,
    reskinnable: false,
    sourceStepId: 'q3-corresponding-angle',
    label: 'Corresponding angles',
  },
  (rng) => {
    const given = randInt(rng, 20, 160);
    const basePrompt = `Two parallel lines are cut by a transversal. A corresponding angle at the upper crossing measures ${given} degrees. Find its corresponding angle at the lower crossing.`;
    const step: LessonStep = {
      id: 'review-al-corresponding-angle',
      type: 'find-angle',
      prompt: basePrompt,
      angleFigure: {
        kind: 'parallel-lines',
        baseAngle: 55,
        labels: [
          { at: 't1', text: String(given) },
          { at: 'b1', text: '?', highlight: true },
        ],
      },
      answer: given,
      feedback: {
        correct: `Corresponding angles across parallel lines are equal, so the angle is $${given}^\\circ$.`,
        wrong: 'Corresponding angles occupy the same position at each crossing and are equal.',
        hint: 'Both angles are upper-left at their crossings, so they match.',
      },
    };
    return { step, params: { given }, basePrompt, answer: given };
  },
);

const alMissingAngle = make(
  {
    formatId: 'al-missing-angle',
    lessonId: AL,
    reskinnable: false,
    sourceStepId: 'q4-missing-angle',
    label: 'Combined missing angle',
  },
  (rng) => {
    const given = randInt(rng, 20, 160);
    const answer = 180 - given;
    const basePrompt = `Two parallel lines are cut by a transversal. An upper-left angle measures ${given} degrees. Find the lower-right angle, which is the supplement carried down by corresponding angles.`;
    const step: LessonStep = {
      id: 'review-al-missing-angle',
      type: 'find-angle',
      prompt: basePrompt,
      angleFigure: {
        kind: 'parallel-lines',
        baseAngle: 65,
        labels: [
          { at: 't1', text: String(given) },
          { at: 'b2', text: '?', highlight: true },
        ],
      },
      answer,
      feedback: {
        correct: `The upper-right angle is $180 - ${given} = ${answer}$ by a linear pair, and its corresponding angle below matches.`,
        wrong: 'Take the supplement of the given angle, then carry it down with corresponding angles.',
        hint: 'Find the supplement first, then apply the Corresponding Angles Postulate.',
      },
    };
    return { step, params: { given }, basePrompt, answer };
  },
);

// ---------------------------------------------------------------------------
// Triangle angles — exterior angle + parallel-line drills (integer degrees)
// ---------------------------------------------------------------------------

const taExteriorSum = make(
  {
    formatId: 'ta-exterior-sum',
    lessonId: TA,
    reskinnable: false,
    sourceStepId: 'q1-exterior-sum',
    label: 'Exterior angle from remote interiors',
  },
  (rng) => {
    const a = randInt(rng, 20, 80);
    const b = randInt(rng, 20, 80);
    const answer = a + b;
    const basePrompt = `The base of a triangle is extended to form an exterior angle. The two remote interior angles measure ${a} degrees and ${b} degrees. Find the exterior angle.`;
    const step: LessonStep = {
      id: 'review-ta-exterior-sum',
      type: 'triangle-angle',
      prompt: basePrompt,
      angleFigure: {
        kind: 'exterior-triangle',
        baseAngle: 55,
        labels: [
          { at: 'A', text: `$${a}^\\circ$` },
          { at: 'B', text: `$${b}^\\circ$` },
          { at: 'ext', text: '?', highlight: true },
        ],
      },
      answer,
      feedback: {
        correct: `$${a}^\\circ + ${b}^\\circ = ${answer}^\\circ$`,
        wrong: 'The exterior angle equals the sum of the two remote interior angles.',
        hint: 'Add the two remote interior angles.',
      },
    };
    return { step, params: { a, b }, basePrompt, answer };
  },
);

const taRemoteInterior = make(
  {
    formatId: 'ta-remote-interior',
    lessonId: TA,
    reskinnable: false,
    sourceStepId: 'q2-remote-interior',
    label: 'Remote interior from exterior',
  },
  (rng) => {
    const ext = randInt(rng, 70, 150);
    const b = randInt(rng, 20, ext - 20);
    const answer = ext - b;
    const basePrompt = `An exterior angle of a triangle measures ${ext} degrees. One remote interior angle measures ${b} degrees. Find the other remote interior angle.`;
    const step: LessonStep = {
      id: 'review-ta-remote-interior',
      type: 'triangle-angle',
      prompt: basePrompt,
      angleFigure: {
        kind: 'exterior-triangle',
        baseAngle: 55,
        labels: [
          { at: 'A', text: '?', highlight: true },
          { at: 'B', text: `$${b}^\\circ$` },
          { at: 'ext', text: `$${ext}^\\circ$` },
        ],
      },
      answer,
      feedback: {
        correct: `$${ext}^\\circ - ${b}^\\circ = ${answer}^\\circ$`,
        wrong: 'Subtract the known remote interior angle from the exterior angle.',
        hint: 'The exterior angle equals the sum of the two remote interior angles.',
      },
    };
    return { step, params: { ext, b }, basePrompt, answer };
  },
);

const taParallelTriangle = make(
  {
    formatId: 'ta-parallel-triangle',
    lessonId: TA,
    reskinnable: false,
    sourceStepId: 'q3-parallel-triangle',
    label: 'Parallel lines with a triangle',
  },
  (rng) => {
    const a = randInt(rng, 30, 70);
    const b = randInt(rng, 30, 70);
    const answer = 180 - a - b;
    const basePrompt = `A ray through one vertex is parallel to the opposite side, which gives a triangle angle of ${b} degrees. With another interior angle equal to ${a} degrees, find the third interior angle.`;
    const step: LessonStep = {
      id: 'review-ta-parallel-triangle',
      type: 'triangle-angle',
      prompt: basePrompt,
      angleFigure: {
        kind: 'exterior-triangle',
        baseAngle: 55,
        labels: [
          { at: 'A', text: `$${a}^\\circ$` },
          { at: 'B', text: `$${b}^\\circ$` },
          { at: 'C', text: '?', highlight: true },
        ],
      },
      answer,
      feedback: {
        correct: `The interior angles sum to $180^\\circ$, so $180 - ${a} - ${b} = ${answer}$.`,
        wrong: 'Use the parallel ray to find the second angle, then apply the triangle angle sum.',
        hint: 'The three interior angles of a triangle sum to $180^\\circ$.',
      },
    };
    return { step, params: { a, b }, basePrompt, answer };
  },
);

const taParallelTriangleX = make(
  {
    formatId: 'ta-parallel-triangle-x',
    lessonId: TA,
    reskinnable: false,
    sourceStepId: 'q4-parallel-triangle-x',
    label: 'Combined angle in a triangle',
  },
  (rng) => {
    const ext = randInt(rng, 80, 150);
    const b = randInt(rng, 20, ext - 30);
    const answer = ext - b;
    const basePrompt = `A ray parallel to one side makes a corresponding angle of ${b} degrees, equal to one interior angle. The base is extended to form an exterior angle of ${ext} degrees. Find the remaining remote interior angle.`;
    const step: LessonStep = {
      id: 'review-ta-parallel-triangle-x',
      type: 'triangle-angle',
      prompt: basePrompt,
      angleFigure: {
        kind: 'exterior-triangle',
        baseAngle: 55,
        labels: [
          { at: 'A', text: '?', highlight: true },
          { at: 'B', text: `$${b}^\\circ$` },
          { at: 'ext', text: `$${ext}^\\circ$` },
        ],
      },
      answer,
      feedback: {
        correct: `The corresponding angle gives one remote interior of $${b}^\\circ$, so $${ext} - ${b} = ${answer}$.`,
        wrong: 'Find the known remote interior from the corresponding angle, then subtract it from the exterior angle.',
        hint: 'The exterior angle equals the sum of the two remote interior angles.',
      },
    };
    return { step, params: { ext, b }, basePrompt, answer };
  },
);

// ---------------------------------------------------------------------------
// Circular 3D solids — volume (pi-coefficient) + cone radius drills
// ---------------------------------------------------------------------------

const s3CylinderVolume = make(
  {
    formatId: 's3-cylinder-volume',
    lessonId: S3,
    reskinnable: false,
    sourceStepId: 'q1-cylinder-volume',
    label: 'Volume of a cylinder',
  },
  (rng) => {
    const radius = randInt(rng, 2, 6);
    const height = randInt(rng, 2, 8);
    const answer = radius * radius * height;
    const basePrompt = `A cylinder has radius ${radius} cm and height ${height} cm. Its volume is how many cubic centimeters of pi? (Give the whole number multiplied by pi.)`;
    const step: LessonStep = {
      id: 'review-s3-cylinder-volume',
      type: 'solid-volume',
      prompt: basePrompt,
      solid: {
        kind: 'cylinder',
        radius,
        height,
        unit: 'cm',
        labels: [
          { at: 'r', text: String(radius) },
          { at: 'h', text: String(height) },
        ],
      },
      answer,
      feedback: {
        correct: `$V = \\pi r^2 h = \\pi \\times ${radius}^2 \\times ${height} = ${answer}\\pi$ cubic centimeters.`,
        wrong: 'Compute $r^2 h$ to find the coefficient of $\\pi$.',
        hint: 'For a cylinder, $V = \\pi r^2 h$; the coefficient of $\\pi$ is $r^2 h$.',
      },
    };
    return { step, params: { radius, height }, basePrompt, answer };
  },
);

const s3ConeVolume = make(
  {
    formatId: 's3-cone-volume',
    lessonId: S3,
    reskinnable: false,
    sourceStepId: 'q2-cone-volume',
    label: 'Volume of a cone',
  },
  (rng) => {
    const { r: radius, h: height } = pick(CONE_VOLUME_CONFIGS, rng);
    const answer = (radius * radius * height) / 3;
    const basePrompt = `A cone has radius ${radius} cm and height ${height} cm. Its volume is how many cubic centimeters of pi? (Give the whole number multiplied by pi.)`;
    const step: LessonStep = {
      id: 'review-s3-cone-volume',
      type: 'solid-volume',
      prompt: basePrompt,
      solid: {
        kind: 'cone',
        radius,
        height,
        unit: 'cm',
        labels: [
          { at: 'r', text: String(radius) },
          { at: 'h', text: String(height) },
        ],
      },
      answer,
      feedback: {
        correct: `$V = \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi \\times ${radius}^2 \\times ${height} = ${answer}\\pi$ cubic centimeters.`,
        wrong: 'Compute $\\frac{r^2 h}{3}$ to find the coefficient of $\\pi$.',
        hint: 'For a cone, $V = \\frac{1}{3}\\pi r^2 h$; the coefficient of $\\pi$ is $\\frac{r^2 h}{3}$.',
      },
    };
    return { step, params: { radius, height }, basePrompt, answer };
  },
);

const s3Sphere = make(
  {
    formatId: 's3-sphere',
    lessonId: S3,
    reskinnable: false,
    sourceStepId: 'q3-sphere',
    label: 'Volume of a sphere',
  },
  (rng) => {
    const radius = pick(SPHERE_VOLUME_RADII, rng);
    const answer = (4 * radius * radius * radius) / 3;
    const basePrompt = `A sphere has radius ${radius} cm. Its volume is how many cubic centimeters of pi? (Give the whole number multiplied by pi.)`;
    const step: LessonStep = {
      id: 'review-s3-sphere',
      type: 'solid-volume',
      prompt: basePrompt,
      solid: {
        kind: 'sphere',
        radius,
        unit: 'cm',
        labels: [{ at: 'r', text: String(radius) }],
      },
      answer,
      feedback: {
        correct: `$V = \\frac{4}{3}\\pi r^3 = \\frac{4}{3}\\pi \\times ${radius}^3 = ${answer}\\pi$ cubic centimeters.`,
        wrong: 'Compute $\\frac{4 r^3}{3}$ to find the coefficient of $\\pi$.',
        hint: 'For a sphere, $V = \\frac{4}{3}\\pi r^3$; the coefficient of $\\pi$ is $\\frac{4 r^3}{3}$.',
      },
    };
    return { step, params: { radius }, basePrompt, answer };
  },
);

const s3ConeRadius = make(
  {
    formatId: 's3-cone-radius',
    lessonId: S3,
    reskinnable: false,
    sourceStepId: 'q4-cone-radius-volume',
    label: 'Cone radius from a slice',
  },
  (rng) => {
    const [a, b, c] = pick(PYTHAGOREAN_TRIPLES, rng);
    const radius = a;
    const height = b;
    const slant = c;
    const basePrompt = `A cone has height ${height} cm and slant height ${slant} cm. Slice it to reveal the right triangle, then find the radius of its circular base.`;
    const step: LessonStep = {
      id: 'review-s3-cone-radius',
      type: 'cone-radius-slice',
      prompt: basePrompt,
      solid: {
        kind: 'cone',
        height,
        slant,
        unit: 'cm',
        labels: [
          { at: 'r', text: '?' },
          { at: 'h', text: String(height) },
          { at: 'l', text: String(slant) },
        ],
      },
      answer: radius,
      feedback: {
        correct: `$r = \\sqrt{l^2 - h^2} = \\sqrt{${slant}^2 - ${height}^2} = ${radius}$ cm.`,
        wrong: 'Use $r = \\sqrt{l^2 - h^2}$ with the slant height and the height.',
        hint: 'The slice exposes a right triangle, so $r^2 + h^2 = l^2$; solve for $r$.',
      },
    };
    return { step, params: { height, slant }, basePrompt, answer: radius };
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
  alVerticalAngles,
  alLinearPair,
  alCorresponding,
  alMissingAngle,
  taExteriorSum,
  taRemoteInterior,
  taParallelTriangle,
  taParallelTriangleX,
  s3CylinderVolume,
  s3ConeVolume,
  s3Sphere,
  s3ConeRadius,
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
