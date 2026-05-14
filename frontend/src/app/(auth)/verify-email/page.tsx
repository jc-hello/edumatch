'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';

function VerifyInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [state, setState] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');
  const [error, setError] = useState(token ? '' : 'Token không hợp lệ');

  useEffect(() => {
    if (!token) return;
    authService
      .verifyEmail(token)
      .then(() => setState('success'))
      .catch((err) => {
        setState('error');
        setError(err?.response?.data?.error?.message || 'Token đã hết hạn hoặc không hợp lệ');
      });
  }, [token]);

  return (
    <div className="w-full max-w-md text-center edm-animate-fade-up">
      {state === 'loading' && (
        <>
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-tint)] text-accent">
            <Loader2 className="h-7 w-7 animate-spin" />
          </span>
          <h1 className="mt-6 text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
            Đang xác minh email…
          </h1>
          <p className="mt-3 text-muted-foreground">Quá trình chỉ mất vài giây.</p>
        </>
      )}
      {state === 'success' && (
        <>
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h1 className="mt-6 text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
            Email đã được xác minh.
          </h1>
          <p className="mt-3 text-muted-foreground">Bạn có thể tiếp tục sử dụng tất cả tính năng của EduMatch.</p>
          <Button className="mt-8" asChild>
            <Link href="/dashboard">Vào bảng điều khiển</Link>
          </Button>
        </>
      )}
      {state === 'error' && (
        <>
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <XCircle className="h-7 w-7" />
          </span>
          <h1 className="mt-6 text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
            Xác minh thất bại.
          </h1>
          <p className="mt-3 text-muted-foreground">{error}</p>
          <Button className="mt-8" variant="outline" asChild>
            <Link href="/login">Quay lại đăng nhập</Link>
          </Button>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Đang tải…</div>}>
      <VerifyInner />
    </Suspense>
  );
}
