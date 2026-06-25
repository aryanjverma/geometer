/**
 * Seed demo users into the public `leaderboard` collection.
 *
 * The leaderboard security rules only allow a signed-in user to write their own
 * entry, so demo rows must be written with the Firebase Admin SDK (which
 * bypasses rules). Run this once from a trusted machine.
 *
 * Setup:
 *   1. npm install -D firebase-admin
 *   2. Download a service-account key JSON from the Firebase console
 *      (Project settings -> Service accounts -> Generate new private key).
 *   3. Run:
 *        GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
 *        node scripts/seedLeaderboard.mjs
 *      (On PowerShell:
 *        $env:GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"; \
 *        node scripts/seedLeaderboard.mjs )
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const DEMO_USERS = [
  { uid: 'demo-ada', displayName: 'Ada', photoURL: 'emoji:🦊', streak: 12 },
  { uid: 'demo-bo', displayName: 'Bo', photoURL: 'emoji:🐢', streak: 9 },
  { uid: 'demo-cleo', displayName: 'Cleo', photoURL: 'emoji:🦉', streak: 7 },
  { uid: 'demo-dev', displayName: 'Dev', photoURL: 'emoji:🐬', streak: 5 },
  { uid: 'demo-emi', displayName: 'Emi', photoURL: 'emoji:🦄', streak: 3 },
  { uid: 'demo-finn', displayName: 'Finn', photoURL: 'emoji:🐼', streak: 1 },
];

function makeApp() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath) {
    // applicationDefault() reads GOOGLE_APPLICATION_CREDENTIALS automatically.
    return initializeApp({ credential: applicationDefault() });
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  }
  throw new Error(
    'Set GOOGLE_APPLICATION_CREDENTIALS (path to a service-account JSON) before running.',
  );
}

async function main() {
  const app = makeApp();
  const db = getFirestore(app);
  const batch = db.batch();
  for (const user of DEMO_USERS) {
    batch.set(db.collection('leaderboard').doc(user.uid), user, { merge: true });
  }
  await batch.commit();
  console.log(`Seeded ${DEMO_USERS.length} demo leaderboard entries.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
