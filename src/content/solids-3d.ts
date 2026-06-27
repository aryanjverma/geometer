import type { Lesson, LessonStep } from '@/types/lesson';

/** `tag` labels the I do / We do / You do phase; not part of the shared type. */
type AuthoredStep = LessonStep & { tag?: 'I do' | 'We do' | 'You do' };

const steps: AuthoredStep[] = [
  {
    id: 'intro',
    type: 'transition',
    prompt:
      'Welcome to the lesson on circular solids! Today we measure the volume of cylinders, cones, and spheres, and we apply the Pythagorean theorem to recover a hidden dimension of a cone. Watch me work the first example.',
    transition: { emoji: '\u{1F6E2}', cta: "Let's begin" },
  },
  {
    id: 'demo-cylinder',
    type: 'demonstration',
    tag: 'I do',
    prompt:
      'Watch me find the volume of a cylinder with radius $3$ cm and height $4$ cm, reported as a coefficient of $\\pi$.',
    solid: {
      kind: 'cylinder',
      radius: 3,
      height: 4,
      unit: 'cm',
      labels: [
        { at: 'r', text: '3' },
        { at: 'h', text: '4' },
      ],
    },
    demo: {
      intro:
        'A cylinder is a circular base extended vertically through its height. Its volume is the area of that circular base multiplied by the height.',
      reveals: [
        {
          label: 'Step 1 \u2014 Recall the formula',
          formula: '$V = \\pi r^2 h$',
          body: 'The base is a circle of area $\\pi r^2$, and the cylinder stacks that base up through the height $h$, so $V = \\pi r^2 h$.',
        },
        {
          label: 'Step 2 \u2014 Read the dimensions',
          body: 'From the figure the radius is $r = 3$ and the height is $h = 4$.',
        },
        {
          label: 'Step 3 \u2014 Compute the coefficient of $\\pi$',
          body: 'Multiplying $r^2 h = 3^2 \\times 4 = 36$, so the volume is $36\\pi$ cubic centimeters.',
        },
      ],
    },
  },
  {
    id: 'transition-wedo',
    type: 'transition',
    prompt: "Now let's measure one together.",
    transition: { emoji: '\u{1F60A}', cta: "Let's do it" },
  },
  {
    id: 'guided-cylinder',
    type: 'guided',
    tag: 'We do',
    prompt:
      'A cylindrical water tank has a radius of $5$ cm and a height of $4$ cm. Let us find its volume together, expressed as a multiple of $\\pi$.',
    solid: {
      kind: 'cylinder',
      radius: 5,
      height: 4,
      unit: 'cm',
      labels: [
        { at: 'r', text: '5' },
        { at: 'h', text: '4' },
      ],
    },
    guided: [
      {
        id: 'dimensions',
        prompt: 'First, record the radius and the height of the tank.',
        inputs: [
          { id: 'r', label: 'radius =', answer: 5 },
          { id: 'h', label: 'height =', answer: 4 },
        ],
        feedback: {
          hint: 'Read the two labeled lengths directly from the figure.',
          correct: 'The radius is $5$ and the height is $4$.',
        },
      },
      {
        id: 'coefficient',
        prompt:
          'Apply $V = \\pi r^2 h$. Multiplying $r^2 h$ gives the coefficient of $\\pi$. What is that whole number?',
        answer: 100,
        feedback: {
          correct:
            'Since $r^2 h = 5^2 \\times 4 = 100$, the volume is $100\\pi$ cubic centimeters.',
          wrong: 'Compute $5^2 \\times 4$ to find the coefficient of $\\pi$.',
          hint: 'Square the radius, then multiply by the height.',
        },
      },
    ],
  },
  {
    id: 'demo-cone',
    type: 'demonstration',
    tag: 'I do',
    prompt:
      'Watch me slice a cone open to recover its radius with the Pythagorean theorem, then find its volume as a coefficient of $\\pi$.',
    solid: {
      kind: 'cone',
      radius: 6,
      height: 8,
      slant: 10,
      unit: 'cm',
      labels: [
        { at: 'r', text: '6' },
        { at: 'h', text: '8' },
        { at: 'l', text: '10' },
      ],
    },
    demo: {
      interactive: 'slice-cone',
      intro:
        'A cone hides a right triangle inside it. Slice it down the middle to expose that triangle, recover the radius, and then apply the cone volume formula.',
      reveals: [
        {
          label: 'Step 1 \u2014 Slice to expose the right triangle',
          body: 'A vertical cut through the apex and the center of the base exposes a right triangle whose legs are the radius $r$ and the height $h$ and whose hypotenuse is the slant height $l$.',
        },
        {
          label: 'Step 2 \u2014 Recover the radius',
          formula: '$r = \\sqrt{l^2 - h^2}$',
          body: 'By the Pythagorean theorem $l^2 = r^2 + h^2$, so $r = \\sqrt{10^2 - 8^2} = \\sqrt{36} = 6$ cm.',
        },
        {
          label: 'Step 3 \u2014 Recall the cone volume formula',
          formula: '$V = \\frac{1}{3}\\pi r^2 h$',
          body: 'A cone fills one third of the cylinder with the same base and height, so $V = \\frac{1}{3}\\pi r^2 h$.',
        },
        {
          label: 'Step 4 \u2014 Compute the coefficient of $\\pi$',
          body: 'With $r = 6$ and $h = 8$, the coefficient is $\\frac{r^2 h}{3} = \\frac{6^2 \\times 8}{3} = 96$, so the volume is $96\\pi$ cubic centimeters.',
        },
      ],
    },
  },
  {
    id: 'guided-cone',
    type: 'guided',
    tag: 'We do',
    prompt:
      'A cone has a radius of $3$ cm and a height of $4$ cm. Let us find its volume together, expressed as a multiple of $\\pi$.',
    solid: {
      kind: 'cone',
      radius: 3,
      height: 4,
      unit: 'cm',
      labels: [
        { at: 'r', text: '3' },
        { at: 'h', text: '4' },
      ],
    },
    guided: [
      {
        id: 'dimensions',
        prompt: 'First, record the radius and the height of the cone.',
        inputs: [
          { id: 'r', label: 'radius =', answer: 3 },
          { id: 'h', label: 'height =', answer: 4 },
        ],
        feedback: {
          hint: 'Read the two labeled lengths directly from the figure.',
          correct: 'The radius is $3$ and the height is $4$.',
        },
      },
      {
        id: 'coefficient',
        prompt:
          'Apply $V = \\frac{1}{3}\\pi r^2 h$. Dividing $r^2 h$ by $3$ gives the coefficient of $\\pi$. What is that whole number?',
        answer: 12,
        feedback: {
          correct:
            'Since $\\frac{r^2 h}{3} = \\frac{3^2 \\times 4}{3} = 12$, the volume is $12\\pi$ cubic centimeters.',
          wrong: 'Compute $\\frac{3^2 \\times 4}{3}$ to find the coefficient of $\\pi$.',
          hint: 'Square the radius, multiply by the height, then divide by $3$.',
        },
      },
    ],
  },
  {
    id: 'demo-sphere',
    type: 'demonstration',
    tag: 'I do',
    prompt:
      'Watch me find the volume of a sphere with radius $3$ cm, reported as a coefficient of $\\pi$.',
    solid: {
      kind: 'sphere',
      radius: 3,
      unit: 'cm',
      labels: [{ at: 'r', text: '3' }],
    },
    demo: {
      intro:
        'A sphere has a single dimension, its radius. Its volume grows with the cube of that radius.',
      reveals: [
        {
          label: 'Step 1 \u2014 Recall the formula',
          formula: '$V = \\frac{4}{3}\\pi r^3$',
          body: 'The volume of a sphere is $V = \\frac{4}{3}\\pi r^3$, so the coefficient of $\\pi$ is $\\frac{4 r^3}{3}$.',
        },
        {
          label: 'Step 2 \u2014 Read the radius',
          body: 'From the figure the radius is $r = 3$.',
        },
        {
          label: 'Step 3 \u2014 Compute the coefficient of $\\pi$',
          body: 'Evaluating $\\frac{4 r^3}{3} = \\frac{4 \\times 3^3}{3} = 36$, so the volume is $36\\pi$ cubic centimeters.',
        },
      ],
    },
  },
  {
    id: 'guided-sphere',
    type: 'guided',
    tag: 'We do',
    prompt:
      'A sphere has a radius of $6$ cm. Let us find its volume together, expressed as a multiple of $\\pi$.',
    solid: {
      kind: 'sphere',
      radius: 6,
      unit: 'cm',
      labels: [{ at: 'r', text: '6' }],
    },
    guided: [
      {
        id: 'radius',
        prompt: 'First, record the radius of the sphere.',
        answer: 6,
        feedback: {
          hint: 'Read the labeled length directly from the figure.',
          correct: 'The radius is $6$.',
        },
      },
      {
        id: 'coefficient',
        prompt:
          'Apply $V = \\frac{4}{3}\\pi r^3$. Evaluating $\\frac{4 r^3}{3}$ gives the coefficient of $\\pi$. What is that whole number?',
        answer: 288,
        feedback: {
          correct:
            'Since $\\frac{4 r^3}{3} = \\frac{4 \\times 6^3}{3} = 288$, the volume is $288\\pi$ cubic centimeters.',
          wrong: 'Compute $\\frac{4 \\times 6^3}{3}$ to find the coefficient of $\\pi$.',
          hint: 'Cube the radius, multiply by $4$, then divide by $3$.',
        },
      },
    ],
  },
  {
    id: 'transition-youdo',
    type: 'transition',
    prompt:
      'Your turn! Solve four problems: three volumes reported as a coefficient of $\\pi$, and one cone where you recover the radius from a slice and then find its volume.',
    transition: { emoji: '\u{1F4AA}', cta: "I'm ready" },
  },
  {
    id: 'q1-cylinder-volume',
    type: 'solid-volume',
    tag: 'You do',
    prompt:
      'A coffee thermos is a cylinder with radius $4$ cm and height $5$ cm. Its volume is how many cubic centimeters of $\\pi$? (Give the whole number multiplied by $\\pi$.)',
    solid: {
      kind: 'cylinder',
      radius: 4,
      height: 5,
      unit: 'cm',
      labels: [
        { at: 'r', text: '4' },
        { at: 'h', text: '5' },
      ],
    },
    answer: 80,
    feedback: {
      correct:
        'Using $V = \\pi r^2 h = \\pi \\times 4^2 \\times 5$, the volume is $80\\pi$ cubic centimeters.',
      wrong: 'Compute $r^2 h = 4^2 \\times 5$ to find the coefficient of $\\pi$.',
      hint: 'For a cylinder, $V = \\pi r^2 h$; the coefficient of $\\pi$ is $r^2 h$.',
    },
  },
  {
    id: 'q2-cone-volume',
    type: 'solid-volume',
    tag: 'You do',
    prompt:
      'A party hat is a cone with radius $3$ cm and height $7$ cm. Its volume is how many cubic centimeters of $\\pi$? (Give the whole number multiplied by $\\pi$.)',
    solid: {
      kind: 'cone',
      radius: 3,
      height: 7,
      unit: 'cm',
      labels: [
        { at: 'r', text: '3' },
        { at: 'h', text: '7' },
      ],
    },
    answer: 21,
    feedback: {
      correct:
        'Using $V = \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi \\times 3^2 \\times 7$, the volume is $21\\pi$ cubic centimeters.',
      wrong: 'Compute $\\frac{r^2 h}{3} = \\frac{3^2 \\times 7}{3}$ to find the coefficient of $\\pi$.',
      hint: 'For a cone, $V = \\frac{1}{3}\\pi r^2 h$; the coefficient of $\\pi$ is $\\frac{r^2 h}{3}$.',
    },
  },
  {
    id: 'q3-sphere',
    type: 'solid-volume',
    tag: 'You do',
    prompt:
      'A marble is a sphere with radius $3$ cm. Its volume is how many cubic centimeters of $\\pi$? (Give the whole number multiplied by $\\pi$.)',
    solid: {
      kind: 'sphere',
      radius: 3,
      unit: 'cm',
      labels: [{ at: 'r', text: '3' }],
    },
    answer: 36,
    feedback: {
      correct:
        'Using $V = \\frac{4}{3}\\pi r^3 = \\frac{4}{3}\\pi \\times 3^3$, the volume is $36\\pi$ cubic centimeters.',
      wrong: 'Compute $\\frac{4 r^3}{3} = \\frac{4 \\times 3^3}{3}$ to find the coefficient of $\\pi$.',
      hint: 'For a sphere, $V = \\frac{4}{3}\\pi r^3$; the coefficient of $\\pi$ is $\\frac{4 r^3}{3}$.',
    },
  },
  {
    id: 'q4-cone-radius-volume',
    type: 'cone-radius-volume',
    tag: 'You do',
    prompt:
      'An ice cream cone has height $8$ cm and slant height $10$ cm. First slice it to recover the radius of its circular opening, then find the cone volume as a coefficient of $\\pi$.',
    solid: {
      kind: 'cone',
      height: 8,
      slant: 10,
      unit: 'cm',
      labels: [
        { at: 'r', text: '?' },
        { at: 'h', text: '8' },
        { at: 'l', text: '10' },
      ],
    },
    answer: 6,
    volumeAnswer: 96,
    feedback: {
      correct:
        'Slicing gives $r = \\sqrt{l^2 - h^2} = \\sqrt{10^2 - 8^2} = 6$ cm, so $V = \\frac{1}{3}\\pi r^2 h = \\frac{6^2 \\times 8}{3}\\pi = 96\\pi$ cubic centimeters.',
      wrong: 'Use $r = \\sqrt{l^2 - h^2}$ with the slant height and the height.',
      hint: 'The slice exposes a right triangle, so $r^2 + h^2 = l^2$; solve for $r$.',
    },
  },
];

export const solids3dLesson: Lesson = {
  lessonId: 'solids-3d',
  title: 'Circular 3D Shapes',
  steps,
};
