import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'tutor' | 'admin';
  avatarUrl?: string | null;
  phone?: string | null;
  isActive: boolean;
  emailVerified: boolean;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  hasHydrated: boolean;
  setSession: (params: { accessToken: string; refreshToken: string; user: User }) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hasHydrated: false,
      setSession: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user }),
      setTokens: (accessToken, refreshToken) =>
        set((s) => ({ accessToken, refreshToken: refreshToken ?? s.refreshToken })),
      setUser: (user) => set({ user }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'edumatch-auth',
      onRehydrateStorage: () => (state) => {
        state?.hasHydrated && state.hasHydrated;
        if (state) state.hasHydrated = true;
      },
    },
  ),
);
