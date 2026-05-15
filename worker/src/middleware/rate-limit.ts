import { MiddlewareHandler } from 'hono';
import { AppContext } from '../types';
import { err } from '../lib/response';

const MAX_REQUESTS = 5;
const WINDOW_SECONDS = 60;

export function rateLimitMiddleware(slug: string): MiddlewareHandler<AppContext> {
  return async (c, next) => {
    const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';
    const key = `rl:${slug}:${ip}`;
    const current = await c.env.RATE_LIMIT.get(key);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= MAX_REQUESTS) return err(c, 'RATE_LIMITED', 'Too many requests, try again later', 429);

    await c.env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: WINDOW_SECONDS });
    await next();
  };
}
