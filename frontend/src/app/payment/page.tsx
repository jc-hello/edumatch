'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { paymentsService } from '@/services/edumatch.service';
import { formatVnd } from '@/lib/format';

function PaymentInner() {
  const router = useRouter();
  const params = useSearchParams();
  const bookingId = params.get('bookingId') ?? '';
  const amount = Number(params.get('amount') ?? 0);
  const missingPaymentInput = !bookingId || !amount;
  const [message, setMessage] = useState(
    missingPaymentInput ? 'Thiếu bookingId hoặc amount.' : 'Đang tạo giao dịch VNPay...',
  );

  useEffect(() => {
    if (missingPaymentInput) return;
    let cancelled = false;
    paymentsService.createVnpay({
      bookingId,
      amount,
      returnUrl: `${window.location.origin}/payment/result`,
    }).then((result) => {
      const payment = result as { paymentUrl?: string };
      if (cancelled) return;
      if (payment.paymentUrl) {
        setMessage('Đang chuyển hướng đến VNPay...');
        window.location.href = payment.paymentUrl;
        return;
      }
      router.push(`/payment/result?status=failed&bookingId=${encodeURIComponent(bookingId)}`);
    }).catch((error) => {
      if (cancelled) return;
      toast.error(error instanceof Error ? error.message : 'Không tạo được giao dịch');
      setMessage('Không tạo được giao dịch thanh toán.');
    });
    return () => {
      cancelled = true;
    };
  }, [amount, bookingId, missingPaymentInput, router]);

  return (
    <main className="flex min-h-svh flex-1 items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md rounded-lg shadow-[var(--shadow-card-lg)]">
        <CardContent className="space-y-6 p-8 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-accent text-white">
            <Loader2 className="h-7 w-7 animate-spin" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mã booking</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{bookingId || 'N/A'}</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{formatVnd(amount)}</p>
          </div>
          <p className="text-sm font-medium text-foreground">{message}</p>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-left text-xs text-emerald-800">
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              Giao dịch được tạo bởi backend qua `/payments/vnpay/create`.
            </p>
          </div>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" /> Không lưu thông tin thẻ
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
