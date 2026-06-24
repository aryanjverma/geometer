# Geometer — Phase 1 PRD

## Vision

Geometer is an interactive geometry learning app for **8th graders**, modeled on Brilliant's learn-by-doing approach. Learners manipulate shapes, get instant feedback, and build understanding through action — not videos or walls of text.

**Subject (Phase 1):** Right triangles — perimeter, area, and the Pythagorean theorem.

**Phase 1 hard rule:** No AI. No model calls, no generated content, no chatbot tutor. Every prompt, answer check, and explanation is hand-written.

**Standards anchor:** CCSS `8.G.B.6`–`8.G.B.7` — apply the Pythagorean theorem and find unknown side lengths in right triangles.

## Brilliant Design Principles (Phase 1)

- **Action first, theory later** — drop the learner into a manipulable problem before showing formulas.
- **Instant, specific feedback** — every answer gets a short explanation; wrong answers get a hint, not just a red X.
- **Visual and hands-on** — diagrams respond to input in real time (target: 60 FPS during drag).
- **Short lessons** — one lesson, four steps, a few minutes to complete.
- **Progress persists** — leave mid-lesson, come back on any device, pick up where you left off.

## Persona

8th graders who are bored or lost in traditional geometry class and want a hands-on, browser-based experience they can move through at their own pace.

## User Stories

- As Johnny, an 8th grader whose geometry class moves too fast, I want lessons I can pause and resume so I can actually understand right triangles without falling behind.
- As Sally, an 8th grader who is ahead of her class, I want to work through interactive proofs and applications so I can deepen my understanding beyond what the textbook covers.
- As Robert, an 8th grader who memorizes the Pythagorean theorem but does not understand it, I want to manipulate triangles and see why a² + b² = c² before I am asked to compute.
- As Jill, an 8th grader who keeps mixing up area and perimeter formulas, I want feedback that tells me exactly what I did wrong so I can fix my weak spots. *(Weak-point detection deferred to Phase 2.)*
- As Edward, an 8th grader who is not motivated by grades alone, I want a streak system and leaderboard so I can compete with friends and come back every day. *(Deferred to Phase 2.)*

## Pages

**Unauthenticated:**

- `/login` — Google OAuth sign-in gate

**Authenticated (2-tab navigator):**

- **Dashboard** — progress bar, lesson card
- **Account** — profile, logout, delete account

**Lesson (full-screen, outside tab bar):**

- `/lesson/right-triangles` — interactive step sequence

---

## Functional Requirements

FRs are ordered by **build priority**. Each FR is a checkpoint: complete it, verify acceptance criteria, then move to the next.

---

### FR-1: Login Gate (Priority 1)

**Goal:** Gate the entire app behind Google OAuth.

**Scope:**

- Google OAuth as the only sign-in method
- `/login` is the only route accessible without authentication
- All other routes redirect unauthenticated users to `/login`
- Successful sign-in lands on the dashboard
- `authDomain` must be the **same origin** that serves the app (the Firebase Hosting
  domain, e.g. `your-project.web.app`), not `your-project.firebaseapp.com`. A cross-origin
  auth helper breaks sign-in on mobile/storage-partitioned browsers with the "missing
  initial state" error. See README → Troubleshooting.

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
- Placeholder content is acceptable for pages not yet built
- Lesson view lives **outside** the tab bar at `/lesson/right-triangles` (full-screen)
- Bottom or top nav that works on phone-sized viewports

**Out of scope for this FR:** Dashboard progress logic, lesson content, leaderboard, streaks

**Acceptance criteria:**

- Authenticated user can switch between both tabs
- Lesson route is reachable via a link/button from the dashboard (even if lesson is a stub)
- Nav renders correctly on a mobile viewport

> **Checkpoint:** Stop here. Verify acceptance criteria before starting FR-3.

---

### FR-3: Dashboard (Priority 3)

**Goal:** Show the learner where they are in the course and how to start or resume the lesson.

**Scope:**

