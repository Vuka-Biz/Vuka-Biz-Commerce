import type { UserRole } from '@/models';

import { ServerConfig } from './config';
import { ApiError } from './http';

export type AuthUser = { uid: string; role: UserRole; name?: string; phone?: string };

type Jwk = JsonWebKey & { kid: string };
type JwtHeader = { alg?: string; kid?: string; typ?: string };
type FirebaseClaims = {
  aud?: string;
  iss?: string;
  sub?: string;
  iat?: number;
  exp?: number;
  auth_time?: number;
  phone_number?: string;
  name?: string;
  /** Custom claim set with the Admin SDK. Users cannot set their own claims. */
  role?: string;
};

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const ALGORITHM = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } as const;

function base64UrlToBytes(input: string): Uint8Array<ArrayBuffer> {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeJson<T>(segment: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment))) as T;
}

/**
 * Verifies Firebase Auth ID tokens with WebCrypto, following
 * https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
 * (no Admin SDK, so it runs on the edge runtime too).
 */
export class FirebaseAuth {
  private static keys = new Map<string, CryptoKey>();
  private static keysExpireAt = 0;

  /** Reads `Authorization: Bearer <token>` and returns the verified user, or throws 401. */
  static async requireUser(request: Request): Promise<AuthUser> {
    const projectId = ServerConfig.firebaseProjectId;
    if (!projectId) throw new ApiError(503, 'Authentication is not configured.');

    const header = request.headers.get('authorization') ?? '';
    const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.exec(header);
    if (!match) throw new ApiError(401, 'Missing bearer token.');

    try {
      return await FirebaseAuth.verify(match[1], projectId);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'Invalid or expired token.');
    }
  }

  private static async verify(token: string, projectId: string): Promise<AuthUser> {
    const [headerPart, payloadPart, signaturePart] = token.split('.');
    const header = decodeJson<JwtHeader>(headerPart);
    const claims = decodeJson<FirebaseClaims>(payloadPart);

    if (header.alg !== 'RS256' || !header.kid) throw new ApiError(401, 'Invalid or expired token.');
    const key = await FirebaseAuth.key(header.kid);
    const signed = new TextEncoder().encode(`${headerPart}.${payloadPart}`);
    const valid = await crypto.subtle.verify(ALGORITHM, key, base64UrlToBytes(signaturePart), signed);
    if (!valid) throw new ApiError(401, 'Invalid or expired token.');

    const now = Math.floor(Date.now() / 1000);
    const skew = ServerConfig.clockSkewSeconds;
    const ok =
      claims.aud === projectId &&
      claims.iss === `https://securetoken.google.com/${projectId}` &&
      typeof claims.sub === 'string' &&
      claims.sub.length > 0 &&
      claims.sub.length <= 128 &&
      typeof claims.exp === 'number' &&
      claims.exp > now - skew &&
      typeof claims.iat === 'number' &&
      claims.iat <= now + skew &&
      typeof claims.auth_time === 'number' &&
      claims.auth_time <= now + skew;
    if (!ok) throw new ApiError(401, 'Invalid or expired token.');

    return {
      uid: claims.sub!,
      role: claims.role === 'driver' || claims.role === 'admin' ? claims.role : 'owner',
      name: typeof claims.name === 'string' ? claims.name.slice(0, 80) : undefined,
      phone: claims.phone_number,
    };
  }

  /** Google's signing keys, cached for as long as their Cache-Control allows. */
  private static async key(kid: string): Promise<CryptoKey> {
    if (Date.now() >= FirebaseAuth.keysExpireAt || !FirebaseAuth.keys.has(kid)) await FirebaseAuth.loadKeys();
    const key = FirebaseAuth.keys.get(kid);
    if (!key) throw new ApiError(401, 'Invalid or expired token.');
    return key;
  }

  private static async loadKeys(): Promise<void> {
    const response = await fetch(JWKS_URL);
    if (!response.ok) throw new ApiError(503, 'Could not reach the token signing service.');
    const { keys } = (await response.json()) as { keys: Jwk[] };
    const maxAge = Number(/max-age=(\d+)/.exec(response.headers.get('cache-control') ?? '')?.[1] ?? 3600);

    const imported = await Promise.all(
      keys.map(async (jwk) => [jwk.kid, await crypto.subtle.importKey('jwk', jwk, ALGORITHM, false, ['verify'])] as const),
    );
    FirebaseAuth.keys = new Map(imported);
    FirebaseAuth.keysExpireAt = Date.now() + maxAge * 1000;
  }
}
