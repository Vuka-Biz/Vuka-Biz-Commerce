import type { UserRole } from '@/models';

const API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '';

type Session = { uid: string; idToken: string; refreshToken: string; expiresAt: number; role: UserRole; name?: string };

export type SignInResult = { ok: true; uid: string; role: UserRole; name?: string } | { ok: false; error: string };

/** Firebase error codes → messages a shop owner can act on. */
const ERRORS: Record<string, string> = {
  INVALID_LOGIN_CREDENTIALS: 'Incorrect cellphone number or PIN.',
  INVALID_PASSWORD: 'Incorrect cellphone number or PIN.',
  EMAIL_NOT_FOUND: 'Incorrect cellphone number or PIN.',
  USER_DISABLED: 'This account has been suspended. Call support.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Too many attempts. Wait a few minutes and try again.',
};

function claimsOf(idToken: string): { role?: string; name?: string } {
  const payload = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')));
}

/**
 * Firebase Auth over its REST API. Phone + PIN logins map onto Email/Password
 * accounts (see scripts/firebase-setup.mjs), so no SMS provider is needed for the demo.
 */
export class FirebaseIdentity {
  private static session: Session | null = null;

  /** Must match scripts/firebase-setup.mjs. */
  static emailFor(phone: string): string {
    return `27${phone.replace(/\D/g, '').replace(/^(27|0)/, '')}@phone.vukabiz.app`;
  }

  static passwordFor(pin: string): string {
    return `vuka-pin-${pin}`;
  }

  static async signIn(phone: string, pin: string): Promise<SignInResult> {
    try {
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: FirebaseIdentity.emailFor(phone),
          password: FirebaseIdentity.passwordFor(pin),
          returnSecureToken: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const code = String(data?.error?.message ?? '').split(' ')[0];
        return { ok: false, error: ERRORS[code] ?? 'Could not sign in. Check your connection and try again.' };
      }
      const session = FirebaseIdentity.toSession(data.localId, data.idToken, data.refreshToken, Number(data.expiresIn));
      FirebaseIdentity.session = session;
      return { ok: true, uid: session.uid, role: session.role, name: session.name };
    } catch {
      return { ok: false, error: 'No connection. Check your data or Wi-Fi and try again.' };
    }
  }

  static signOut(): void {
    FirebaseIdentity.session = null;
  }

  /** A valid ID token for the API, refreshed when it is within 5 minutes of expiry. */
  static async idToken(): Promise<string | null> {
    const session = FirebaseIdentity.session;
    if (!session) return null;
    if (session.expiresAt - Date.now() > 5 * 60_000) return session.idToken;

    const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: session.refreshToken }).toString(),
    });
    if (!response.ok) {
      FirebaseIdentity.session = null;
      return null;
    }
    const data = await response.json();
    FirebaseIdentity.session = FirebaseIdentity.toSession(data.user_id, data.id_token, data.refresh_token, Number(data.expires_in));
    return FirebaseIdentity.session.idToken;
  }

  private static toSession(uid: string, idToken: string, refreshToken: string, expiresInSeconds: number): Session {
    // Read for screen routing only – the API verifies the signature and enforces the role.
    const claims = claimsOf(idToken);
    return {
      uid,
      idToken,
      refreshToken,
      expiresAt: Date.now() + expiresInSeconds * 1000,
      role: claims.role === 'driver' || claims.role === 'admin' ? claims.role : 'owner',
      name: claims.name,
    };
  }
}
