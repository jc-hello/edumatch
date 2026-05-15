import { Context } from 'hono';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ok(c: Context, data: unknown, meta?: PaginationMeta, status: 200 | 201 = 200) {
  return c.json({ success: true, data, ...(meta ? { meta } : {}) }, status);
}

export function err(
  c: Context,
  code: string,
  message: string,
  status: 400 | 401 | 402 | 403 | 404 | 409 | 422 | 429 | 500 = 400,
  details?: unknown,
) {
  return c.json({ success: false, error: { code, message, ...(details ? { details } : {}) } }, status);
}
