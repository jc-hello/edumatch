import { MiddlewareHandler } from 'hono';
import { AppContext } from '../types';
import { verifyJwt } from '../lib/jwt';
import { err } from '../lib/response';

export const authMiddleware: MiddlewareHandler<AppContext> = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return err(c, 'UNAUTHORIZED', 'Missing token', 401);

  const token = authHeader.slice(7);
  const payload = await verifyJwt(token, c.env.JWT_SECRET);
  if (!payload) return err(c, 'TOKEN_EXPIRED', 'Token invalid or expired', 401);

  // Check blacklist
  const blacklisted = await c.env.DB.prepare('SELECT jti FROM token_blacklist WHERE jti = ?').bind(payload.jti).first();
  if (blacklisted) return err(c, 'UNAUTHORIZED', 'Token revoked', 401);

  c.set('user', { id: payload.sub, role: payload.role, jti: payload.jti });
  await next();
};

export function requireRole(...roles: string[]): MiddlewareHandler<AppContext> {
  return async (c, next) => {
    const user = c.get('user');
    if (!user || !roles.includes(user.role)) return err(c, 'FORBIDDEN', 'Insufficient permissions', 403);
    await next();
  };
}
