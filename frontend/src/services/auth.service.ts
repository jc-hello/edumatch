import { api, unwrap } from '@/lib/api';
import type { User } from '@/stores/auth-store';

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export const authService = {
  async register(input: {
    email: string;
    password: string;
    fullName: string;
    role: 'student' | 'tutor';
  }): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', input);
    return unwrap<AuthResponse>(data);
  },

  async login(input: { email: string; password: string }): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', input);
    return unwrap<AuthResponse>(data);
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/forgot-password', { email });
    return unwrap(data);
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return unwrap(data);
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const { data } = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return unwrap(data);
  },

  async getMe(): Promise<User> {
    const { data } = await api.get('/users/me');
    return unwrap<User>(data);
  },
};
