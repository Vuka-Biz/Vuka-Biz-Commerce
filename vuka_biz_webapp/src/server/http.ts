import { ServerConfig } from './config';
import { RateLimiter } from './RateLimiter';

/** An expected failure with a status code and a message that is safe to show the client. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly headers: Record<string, string> = {},
  ) {
    super(message);
  }
}

/** Hardening for JSON API responses: no sniffing, framing, caching or referrer leaks. */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
};

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { ...SECURITY_HEADERS, ...headers } });
}

export function errorResponse(error: ApiError): Response {
  return json({ error: error.message }, error.status, error.headers);
}

/** Edge-provided client address. Falls back to the first X-Forwarded-For hop. */
export function clientIp(request: Pick<Request, 'headers'>): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

export function rateLimit(limiter: RateLimiter, key: string, message = 'Too many requests. Slow down and try again.'): void {
  const result = limiter.take(key);
  if (!result.ok) throw new ApiError(429, message, { 'Retry-After': String(result.retryAfterSeconds) });
}

/**
 * Reads a JSON body, refusing anything that isn't JSON (415) or is larger than
 * `maxBytes` (413) – counted while streaming, so a lying Content-Length can't
 * get a big body through.
 */
export async function readJson(request: Request, maxBytes: number = ServerConfig.maxBodyBytes): Promise<unknown> {
  const type = request.headers.get('content-type') ?? '';
  if (!/^application\/json\b/i.test(type)) throw new ApiError(415, 'Send the body as application/json.');

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > maxBytes) throw new ApiError(413, 'Request body is too large.');
  if (!request.body) throw new ApiError(400, 'Request body is required.');

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new ApiError(413, 'Request body is too large.');
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new ApiError(400, 'Body is not valid JSON.');
  }
}

type Handler<P> = (request: Request, params: P) => Promise<Response> | Response;

/**
 * Wraps an API route: turns ApiErrors into JSON responses, hides unexpected
 * errors behind a generic 500, and adds the security headers.
 */
export function route<P = Record<string, string>>(handler: Handler<P>): Handler<P> {
  return async (request, params) => {
    try {
      return await handler(request, params);
    } catch (error) {
      if (error instanceof ApiError) return errorResponse(error);
      console.error('Unhandled API error', error);
      return json({ error: 'Something went wrong.' }, 500);
    }
  };
}
