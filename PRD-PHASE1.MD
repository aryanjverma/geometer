# Geometer — Phase 1 PRD

## Vision

Geometer is an interactive geometry learning app for **8th graders**, modeled on Brilliant's learn-by-doing approach. Learners manipulate shapes, get instant feedback, and build understanding through action — not videos or walls of text.

**Subject (Phase 1):** Triangle geometry — perimeter, area, the Pythagorean theorem, and distance on the coordinate plane, taught across **three sequential lessons**.

**Phase 1 hard rule:** No AI. No model calls, no generated content, no chatbot tutor. Every prompt, answer check, hint, and explanation is hand-written.

**Standards anchor:** CCSS `8.G.B.6`–`8.G.B.8` — apply the Pythagorean theorem to find unknown side lengths in right triangles and to compute the distance between two points in a coordinate system.

## Brilliant Design Principles (Phase 1)

- **Action first, theory later** — drop the learner into a manipulable problem before showing formulas.
- **Instant, specific feedback** — every answer gets a short explanation; wrong answers get a targeted hint, not just a red X.
- **Visual and hands-on** — diagrams respond to input in real time (target: 60 FPS during drag/swipe).
- **I do → We do → You do** — each lesson opens with a worked demonstration, then a guided walkthrough, then independent practice (gradual release of responsibility).
- **Short lessons** — one concept per lesson, a worked example plus a handful of problems, a few minutes to complete.
- **Progress persists** — leave mid-lesson, come back on any device, pick up where you left off.

## Persona

8th graders who are bored or lost in traditional geometry class and want a hands-on, browser-based experience they can move through at their own pace.

## User Stories

- As Johnny, an 8th grader whose geometry class moves too fast, I want lessons I can pause and resume so I can actually understand triangles without falling behind.
- As Sally, an 8th grader who is ahead of her class, I want a course that unlocks harder lessons as I master each one so I can keep pushing beyond the textbook.
- As Robert, an 8th grader who memorizes the Pythagorean theorem but does not understand it, I want to watch a triangle unfold and a parallelogram split so I can see why the formulas work before I am asked to compute.
- As Jill, an 8th grader who keeps mixing up area and perimeter formulas, I want feedback that tells me exactly what I did wrong so I can fix my weak spots. *(Adaptive weak-point detection deferred to Phase 2.)*
- As Edward, an 8th grader who is not motivated by grades alone, I want a streak system and leaderboard so I can compete with friends and come back every day. *(Deferred to Phase 2.)*

## Pages

**Unauthenticated:**

- `/login` — Google OAuth sign-in gate

**Authenticated (2-tab navigator):**

- **Dashboard** (`/dashboard`) — course progress bar, one card per lesson
- **Account** (`/account`) — profile (name + avatar), reset progress, logout, delete account

**Lesson (full-screen, outside the tab bar):**

- `/lesson/:lessonId` — interactive step sequence for `right-triangles`, `non-right-triangles`, or `distance-coordinate-plane`

---

## Functional Requirements

FRs are ordered by **build priority**. Each FR is a checkpoint: complete it, verify acceptance criteria, then move to the next.

---

### FR-1: Login Gate (Priority 1)

**Goal:** Gate the entire app behind Google OAuth.

**Scope:**

- Google OAuth as the only sign-in method
- `/login` is the only route accessible without authentication
- All other routes redirect unauthenticated users to `/login`; authenticated users on `/login` are redirected to the dashboard
- `authDomain` must be the **same origin** that serves the app (e.g. the Firebase Hosting `*.web.app` domain), not `your-project.firebaseapp.com`. A cross-origin auth helper breaks sign-in on mobile/storage-partitioned browsers with the "missing initial state" error. See README → Troubleshooting.

**Out of scope for this FR:** Navigator, dashboard content, lesson content

**Acceptance criteria:**

- A signed-out user cannot reach `/dashboard`, `/account`, or `/lesson/`*
- Sign-in with Google completes and redirects to the dashboard
- Returning authenticated users skip the login page
- Sign-in succeeds on a mobile browser (no "missing initial state" error)

