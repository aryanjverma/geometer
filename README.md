# Geometer

**Subject:** Geometry — right triangles (area, perimeter, Pythagorean theorem)  
**Audience:** 8th graders  
**Stack:** React, TypeScript, Vite, Firebase (Auth + Firestore + Hosting), Konva

Interactive learn-by-doing geometry app modeled on Brilliant. Phase 1 — no AI.

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
per-user ownership plus field/type/size validation. Deploy them with:

```bash
npx firebase deploy --only firestore:rules
```

4. **Run locally**

```bash
npm run dev
```

5. **Deploy to Firebase Hosting**

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
src/
  content/right-triangles.ts   # Lesson JSON (data-driven steps)
  contexts/                  # Auth + progress providers
  services/progressService.ts  # Firestore read/write
  components/
    lesson/                    # Step renderers + Konva unfold interactive
    layout/                    # 2-tab bottom nav (Dashboard, Account)
  pages/                       # Login, Dashboard, Account, Lesson
```

## Phase 1 FRs implemented

| FR | Feature |
|----|---------|
| FR-1 | Google OAuth login gate |
| FR-2 | 2-tab navigator + full-screen lesson route |
| FR-3 | Dashboard with progress bar and lesson card |
| FR-4 | Right triangle lesson — 4 interactive steps |
| FR-5 | Account — name, avatar, logout, delete |
| FR-6 | Firestore progress persistence |
| FR-7 | Mobile-responsive layout + Firebase Hosting deploy config |

## Lesson steps

1. **Perimeter** — drag vertices to unfold triangle; enter perimeter (12)
2. **Area** — formula + compute (24)
3. **Pythagorean** — find hypotenuse (13)
4. **Missing leg + area** — two-part (6, then 24)
