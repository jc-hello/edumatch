import { Hono } from 'hono';
import { AppContext } from '../types';
import { ok, err } from '../lib/response';
import { authMiddleware } from '../middleware/auth';

const uploads = new Hono<AppContext>();
uploads.use('*', authMiddleware);

const ALLOWED_PURPOSES = ['tutor_doc', 'booking_attachment', 'avatar'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// POST /uploads/sign
uploads.post('/sign', async (c) => {
  const { id: userId } = c.get('user');
  const body = await c.req.json<{ fileName: string; mimeType: string; size: number; purpose: string }>();

  if (!ALLOWED_PURPOSES.includes(body.purpose)) return err(c, 'VALIDATION_ERROR', 'Invalid purpose', 400);
  if (!body.fileName || !body.mimeType) return err(c, 'VALIDATION_ERROR', 'Missing fileName or mimeType', 400);
  if (body.size > MAX_SIZE) return err(c, 'VALIDATION_ERROR', 'File too large (max 10MB)', 400);

  const safeFileName = body.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `${body.purpose}/${userId}/${Date.now()}_${safeFileName}`;
  const publicUrl = `${c.env.R2_PUBLIC_URL}/${key}`;

  // R2 presigned URL via direct upload endpoint (Worker proxies the PUT)
  const url = `/uploads/direct/${encodeURIComponent(key)}`;

  return ok(c, { url, publicUrl, key });
});

// PUT /uploads/direct/:key — proxy PUT to R2
uploads.put('/direct/:key', async (c) => {
  const key = decodeURIComponent(c.req.param('key'));
  const contentType = c.req.header('Content-Type') ?? 'application/octet-stream';
  const body = c.req.raw.body;
  if (!body) return err(c, 'VALIDATION_ERROR', 'Empty body', 400);

  await c.env.STORAGE.put(key, body, { httpMetadata: { contentType } });
  return ok(c, { key, publicUrl: `${c.env.R2_PUBLIC_URL}/${key}` });
});

export default uploads;