> **Checkpoint:** Stop here. Verify acceptance criteria before starting FR-2.

---

### FR-2: Authenticated Navigator (Priority 2)

**Goal:** Provide a mobile-friendly shell for authenticated users to move between app sections.

**Scope:**

- 2-tab router: **Dashboard**, **Account**
- Active tab is visually highlighted
- Bottom nav fixed to the viewport, sized for phone screens (safe-area aware)
- Lesson view lives **outside** the tab bar at `/lesson/:lessonId` (full-screen)

**Out of scope for this FR:** Dashboard progress logic, lesson content, leaderboard, streaks

**Acceptance criteria:**

- Authenticated user can switch between both tabs
- Lesson routes are reachable via the lesson cards on the dashboard
- Nav renders correctly on a mobile viewport

> **Checkpoint:** Stop here. Verify acceptance criteria before starting FR-3.

---

### FR-3: Dashboard and Course Path (Priority 3)

**Goal:** Show the learner where they are in the course and how to start, resume, or review each lesson.

**Scope:**

- **Course progress bar** at top: percent of lessons completed across the whole course (`getProgressPercent`).
- **One card per lesson** (`right-triangles`, `non-right-triangles`, `distance-coordinate-plane`), each with a button whose state comes from `getLessonButtonState`:
  - `Start` — lesson not begun
  - `Continue` — left mid-lesson (resumes at the saved step)
  - `Review` — all steps completed
  - `Locked` — a prerequisite lesson is not yet complete (`requires` / `isLessonLocked`)
- **Sequential unlock:** Lesson 2 unlocks after Lesson 1 is complete; Lesson 3 after Lesson 2. A locked card is visually dimmed and its button is disabled.
- Clicking an unlocked button opens `/lesson/:lessonId` at the correct step.

**Out of scope for this FR:** Lesson step content, streaks, leaderboard

**Acceptance criteria:**

- Course progress bar reflects how many of the three lessons are complete
- Each card button reflects that lesson's current state, including `Locked` when gated
- `Start` / `Continue` / `Review` opens the lesson at the correct step

> **Checkpoint:** Stop here. Verify acceptance criteria before starting FR-4.

---

### FR-4: Interactive Lessons (Priority 4)

**Goal:** Deliver three hand-built, Brilliant-style lessons that teach triangle geometry through interaction and instant feedback.

**Pedagogy — every lesson follows I do / We do / You do:**

1. **Transition** slide introduces the phase (tutor avatar + message).
2. **I do** — a `demonstration` (or `distance-demo`): a click-to-reveal worked example, sometimes with an embedded interactive.
3. **We do** — a `guided` (or `distance-guided`) walkthrough: the learner fills in each step of one problem with scaffolded prompts.
4. **You do** — independent problems the learner solves on their own.

Steps are tagged on-screen with `I do` / `We do` / `You do` labels.

All problems use integer answers and (where relevant) Pythagorean triples — no decimals. Answer checks are exact-match (tolerance 0).

#### Lesson 1 — Right Triangles (`right-triangles`)

| # | Step id | Type | Content |
| - | ------- | ---- | ------- |
| 1 | `intro` | `transition` | Tutor intro |
| 2 | `demo-pythagorean` | `demonstration` | Worked Pythagorean example, legs 6 & 8, hypotenuse 10 |
| 3 | `transition-wedo` | `transition` | "Let's do one together" |
| 4 | `guided-pythagorean` | `guided` | Legs 3 & 4 → identify legs, compute c² = 25, solve c = 5 |
| 5 | `transition-youdo` | `transition` | "Your turn" |
| 6 | `q1-hypotenuse` | `numeric` | Legs 5 & 12 → c = 13 |
| 7 | `q2-area` | `formula-compute` | Legs 6 & 8 → area 24 |
| 8 | `q3-leg-then-perimeter` | `leg-then-perimeter` | Leg 9, hypotenuse 15 → missing leg 12, then unfold to perimeter 36 |
| 9 | `q4-leg-then-area` | `multi-part-numeric` | Leg 8, hypotenuse 10 → missing leg 6, then area 24 |

