import type { MiddlewareFunction } from 'expo-router/server';

import { ServerConfig } from '@/server/config';
import { ApiError, clientIp, errorResponse } from '@/server/http';
import { RateLimiter } from '@/server/RateLimiter';

const ipLimiter = new RateLimiter(ServerConfig.ipLimit.capacity, ServerConfig.ipLimit.refillPerSecond);
const ALLOWED_METHODS = new Set(['GET', 'POST', 'HEAD']);
const PUBLIC_PATHS = new Set(['/api/health']);

/**
 * First gate for every API request, before any route code runs:
 * per-IP rate limit, method allowlist, oversized-body and missing-token rejection.
 * Token signatures are verified in the routes (FirebaseAuth.requireUser).
 */
const middleware: MiddlewareFunction = (request) => {
  const { pathname } = new URL(request.url);

  const limit = ipLimiter.take(clientIp(request));
  if (!limit.ok) {
    return errorResponse(
      new ApiError(429, 'Too many requests. Slow down and try again.', { 'Retry-After': String(limit.retryAfterSeconds) }),
    );
  }
  if (!ALLOWED_METHODS.has(request.method)) return errorResponse(new ApiError(405, 'Method not allowed.'));
  if (Number(request.headers.get('content-length') ?? 0) > ServerConfig.maxBodyBytes) {
    return errorResponse(new ApiError(413, 'Request body is too large.'));
  }
  if (!PUBLIC_PATHS.has(pathname) && !/^Bearer \S+$/.test(request.headers.get('authorization') ?? '')) {
    return errorResponse(new ApiError(401, 'Missing bearer token.'));
  }
};

export const unstable_settings = {
  matcher: { patterns: ['/api', '/api/[...path]'] },
};

export default middleware;
