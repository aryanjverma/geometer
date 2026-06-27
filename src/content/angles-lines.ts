import type { Lesson, LessonStep } from '@/types/lesson';

/** `tag` labels the I do / We do / You do phase; not part of the shared type. */
type AuthoredStep = LessonStep & { tag?: 'I do' | 'We do' | 'You do' };

const steps: AuthoredStep[] = [
  {
    id: 'intro',
    type: 'transition',
    prompt:
      'Welcome to this lesson on angles and lines! When two parallel lines are crossed by a transversal, the eight angles that form are not all different. Three results explain every relationship: the Linear Pair Theorem, the Vertical Angles Theorem, and the Corresponding Angles Postulate. I will demonstrate each one in turn, then we will use all three together.',
    transition: { emoji: '\u{1F4D0}', cta: "Let's begin" },
  },
  {
    id: 'demo-linear-pair',
    type: 'demonstration',
    tag: 'I do',
    prompt:
      'First, the Linear Pair Theorem. Watch how two angles that sit side by side on one straight line are related.',
    angleFigure: {
      kind: 'parallel-lines',
      baseAngle: 65,
      labels: [
        { at: 't1', text: '65', highlight: true },
        { at: 't2', text: '115', highlight: true },
      ],
    },
    demo: {
      intro:
        'The two highlighted angles share the transversal and open out along the same straight line.',
      reveals: [
        {
          label: 'Step 1 \u2014 A linear pair',
          body: 'Two angles that are adjacent and whose outer sides form a single straight line are called a linear pair. Here both highlighted angles rest on the upper parallel line, one on each side of the transversal.',
        },
        {
          label: 'Step 2 \u2014 The Linear Pair Theorem',
          formula: '$\\angle t_1 + \\angle t_2 = 180^\\circ$',
          body: 'Together a linear pair sweeps across a straight angle, so the two measures are supplementary. Here $65^\\circ + 115^\\circ = 180^\\circ$, which is why one angle is always the supplement of the other.',
        },
      ],
    },
  },
  {
    id: 'demo-vertical',
    type: 'demonstration',
    tag: 'I do',
    prompt:
      'Next, the Vertical Angles Theorem. Watch the two angles that sit directly across the crossing from each other.',
    angleFigure: {
      kind: 'parallel-lines',
      baseAngle: 60,
      labels: [
        { at: 't1', text: '60', highlight: true },
        { at: 't3', text: '60', highlight: true },
      ],
    },
    demo: {
      intro:
        'The two highlighted angles are opposite each other where the transversal meets the line.',
      reveals: [
        {
          label: 'Step 1 \u2014 Opposite angles',
          body: 'When two lines cross, the angles directly across from each other at the intersection are called vertical angles. The highlighted pair points in opposite directions from the same vertex.',
        },
        {
          label: 'Step 2 \u2014 The Vertical Angles Theorem',
          formula: '$\\angle t_1 = \\angle t_3$',
          body: 'Each of these angles is the supplement of the same neighbouring angle, so the two must be equal. Here both measure $60^\\circ$, which is why vertical angles are always congruent.',
        },
      ],
    },
  },
  {
    id: 'demo-corresponding',
    type: 'demonstration',
    tag: 'I do',
    prompt:
      'Finally, the Corresponding Angles Postulate. Because the lines are parallel, I can slide one angle onto the other to show they match.',
    angleFigure: {
      kind: 'parallel-lines',
      baseAngle: 55,
      labels: [
        { at: 't1', text: '55', highlight: true },
        { at: 'b1', text: '55', highlight: true },
      ],
    },
    demo: {
      intro:
        'Reveal each step, then use the slider to glide the upper angle straight down the transversal onto the lower intersection.',
      interactive: 'slide-angles',
      reveals: [
        {
          label: 'Step 1 \u2014 Same position at each crossing',
          body: 'Corresponding angles occupy the same position at each intersection: upper-left with upper-left, and so on. Here both marked angles measure $55^\\circ$, the acute angle the transversal makes with each parallel line.',
        },
        {
          label: 'Step 2 \u2014 The Corresponding Angles Postulate',
          formula: '$\\angle t_1 = \\angle b_1$',
          body: 'Slide the upper angle down the transversal onto the lower crossing. Because the lines are parallel, the transversal meets each at the identical inclination, so the angle lands exactly on its corresponding partner. They coincide, which is why corresponding angles are equal.',
        },
      ],
    },
  },
  {
    id: 'transition-wedo',
    type: 'transition',
    prompt: "Now let's use all three results together.",
    transition: { emoji: '\u{1F60A}', cta: "Let's do it" },
  },
  {
    id: 'guided-combined',
    type: 'guided',
    tag: 'We do',
    prompt:
      "Now let's use all three results on one diagram, applying a single theorem at each step. The upper-left angle measures $70^\\circ$.",
    angleFigure: {
      kind: 'parallel-lines',
      baseAngle: 70,
      labels: [
        { at: 't1', text: '70' },
        { at: 't2', text: '?', highlight: true },
      ],
    },
    guided: [
      {
        id: 'linear-pair',
        prompt:
          'Step 1 \u2014 Linear Pair. The upper-left angle ($70^\\circ$) and the upper-right angle sit side by side on the upper line. What is the measure of the upper-right angle?',
        answer: 110,
        angleFigure: {
          kind: 'parallel-lines',
          baseAngle: 70,
          labels: [
            { at: 't1', text: '70' },
            { at: 't2', text: '?', highlight: true },
          ],
        },
        feedback: {
          correct: 'A linear pair is supplementary, so $180 - 70 = 110$.',
          wrong: 'The two angles lie on one straight line, so they add to $180^\\circ$.',
          hint: 'Subtract the known angle from $180^\\circ$.',
        },
      },
      {
        id: 'vertical',
        prompt:
          'Step 2 \u2014 Vertical Angles. Look again at the $70^\\circ$ angle. What is the measure of the angle directly opposite it across the crossing?',
        answer: 70,
        angleFigure: {
          kind: 'parallel-lines',
          baseAngle: 70,
          labels: [
            { at: 't1', text: '70' },
            { at: 't3', text: '?', highlight: true },
          ],
        },
        feedback: {
          correct: 'Vertical angles are equal, so that angle is also $70^\\circ$.',
          wrong: 'Angles directly opposite each other at a crossing are equal.',
          hint: 'A vertical angle keeps the same measure as the given angle.',
        },
      },
      {
        id: 'corresponding',
        prompt:
          'Step 3 \u2014 Corresponding Angles. The lines are parallel. What is the measure of the upper-left angle at the lower intersection, which corresponds to the $70^\\circ$ angle above?',
        answer: 70,
        angleFigure: {
          kind: 'parallel-lines',
          baseAngle: 70,
          labels: [
            { at: 't1', text: '70' },
            { at: 'b1', text: '?', highlight: true },
          ],
        },
        feedback: {
          correct:
            'Corresponding angles across parallel lines are equal, so it is also $70^\\circ$.',
          wrong:
            'Corresponding angles share the same position at each crossing and are equal.',
          hint: 'Both angles are upper-left at their crossings, so they match.',
        },
      },
    ],
  },
  {
    id: 'transition-youdo',
    type: 'transition',
    prompt:
      "Your turn! Apply each result on its own first, then combine them on the final problem.",
    transition: { emoji: '\u{1F4AA}', cta: "I'm ready" },
  },
  {
    id: 'q1-vertical-angles',
    type: 'find-angle',
    tag: 'You do',
    prompt:
      'The two lines are crossed by a transversal. Use the Vertical Angles Theorem to find the unknown angle.',
    angleFigure: {
      kind: 'parallel-lines',
      baseAngle: 50,
      labels: [
        { at: 't1', text: '130', offset: { dx: -8, dy: 11 } },
        { at: 't3', text: '?', highlight: true, offset: { dx: 7 } },
      ],
    },
    answer: 130,
    feedback: {
      correct: 'Vertical angles are equal, so the unknown angle is $130^\\circ$.',
      wrong:
        'Angles directly opposite each other at a crossing are equal, not supplementary.',
      hint: 'The unknown angle is vertical to the given one, so it has the same measure.',
    },
  },
  {
    id: 'q2-linear-pair',
    type: 'find-angle',
    tag: 'You do',
    prompt:
      'Use the Linear Pair Theorem to find the unknown angle on this line.',
    angleFigure: {
      kind: 'parallel-lines',
      baseAngle: 65,
      labels: [
        { at: 't1', text: '110' },
        { at: 't2', text: '?', highlight: true },
      ],
    },
    answer: 70,
    feedback: {
      correct: 'A linear pair is supplementary, so $180 - 110 = 70$.',
      wrong: 'The two angles lie on one line, so they add to $180^\\circ$.',
      hint: 'Subtract the given angle from $180^\\circ$.',
    },
  },
  {
    id: 'q3-corresponding-angle',
    type: 'find-angle',
    tag: 'You do',
    prompt:
      'The lines are parallel. Use the Corresponding Angles Postulate to find the unknown angle at the lower intersection.',
    angleFigure: {
      kind: 'parallel-lines',
      baseAngle: 60,
      labels: [
        { at: 't1', text: '125' },
        { at: 'b1', text: '?', highlight: true },
      ],
    },
    answer: 125,
    feedback: {
      correct:
        'Corresponding angles across parallel lines are equal, so the unknown angle is $125^\\circ$.',
      wrong:
        'Corresponding angles occupy the same position at each crossing and are equal.',
      hint: 'Both angles are upper-left at their crossings, so they match.',
    },
  },
  {
    id: 'q4-missing-angle',
    type: 'find-angle',
    tag: 'You do',
    prompt:
      'These lines are parallel. Combine the postulate with a linear pair to find the unknown angle at the lower intersection.',
    angleFigure: {
      kind: 'parallel-lines',
      baseAngle: 75,
      labels: [
        { at: 't1', text: '75' },
        { at: 'b2', text: '?', highlight: true },
      ],
    },
    answer: 105,
    feedback: {
      correct:
        'The upper-right angle is $180 - 75 = 105$ by a linear pair, and its corresponding angle below is also $105^\\circ$.',
      wrong:
        'First find the upper-right angle with a linear pair, then carry it down with the Corresponding Angles Postulate.',
      hint: 'Take the supplement of $75^\\circ$, then apply corresponding angles to the lower crossing.',
    },
  },
];

export const anglesLinesLesson: Lesson = {
  lessonId: 'angles-lines',
  title: 'Angles and Lines',
  steps,
};
