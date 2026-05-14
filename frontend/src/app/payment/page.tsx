'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatVnd } from '@/data/mock-data';

function PaymentInner() {
  const router = useRouter();
  const params = useSearchParams();
  const bookingId = params.get('bookingId') ?? 'BK-NEW';
  const amount = Number(params.get('amount') ?? 330000);
  const [step, setStep] = useState(0);
  const steps = [
    'Đang khởi tạo giao dịch…',
    'Đang kết nối VNPay…',
    'Đang chuyển hướng đến cổng thanh toán…',
  ];

  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 900);
    return () => clearInterval(id);
  }, [steps.length]);

  useEffect(() => {
    // Demo only: redirect to success after 3s. Real flow: window.location to VNPay url, callback to /payment/result.
    const t = setTimeout(() => {
      router.push(
        `/payment/result?status=success&bookingId=${encodeURIComponent(bookingId)}&amount=${amount}`,
      );
    }, 3500);
    return () => clearTimeout(t);
  }, [router, bookingId, amount]);

  return (
    <main className="relative flex min-h-svh flex-1 items-center justify-center px-4 py-10">
      <div className="edm-glow -top-32 -left-32" aria-hidden />
      <div className="edm-glow bottom-0 right-0" aria-hidden />
      <Card className="relative w-full max-w-md shadow-[var(--shadow-card-lg)]">
        <CardContent className="space-y-6 p-8 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl edm-gradient-bg text-white shadow-[var(--shadow-accent)]">
            <Loader2 className="h-7 w-7 animate-spin" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Mã giao dịch
            </p>
            <p
              className="mt-1 text-lg font-semibold text-foreground"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {bookingId}
            </p>
            <p
              className="mt-3 text-4xl font-bold tabular-nums text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {formatVnd(amount)}
            </p>
          </div>
          <div className="space-y-2">
            {steps.map((s, i) => (
              <p
                key={s}
                className={`text-sm transition ${
                  i === step ? 'font-medium text-foreground' : 'text-muted-foreground'
                }`}
              >
                {i <= step ? '●' : '○'} {s}
              </p>
            ))}
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left text-xs text-emerald-800">
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              Vui lòng không tắt cửa sổ trong khi giao dịch đang diễn ra. Tiền sẽ được giữ ký quỹ
              cho đến khi buổi học hoàn tất.
            </p>
          </div>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" /> Bảo mật SSL · không lưu thông tin thẻ
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Đang chuẩn bị…</div>}>
      <PaymentInner />
    </Suspense>
  );
}
