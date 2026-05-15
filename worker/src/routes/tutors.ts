import { Hono } from 'hono';
import { AppContext } from '../types';
import { ok, err } from '../lib/response';
import { parsePage, buildMeta } from '../lib/paginate';
import { authMiddleware, requireRole } from '../middleware/auth';
import { randomUUID } from '../lib/jwt';

const tutors = new Hono<AppContext>();

function parseTutor(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.full_name,
    title: row.headline,
    subjects: parseJson(row.subjects_json as string, []),
    levels: parseJson(row.levels_json as string, []),
    location: row.location,
    format: row.format,
    price: row.price,
    rating: row.rating,
    reviews: row.review_count,
    sessions: row.session_count,
    responseTime: row.response_time,
    verified: row.status === 'approved',
    avatar: (row.full_name as string)?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
    bio: row.bio,
    avatarUrl: row.avatar_url,
    slug: row.slug,
    status: row.status,
  };
}

function parseJson(s: string | null | undefined, def: unknown) {
  if (!s) return def;
  try { return JSON.parse(s); } catch { return def; }
}

// GET /tutors
tutors.get('/', async (c) => {
  const q = c.req.query();
  const { page, limit, offset } = parsePage(q);

  const conditions: string[] = ['tp.status = \'approved\''];
  const params: unknown[] = [];

  if (q.q) { conditions.push('(tp.headline LIKE ? OR tp.bio LIKE ? OR u.full_name LIKE ?)'); params.push(`%${q.q}%`, `%${q.q}%`, `%${q.q}%`); }
  if (q.subject) { conditions.push('EXISTS (SELECT 1 FROM json_each(tp.subjects_json) WHERE value = ?)'); params.push(q.subject); }
  if (q.level) { conditions.push('EXISTS (SELECT 1 FROM json_each(tp.levels_json) WHERE value = ?)'); params.push(q.level); }
  if (q.format) { conditions.push('tp.format = ?'); params.push(q.format); }
  if (q.minPrice) { conditions.push('tp.price >= ?'); params.push(parseInt(q.minPrice, 10)); }
  if (q.maxPrice) { conditions.push('tp.price <= ?'); params.push(parseInt(q.maxPrice, 10)); }
  if (q.minRating) { conditions.push('tp.rating >= ?'); params.push(parseFloat(q.minRating)); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'tp.rating DESC';
  if (q.sort === 'price:asc') orderBy = 'tp.price ASC';
  else if (q.sort === 'responseTime:asc') orderBy = 'tp.response_time ASC';

  const countSql = `SELECT COUNT(*) as cnt FROM tutor_profiles tp JOIN users u ON u.id = tp.user_id ${where}`;
  const listSql = `SELECT tp.*, u.full_name, u.avatar_url FROM tutor_profiles tp JOIN users u ON u.id = tp.user_id ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;

  const totalRow = await c.env.DB.prepare(countSql).bind(...params).first<{ cnt: number }>();
  const rows = await c.env.DB.prepare(listSql).bind(...params, limit, offset).all();

  const data = (rows.results as Record<string, unknown>[]).map(parseTutor);
  return ok(c, data, buildMeta(totalRow?.cnt ?? 0, page, limit));
});

// GET /tutors/:id
tutors.get('/:id', async (c) => {
  const { id } = c.req.param();
  let row = await c.env.DB.prepare(
    'SELECT tp.*, u.full_name, u.avatar_url FROM tutor_profiles tp JOIN users u ON u.id = tp.user_id WHERE tp.id = ? OR tp.slug = ?',
  ).bind(id, id).first() as Record<string, unknown> | null;
  if (!row) return err(c, 'NOT_FOUND', 'Tutor not found', 404);

  const tutorId = row.user_id as string;
  const slots = await c.env.DB.prepare('SELECT day_idx, hour FROM availability_slots WHERE tutor_id = ? ORDER BY day_idx, hour').bind(tutorId).all();
  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  const grouped: Record<number, string[]> = {};
  for (const s of slots.results as { day_idx: number; hour: number }[]) {
    if (!grouped[s.day_idx]) grouped[s.day_idx] = [];
    grouped[s.day_idx].push(`${String(s.hour).padStart(2, '0')}:00`);
  }
  const availability = Object.entries(grouped).map(([dayIdx, slotsArr]) => ({ day: dayNames[parseInt(dayIdx)], slots: slotsArr }));

  const ratingBreakdown = await c.env.DB.prepare(
    'SELECT rating, COUNT(*) as cnt FROM reviews WHERE tutor_id = ? GROUP BY rating',
  ).bind(tutorId).all();
  const totalReviews = (row.review_count as number) || 1;
  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const found = (ratingBreakdown.results as { rating: number; cnt: number }[]).find((r) => r.rating === stars);
    return { stars, pct: Math.round(((found?.cnt ?? 0) / totalReviews) * 100) };
  });

  const edu = parseJson(row.education_json as string, {});
  const credentials = [edu.school, edu.degree, edu.cert, edu.years ? `${edu.years} năm kinh nghiệm` : null].filter(Boolean);

  return ok(c, { ...parseTutor(row), availability, credentials, ratingBreakdown: breakdown });
});

// GET /tutors/:id/availability
tutors.get('/:id/availability', async (c) => {
  const { id } = c.req.param();
  const profile = await c.env.DB.prepare('SELECT user_id FROM tutor_profiles WHERE id = ? OR slug = ?').bind(id, id).first<{ user_id: string }>();
  if (!profile) return err(c, 'NOT_FOUND', 'Tutor not found', 404);

  const weekParam = c.req.query('week') ?? new Date().toISOString().slice(0, 10);
  const weekStart = new Date(weekParam);
  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  const slots = await c.env.DB.prepare('SELECT day_idx, hour FROM availability_slots WHERE tutor_id = ?').bind(profile.user_id).all();
  const bookedSlots = await c.env.DB.prepare(
    "SELECT date, start_time FROM bookings WHERE tutor_id = ? AND status NOT IN ('cancelled','refunded')",
  ).bind(profile.user_id).all();
  const bookedSet = new Set((bookedSlots.results as { date: string; start_time: string }[]).map((b) => `${b.date}T${b.start_time}`));

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    const dayIdx = i; // Mon=0
    const daySlots = (slots.results as { day_idx: number; hour: number }[])
      .filter((s) => s.day_idx === dayIdx)
      .map((s) => {
        const start = `${String(s.hour).padStart(2, '0')}:00`;
        const end = `${String(s.hour + 1).padStart(2, '0')}:00`;
        const status = bookedSet.has(`${dateStr}T${start}`) ? 'booked' : 'open';
        return { start, end, status };
      });
    return { date: dateStr, day: dayNames[i], slots: daySlots };
  });

  return ok(c, days);
});

// GET /tutors/:id/reviews
tutors.get('/:id/reviews', async (c) => {
  const { id } = c.req.param();
  const profile = await c.env.DB.prepare('SELECT user_id FROM tutor_profiles WHERE id = ? OR slug = ?').bind(id, id).first<{ user_id: string }>();
  if (!profile) return err(c, 'NOT_FOUND', 'Tutor not found', 404);

  const { page, limit, offset } = parsePage(c.req.query() as Record<string, string>);
  const total = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM reviews WHERE tutor_id = ?').bind(profile.user_id).first<{ cnt: number }>();
  const rows = await c.env.DB.prepare(
    'SELECT r.*, u.full_name FROM reviews r JOIN users u ON u.id = r.student_id WHERE r.tutor_id = ? ORDER BY r.created_at DESC LIMIT ? OFFSET ?',
  ).bind(profile.user_id, limit, offset).all();

  const data = (rows.results as Record<string, unknown>[]).map((r) => ({
    id: r.id,
    student: r.full_name,
    rating: r.rating,
    body: r.body,
    date: r.created_at,
  }));
  return ok(c, data, buildMeta(total?.cnt ?? 0, page, limit));
});

// POST /tutors/me/profile
tutors.post('/me/profile', authMiddleware, requireRole('tutor'), async (c) => {
  const { id: userId } = c.get('user');
  const body = await c.req.json<Record<string, unknown>>();
  const existing = await c.env.DB.prepare('SELECT id FROM tutor_profiles WHERE user_id = ?').bind(userId).first();
  if (existing) return err(c, 'CONFLICT', 'Profile already exists, use PATCH to update', 409);

  const profileId = randomUUID();
  const slug = (body.headline as string ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60) + '-' + profileId.slice(0, 8);

  await c.env.DB.prepare(
    'INSERT INTO tutor_profiles (id, user_id, slug, headline, bio, location, format, education_json, subjects_json, levels_json, price, payout_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).bind(
    profileId, userId, slug,
    body.headline ?? null, body.bio ?? null, body.location ?? null, body.format ?? null,
    JSON.stringify(body.education ?? {}),
    JSON.stringify(body.subjects ?? []),
    JSON.stringify(body.levels ?? []),
    body.price ?? null,
    JSON.stringify(body.payout ?? {}),
  ).run();

  const profile = await c.env.DB.prepare('SELECT * FROM tutor_profiles WHERE id = ?').bind(profileId).first();
  return ok(c, profile, undefined, 201);
});

// PATCH /tutors/me/profile
tutors.patch('/me/profile', authMiddleware, requireRole('tutor', 'admin'), async (c) => {
  const { id: userId } = c.get('user');
  const body = await c.req.json<Record<string, unknown>>();
  const profile = await c.env.DB.prepare('SELECT id FROM tutor_profiles WHERE user_id = ?').bind(userId).first<{ id: string }>();
  if (!profile) return err(c, 'NOT_FOUND', 'Profile not found', 404);

  const fields: string[] = [];
  const values: unknown[] = [];
  const map: Record<string, string> = { headline: 'headline', bio: 'bio', location: 'location', format: 'format', price: 'price' };
  for (const [k, col] of Object.entries(map)) {
    if (body[k] !== undefined) { fields.push(`${col} = ?`); values.push(body[k]); }
  }
  if (body.education) { fields.push('education_json = ?'); values.push(JSON.stringify(body.education)); }
  if (body.subjects) { fields.push('subjects_json = ?'); values.push(JSON.stringify(body.subjects)); }
  if (body.levels) { fields.push('levels_json = ?'); values.push(JSON.stringify(body.levels)); }
  if (body.payout) { fields.push('payout_json = ?'); values.push(JSON.stringify(body.payout)); }
  if (!fields.length) return err(c, 'VALIDATION_ERROR', 'No fields to update', 400);

  values.push(profile.id);
  await c.env.DB.prepare(`UPDATE tutor_profiles SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
  const updated = await c.env.DB.prepare('SELECT * FROM tutor_profiles WHERE id = ?').bind(profile.id).first();
  return ok(c, updated);
});

export default tutors;
