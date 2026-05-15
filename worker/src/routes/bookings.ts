import { Hono } from 'hono';
import { AppContext } from '../types';
import { ok, err } from '../lib/response';
import { parsePage, buildMeta } from '../lib/paginate';
import { authMiddleware, requireRole } from '../middleware/auth';
import { randomUUID } from '../lib/jwt';

const bookings = new Hono<AppContext>();
bookings.use('*', authMiddleware);

function formatBooking(b: Record<string, unknown>, tutor?: Record<string, unknown>, student?: Record<string, unknown>) {
  return {
    id: b.id,
    tutorId: b.tutor_id,
    studentId: b.student_id,
    subject: b.subject,
    date: b.date,
    time: `${b.start_time} - ${addHours(b.start_time as string, b.duration as number)}`,
    startTime: b.start_time,
    duration: b.duration,
    status: b.status,
    amount: b.amount,
    platformFee: b.platform_fee,
    format: b.format,
    goal: b.goal,
    meetingUrl: b.meeting_url,
    cancelledReason: b.cancelled_reason,
    createdAt: b.created_at,
    ...(tutor ? { tutor } : {}),
    ...(student ? { student } : {}),
  };
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMin = h * 60 + m + hours * 60;
  return `${String(Math.floor(totalMin / 60) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
}

// GET /bookings/export.csv — MUST be before /:id
bookings.get('/export.csv', async (c) => {
  const { id: userId, role } = c.get('user');
  const field = role === 'tutor' ? 'tutor_id' : 'student_id';
  const rows = await c.env.DB.prepare(`SELECT * FROM bookings WHERE ${field} = ? ORDER BY created_at DESC`).bind(userId).all();

  const header = 'id,status,date,startTime,duration,subject,amount,format\n';
  const lines = (rows.results as Record<string, unknown>[]).map((b) =>
    [b.id, b.status, b.date, b.start_time, b.duration, `"${b.subject}"`, b.amount, b.format].join(','),
  );
  return new Response(header + lines.join('\n'), {
    headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="bookings.csv"' },
  });
});

// GET /bookings
bookings.get('/', async (c) => {
  const { id: userId, role } = c.get('user');
  const q = c.req.query() as Record<string, string>;
  const { page, limit, offset } = parsePage(q);

  const conditions: string[] = [];
  const params: unknown[] = [];

  const userRole = q.role || role;
  if (userRole === 'tutor') { conditions.push('b.tutor_id = ?'); params.push(userId); }
  else if (role === 'admin') { /* no filter */ }
  else { conditions.push('b.student_id = ?'); params.push(userId); }

  if (q.status) {
    const statuses = q.status.split(',').map((s) => `'${s.trim()}'`).join(',');
    conditions.push(`b.status IN (${statuses})`);
  }
  if (q.q) { conditions.push('(b.id LIKE ? OR b.subject LIKE ?)'); params.push(`%${q.q}%`, `%${q.q}%`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countRow = await c.env.DB.prepare(`SELECT COUNT(*) as cnt FROM bookings b ${where}`).bind(...params).first<{ cnt: number }>();
  const rows = await c.env.DB.prepare(
    `SELECT b.*, u.full_name as tutor_name, u.avatar_url as tutor_avatar FROM bookings b LEFT JOIN users u ON u.id = b.tutor_id ${where} ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
  ).bind(...params, limit, offset).all();

  const data = (rows.results as Record<string, unknown>[]).map((b) =>
    formatBooking(b, { id: b.tutor_id, name: b.tutor_name, avatarUrl: b.tutor_avatar }),
  );
  return ok(c, data, buildMeta(countRow?.cnt ?? 0, page, limit));
});

