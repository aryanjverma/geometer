import type { Lesson, LessonStep } from '@/types/lesson';

/** `tag` labels the I do / We do / You do phase; not part of the shared type. */
type AuthoredStep = LessonStep & { tag?: 'I do' | 'We do' | 'You do' };

const steps: AuthoredStep[] = [
  {
    id: 'intro',
    type: 'transition',
    prompt:
      'Welcome to lesson 8! Today we combine lines and angles with triangles. We will prove and then apply the Triangle Exterior Angle Theorem, which says an exterior angle of a triangle equals the sum of its two remote interior angles. Watch me build the proof first.',
    transition: { emoji: '\u{1F4D0}', cta: "Let's begin" },
  },
  {
    id: 'demo-exterior',
    type: 'demonstration',
    tag: 'I do',
    prompt:
      'Why does an exterior angle of a triangle equal the sum of the two remote interior angles? I will prove it with a parallel ray.',
    angleFigure: {
      kind: 'exterior-triangle',
      baseAngle: 55,
      labels: [
        { at: 'A', text: '$A$' },
        { at: 'B', text: '$B$' },
        { at: 'C', text: '$C$' },
        { at: 'ext', text: '$A + B$', highlight: true },
      ],
    },
    demo: {
      intro:
        'Triangle $ABC$ has its base $BC$ extended past $C$ to a point $D$, creating the exterior angle $ACD$. Reveal each step to see the parallel ray split that exterior angle into a copy of angle $A$ and a copy of angle $B$.',
      interactive: 'exterior-angle',
      reveals: [
        {
          label: 'Step 1 \u2014 Draw a ray through $C$ parallel to side $AB$',
          body: 'From vertex $C$, draw a ray parallel to side $AB$. This ray lies inside the exterior angle $ACD$ and divides it into two smaller angles, which we will measure one at a time.',
        },
        {
          label: 'Step 2 \u2014 The lower piece equals angle $B$',
          body: 'Line $BC$ is a transversal cutting the two parallel rays $AB$ and the new ray through $C$. The lower piece of the exterior angle and angle $B$ are corresponding angles, so the lower piece equals $B$.',
        },
        {
          label: 'Step 3 \u2014 The upper piece equals angle $A$',
          body: 'Side $AC$ is a transversal cutting the same two parallel rays. The upper piece of the exterior angle and angle $A$ are alternate interior angles, so the upper piece equals $A$.',
        },
        {
          label: 'Step 4 \u2014 Add the two pieces',
          formula: 'exterior angle $ACD = A + B$',
          body: 'The exterior angle is made of the two pieces together, so it equals $A + B$. An exterior angle of a triangle equals the sum of its two remote interior angles.',
        },
      ],
    },
  },
  {
    id: 'transition-wedo',
    type: 'transition',
    prompt: "Now let's apply the theorem together.",
    transition: { emoji: '\u{1F60A}', cta: "Let's do it" },
  },
  {
    id: 'guided-exterior',
    type: 'guided',
    tag: 'We do',
    prompt:
      "Let's apply the theorem together. The base of a triangle is extended to form an exterior angle, and the two remote interior angles measure $40^\\circ$ and $75^\\circ$.",
    angleFigure: {
      kind: 'exterior-triangle',
      baseAngle: 55,
      labels: [
        { at: 'A', text: '$40^\\circ$' },
        { at: 'B', text: '$75^\\circ$' },
        { at: 'ext', text: '$115^\\circ$', highlight: true, revealOnSolve: true },
      ],
    },
    guided: [
      {
        id: 'remote-interiors',
        prompt:
          'First, record the two remote interior angles, the angles at the vertices not next to the exterior angle.',
        inputs: [
          { id: 'a', label: 'angle A =', answer: 40 },
          { id: 'b', label: 'angle B =', answer: 75 },
        ],
        acceptAnyOrder: true,
        feedback: {
          hint: 'The remote interior angles are the two angles of the triangle that do not share a vertex with the exterior angle.',
          correct: 'The remote interior angles are $40^\\circ$ and $75^\\circ$.',
        },
      },
      {
        id: 'exterior',
        prompt:
          'Now add the two remote interior angles to find the exterior angle.',
        answer: 115,
        feedback: {
          correct: '$40^\\circ + 75^\\circ = 115^\\circ$',
          wrong: 'Add the two remote interior angles together.',
          hint: 'The exterior angle equals the sum of the two remote interior angles.',
        },
      },
    ],
  },
  {
    id: 'transition-youdo',
    type: 'transition',
    prompt:
      "Your turn! You will use the exterior angle theorem on its own, and then combine parallel-line angle relationships with triangles.",
    transition: { emoji: '\u{1F4AA}', cta: "I'm ready" },
  },
  {
    id: 'q1-exterior-sum',
    type: 'triangle-angle',
    tag: 'You do',
    prompt:
      'The base of triangle $ABC$ is extended to form an exterior angle. The two remote interior angles measure $50^\\circ$ and $60^\\circ$. Find the exterior angle.',
    angleFigure: {
      kind: 'exterior-triangle',
      baseAngle: 55,
      labels: [
        { at: 'A', text: '$50^\\circ$' },
        { at: 'B', text: '$60^\\circ$' },
        { at: 'ext', text: '?', highlight: true },
      ],
    },
    answer: 110,
    feedback: {
      correct: '$50^\\circ + 60^\\circ = 110^\\circ$',
      wrong: 'The exterior angle equals the sum of the two remote interior angles.',
      hint: 'Add the two remote interior angles.',
    },
  },
  {
    id: 'q2-remote-interior',
    type: 'triangle-angle',
    tag: 'You do',
    prompt:
      'An exterior angle of triangle $ABC$ measures $120^\\circ$. One remote interior angle, at vertex $B$, measures $45^\\circ$. Find the remote interior angle at vertex $A$.',
    angleFigure: {
      kind: 'exterior-triangle',
      baseAngle: 55,
      labels: [
        { at: 'A', text: '?', highlight: true },
        { at: 'B', text: '$45^\\circ$' },
        { at: 'ext', text: '$120^\\circ$' },
      ],
    },
    answer: 75,
    feedback: {
      correct: '$120^\\circ - 45^\\circ = 75^\\circ$',
      wrong: 'The exterior angle equals the sum of the two remote interior angles, so subtract the known one.',
      hint: 'Subtract the known remote interior angle from the exterior angle.',
    },
  },
  {
    id: 'q3-parallel-triangle',
    type: 'triangle-angle',
    tag: 'You do',
    prompt:
      'A ray through vertex $C$ is parallel to side $AB$. A transversal makes an alternate interior angle of $70^\\circ$ that is equal to angle $B$. Given that angle $A = 65^\\circ$, find angle $C$.',
    angleFigure: {
      kind: 'triangle',
      baseAngle: 55,
      labels: [
        { at: 'A', text: '$65^\\circ$' },
        { at: 'B', text: '$70^\\circ$' },
        { at: 'C', text: '?', highlight: true },
      ],
    },
    answer: 45,
    feedback: {
      correct:
        'The parallel ray makes angle $B = 70^\\circ$, so $C = 180^\\circ - 65^\\circ - 70^\\circ = 45^\\circ$.',
      wrong: 'Use the parallel ray to find angle $B$, then apply the triangle angle sum of $180^\\circ$.',
      hint: 'The three interior angles of a triangle sum to $180^\\circ$.',
    },
  },
  {
    id: 'q4-parallel-triangle-x',
    type: 'triangle-angle',
    tag: 'You do',
    prompt:
      'A ray parallel to side $AC$ crosses side $AB$, making a corresponding angle of $55^\\circ$ that is equal to angle $B$. The base of the triangle is extended to form an exterior angle of $140^\\circ$. Find the remaining remote interior angle at vertex $A$.',
    angleFigure: {
      kind: 'exterior-triangle',
      baseAngle: 55,
      labels: [
        { at: 'A', text: '?', highlight: true },
        { at: 'B', text: '$55^\\circ$' },
        { at: 'ext', text: '$140^\\circ$' },
      ],
    },
    answer: 85,
    feedback: {
      correct:
        'The corresponding angle makes angle $B = 55^\\circ$, so $A = 140^\\circ - 55^\\circ = 85^\\circ$.',
      wrong: 'Find angle $B$ from the corresponding angle, then subtract it from the exterior angle.',
      hint: 'The exterior angle equals the sum of the two remote interior angles.',
    },
  },
];

export const triangleAnglesLesson: Lesson = {
  lessonId: 'triangle-angles',
  title: 'Triangles with Lines and Angles',
  steps,
};
