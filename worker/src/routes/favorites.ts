import { Hono } from 'hono';
import { AppContext } from '../types';
import { ok, err } from '../lib/response';
import { authMiddleware } from '../middleware/auth';

const favorites = new Hono<AppContext>();
favorites.use('*', authMiddleware);

// GET /favorites
favorites.get('/', async (c) => {
  const { id: studentId } = c.get('user');
  const rows = await c.env.DB.prepare(
    'SELECT tp.*, u.full_name, u.avatar_url FROM favorites f JOIN tutor_profiles tp ON tp.user_id = f.tutor_id JOIN users u ON u.id = tp.user_id WHERE f.student_id = ?',
  ).bind(studentId).all();

  const data = (rows.results as Record<string, unknown>[]).map((r) => ({
    id: r.id,
    name: r.full_name,
    title: r.headline,
    subjects: parseJson(r.subjects_json as string, []),
    levels: parseJson(r.levels_json as string, []),
    location: r.location,
    format: r.format,
    price: r.price,
    rating: r.rating,
    reviews: r.review_count,
    avatarUrl: r.avatar_url,
  }));
  return ok(c, data);
});

// POST /favorites/:tutorId
favorites.post('/:tutorId', async (c) => {
  const { id: studentId } = c.get('user');
  const { tutorId } = c.req.param();
  const tutorUser = await c.env.DB.prepare("SELECT id FROM users WHERE id = ? AND role = 'tutor'").bind(tutorId).first();
  if (!tutorUser) return err(c, 'NOT_FOUND', 'Tutor not found', 404);

  try {
    await c.env.DB.prepare('INSERT INTO favorites (student_id, tutor_id) VALUES (?, ?)').bind(studentId, tutorId).run();
  } catch {
    return err(c, 'CONFLICT', 'Already favorited', 409);
  }
  return ok(c, { tutorId, favoritedAt: new Date().toISOString() }, undefined, 201);
});

// DELETE /favorites/:tutorId
favorites.delete('/:tutorId', async (c) => {
  const { id: studentId } = c.get('user');
  const { tutorId } = c.req.param();
  await c.env.DB.prepare('DELETE FROM favorites WHERE student_id = ? AND tutor_id = ?').bind(studentId, tutorId).run();
  return c.body(null, 204);
});

function parseJson(s: string | null | undefined, def: unknown) {
  if (!s) return def;
  try { return JSON.parse(s); } catch { return def; }
}

export default favorites;
