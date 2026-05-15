import { Hono } from 'hono';
import { AppContext } from './types';
import { corsMiddleware } from './middleware/cors';

import auth from './routes/auth';
import users from './routes/users';
import tutors from './routes/tutors';
import favorites from './routes/favorites';
import availability from './routes/availability';
import bookings from './routes/bookings';
import reviews from './routes/reviews';
import payments from './routes/payments';
import payouts from './routes/payouts';
import admin from './routes/admin';
import notifications from './routes/notifications';
import uploads from './routes/uploads';
import meta from './routes/meta';

const app = new Hono<AppContext>();

app.use('*', corsMiddleware);

app.route('/auth', auth);
app.route('/users', users);
app.route('/tutors', tutors);
app.route('/favorites', favorites);
app.route('/availability', availability);
app.route('/bookings', bookings);
app.route('/reviews', reviews);
app.route('/payments', payments);
app.route('/payouts', payouts);
app.route('/admin', admin);
app.route('/notifications', notifications);
app.route('/uploads', uploads);
app.route('/meta', meta);

app.get('/health', (c) => c.json({ status: 'ok', ts: new Date().toISOString() }));

app.notFound((c) => c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404));
app.onError((error, c) => {
  console.error(error);
  return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, 500);
});

export default app;
