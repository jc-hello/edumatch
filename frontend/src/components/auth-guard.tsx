'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export function AuthGuard({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Array<'student' | 'tutor' | 'admin'>;
}) {
  const router = useRouter();
  const { user, accessToken, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken || !user) {
      router.replace('/login');
      return;
    }
    if (roles && !roles.includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [hasHydrated, accessToken, user, roles, router]);

  if (!hasHydrated || !accessToken || !user) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-500">Đang tải…</div>
    );
  }
  if (roles && !roles.includes(user.role)) {
    return null;
  }
  return <>{children}</>;
}
