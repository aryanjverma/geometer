# Geometer

**Subject:** Geometry — right triangles (area, perimeter, Pythagorean theorem)  
**Audience:** 8th graders  
**Stack:** React, TypeScript, Vite, Firebase (Auth + Firestore), Konva, Vercel

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

5. **Deploy to Vercel**

- Import repo, add the same `VITE_FIREBASE_*` env vars, deploy
- Add your Vercel domain to Firebase Auth → Authorized domains

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
| FR-7 | Mobile-responsive layout + Vercel deploy config |

## Lesson steps

1. **Perimeter** — drag vertices to unfold triangle; enter perimeter (12)
2. **Area** — formula + compute (24)
3. **Pythagorean** — find hypotenuse (13)
4. **Missing leg + area** — two-part (6, then 24)
