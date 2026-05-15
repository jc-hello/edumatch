import { Hono } from 'hono';
import { AppContext } from '../types';
import { ok, err } from '../lib/response';
import { authMiddleware, requireRole } from '../middleware/auth';
import { randomUUID } from '../lib/jwt';

const payments = new Hono<AppContext>();

// POST /payments/vnpay/create — authenticated
payments.post('/vnpay/create', authMiddleware, async (c) => {
  const body = await c.req.json<{ bookingId: string; amount: number; returnUrl: string }>();
  if (!body.bookingId || !body.amount) return err(c, 'VALIDATION_ERROR', 'Missing fields', 400);

  const booking = await c.env.DB.prepare('SELECT id FROM bookings WHERE id = ?').bind(body.bookingId).first();
  if (!booking) return err(c, 'NOT_FOUND', 'Booking not found', 404);

  const txnRef = `${body.bookingId}-${Date.now()}`;
  const paymentId = randomUUID();
  await c.env.DB.prepare('INSERT INTO payments (id, booking_id, amount, txn_ref) VALUES (?, ?, ?, ?)').bind(paymentId, body.bookingId, body.amount, txnRef).run();

  // Stub VNPay URL
  const paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?stub=1&txnRef=${txnRef}&amount=${body.amount}&returnUrl=${encodeURIComponent(body.returnUrl)}`;
  return ok(c, { paymentUrl, txnRef });
});

// GET /payments/vnpay/return — public, called by VNPay redirect
payments.get('/vnpay/return', async (c) => {
  const q = c.req.query() as Record<string, string>;
  const txnRef = q.vnp_TxnRef ?? q.txnRef ?? '';
  const responseCode = q.vnp_ResponseCode ?? '00';
  const bookingId = txnRef.split('-')[0];

  if (responseCode === '00') {
    await c.env.DB.prepare("UPDATE bookings SET status = 'confirmed' WHERE id = ?").bind(bookingId).run();
    await c.env.DB.prepare("UPDATE payments SET status = 'completed' WHERE txn_ref = ?").bind(txnRef).run();
    return c.redirect(`${c.env.FRONTEND_URL}/payment/result?status=success&bookingId=${bookingId}&amount=${q.vnp_Amount ?? ''}`);
  }
  return c.redirect(`${c.env.FRONTEND_URL}/payment/result?status=failed&bookingId=${bookingId}`);
});

// POST /payments/vnpay/ipn — public server-to-server
payments.post('/vnpay/ipn', async (c) => {
  const body = await c.req.json<{ vnp_TxnRef?: string; vnp_ResponseCode?: string }>().catch(() => ({ vnp_TxnRef: undefined, vnp_ResponseCode: undefined }));
  const txnRef = body.vnp_TxnRef ?? '';
  const responseCode = body.vnp_ResponseCode ?? '';
  if (responseCode === '00' && txnRef) {
    const bookingId = txnRef.split('-')[0];
    await c.env.DB.prepare("UPDATE bookings SET status = 'confirmed' WHERE id = ?").bind(bookingId).run();
    await c.env.DB.prepare("UPDATE payments SET status = 'completed' WHERE txn_ref = ?").bind(txnRef).run();
  }
  return c.json({ RspCode: '00', Message: 'Confirm Success' });
});

// POST /payments/:bookingId/refund — admin only
payments.post('/:bookingId/refund', authMiddleware, requireRole('admin'), async (c) => {
  const { bookingId } = c.req.param();
  const body = await c.req.json<{ amount: number; reason: string }>();
  const booking = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(bookingId).first();
  if (!booking) return err(c, 'NOT_FOUND', 'Booking not found', 404);

  await c.env.DB.prepare("UPDATE bookings SET status = 'refunded' WHERE id = ?").bind(bookingId).run();
  await c.env.DB.prepare("UPDATE payments SET status = 'refunded' WHERE booking_id = ?").bind(bookingId).run();
  return ok(c, { message: 'Refund processed', amount: body.amount, reason: body.reason });
});

export default payments;
