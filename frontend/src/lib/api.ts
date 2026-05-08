import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth-store';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach access token ─────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: refresh-then-retry on 401 ──────────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      original._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().clear();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((newToken) => {
            if (!newToken) return reject(error);
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const newAccess = data?.data?.accessToken;
        const newRefresh = data?.data?.refreshToken;
        if (!newAccess) throw error;
        useAuthStore.getState().setTokens(newAccess, newRefresh);
        processQueue(newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        processQueue(null);
        useAuthStore.getState().clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

// Helper: unwrap our backend's ApiResponse<T> wrapper.
export function unwrap<T>(payload: any): T {
  if (payload && typeof payload === 'object' && 'success' in payload) {
    if (payload.success) return payload.data as T;
    throw new Error(payload.error?.message || 'Request failed');
  }
  return payload as T;
}
