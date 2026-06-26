# Geometer

**Live app:** [geometer-8317d.web.app](https://geometer-8317d.web.app)

**Subject:** Geometry — triangles, the coordinate plane, transformations, and similarity  
**Audience:** 8th graders  
**Stack:** React, TypeScript, Vite, Firebase (Auth + Firestore + Hosting + Cloud Functions + App Check), Konva, OpenAI

Interactive learn-by-doing geometry app modeled on Brilliant.

- **Phase 1** — hand-built, learn-by-doing lessons (no AI).
- **Phase 2** — a personalized, spaced-retrieval **Review Session** with rule-based concept selection and two AI enhancements (word-problem reskinning and "Ask Geometer" struggle-grounded hints). AI never generates questions, picks what to review, or grades answers — and the whole app still works with AI turned off.

## Setup

1. **Clone and install**

```bash
npm install
```

2. **Firebase project**

- Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Enable **Google** sign-in under Authentication → Sign-in method
- Create a **Firestore** database
- Register a web app and copy config values into `.env` (see `.env.example`)
- Set `VITE_FIREBASE_AUTH_DOMAIN` to the **same domain that serves the app** (the
  Firebase Hosting domain, e.g. `your-project.web.app`), **not** `your-project.firebaseapp.com`.
  Keeping the app and the Firebase auth helper on one origin avoids the
  "missing initial state" sign-in failure on mobile (see Troubleshooting).

3. **Firestore rules**

Rules live in `firestore.rules` (config in `firebase.json`). They enforce
per-user ownership plus field/type/size validation (including the Phase 2
`conceptMastery` subcollection and the `interests` profile field). Deploy them with:

```bash
npx firebase deploy --only firestore:rules
```

4. **AI proxy (Phase 2 — optional)**

The review session's AI features call OpenAI through a callable Cloud Function
proxy (`functions/src/index.ts`), so the OpenAI key never ships in the client
bundle. This is **optional**: with AI off, reskinned word problems fall back to
the plain template prompt and "Ask Geometer" hints fall back to the hand-written
Phase 1 hints, and the full session still runs.

To enable it:

- Cloud Functions require the Firebase **Blaze plan**.
- Set the OpenAI key as a server-side secret: `npx firebase functions:secrets:set OPENAI_API_KEY`
- Enable **App Check** (reCAPTCHA Enterprise) — the callable enforces it. Add the
  site key as `VITE_FIREBASE_APPCHECK_SITE_KEY` in `.env` (see `.env.example`).
- Deploy: `npx firebase deploy --only functions`

5. **Run locally**

```bash
npm run dev
```

6. **Deploy to Firebase Hosting**

- Build the app: `npm run build` (outputs to `dist/`, the `public` dir in `firebase.json`)
- Deploy: `npx firebase deploy --only hosting`
- Confirm your `*.web.app` domain is listed under Firebase Auth → Authorized domains

## Troubleshooting

### "Unable to process request due to missing initial state" on mobile sign-in

Cause: the app and the Firebase auth helper are on **different origins**. The app is
served from your hosting domain (e.g. `your-project.web.app`) while `authDomain` points
to `your-project.firebaseapp.com`. Mobile browsers partition third-party storage, so the
`sessionStorage` written during sign-in can't be read back, and `signInWithPopup` /
`signInWithRedirect` fail. See Firebase's
[redirect best practices](https://firebase.google.com/docs/auth/web/redirect-best-practices).

Fix (same-origin auth helper):

1. Set `VITE_FIREBASE_AUTH_DOMAIN` to the domain that serves the app
   (e.g. `your-project.web.app`). Firebase Hosting serves the `/__/auth/` helper on that
   domain too, so no reverse proxy is needed.
2. In Google Cloud Console → APIs & Services → Credentials → the auto-created
   "Web client (auth)" OAuth client, add `https://your-project.web.app/__/auth/handler`
   to **Authorized redirect URIs** (the trailing `/__/auth/handler` matters). The
   `.web.app` domain is **not** authorized by default, so skipping this yields a
   `redirect_uri_mismatch`.
3. Confirm `your-project.web.app` is listed under Firebase Auth → Settings →
   Authorized domains.
4. Rebuild and redeploy (`npm run build` then `npx firebase deploy --only hosting`) —
   `authDomain` is baked in at build time.

## Architecture

```
functions/
  src/index.ts                 # Callable OpenAI proxy (App Check enforced)
src/
  content/                     # Data-driven lessons (one file per lesson)
    lessons.ts                 # Lesson catalog + unlock order
    reviewFormats.ts           # Phase 2 parameterized question formats + solvers
  contexts/                    # Auth + progress providers
  services/
    progressService.ts         # Firestore progress read/write
    masteryService.ts          # Phase 2 per-concept mastery records
    reviewService.ts           # Phase 2 mastery-based selection + recs
    reviewSession.ts           # Phase 2 session runner state
    aiReviewService.ts         # Phase 2 reskin + hint (validation, leak filter, fallbacks)
    streakService.ts / leaderboardService.ts
  components/
    lesson/                    # Step renderers + Konva interactives
    dashboard/                 # Progress bar, lesson card, ReviewSessionCard
    layout/                    # Bottom nav
  pages/                       # Login, Dashboard, Account, Lesson, Review, Leaderboard
  types/                       # lesson, progress, mastery, review
```

## Phase 1 FRs implemented

| FR | Feature |
|----|---------|
| FR-1 | Google OAuth login gate |
| FR-2 | Tab navigator + full-screen lesson route |
| FR-3 | Dashboard with progress bar and lesson cards |
| FR-4 | Interactive geometry lessons |
| FR-5 | Account — name, avatar, logout, delete |
| FR-6 | Firestore progress persistence |
| FR-7 | Mobile-responsive layout + Firebase Hosting deploy config |

## Phase 2 FRs implemented

See `PRD-PHASE2.MD` for the full spec.

| FR | Feature |
|----|---------|
| FR-1 | Per-concept mastery tracking (`users/{uid}/conceptMastery`, last-2 correctness rule) |
| FR-2 | Parameterized question formats with deterministic ground-truth solvers |
| FR-3 | Rule-based review session — `ReviewSessionCard`, `/review` runner, results + revisit links |
| FR-4 | AI enhancements via OpenAI behind a Cloud Function proxy — word-problem reskinning + "Ask Geometer" hints, each with a deterministic fallback |
| FR-5 | Account interests field, Vitest coverage (solvers, ranking, validators, leak filter), mobile + AI-off verification |

## Lessons

Lessons unlock in order; each mixes "I do" (watch), "We do" (guided), and "You do" (solve) steps.

1. **Right Triangles** — perimeter, area, and the Pythagorean theorem
2. **Non-Right Triangles** — area, perimeter, and the height trick
3. **Distance on the Coordinate Plane** — measure distance with the Pythagorean theorem
4. **Transformations** — translate, reflect, rotate, and dilate on the grid
5. **Congruence and Similarity** — compare sides and ratios, then drag to prove it

The Review Session covers the numeric lessons (right triangles, non-right triangles, distance) with fresh numbers on each run.
