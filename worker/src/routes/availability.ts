import { Hono } from 'hono';
import { AppContext } from '../types';
import { ok, err } from '../lib/response';
import { authMiddleware, requireRole } from '../middleware/auth';
import { randomUUID } from '../lib/jwt';

const availability = new Hono<AppContext>();
availability.use('*', authMiddleware, requireRole('tutor', 'admin'));

// GET /availability/me
availability.get('/me', async (c) => {
  const { id: tutorId } = c.get('user');
  const rows = await c.env.DB.prepare('SELECT day_idx, hour, recurring FROM availability_slots WHERE tutor_id = ?').bind(tutorId).all();
  return ok(c, rows.results);
});

// PUT /availability/me
availability.put('/me', async (c) => {
  const { id: tutorId } = c.get('user');
  const body = await c.req.json<{ recurring: boolean; slots: { dayIdx: number; hour: number }[] }>();
  if (!Array.isArray(body.slots)) return err(c, 'VALIDATION_ERROR', 'slots must be an array', 400);

  // Check no booked slots are being removed
  const booked = await c.env.DB.prepare(
    "SELECT as2.day_idx, as2.hour FROM availability_slots as2 WHERE as2.tutor_id = ? AND EXISTS (SELECT 1 FROM bookings b WHERE b.tutor_id = ? AND b.status IN ('confirmed','pending_payment'))",
  ).bind(tutorId, tutorId).all() as { results: { day_idx: number; hour: number }[] };

  const newSet = new Set(body.slots.map((s) => `${s.dayIdx}:${s.hour}`));
  for (const b of booked.results) {
    if (!newSet.has(`${b.day_idx}:${b.hour}`)) {
      return err(c, 'CONFLICT', 'Cannot remove slot with active bookings', 409);
    }
  }

  // Replace all slots
  await c.env.DB.prepare('DELETE FROM availability_slots WHERE tutor_id = ?').bind(tutorId).run();
  if (body.slots.length > 0) {
    const stmts = body.slots.map((s) =>
      c.env.DB.prepare('INSERT OR IGNORE INTO availability_slots (id, tutor_id, day_idx, hour, recurring) VALUES (?, ?, ?, ?, ?)').bind(
        randomUUID(), tutorId, s.dayIdx, s.hour, body.recurring ? 1 : 0,
      ),
    );
    await c.env.DB.batch(stmts);
  }
  const updated = await c.env.DB.prepare('SELECT day_idx, hour, recurring FROM availability_slots WHERE tutor_id = ?').bind(tutorId).all();
  return ok(c, updated.results);
});

export default availability;