#### Lesson 2 — Non-Right Triangles (`non-right-triangles`)

| # | Step id | Type | Content |
| - | ------- | ---- | ------- |
| 1 | `intro` | `transition` | Tutor intro |
| 2 | `demo-area` | `demonstration` (shear) | Area = bh/2; drag the apex to see area is invariant (base 4, height 3 → 6) |
| 3 | `demo-why` | `demonstration` (parallelogram) | Duplicate + rotate to justify the ½ (base 4, height 3) |
| 4 | `transition-wedo` | `transition` | "Let's work one together" |
| 5 | `guided-area` | `guided` | Base 5, height 4 → identify base/height, area 10 |
| 6 | `transition-youdo` | `transition` | "Your turn" |
| 7 | `q1-area-base-height` | `area-base-height` | Base 4, height 3 → area 6 |
| 8 | `q2-derive-perimeter` | `derive-perimeter` | Base 21, height 8, splits 6 & 15, sides 10 & 17 → perimeter 48 |
| 9 | `q3-interactive-split` | `interactive-split` | Swipe to split isosceles (base 16, height 6) → area 48 |
| 10 | `q4-perimeter-from-area` | `perimeter-from-area` | Area 120, height 8 → recover base 30, sides 17 → perimeter 64 |

#### Lesson 3 — Distance on the Coordinate Plane (`distance-coordinate-plane`)

| # | Step id | Type | Content |
| - | ------- | ---- | ------- |
| 1 | `intro` | `transition` | Tutor intro |
| 2 | `demo-distance` | `distance-demo` | A (1, 2) → B (5, 5); the right triangle draws itself, D = 5 |
| 3 | `transition-wedo` | `transition` | "Let's find one together" |
| 4 | `guided-distance` | `distance-guided` | C (2, 1) → D (10, 7): find Δx & Δy, D² = 100, D = 10 |
| 5 | `transition-youdo` | `transition` | "Four problems" |
| 6 | `q1-distance` | `distance-problem` | E (2, 3) → F (14, 8) → distance 13 |
| 7 | `q2-perimeter` | `distance-problem` | Triangle PQR → side lengths 8, 5, 5 → perimeter 18 |
| 8 | `q3-right-triangle` | `distance-problem` | Triangle ABC, sides 15/20/25 → is it right? (Yes) |
| 9 | `q4-journey` | `distance-problem` | Houston → Austin → Dallas (legs 5 + 10) → total 15, with a car driving the route |

#### Lesson-level requirements

- Progress saves after each completed step (persistence in FR-6).
- Feedback appears in under 100 ms after submission.
- Drag/swipe interactions run at 60 FPS.
- At least one rich non-multiple-choice interaction per lesson (vertex unfold, apex shear/split, animated coordinate graph).
- A wrong answer never advances the step; it shows the wrong message first, then a hint on subsequent attempts. A correct answer reveals the explanation, fires a confetti celebration, then advances.
- Completing the final step of a lesson marks it complete → dashboard updates the course bar and the card's `Review` state, and (if not the last lesson) unlocks the next lesson.

**Out of scope for this FR:** Account settings, deployment, streaks, leaderboard

**Acceptance criteria:**

- A learner can complete every lesson end-to-end through the I do / We do / You do arc
- Each interactive (unfold, shear, split, coordinate graph) responds in real time
- Each step gives instant correct/wrong/hint feedback as specified
- Wrong answers do not advance; correct answers advance to the next step

> **Checkpoint:** Stop here. Verify acceptance criteria before starting FR-5.

---

### FR-5: Account (Priority 5)

**Goal:** Let learners manage their profile and session.

**Scope:**

- Edit **display name**
- Choose a **profile avatar** (emoji picker; stored as `emoji:<char>`)
- **Reset progress** — clears lesson progress without deleting the account
- **Log out** — returns to `/login`
- **Delete account** — confirmation warning before permanent deletion; removes user progress and profile data

**Out of scope for this FR:** Streaks, leaderboard, lesson content

**Acceptance criteria:**