- **Progress bar** at top: `0%` (not started) or `100%` (lesson complete) — one lesson in MVP
- **Single lesson card:** "Right Triangles"
  - Button states:
    - `Start` — user has not begun the lesson
    - `Continue` — user left mid-lesson (resume at saved step)
    - `Review` — user completed all four steps
  - `Locked` is not used in MVP (only one lesson exists)
- Clicking the button opens `/lesson/right-triangles` at the correct step

**Out of scope for this FR:** Lesson step content, streaks, leaderboard

**Acceptance criteria:**

- Progress bar shows 0% for a new user and 100% after lesson completion
- Card button reflects the user's current lesson state
- `Start` / `Continue` / `Review` opens the lesson at the correct step

> **Checkpoint:** Stop here. Verify acceptance criteria before starting FR-4.

---

### FR-4: Right Triangle Lesson (Priority 4)

**Goal:** Deliver one hand-built, Brilliant-style lesson that teaches perimeter, area, and the Pythagorean theorem through interaction and instant feedback.

**Lesson arc:** manipulation first → formula introduction → compute → multi-step application.


| Step | Topic                    | Interaction type                                   | Triangle values                              |
| ---- | ------------------------ | -------------------------------------------------- | -------------------------------------------- |
| Q1   | Perimeter                | Vertex-drag interactive (`interactive-unfold`)     | legs 3, 4; hypotenuse 5                      |
| Q2   | Area                     | Formula reveal + numeric input (`formula-compute`) | legs 6, 8; hypotenuse 10                     |
| Q3   | Pythagorean (hypotenuse) | Numeric input (`numeric`)                          | legs 5, 12; answer c = 13                    |
| Q4   | Missing leg + area       | Two-part numeric input (`multi-part-numeric`)      | leg 8, hypotenuse 10; missing leg 6; area 24 |


All problems use integer Pythagorean triples — no decimals.

#### Q1 — Perimeter (interactive unfold)

**Prompt:** "Drag the vertices until the triangle unwraps into one straight line. What is the perimeter?"

**Setup:**

- Right triangle on SVG or Canvas with the right angle marked
- Side lengths labeled: legs 3 and 4, hypotenuse 5

**Interaction:**

- User drags each vertex; sides animate as rigid segments that pivot at vertices
- Goal state: three segments collinear on a horizontal axis (number-line style), like laying a string flat
- Live labels on each segment show side lengths; running total updates as segments align
- Snap-to-straight when segments are within ~5° of collinear (optional but recommended)

**Answer:** numeric input; correct answer = **12** (3 + 4 + 5)

**Feedback:**

- **Correct:** "Perimeter is the distance around the shape — all three sides added together."
- **Wrong:** "You have three sides. Add the length of each segment on the line."
- **Hint** (after 1 wrong attempt): highlight the three segment labels sequentially

**Why it teaches:** Perimeter as path length, not a memorized formula — mirrors Brilliant's action-first pattern.

#### Q2 — Area (formula + compute)

**Prompt:** "What is the area of this right triangle?"

**Setup:**

- Brief formula text (not a wall of text): "For a right triangle, the two legs are the base and height. **Area = ½ × leg₁ × leg₂**"
- Static right triangle with legs labeled 6 and 8

**Interaction:** numeric input only — deliberately lighter than Q1

**Answer:** **24** (½ × 6 × 8)

**Feedback:**

- **Correct:** show substitution: ½ × 6 × 8 = 24
- **Wrong:** "Multiply the two legs, then divide by 2."
- **Common mistake** (forgot ½): "A triangle is half of the rectangle with the same base and height."

#### Q3 — Pythagorean theorem: find hypotenuse

**Prompt:** "Use a² + b² = c² to find the hypotenuse."

**Setup:** Right triangle with legs labeled 5 and 12

**Interaction:** numeric input for c

**Answer:** **13** (√(5² + 12²) = √169 = 13)

**Feedback:**

- **Correct:** show check: 5² + 12² = 25 + 144 = 169 = 13²
- **Wrong:** "Square each leg, add them, then take the square root."
- **Hint:** show 5² + 12² = ? without giving c

#### Q4 — Find missing leg, then area (two-part)

**Setup:** Right triangle with one leg labeled 8, hypotenuse labeled 10, other leg shown as "?"

