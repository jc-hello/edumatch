import { Hono } from 'hono';
import { AppContext } from '../types';
import { ok, err } from '../lib/response';
import { authMiddleware, requireRole } from '../middleware/auth';
import { randomUUID } from '../lib/jwt';

const reviews = new Hono<AppContext>();
reviews.use('*', authMiddleware);

// POST /reviews
reviews.post('/', requireRole('student'), async (c) => {
  const { id: studentId } = c.get('user');
  const body = await c.req.json<{ bookingId: string; tutorId: string; rating: number; body: string }>();
  if (!body.bookingId || !body.tutorId || !body.rating) return err(c, 'VALIDATION_ERROR', 'Missing fields', 400);
  if (body.rating < 1 || body.rating > 5) return err(c, 'VALIDATION_ERROR', 'Rating must be 1-5', 400);

  const booking = await c.env.DB.prepare("SELECT * FROM bookings WHERE id = ? AND student_id = ? AND status = 'completed'").bind(body.bookingId, studentId).first();
  if (!booking) return err(c, 'FORBIDDEN', 'Booking not found or not completed', 403);

  const existing = await c.env.DB.prepare('SELECT id FROM reviews WHERE booking_id = ?').bind(body.bookingId).first();
  if (existing) return err(c, 'CONFLICT', 'Already reviewed this booking', 409);

  const id = randomUUID();
  await c.env.DB.prepare('INSERT INTO reviews (id, booking_id, tutor_id, student_id, rating, body) VALUES (?, ?, ?, ?, ?, ?)').bind(id, body.bookingId, body.tutorId, studentId, body.rating, body.body ?? null).run();

  // Update tutor aggregate rating
  const agg = await c.env.DB.prepare('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE tutor_id = ?').bind(body.tutorId).first<{ avg: number; cnt: number }>();
  await c.env.DB.prepare('UPDATE tutor_profiles SET rating = ?, review_count = ? WHERE user_id = ?').bind(
    Math.round((agg?.avg ?? body.rating) * 10) / 10,
    agg?.cnt ?? 1,
    body.tutorId,
  ).run();

  const review = await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(id).first();
  return ok(c, review, undefined, 201);
});

export default reviews;