// POST /bookings
bookings.post('/', requireRole('student'), async (c) => {
  const { id: studentId } = c.get('user');
  const body = await c.req.json<{ tutorId: string; date: string; startTime: string; duration: number; format: string; subject: string; goal?: string }>();
  if (!body.tutorId || !body.date || !body.startTime || !body.duration || !body.format || !body.subject) {
    return err(c, 'VALIDATION_ERROR', 'Missing required fields', 400);
  }

  const tutor = await c.env.DB.prepare('SELECT tp.price, tp.user_id FROM tutor_profiles tp WHERE tp.user_id = ?').bind(body.tutorId).first<{ price: number; user_id: string }>();
  if (!tutor) return err(c, 'NOT_FOUND', 'Tutor not found', 404);

  const amount = Math.round(tutor.price * body.duration);
  const platformFee = Math.round(amount * 0.1);

  const countRow = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM bookings').first<{ cnt: number }>();
  const bookingId = `BK-${String((countRow?.cnt ?? 0) + 1).padStart(4, '0')}`;

  await c.env.DB.prepare(
    'INSERT INTO bookings (id, student_id, tutor_id, date, start_time, duration, format, subject, goal, amount, platform_fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).bind(bookingId, studentId, body.tutorId, body.date, body.startTime, body.duration, body.format, body.subject, body.goal ?? null, amount, platformFee).run();

  return ok(c, { id: bookingId, status: 'pending_payment', subtotal: amount, platformFee, total: amount + platformFee }, undefined, 201);
});

// GET /bookings/:id
bookings.get('/:id', async (c) => {
  const { id: userId, role } = c.get('user');
  const { id } = c.req.param();
  const b = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first() as Record<string, unknown> | null;
  if (!b) return err(c, 'NOT_FOUND', 'Booking not found', 404);
  if (role !== 'admin' && b.student_id !== userId && b.tutor_id !== userId) return err(c, 'FORBIDDEN', 'Access denied', 403);

  const tutor = await c.env.DB.prepare('SELECT id, full_name, avatar_url FROM users WHERE id = ?').bind(b.tutor_id).first<Record<string, unknown>>();
  const student = await c.env.DB.prepare('SELECT id, full_name FROM users WHERE id = ?').bind(b.student_id).first<Record<string, unknown>>();

  return ok(c, formatBooking(b, { id: tutor?.id, name: tutor?.full_name, avatarUrl: tutor?.avatar_url }, { id: student?.id, name: student?.full_name }));
});

// PATCH /bookings/:id/accept
bookings.patch('/:id/accept', requireRole('tutor', 'admin'), async (c) => {
  const { id: userId, role } = c.get('user');
  const { id } = c.req.param();
  const b = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first() as Record<string, unknown> | null;
  if (!b) return err(c, 'NOT_FOUND', 'Booking not found', 404);
  if (role !== 'admin' && b.tutor_id !== userId) return err(c, 'FORBIDDEN', 'Access denied', 403);
  if (b.status !== 'pending_payment' && b.status !== 'confirmed') return err(c, 'CONFLICT', 'Invalid booking status', 409);

  const meetingUrl = `https://meet.google.com/${randomUUID().slice(0, 10)}`;
  await c.env.DB.prepare("UPDATE bookings SET status = 'confirmed', meeting_url = ? WHERE id = ?").bind(meetingUrl, id).run();
  return ok(c, { status: 'confirmed', meetingUrl });
});

// PATCH /bookings/:id/reject
bookings.patch('/:id/reject', requireRole('tutor', 'admin'), async (c) => {
  const { id: userId, role } = c.get('user');
  const { id } = c.req.param();
  const b = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first() as Record<string, unknown> | null;
  if (!b) return err(c, 'NOT_FOUND', 'Booking not found', 404);
  if (role !== 'admin' && b.tutor_id !== userId) return err(c, 'FORBIDDEN', 'Access denied', 403);

  const body = await c.req.json<{ reason?: string }>().catch(() => ({ reason: undefined }));
  await c.env.DB.prepare("UPDATE bookings SET status = 'cancelled', cancelled_reason = ? WHERE id = ?").bind(body.reason ?? null, id).run();
  return ok(c, { status: 'cancelled' });
});

// PATCH /bookings/:id/cancel
bookings.patch('/:id/cancel', async (c) => {
  const { id: userId, role } = c.get('user');
  const { id } = c.req.param();
  const b = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first() as Record<string, unknown> | null;
  if (!b) return err(c, 'NOT_FOUND', 'Booking not found', 404);
  if (role !== 'admin' && b.student_id !== userId && b.tutor_id !== userId) return err(c, 'FORBIDDEN', 'Access denied', 403);

  const body = await c.req.json<{ reason?: string }>().catch(() => ({ reason: undefined }));
  const sessionTime = new Date(`${b.date}T${b.start_time}`).getTime();
  const hoursUntil = (sessionTime - Date.now()) / 3600_000;
  const refundPolicy = hoursUntil > 24 ? 'full' : hoursUntil > 0 ? 'partial' : 'none';
  const refundAmount = refundPolicy === 'full' ? b.amount : refundPolicy === 'partial' ? Math.round((b.amount as number) * 0.5) : 0;

  await c.env.DB.prepare("UPDATE bookings SET status = 'cancelled', cancelled_reason = ? WHERE id = ?").bind(body.reason ?? null, id).run();
  return ok(c, { status: 'cancelled', refundAmount, refundPolicy });
});

// PATCH /bookings/:id/complete
bookings.patch('/:id/complete', requireRole('tutor', 'admin'), async (c) => {
  const { id } = c.req.param();
  const b = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();
  if (!b) return err(c, 'NOT_FOUND', 'Booking not found', 404);
  await c.env.DB.prepare("UPDATE bookings SET status = 'completed' WHERE id = ?").bind(id).run();
  // Update tutor session count
  await c.env.DB.prepare('UPDATE tutor_profiles SET session_count = session_count + 1 WHERE user_id = ?').bind((b as Record<string, unknown>).tutor_id).run();
  return ok(c, { status: 'completed' });
});

export default bookings;