**Part A — prompt:** "Find the missing leg."

- **Answer:** **6** (√(10² − 8²) = √36 = 6)
- **Wrong feedback:** "Use c² − a² = b² when you know the hypotenuse and one leg."

**Part B — prompt** (unlocks after Part A is correct): "Now find the area of this triangle."

- **Answer:** **24** (½ × 8 × 6)
- **Wrong feedback:** reuse Q2 area feedback

**Why two-part:** Tests inverse Pythagorean reasoning before applying area — retrieval practice without AI.

#### Lesson-level requirements

- Progress saves after each step (storage wired in FR-6; stub acceptable during FR-4 development)
- Feedback appears in under 100 ms after submission
- Vertex-drag interaction runs at 60 FPS
- At least one rich non-multiple-choice interaction (Q1 satisfies outline requirement)
- Completing Q4 marks the lesson done → dashboard shows 100% and `Review` button

**Out of scope for this FR:** Account settings, deployment, streaks, leaderboard

**Acceptance criteria:**

- Learner can complete all four steps end-to-end
- Q1 vertex drag unwraps triangle to a straight line
- Each step gives instant correct/wrong/hint feedback as specified
- Wrong answers do not advance the step; correct answers advance to the next step

> **Checkpoint:** Stop here. Verify acceptance criteria before starting FR-5.

---

### FR-5: Account (Priority 5)

**Goal:** Let learners manage their profile and session.

**Scope:**

- Edit **display name**
- Upload or select **profile picture**
- **Log out** — returns to `/login`
- **Delete account** — confirmation warning before permanent deletion; removes user progress and profile data

**Out of scope for this FR:** Streaks, leaderboard, lesson content

**Acceptance criteria:**

- Name and profile picture changes persist across sessions
- Log out clears session and redirects to login
- Delete account removes user data after confirmation

> **Checkpoint:** Stop here. Verify acceptance criteria before starting FR-6.

---

### FR-6: Progress and Persistence (Priority 6)

**Goal:** Ensure lesson progress survives across sessions and devices.

**Scope — persist per user:**

- Current lesson step index (0–3)
- Lesson completion flag

**Mid-lesson resume:**

- User leaves on step 2 → returns → dashboard shows `Continue` → lesson opens on step 2

**Out of scope for this FR:** Streaks, leaderboard, daily habit tracking

**Acceptance criteria:**

- Leave mid-lesson on Q2, return later → still on Q2
- Finish lesson → dashboard shows 100% and `Review` button
- Dashboard progress bar and button state reflect persisted data

> **Checkpoint:** Stop here. Verify acceptance criteria before starting FR-7.

---

### FR-7: Mobile and Deployment (Priority 7)

**Goal:** Ship a public, mobile-ready app that passes outline MVP test scenarios.

**Scope:**

- Responsive layout for phone-sized screens (touch input for vertex drag in Q1)
- Deploy to a public URL (Vercel, Firebase Hosting, or Render)
- Lesson loads to first interaction in under 2 seconds
- Feedback on answer submission in under 100 ms
- Interactive visuals at 60 FPS during vertex manipulation

**MVP test scenarios (from outline):**

1. Learner completes the lesson end-to-end, gets some problems wrong, uses feedback to recover
2. Learner manipulates the Q1 interactive and sees the visual respond in real time
3. Learner leaves mid-lesson and returns — progress persists
4. Learner finishes the lesson — dashboard shows 100% and sensible next action (`Review`)
5. Entire flow works on a phone-sized viewport

**Acceptance criteria:**

- All five test scenarios pass on the deployed app
- Touch drag works for Q1 on mobile
- App supports multiple concurrent learners without degradation

> **Checkpoint:** Phase 1 complete. Verify all FR acceptance criteria before starting Phase 2.

---

## Content Model

Lessons are data-driven JSON — not hard-coded HTML — so new lessons can be added without rewriting render logic (and so Phase 2 AI can generate content later).

### Step types (Phase 1)


