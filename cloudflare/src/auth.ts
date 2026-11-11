import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { ApiError } from './http';
import type { Env } from './types';

const keySets = new Map<string, JWTVerifyGetKey>();

function isLoopback(hostname: string): boolean {
  return ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
}

export function localBypass(request: Request, env: Env): boolean {
  return env.ENVIRONMENT === 'development' && env.DEV_AUTH_BYPASS === 'true' && isLoopback(new URL(request.url).hostname);
}

export async function verifyAccessJwt(token: string, issuer: string, audience: string, keys?: JWTVerifyGetKey) {
  let resolver = keys || keySets.get(issuer);
  if (!resolver) {
    resolver = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
    keySets.set(issuer, resolver);
  }
  const { payload } = await jwtVerify(token, resolver, { issuer, audience, algorithms: ['RS256'] });
  if (!payload.sub || typeof payload.email !== 'string') throw new Error('Missing identity');
  return { subject: payload.sub, email: payload.email };
}

export async function requireAdmin(request: Request, env: Env) {
  if (localBypass(request, env)) return { subject: 'local-developer', email: 'developer@localhost' };
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    throw new ApiError(503, 'auth_not_configured', 'Cloudflare Access 설정이 필요합니다.');
  }
  const issuer = `https://${env.ACCESS_TEAM_DOMAIN.replace(/^https:\/\//, '').replace(/\/$/, '')}`;
  const issuerUrl = new URL(issuer);
  if (!issuerUrl.hostname.endsWith('.cloudflareaccess.com') || issuerUrl.pathname !== '/') {
    throw new ApiError(503, 'auth_not_configured', 'Access 팀 도메인 설정이 올바르지 않습니다.');
  }
  const cookie = request.headers.get('cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith('CF_Authorization='))?.slice('CF_Authorization='.length);
  const token = request.headers.get('cf-access-jwt-assertion') || cookie;
  if (!token) throw new ApiError(401, 'unauthorized', '관리자 로그인이 필요합니다.');
  try {
    const identity = await verifyAccessJwt(token, issuer, env.ACCESS_AUD);
    const allowlist = env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()).filter(Boolean) || [];
    if (allowlist.length && !allowlist.includes(identity.email.toLowerCase())) throw new ApiError(403, 'forbidden', '관리자 권한이 없습니다.');
    return identity;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'unauthorized', '관리자 인증이 만료되었거나 올바르지 않습니다.');
  }
}

export function requireMutationOrigin(request: Request, env: Env): void {
  const origin = request.headers.get('origin');
  const expected = env.APP_ORIGIN || new URL(request.url).origin;
  if (!origin || origin !== expected || request.headers.get('sec-fetch-site') === 'cross-site') {
    throw new ApiError(403, 'invalid_origin', '허용되지 않은 요청 출처입니다.');
  }
}

export function loginUrl(returnTo = '/Editor'): string {
  return `/api/admin/login?return_to=${encodeURIComponent(returnTo)}`;
}
