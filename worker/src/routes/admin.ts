import { Hono } from 'hono';
import { AppContext } from '../types';
import { ok, err } from '../lib/response';
import { parsePage, buildMeta } from '../lib/paginate';
import { authMiddleware, requireRole } from '../middleware/auth';

const admin = new Hono<AppContext>();
admin.use('*', authMiddleware, requireRole('admin'));

// GET /admin/stats/overview
admin.get('/stats/overview', async (c) => {
  const [totalUsers, pendingTutors, openReports, monthlyRevenue, bookingsByDay, revenueSeries] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as cnt FROM users WHERE deleted_at IS NULL').first<{ cnt: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as cnt FROM tutor_profiles WHERE status = 'pending_review'").first<{ cnt: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as cnt FROM reports WHERE status = 'open'").first<{ cnt: number }>(),
    c.env.DB.prepare("SELECT SUM(platform_fee) as total FROM bookings WHERE status = 'completed' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')").first<{ total: number }>(),
    c.env.DB.prepare("SELECT strftime('%w', created_at) as dow, COUNT(*) as value FROM bookings WHERE created_at >= date('now', '-7 days') GROUP BY dow").all(),
    c.env.DB.prepare("SELECT strftime('%m', created_at) as month, SUM(platform_fee) as value FROM bookings WHERE status = 'completed' AND created_at >= date('now', '-6 months') GROUP BY month ORDER BY month").all(),
  ]);

  const dowNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

  return ok(c, {
    totalUsers: totalUsers?.cnt ?? 0,
    pendingTutors: pendingTutors?.cnt ?? 0,
    openReports: openReports?.cnt ?? 0,
    monthlyRevenue: monthlyRevenue?.total ?? 0,
    bookingsByDay: (bookingsByDay.results as { dow: string; value: number }[]).map((r) => ({ label: dowNames[parseInt(r.dow)], value: r.value })),
    revenueSeries: (revenueSeries.results as { month: string; value: number }[]).map((r) => ({ month: monthNames[parseInt(r.month) - 1], value: Math.round(r.value / 1_000_000) })),
  });
});

// GET /admin/tutors/queue
admin.get('/tutors/queue', async (c) => {
  const status = c.req.query('status') ?? 'pending_review';
  const { page, limit, offset } = parsePage(c.req.query() as Record<string, string>);
  const total = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM tutor_profiles WHERE status = ?').bind(status).first<{ cnt: number }>();
  const rows = await c.env.DB.prepare(
    'SELECT tp.*, u.full_name, u.email, u.avatar_url FROM tutor_profiles tp JOIN users u ON u.id = tp.user_id WHERE tp.status = ? ORDER BY tp.created_at ASC LIMIT ? OFFSET ?',
  ).bind(status, limit, offset).all();
  return ok(c, rows.results, buildMeta(total?.cnt ?? 0, page, limit));
});

// GET /admin/tutors/:id
admin.get('/tutors/:id', async (c) => {
  const { id } = c.req.param();
  const row = await c.env.DB.prepare(
    'SELECT tp.*, u.full_name, u.email, u.avatar_url FROM tutor_profiles tp JOIN users u ON u.id = tp.user_id WHERE tp.id = ?',
  ).bind(id).first();
  if (!row) return err(c, 'NOT_FOUND', 'Tutor profile not found', 404);
  return ok(c, row);
});

// PATCH /admin/tutors/:id/approve
admin.patch('/tutors/:id/approve', async (c) => {
  const { id } = c.req.param();
  await c.env.DB.prepare("UPDATE tutor_profiles SET status = 'approved' WHERE id = ?").bind(id).run();
  return ok(c, { id, status: 'approved' });
});

// PATCH /admin/tutors/:id/reject
admin.patch('/tutors/:id/reject', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json<{ reason: string }>();
  await c.env.DB.prepare("UPDATE tutor_profiles SET status = 'rejected' WHERE id = ?").bind(id).run();
  return ok(c, { id, status: 'rejected', reason: body.reason });
});