- Name and avatar changes persist across sessions
- Reset progress returns every lesson to its un-started state
- Log out clears the session and redirects to login
- Delete account removes user data after confirmation

> **Checkpoint:** Stop here. Verify acceptance criteria before starting FR-6.

---

### FR-6: Progress and Persistence (Priority 6)

**Goal:** Ensure lesson progress survives across sessions and devices.

**Scope — persist per user, per lesson:**

- Current step index within each lesson
- Per-lesson completion flag
- Live sync via a Firestore snapshot subscription so changes propagate across open sessions

**Mid-lesson resume:**

- User leaves on a step → returns → dashboard shows `Continue` → lesson reopens on that step

**Out of scope for this FR:** Streaks, leaderboard, daily habit tracking

**Acceptance criteria:**

- Leave mid-lesson, return later → still on the same step
- Finish a lesson → dashboard reflects completion and the next lesson unlocks
- Dashboard progress bar and button states reflect persisted data

> **Checkpoint:** Stop here. Verify acceptance criteria before starting FR-7.

---

### FR-7: Mobile, Testing, and Deployment (Priority 7)

**Goal:** Ship a public, mobile-ready app that holds up under the MVP test scenarios.

**Scope:**

- Responsive layout for phone-sized screens; touch input for vertex drag, apex shear/split, and graph interactions
- Automated test suite (Vitest) covering content integrity and core utilities
- Deploy to a public URL on Firebase Hosting (`*.web.app`), which also keeps the app and the Google auth helper same-origin
- Lesson loads to first interaction in under 2 seconds
- Feedback on answer submission in under 100 ms
- Interactive visuals at 60 FPS during manipulation

**MVP test scenarios:**

1. Learner completes a lesson end-to-end, gets some problems wrong, uses feedback to recover
2. Learner manipulates an interactive (unfold / shear / split / coordinate graph) and sees the visual respond in real time
3. Learner leaves mid-lesson and returns — progress persists
4. Learner finishes a lesson — dashboard updates and the course path unlocks/recommends the next lesson
5. Entire flow works on a phone-sized viewport

**Acceptance criteria:**

- All five test scenarios pass on the deployed app
- Touch interactions work on mobile
- App supports multiple concurrent learners without degradation

> **Checkpoint:** Phase 1 complete. Verify all FR acceptance criteria before starting Phase 2.

---

## Content Model

Lessons are data-driven TypeScript objects (typed JSON) — not hard-coded HTML — so new lessons can be added without rewriting render logic (and so Phase 2 AI can generate content later). Lessons are registered in `src/content/lessons.ts` with metadata (`title`, `description`, optional `requires` prerequisite); each step is rendered by `StepRenderer`, which dispatches on `step.type`.

### Step types (Phase 1)

| Type | Phase | Description |
| ---- | ----- | ----------- |
| `transition` | — | Full-slide message with tutor avatar/emoji and a continue button |
| `demonstration` | I do | Click-to-reveal worked example; optional embedded interactive (`shear`, `parallelogram`) |
| `distance-demo` | I do | Click-to-reveal example that animates segments onto a coordinate graph |
| `guided` | We do | Scaffolded multi-part walkthrough with single- or multi-field numeric inputs |
| `distance-guided` | We do | Guided distance walkthrough with ordered sub-steps that draw onto the graph |
| `numeric` | You do | Static triangle; single numeric answer |
| `formula-compute` | You do | Formula text + static triangle; numeric answer (detects the "forgot ½" mistake) |
| `area-base-height` | You do | General triangle with altitude; area from base × height ÷ 2 |
| `leg-then-perimeter` | You do | Find missing leg, then unfold the triangle to a line for the perimeter |
| `multi-part-numeric` | You do | Sequential parts; Part B (area) unlocks after Part A (missing leg) |
| `derive-perimeter` | You do | Split-base general triangle; reveal oblique sides, then perimeter |
| `interactive-split` | You do | Swipe to split an isosceles triangle, then total area |
| `perimeter-from-area` | You do | Work backward from area to base, then perimeter |
| `distance-problem` | You do | Coordinate problem with ordered sub-steps (numeric / multi-field / choice), optional car path |
| `interactive-unfold` | You do | Draggable Konva vertices; triangle unwraps to a straight line for a perimeter answer |

