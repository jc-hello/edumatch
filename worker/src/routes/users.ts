import { Hono } from 'hono';
import { AppContext } from '../types';
import { ok, err } from '../lib/response';
import { authMiddleware } from '../middleware/auth';
import { hashPassword, comparePassword } from '../lib/password';

const users = new Hono<AppContext>();

users.use('*', authMiddleware);

function formatUser(u: Record<string, unknown>) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.full_name,
    role: u.role,
    avatarUrl: u.avatar_url,
    phone: u.phone,
    isActive: u.is_active === 1,
    emailVerified: u.email_verified === 1,
  };
}

// GET /users/me
users.get('/me', async (c) => {
  const { id } = c.get('user');
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL').bind(id).first();
  if (!user) return err(c, 'NOT_FOUND', 'User not found', 404);
  return ok(c, formatUser(user as Record<string, unknown>));
});

// PATCH /users/me
users.patch('/me', async (c) => {
  const { id } = c.get('user');
  const body = await c.req.json<{ fullName?: string; phone?: string; avatarUrl?: string }>();
  const fields: string[] = [];
  const values: unknown[] = [];
  if (body.fullName !== undefined) { fields.push('full_name = ?'); values.push(body.fullName); }
  if (body.phone !== undefined) { fields.push('phone = ?'); values.push(body.phone); }
  if (body.avatarUrl !== undefined) { fields.push('avatar_url = ?'); values.push(body.avatarUrl); }
  if (!fields.length) return err(c, 'VALIDATION_ERROR', 'No fields to update', 400);
  values.push(id);
  await c.env.DB.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  return ok(c, formatUser(user as Record<string, unknown>));
});

// PATCH /users/me/password
users.patch('/me/password', async (c) => {
  const { id } = c.get('user');
  const body = await c.req.json<{ currentPassword: string; newPassword: string }>();
  if (!body.currentPassword || !body.newPassword) return err(c, 'VALIDATION_ERROR', 'Missing fields', 400);

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first() as Record<string, unknown>;
  const valid = await comparePassword(body.currentPassword, user.password_hash as string);
  if (!valid) return err(c, 'UNAUTHORIZED', 'Mật khẩu hiện tại không đúng', 401);

  const newHash = await hashPassword(body.newPassword);
  await c.env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(newHash, id).run();
  return ok(c, { message: 'Đổi mật khẩu thành công' });
});

// DELETE /users/me
users.delete('/me', async (c) => {
  const { id } = c.get('user');
  const deletedAt = new Date().toISOString();
  await c.env.DB.prepare('UPDATE users SET deleted_at = ?, is_active = 0 WHERE id = ?').bind(deletedAt, id).run();
  return ok(c, { message: 'Tài khoản đã được xoá. Bạn có 30 ngày để khôi phục.' });
});

// POST /users/me/avatar (multipart upload → R2)
users.post('/me/avatar', async (c) => {
  const { id } = c.get('user');
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return err(c, 'VALIDATION_ERROR', 'Missing file', 400);
  if (file.size > 2 * 1024 * 1024) return err(c, 'VALIDATION_ERROR', 'File too large (max 2MB)', 400);

  const ext = file.name.split('.').pop();
  const key = `avatar/${id}/avatar.${ext}`;
  await c.env.STORAGE.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  const avatarUrl = `${c.env.R2_PUBLIC_URL}/${key}`;
  await c.env.DB.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').bind(avatarUrl, id).run();
  return ok(c, { avatarUrl });
});

export default users;