// PATCH /admin/tutors/:id/request-info
admin.patch('/tutors/:id/request-info', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json<{ message: string }>();
  await c.env.DB.prepare("UPDATE tutor_profiles SET status = 'info_requested' WHERE id = ?").bind(id).run();
  return ok(c, { id, status: 'info_requested', message: body.message });
});

// GET /admin/users
admin.get('/users', async (c) => {
  const q = c.req.query() as Record<string, string>;
  const { page, limit, offset } = parsePage(q);
  const conditions: string[] = ['deleted_at IS NULL'];
  const params: unknown[] = [];
  if (q.q) { conditions.push('(full_name LIKE ? OR email LIKE ?)'); params.push(`%${q.q}%`, `%${q.q}%`); }
  if (q.role) { conditions.push('role = ?'); params.push(q.role); }
  if (q.status === 'active') { conditions.push('is_active = 1'); }
  if (q.status === 'locked') { conditions.push('is_active = 0'); }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const total = await c.env.DB.prepare(`SELECT COUNT(*) as cnt FROM users ${where}`).bind(...params).first<{ cnt: number }>();
  const rows = await c.env.DB.prepare(`SELECT id, full_name, email, role, is_active, created_at FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all();

  const data = (rows.results as Record<string, unknown>[]).map((u) => ({
    id: u.id,
    name: u.full_name,
    email: u.email,
    role: u.role,
    status: u.is_active ? 'active' : 'locked',
    joined: (u.created_at as string).slice(0, 10),
  }));
  return ok(c, data, buildMeta(total?.cnt ?? 0, page, limit));
});

// PATCH /admin/users/:id/lock
admin.patch('/users/:id/lock', async (c) => {
  const { id } = c.req.param();
  await c.env.DB.prepare('UPDATE users SET is_active = 0 WHERE id = ?').bind(id).run();
  return ok(c, { id, status: 'locked' });
});

// PATCH /admin/users/:id/unlock
admin.patch('/users/:id/unlock', async (c) => {
  const { id } = c.req.param();
  await c.env.DB.prepare('UPDATE users SET is_active = 1 WHERE id = ?').bind(id).run();
  return ok(c, { id, status: 'active' });
});

// POST /admin/users/:id/refund
admin.post('/users/:id/refund', async (c) => {
  const body = await c.req.json<{ bookingId: string; amount: number; reason: string }>();
  if (!body.bookingId) return err(c, 'VALIDATION_ERROR', 'Missing bookingId', 400);
  await c.env.DB.prepare("UPDATE bookings SET status = 'refunded' WHERE id = ?").bind(body.bookingId).run();
  return ok(c, { message: 'Refund processed', ...body });
});

// GET /admin/reports
admin.get('/reports', async (c) => {
  const q = c.req.query() as Record<string, string>;
  const { page, limit, offset } = parsePage(q);
  const status = q.status ?? 'open';
  const total = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM reports WHERE status = ?').bind(status).first<{ cnt: number }>();
  const rows = await c.env.DB.prepare('SELECT * FROM reports WHERE status = ? ORDER BY submitted DESC LIMIT ? OFFSET ?').bind(status, limit, offset).all();
  return ok(c, rows.results, buildMeta(total?.cnt ?? 0, page, limit));
});

// PATCH /admin/reports/:id/resolve
admin.patch('/reports/:id/resolve', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json<{ resolution: string; actionTaken?: string }>();
  await c.env.DB.prepare("UPDATE reports SET status = 'resolved', resolution = ?, action_taken = ? WHERE id = ?").bind(body.resolution, body.actionTaken ?? null, id).run();
  return ok(c, { id, status: 'resolved' });
});

// GET /admin/reports/export.csv
admin.get('/reports/export.csv', async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM reports ORDER BY submitted DESC').all();
  const header = 'id,type,target,severity,status,submitted\n';
  const lines = (rows.results as Record<string, unknown>[]).map((r) =>
    [r.id, `"${r.type}"`, `"${r.target}"`, r.severity, r.status, r.submitted].join(','),
  );
  return new Response(header + lines.join('\n'), {
    headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="reports.csv"' },
  });
});

export default admin;
