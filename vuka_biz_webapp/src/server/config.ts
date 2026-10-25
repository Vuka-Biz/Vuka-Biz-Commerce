/**
 * Server-only settings. Imported by API routes and middleware, never by screens,
 * so values here stay out of the client bundle.
 */
export const ServerConfig = {
  /** Firebase project whose ID tokens are accepted. Unset → protected routes fail closed (503). */
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? '',

  /** Admin service account for Firestore. Unset → orders are kept in memory (local dev only). */
  serviceAccount:
    process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
      ? {
          projectId: process.env.FIREBASE_PROJECT_ID ?? '',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY,
        }
      : undefined,

  /** Largest JSON body accepted, in bytes. */
  maxBodyBytes: 16 * 1024,

  /** Per client IP, across all API routes (checked in middleware). */
  ipLimit: { capacity: 120, refillPerSecond: 2 },

  /** Per signed-in user, for writes. */
  userWriteLimit: { capacity: 20, refillPerSecond: 0.5 },

  /** Wrong handover PINs allowed per order before it locks for support review. */
  maxPinAttempts: 5,

  /** Accepted clock drift when checking token times, in seconds. */
  clockSkewSeconds: 60,
} as const;