### Visual and interactive components

- **`InteractiveUnfold`** (Konva) — drag vertices to unwrap a triangle into a collinear chain; gates the perimeter input until unfolded.
- **`ShearTriangle`** (Konva) — drag the apex horizontally to show area is invariant under shear.
- **`SplitTriangle`** (Konva) — swipe the apex handle to split an isosceles triangle into two right triangles.
- **`WhyHalfParallelogram`** — animates a rotated duplicate forming a parallelogram to justify the ½ factor.
- **`GraphPlane`** (SVG) — auto-fitting coordinate grid; segments draw themselves in (`dx` / `dy` / `dist`); supports an animated car driving a `carPath`.
- **`StaticTriangle` / `GeneralTriangle`** (SVG) — labeled diagrams with optional altitude and reveal animations.
- **`Confetti`** — celebration on a correct final answer.
- **`MathText`** — renders inline `$...$` spans with KaTeX so prompts and feedback can show real math.

### Lesson schema (TypeScript)

```ts
interface Lesson {
  lessonId: string;
  title: string;
  steps: LessonStep[];
}

interface LessonStep {
  id: string;
  type: StepType;            // one of the step types above
  prompt: string;
  answer?: number;
  formula?: string;
  triangle?: TriangleLegs | TrianglePartial | TriangleGeneral;
  parts?: MultiPart[];       // multi-part steps
  demo?: DemoContent;        // I do reveals + optional interactive
  guided?: GuidedPart[];     // We do walkthrough
  transition?: TransitionContent;
  graph?: GraphContent;      // coordinate-plane visual
  subSteps?: DistanceSubStep[];
  tag?: 'I do' | 'We do' | 'You do';
  carPath?: string[];        // ordered point ids the car drives
  feedback?: StepFeedback;
}
```

### User progress schema (Firestore)

```ts
interface UserProgress {
  lessonProgress: Record<string, { currentStep: number; completed: boolean }>;
}

interface UserProfile {
  displayName: string;
  photoURL: string;          // e.g. "emoji:🦊"
}
```

Stored per user at `users/{uid}/data/progress` and `users/{uid}/data/profile`, with per-user ownership enforced by Firestore rules.

---

## Technical Stack

| Layer | Implementation |
| ----- | -------------- |
| Frontend | React 19 + TypeScript + Vite |
| Routing | React Router 7 |
| Interactive visuals | Konva + react-konva (drag/shear/split); SVG (coordinate graph, static triangles) |
| Math rendering | KaTeX via the `MathText` component |
| Auth | Firebase Auth — Google OAuth (`authDomain` must match the hosting origin) |
| Persistence | Firestore — user progress and profile (live snapshot sync) |
| Testing | Vitest + Testing Library (content-integrity and utility tests) |
| Hosting | Firebase Hosting (`*.web.app`) — keeps the app and the Google auth helper same-origin |
| Math validation | Integer-only answers; exact match (tolerance 0) |

---

## Future Phases

### Phase 2 — Gamification and AI (no detail yet)

**Gamification:** Daily streaks, streak display on dashboard, leaderboard ranked by streak (gold/silver/bronze for top 3, seeded demo users), and Edward's motivation loop. Streak rules: +1 on lesson completion on a new calendar day; reset if a day is missed.

**AI:** Adaptive hints, generated practice problems at the right difficulty, weak-point detection (Jill's user story), and path adaptation based on what the learner struggles with. Phase 1 must keep working with AI turned off.

### Phase 3 — Learning Science (no detail yet)

Spaced repetition, interleaving, mastery gates before unlocking new content, and scaffolding that fades support over time. (Phase 1 already establishes the I do / We do / You do gradual-release scaffold and a mastery-style sequential unlock between lessons.)

### Additional Lessons (deferred)

Quadrilaterals (parallelograms, rectangles, squares, trapezoids), triangle proofs, and further coordinate geometry — retargeted to 8th-grade standards when planned.
