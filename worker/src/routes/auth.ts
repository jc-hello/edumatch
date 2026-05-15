import { Hono } from 'hono';
import { AppContext } from '../types';
import { hashPassword, comparePassword } from '../lib/password';
import { signJwt, verifyJwt, randomUUID } from '../lib/jwt';
import { sendEmail } from '../lib/email';
import { ok, err } from '../lib/response';
import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rate-limit';

const auth = new Hono<AppContext>();

const ACCESS_EXP = 15 * 60; // 15 min
const REFRESH_EXP = 7 * 24 * 3600; // 7 days

async function issueTokens(userId: string, role: string, secret: string) {
  const now = Math.floor(Date.now() / 1000);
  const accessToken = await signJwt({ sub: userId, role: role as 'student' | 'tutor' | 'admin', jti: randomUUID(), exp: now + ACCESS_EXP }, secret);
  const refreshToken = await signJwt({ sub: userId, role: role as 'student' | 'tutor' | 'admin', jti: randomUUID(), exp: now + REFRESH_EXP }, secret);
  return { accessToken, refreshToken };
}

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

// POST /auth/register
auth.post('/register', async (c) => {
  const body = await c.req.json<{ email: string; password: string; fullName: string; role: string }>();
  if (!body.email || !body.password || !body.fullName || !body.role) {
    return err(c, 'VALIDATION_ERROR', 'Missing required fields', 400);
  }
  if (!['student', 'tutor'].includes(body.role)) {
    return err(c, 'VALIDATION_ERROR', 'Invalid role', 400);
  }
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(body.email).first();
  if (existing) return err(c, 'CONFLICT', 'Email already registered', 409);

  const id = randomUUID();
  const passwordHash = await hashPassword(body.password);
  await c.env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
  ).bind(id, body.email.toLowerCase(), passwordHash, body.fullName, body.role).run();

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  const { accessToken, refreshToken } = await issueTokens(id, body.role, c.env.JWT_SECRET);

  // Send verification email (fire-and-forget)
  const verifyToken = randomUUID();
  const tokenHash = await hashToken(verifyToken);
  const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  await c.env.DB.prepare('INSERT INTO email_verify_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)').bind(tokenHash, id, expiresAt).run();
  sendEmail(c.env.RESEND_API_KEY, body.email, 'Xác thực email EduMatch', `<p>Token: ${verifyToken}</p>`).catch(() => {});

  return ok(c, { accessToken, refreshToken, user: formatUser(user as Record<string, unknown>) }, undefined, 201);
});

// POST /auth/login
auth.post('/login', rateLimitMiddleware('login'), async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();
  if (!body.email || !body.password) return err(c, 'VALIDATION_ERROR', 'Missing credentials', 400);

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL').bind(body.email.toLowerCase()).first() as Record<string, unknown> | null;
  if (!user) return err(c, 'UNAUTHORIZED', 'Invalid email or password', 401);
  if (!user.is_active) return err(c, 'FORBIDDEN', 'Account is locked', 403);

  const valid = await comparePassword(body.password, user.password_hash as string);
  if (!valid) return err(c, 'UNAUTHORIZED', 'Invalid email or password', 401);

  const { accessToken, refreshToken } = await issueTokens(user.id as string, user.role as string, c.env.JWT_SECRET);
  return ok(c, { accessToken, refreshToken, user: formatUser(user) });
});

// POST /auth/logout
auth.post('/logout', authMiddleware, async (c) => {
  const user = c.get('user');
  const expiresAt = new Date(Date.now() + 16 * 60 * 1000).toISOString();
  await c.env.DB.prepare('INSERT OR IGNORE INTO token_blacklist (jti, expires_at) VALUES (?, ?)').bind(user.jti, expiresAt).run();
  return ok(c, { message: 'Đã đăng xuất' });
});

// POST /auth/refresh
auth.post('/refresh', async (c) => {
  const body = await c.req.json<{ refreshToken: string }>();
  if (!body.refreshToken) return err(c, 'VALIDATION_ERROR', 'Missing refreshToken', 400);

  const payload = await verifyJwt(body.refreshToken, c.env.JWT_SECRET);
  if (!payload) return err(c, 'UNAUTHORIZED', 'Invalid or expired refresh token', 401);

  const blacklisted = await c.env.DB.prepare('SELECT jti FROM token_blacklist WHERE jti = ?').bind(payload.jti).first();
  if (blacklisted) return err(c, 'UNAUTHORIZED', 'Token revoked', 401);

  // Revoke old refresh token jti
  const oldExp = new Date(payload.exp * 1000).toISOString();
  await c.env.DB.prepare('INSERT OR IGNORE INTO token_blacklist (jti, expires_at) VALUES (?, ?)').bind(payload.jti, oldExp).run();

  const { accessToken, refreshToken } = await issueTokens(payload.sub, payload.role, c.env.JWT_SECRET);
  return ok(c, { accessToken, refreshToken });
});

// POST /auth/forgot-password
auth.post('/forgot-password', rateLimitMiddleware('forgot-password'), async (c) => {
  const body = await c.req.json<{ email: string }>();
  // Always return 200 to prevent user enumeration
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind((body.email ?? '').toLowerCase()).first();
  if (user) {
    const token = randomUUID();
    const tokenHash = await hashToken(token);
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
    await c.env.DB.prepare('INSERT INTO password_reset_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)').bind(tokenHash, (user as Record<string, unknown>).id, expiresAt).run();
    sendEmail(c.env.RESEND_API_KEY, body.email, 'Khôi phục mật khẩu EduMatch', `<p>Token: ${token}</p>`).catch(() => {});
  }
  return ok(c, { message: 'Email khôi phục đã gửi' });
});

// POST /auth/reset-password
auth.post('/reset-password', rateLimitMiddleware('reset-password'), async (c) => {
  const body = await c.req.json<{ token: string; newPassword: string }>();
  if (!body.token || !body.newPassword) return err(c, 'VALIDATION_ERROR', 'Missing fields', 400);

  const tokenHash = await hashToken(body.token);
  const record = await c.env.DB.prepare(
    'SELECT * FROM password_reset_tokens WHERE token_hash = ? AND used = 0 AND expires_at > datetime(\'now\')',
  ).bind(tokenHash).first() as Record<string, unknown> | null;

  if (!record) return err(c, 'VALIDATION_ERROR', 'Token không hợp lệ hoặc đã hết hạn', 400);

  const newHash = await hashPassword(body.newPassword);
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(newHash, record.user_id),
    c.env.DB.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token_hash = ?').bind(tokenHash),
  ]);
  return ok(c, { message: 'Đặt lại mật khẩu thành công' });
});

// GET /auth/verify-email
auth.get('/verify-email', async (c) => {
  const token = c.req.query('token');
  if (!token) return err(c, 'VALIDATION_ERROR', 'Missing token', 400);

  const tokenHash = await hashToken(token);
  const record = await c.env.DB.prepare(
    'SELECT * FROM email_verify_tokens WHERE token_hash = ? AND used = 0 AND expires_at > datetime(\'now\')',
  ).bind(tokenHash).first() as Record<string, unknown> | null;

  if (!record) return err(c, 'VALIDATION_ERROR', 'Token không hợp lệ', 400);

  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').bind(record.user_id),
    c.env.DB.prepare('UPDATE email_verify_tokens SET used = 1 WHERE token_hash = ?').bind(tokenHash),
  ]);
  return ok(c, { message: 'Email đã được xác thực' });
});

// SHA-256 hash for token storage
async function hashToken(token: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default auth;
