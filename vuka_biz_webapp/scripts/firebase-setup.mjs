/**
 * One-off Firebase setup for Vuka Biz. Safe to re-run.
 *
 *   node scripts/firebase-setup.mjs <path-to-service-account.json>
 *   node --env-file=.env.local scripts/firebase-setup.mjs   (uses FIREBASE_* from .env.local)
 *   … --reset-orders   also deletes every order (clean demo before judging)
 *
 * 1. Creates the Firestore database (africa-south1, Johannesburg) if missing
 * 2. Deploys firestore.rules (no direct client access)
 * 3. Enables Email/Password sign-in (phone + PIN logins map onto it)
 * 4. Creates the demo owner, driver and support (admin) accounts with their role claims
 */
import { readFileSync } from 'node:fs';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const LOCATION = 'africa-south1';
const DEMO_PIN = '1234';
const DEMO_USERS = [
  { phone: '0712345678', name: 'Thandi Mokoena', role: 'owner' },
  { phone: '0823456789', name: 'Sipho Mahlangu', role: 'driver' },
  { phone: '0601234567', name: 'Vuka Support', role: 'admin' },
];

/** Must match src/services/FirebaseIdentity.ts. */
const emailFor = (phone) => `27${phone.replace(/\D/g, '').replace(/^(27|0)/, '')}@phone.vukabiz.app`;
const passwordFor = (pin) => `vuka-pin-${pin}`;

const args = process.argv.slice(2);
const resetOrders = args.includes('--reset-orders');
const keyPath = args.find((a) => !a.startsWith('--')) ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;
const key = keyPath
  ? JSON.parse(readFileSync(keyPath, 'utf8'))
  : {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
if (!key.project_id || !key.client_email || !key.private_key) {
  throw new Error('Pass the service account JSON path, or run with --env-file=.env.local.');
}
const project = key.project_id;
const credential = cert(key);
initializeApp({ credential, projectId: project });

const { access_token: token } = await credential.getAccessToken();
async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
const fail = (step, r) => {
  throw new Error(`${step} failed (${r.status}): ${JSON.stringify(r.data.error ?? r.data)}`);
};

// 1. Firestore database
const dbUrl = `https://firestore.googleapis.com/v1/projects/${project}/databases`;
const existing = await api('GET', `${dbUrl}/(default)`);
if (existing.ok) {
  console.log(`✓ Firestore database exists (${existing.data.locationId})`);
} else {
  const created = await api('POST', `${dbUrl}?databaseId=(default)`, { type: 'FIRESTORE_NATIVE', locationId: LOCATION });
  if (created.status === 403) {
    // The Admin SDK service account may use Firestore but not create databases.
    console.log(
      `✗ No Firestore database yet, and this key cannot create one. In the Firebase console open
` +
        `  Databases & Storage → Firestore → Create database → Standard edition → location ${LOCATION}
` +
        `  → "Start in production mode", then re-run this script.`,
    );
  } else {
    if (!created.ok) fail('Create Firestore database', created);
    console.log(`✓ Firestore database created in ${LOCATION}`);
    // Creation is a long-running operation; wait for it before deploying rules.
    for (let i = 0; i < 30 && !(await api('GET', `${dbUrl}/(default)`)).ok; i++) await new Promise((r) => setTimeout(r, 2000));
  }
}

// 2. Security rules
const rulesUrl = `https://firebaserules.googleapis.com/v1/projects/${project}`;
const ruleset = await api('POST', `${rulesUrl}/rulesets`, {
  source: { files: [{ name: 'firestore.rules', content: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') }] },
});
if (!ruleset.ok) fail('Create ruleset', ruleset);
const releaseName = `projects/${project}/releases/cloud.firestore`;
let release = await api('PATCH', `${rulesUrl}/releases/cloud.firestore`, {
  release: { name: releaseName, rulesetName: ruleset.data.name },
});
if (release.status === 404) release = await api('POST', `${rulesUrl}/releases`, { name: releaseName, rulesetName: ruleset.data.name });
if (release.ok) console.log('✓ Firestore rules deployed (deny all direct client access)');
else if (release.status === 403 && !existing.ok) console.log('… Rules skipped until the database exists (production mode already denies clients).');
else fail('Release rules', release);

// 3. Email/Password sign-in
const config = await api(
  'PATCH',
  `https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/config?updateMask=signIn.email.enabled,signIn.email.passwordRequired`,
  { signIn: { email: { enabled: true, passwordRequired: true } } },
);
if (config.status === 404) {
  console.log(
    '✗ Firebase Authentication is not switched on yet. In the Firebase console open\n' +
      '  Security → Authentication → Get started → Email/Password → Enable → Save, then re-run this script.',
  );
  process.exit(1);
}
if (!config.ok) fail('Enable Email/Password sign-in', config);
console.log('✓ Email/Password sign-in enabled');

// 4. Demo accounts
const auth = getAuth();
for (const demo of DEMO_USERS) {
  const email = emailFor(demo.phone);
  let user;
  try {
    user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: passwordFor(DEMO_PIN), displayName: demo.name });
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    user = await auth.createUser({ email, password: passwordFor(DEMO_PIN), displayName: demo.name });
  }
  await auth.setCustomUserClaims(user.uid, { role: demo.role });
  console.log(`✓ Demo ${demo.role}: ${demo.phone} / PIN ${DEMO_PIN} (uid ${user.uid})`);
}

// 5. Optional: clean slate for the demo
if (resetOrders) {
  const orders = getFirestore().collection('orders');
  let deleted = 0;
  for (let batch = await orders.limit(400).get(); !batch.empty; batch = await orders.limit(400).get()) {
    const writes = getFirestore().batch();
    batch.docs.forEach((doc) => writes.delete(doc.ref));
    await writes.commit();
    deleted += batch.size;
  }
  console.log(`✓ Deleted ${deleted} order${deleted === 1 ? '' : 's'}`);
}
