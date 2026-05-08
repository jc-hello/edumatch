'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';

function VerifyInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setError('Token không hợp lệ');
      return;
    }
    authService
      .verifyEmail(token)
      .then(() => setState('success'))
      .catch((err) => {
        setState('error');
        setError(err?.response?.data?.error?.message || 'Token đã hết hạn hoặc không hợp lệ');
      });
  }, [token]);

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6 text-center">
        {state === 'loading' && (
          <>
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="mt-4 text-gray-600">Đang xác minh email…</p>
          </>
        )}
        {state === 'success' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-4 text-lg font-semibold">Email đã được xác minh</h2>
            <p className="mt-2 text-sm text-gray-600">Bạn có thể tiếp tục sử dụng EduMatch.</p>
            <Button className="mt-6" asChild>
              <Link href="/dashboard">Vào Dashboard</Link>
            </Button>
          </>
        )}
        {state === 'error' && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-lg font-semibold">Xác minh thất bại</h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <Button className="mt-6" variant="outline" asChild>
              <Link href="/login">Quay lại đăng nhập</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-gray-500">Loading…</div>}>
      <VerifyInner />
    </Suspense>
  );
}
