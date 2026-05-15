import { Hono } from 'hono';
import { AppContext } from '../types';
import { ok, err } from '../lib/response';
import { parsePage, buildMeta } from '../lib/paginate';
import { authMiddleware } from '../middleware/auth';

const notifications = new Hono<AppContext>();
notifications.use('*', authMiddleware);

// GET /notifications
notifications.get('/', async (c) => {
  const { id: userId } = c.get('user');
  const q = c.req.query() as Record<string, string>;
  const { page, limit, offset } = parsePage(q);
  const unreadOnly = q.unreadOnly === 'true';

  const where = unreadOnly ? 'WHERE user_id = ? AND read = 0' : 'WHERE user_id = ?';
  const total = await c.env.DB.prepare(`SELECT COUNT(*) as cnt FROM notifications ${where}`).bind(userId).first<{ cnt: number }>();
  const unreadCount = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND read = 0').bind(userId).first<{ cnt: number }>();
  const rows = await c.env.DB.prepare(`SELECT * FROM notifications ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(userId, limit, offset).all();

  return c.json({
    success: true,
    data: rows.results,
    meta: { ...buildMeta(total?.cnt ?? 0, page, limit), unreadCount: unreadCount?.cnt ?? 0 },
  });
});

// PATCH /notifications/:id/read
notifications.patch('/:id/read', async (c) => {
  const { id: userId } = c.get('user');
  const { id } = c.req.param();
  const n = await c.env.DB.prepare('SELECT id FROM notifications WHERE id = ? AND user_id = ?').bind(id, userId).first();
  if (!n) return err(c, 'NOT_FOUND', 'Notification not found', 404);
  await c.env.DB.prepare('UPDATE notifications SET read = 1 WHERE id = ?').bind(id).run();
  return ok(c, { id, read: true });
});

// PATCH /notifications/read-all
notifications.patch('/read-all', async (c) => {
  const { id: userId } = c.get('user');
  await c.env.DB.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').bind(userId).run();
  return ok(c, { message: 'All notifications marked as read' });
});

export default notifications;