| Type                 | Used in | Description                                                                     |
| -------------------- | ------- | ------------------------------------------------------------------------------- |
| `interactive-unfold` | Q1      | Draggable vertices; triangle unwraps to straight line; numeric perimeter answer |
| `formula-compute`    | Q2      | Displays formula text + static diagram; numeric area answer                     |
| `numeric`            | Q3      | Static diagram; single numeric answer                                           |
| `multi-part-numeric` | Q4      | Sequential parts; Part B unlocks after Part A is correct                        |


### Lesson schema

```json
{
  "lessonId": "right-triangles",
  "title": "Right Triangles",
  "steps": [
    {
      "id": "q1-perimeter",
      "type": "interactive-unfold",
      "prompt": "Drag the vertices until the triangle unwraps into one straight line. What is the perimeter?",
      "triangle": { "legs": [3, 4], "hypotenuse": 5 },
      "answer": 12,
      "feedback": {
        "correct": "Perimeter is the distance around the shape — all three sides added together.",
        "wrong": "You have three sides. Add the length of each segment on the line.",
        "hint": "Add the three side lengths shown on the line."
      }
    },
    {
      "id": "q2-area",
      "type": "formula-compute",
      "formula": "For a right triangle, the two legs are the base and height. Area = ½ × leg₁ × leg₂",
      "prompt": "What is the area of this right triangle?",
      "triangle": { "legs": [6, 8], "hypotenuse": 10 },
      "answer": 24,
      "feedback": {
        "correct": "½ × 6 × 8 = 24",
        "wrong": "Multiply the two legs, then divide by 2.",
        "hint": "A triangle is half of the rectangle with the same base and height."
      }
    },
    {
      "id": "q3-hypotenuse",
      "type": "numeric",
      "prompt": "Use a² + b² = c² to find the hypotenuse.",
      "triangle": { "legs": [5, 12] },
      "answer": 13,
      "feedback": {
        "correct": "5² + 12² = 25 + 144 = 169 = 13²",
        "wrong": "Square each leg, add them, then take the square root.",
        "hint": "5² + 12² = ?"
      }
    },
    {
      "id": "q4-leg-then-area",
      "type": "multi-part-numeric",
      "triangle": { "leg": 8, "hypotenuse": 10 },
      "parts": [
        {
          "id": "leg",
          "prompt": "Find the missing leg.",
          "answer": 6,
          "feedback": {
            "wrong": "Use c² − a² = b² when you know the hypotenuse and one leg."
          }
        },
        {
          "id": "area",
          "prompt": "Now find the area of this triangle.",
          "answer": 24,
          "feedback": {
            "wrong": "Multiply the two legs, then divide by 2."
          }
        }
      ]
    }
  ]
}
```

### User progress schema

```json
{
  "userId": "string",
  "lessonProgress": {
    "right-triangles": {
      "currentStep": 0,
      "completed": false
    }
  }
}
```

---

## Technical Stack


| Layer           | Recommendation                                          |
| --------------- | ------------------------------------------------------- |
| Frontend        | React + Konva.js for draggable triangle vertices        |
| Auth            | Firebase Auth — Google OAuth (`authDomain` must match the hosting origin) |
| Persistence     | Firestore — user progress and profile                   |
| Hosting         | Firebase Hosting (`*.web.app`) — keeps app and auth helper same-origin |
| Math validation | Integer-only answers; exact match (tolerance 0) for MVP |


---

## Future Phases

### Phase 2 — Gamification and AI (no detail yet)

**Gamification:** Daily streaks, streak display on dashboard, leaderboard ranked by streak (gold/silver/bronze for top 3, seeded demo users), and Edward's motivation loop. Streak rules: +1 on lesson completion on a new calendar day; reset if a day is missed.

**AI:** Adaptive hints, generated practice problems at the right difficulty, weak-point detection (Jill's user story), and path adaptation based on what the learner struggles with. Phase 1 must keep working with AI turned off.

### Phase 3 — Learning Science (no detail yet)

Spaced repetition, interleaving, mastery gates before unlocking new content, and scaffolding that fades support over time.

### Additional Lessons (deferred)

Quadrilaterals (parallelograms, rectangles, squares, trapezoids), triangle proofs, and coordinate geometry — retargeted to 8th-grade standards when planned.