import { api, unwrap } from '@/lib/api';
import type { User } from '@/stores/auth-store';

export type ApiList<T> = {
  items?: T[];
  data?: T[];
  results?: T[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

export type Tutor = {
  id: string;
  name: string;
  title: string;
  subjects: string[];
  levels: string[];
  location: string;
  format: 'online' | 'offline' | 'flex';
  price: number;
  rating: number;
  reviews: number;
  sessions: number;
  responseTime: string;
  verified: boolean;
  bio: string;
  avatarUrl?: string | null;
};

export type TutorSearchParams = {
  q?: string;
  subject?: string;
  level?: 'THCS' | 'THPT' | 'Đại học' | 'Người đi làm';
  format?: 'online' | 'offline' | 'flex';
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: 'relevance' | 'rating:desc' | 'price:asc' | 'responseTime:asc';
  page?: number;
  limit?: number;
};

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type Booking = {
  id: string;
  tutorId: string;
  studentId: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  status: BookingStatus;
  amount: number;
  platformFee: number;
  format: 'online' | 'offline' | string;
  goal?: string | null;
  meetingUrl?: string | null;
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type AvailabilitySlot = {
  dayIdx: number;
  hour: number;
};

export type CreateTutorProfileInput = {
  headline?: string;
  bio?: string;
  location?: string;
  format?: 'online' | 'offline' | 'flex';
  education?: {
    school?: string;
    degree?: string;
    years?: number;
    cert?: string;
  };
  subjects?: string[];
  levels?: string[];
  price?: number;
  payout?: {
    bank?: string;
    account?: string;
  };
};

export type CreateBookingInput = {
  tutorId: string;
  date: string;
  startTime: string;
  duration: number;
  format: 'online' | 'offline';
  subject: string;
  goal?: string;
};

export type ListBookingsParams = {
  role?: 'student' | 'tutor';
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
};

export type ReviewInput = {
  bookingId: string;
  tutorId: string;
  rating: number;
  body?: string;
};

export type UploadSignInput = {
  fileName: string;
  mimeType: string;
  size: number;
  purpose: 'tutor_doc' | 'booking_attachment' | 'avatar';
};

export type PaymentInput = {
  bookingId: string;
  amount: number;
  returnUrl?: string;
};

export const tutorsService = {
  async list(params?: TutorSearchParams): Promise<ApiList<Tutor> | Tutor[]> {
    const { data } = await api.get('/tutors', { params });
    return unwrap(data);
  },

  async get(id: string): Promise<Tutor> {
    const { data } = await api.get(`/tutors/${encodeURIComponent(id)}`);
    return unwrap<Tutor>(data);
  },

  async availability(id: string, week?: string) {
    const { data } = await api.get(`/tutors/${encodeURIComponent(id)}/availability`, {
      params: { week },
    });
    return unwrap(data);
  },

  async reviews(id: string, params?: { page?: number; limit?: number }) {
    const { data } = await api.get(`/tutors/${encodeURIComponent(id)}/reviews`, { params });
    return unwrap(data);
  },

  async createProfile(input: CreateTutorProfileInput) {
    const { data } = await api.post('/tutors/me/profile', input);
    return unwrap(data);
  },

  async updateProfile(input: Partial<CreateTutorProfileInput>) {
    const { data } = await api.patch('/tutors/me/profile', input);
    return unwrap(data);
  },
};

export const favoritesService = {
  async list(): Promise<Tutor[]> {
    const { data } = await api.get('/favorites');
    return unwrap<Tutor[]>(data);
  },

  async add(tutorId: string) {
    const { data } = await api.post(`/favorites/${encodeURIComponent(tutorId)}`);
    return unwrap(data);
  },

  async remove(tutorId: string): Promise<void> {
    await api.delete(`/favorites/${encodeURIComponent(tutorId)}`);
  },
};

export const availabilityService = {
  async getMine(week?: string) {
    const { data } = await api.get('/availability/me', { params: { week } });
    return unwrap(data);
  },

  async replaceMine(input: { recurring?: boolean; slots: AvailabilitySlot[] }) {
    const { data } = await api.put('/availability/me', input);
    return unwrap(data);
  },
};

export const bookingsService = {
  async list(params?: ListBookingsParams): Promise<ApiList<Booking> | Booking[]> {
    const { data } = await api.get('/bookings', { params });
    return unwrap(data);
  },

  async create(input: CreateBookingInput) {
    const { data } = await api.post('/bookings', input);
    return unwrap(data);
  },

  async get(id: string): Promise<Booking> {
    const { data } = await api.get(`/bookings/${encodeURIComponent(id)}`);
    return unwrap<Booking>(data);
  },

  async accept(id: string) {
    const { data } = await api.patch(`/bookings/${encodeURIComponent(id)}/accept`);
    return unwrap(data);
  },

  async reject(id: string, reason?: string) {
    const { data } = await api.patch(`/bookings/${encodeURIComponent(id)}/reject`, { reason });
    return unwrap(data);
  },

  async cancel(id: string, reason?: string) {
    const { data } = await api.patch(`/bookings/${encodeURIComponent(id)}/cancel`, { reason });
    return unwrap(data);
  },

  async complete(id: string) {
    const { data } = await api.patch(`/bookings/${encodeURIComponent(id)}/complete`);
    return unwrap(data);
  },

  exportCsvUrl() {
    return '/bookings/export.csv';
  },
};

export const reviewsService = {
  async create(input: ReviewInput) {
    const { data } = await api.post('/reviews', input);
    return unwrap(data);
  },
};

export const paymentsService = {
  async createVnpay(input: PaymentInput) {
    const { data } = await api.post('/payments/vnpay/create', input);
    return unwrap(data);
  },

  async refund(bookingId: string, input: { amount: number; reason?: string }) {
    const { data } = await api.post(`/payments/${encodeURIComponent(bookingId)}/refund`, input);
    return unwrap(data);
  },
};

export const payoutsService = {
  async summary() {
    const { data } = await api.get('/payouts/me/summary');
    return unwrap(data);
  },

  async list(params?: { page?: number }) {
    const { data } = await api.get('/payouts/me', { params });
    return unwrap(data);
  },

  async request(amount: number) {
    const { data } = await api.post('/payouts/me/request', { amount });
    return unwrap(data);
  },
};

export const adminService = {
  async overview() {
    const { data } = await api.get('/admin/stats/overview');
    return unwrap(data);
  },

  async tutorQueue(params?: { status?: string; page?: number }) {
    const { data } = await api.get('/admin/tutors/queue', { params });
    return unwrap(data);
  },

  async tutor(id: string) {
    const { data } = await api.get(`/admin/tutors/${encodeURIComponent(id)}`);
    return unwrap(data);
  },

  async approveTutor(id: string, note?: string) {
    const { data } = await api.patch(`/admin/tutors/${encodeURIComponent(id)}/approve`, { note });
    return unwrap(data);
  },

  async rejectTutor(id: string, reason: string) {
    const { data } = await api.patch(`/admin/tutors/${encodeURIComponent(id)}/reject`, { reason });
    return unwrap(data);
  },

  async requestTutorInfo(id: string, message: string) {
    const { data } = await api.patch(`/admin/tutors/${encodeURIComponent(id)}/request-info`, {
      message,
    });
    return unwrap(data);
  },

  async users(params?: {
    q?: string;
    role?: 'student' | 'tutor' | 'admin';
    status?: 'active' | 'locked';
    page?: number;
  }): Promise<ApiList<User> | User[]> {
    const { data } = await api.get('/admin/users', { params });
    return unwrap(data);
  },

  async lockUser(id: string) {
    const { data } = await api.patch(`/admin/users/${encodeURIComponent(id)}/lock`);
    return unwrap(data);
  },

  async unlockUser(id: string) {
    const { data } = await api.patch(`/admin/users/${encodeURIComponent(id)}/unlock`);
    return unwrap(data);
  },

  async refundUser(id: string, input: { bookingId: string; amount: number; reason?: string }) {
    const { data } = await api.post(`/admin/users/${encodeURIComponent(id)}/refund`, input);
    return unwrap(data);
  },

  async reports(params?: { status?: string; page?: number }) {
    const { data } = await api.get('/admin/reports', { params });
    return unwrap(data);
  },

  async resolveReport(id: string, input: { resolution: string; actionTaken?: 'lock' | 'refund' | 'warn' | 'dismiss' }) {
    const { data } = await api.patch(`/admin/reports/${encodeURIComponent(id)}/resolve`, input);
    return unwrap(data);
  },
};

export const notificationsService = {
  async list(params?: { unreadOnly?: boolean; page?: number }): Promise<ApiList<Notification> | Notification[]> {
    const { data } = await api.get('/notifications', { params });
    return unwrap(data);
  },

  async markRead(id: string) {
    const { data } = await api.patch(`/notifications/${encodeURIComponent(id)}/read`);
    return unwrap(data);
  },

  async markAllRead() {
    const { data } = await api.patch('/notifications/read-all');
    return unwrap(data);
  },
};

export const uploadsService = {
  async sign(input: UploadSignInput) {
    const { data } = await api.post('/uploads/sign', input);
    return unwrap(data);
  },

  async direct(key: string, file: Blob | ArrayBuffer | Uint8Array) {
    const { data } = await api.put(`/uploads/direct/${encodeURIComponent(key)}`, file, {
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    return unwrap(data);
  },
};

export const metaService = {
  async subjects(): Promise<string[]> {
    const { data } = await api.get('/meta/subjects');
    return unwrap<string[]>(data);
  },

  async levels(): Promise<string[]> {
    const { data } = await api.get('/meta/levels');
    return unwrap<string[]>(data);
  },

  async banks(): Promise<Array<{ code: string; name: string }>> {
    const { data } = await api.get('/meta/banks');
    return unwrap<Array<{ code: string; name: string }>>(data);
  },
};
