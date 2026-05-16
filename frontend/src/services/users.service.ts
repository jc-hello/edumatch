import { api, unwrap } from '@/lib/api';
import type { User } from '@/stores/auth-store';

export const usersService = {
  async updateProfile(input: {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
  }): Promise<User> {
    const { data } = await api.patch('/users/me', input);
    return unwrap<User>(data);
  },

  async changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const { data } = await api.patch('/users/me/password', input);
    return unwrap(data);
  },

  async deleteAccount(): Promise<{ message: string }> {
    const { data } = await api.delete('/users/me');
    return unwrap(data);
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(data);
  },
};
