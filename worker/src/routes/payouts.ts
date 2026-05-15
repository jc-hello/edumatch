import { Hono } from 'hono';
import { AppContext } from '../types';
import { ok, err } from '../lib/response';
import { parsePage, buildMeta } from '../lib/paginate';
import { authMiddleware, requireRole } from '../middleware/auth';
import { randomUUID } from '../lib/jwt';

const payouts = new Hono<AppContext>();
payouts.use('*', authMiddleware, requireRole('tutor', 'admin'));

// GET /payouts/me/summary
payouts.get('/me/summary', async (c) => {
  const { id: tutorId } = c.get('user');

  const completed = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM payouts WHERE tutor_id = ? AND status = 'completed'",
  ).bind(tutorId).first<{ total: number }>();

  const earnings = await c.env.DB.prepare(
    "SELECT SUM(b.amount - b.platform_fee) as total FROM bookings b WHERE b.tutor_id = ? AND b.status = 'completed'",
  ).bind(tutorId).first<{ total: number }>();

  const paid = completed?.total ?? 0;
  const lifetime = earnings?.total ?? 0;
  const balance = lifetime - paid;

  // Monthly series (last 6 months)
  const series = await c.env.DB.prepare(
    "SELECT strftime('%m', created_at) as month, SUM(amount - platform_fee) as value FROM bookings WHERE tutor_id = ? AND status = 'completed' AND created_at >= date('now', '-6 months') GROUP BY month ORDER BY month",
  ).bind(tutorId).all();

  const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  const monthlySeries = (series.results as { month: string; value: number }[]).map((r) => ({
    month: monthNames[parseInt(r.month, 10) - 1],
    value: Math.round(r.value / 1_000_000 * 10) / 10,
  }));

  return ok(c, { balance, lifetimeEarnings: lifetime, monthlySeries });
});

// GET /payouts/me
payouts.get('/me', async (c) => {
  const { id: tutorId } = c.get('user');
  const { page, limit, offset } = parsePage(c.req.query() as Record<string, string>);
  const total = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM payouts WHERE tutor_id = ?').bind(tutorId).first<{ cnt: number }>();
  const rows = await c.env.DB.prepare('SELECT * FROM payouts WHERE tutor_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').bind(tutorId, limit, offset).all();

  const data = (rows.results as Record<string, unknown>[]).map((p) => ({
    id: p.id,
    date: new Date(p.created_at as string).toLocaleDateString('vi-VN'),
    amount: p.amount,
    status: p.status,
    method: p.method,
  }));
  return ok(c, data, buildMeta(total?.cnt ?? 0, page, limit));
});

// POST /payouts/me/request
payouts.post('/me/request', async (c) => {
  const { id: tutorId } = c.get('user');
  const body = await c.req.json<{ amount: number }>();
  if (!body.amount || body.amount <= 0) return err(c, 'VALIDATION_ERROR', 'Invalid amount', 400);

  // Check balance
  const earnings = await c.env.DB.prepare(
    "SELECT SUM(amount - platform_fee) as total FROM bookings WHERE tutor_id = ? AND status = 'completed'",
  ).bind(tutorId).first<{ total: number }>();
  const paid = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM payouts WHERE tutor_id = ? AND status IN ('completed','pending')",
  ).bind(tutorId).first<{ total: number }>();
  const balance = (earnings?.total ?? 0) - (paid?.total ?? 0);
  if (body.amount > balance) return err(c, 'VALIDATION_ERROR', 'Insufficient balance', 400);

  const profile = await c.env.DB.prepare('SELECT payout_json FROM tutor_profiles WHERE user_id = ?').bind(tutorId).first<{ payout_json: string }>();
  const payout = profile?.payout_json ? JSON.parse(profile.payout_json) : {};
  const method = payout.bank ? `${payout.bank} · ${String(payout.account ?? '').slice(-4).padStart(8, '*')}` : null;

  const id = randomUUID();
  await c.env.DB.prepare('INSERT INTO payouts (id, tutor_id, amount, method) VALUES (?, ?, ?, ?)').bind(id, tutorId, body.amount, method).run();
  const created = await c.env.DB.prepare('SELECT * FROM payouts WHERE id = ?').bind(id).first();
  return ok(c, created, undefined, 201);
});

export default payouts;
