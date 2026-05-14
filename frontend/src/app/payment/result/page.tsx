'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatVnd } from '@/data/mock-data';

function ResultInner() {
  const params = useSearchParams();
  const status = params.get('status') ?? 'success';
  const bookingId = params.get('bookingId') ?? 'BK-NEW';
  const amount = Number(params.get('amount') ?? 0);
  const success = status === 'success';

  return (
    <main className="relative flex min-h-svh flex-1 items-center justify-center px-4 py-10">
      <div className="edm-glow -top-32 -right-32" aria-hidden />
      <Card className="relative w-full max-w-md shadow-[var(--shadow-card-lg)] edm-animate-fade-up">
        <CardContent className="space-y-6 p-8 text-center">
          <span
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl ${
              success ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}
          >
            {success ? <CheckCircle2 className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
          </span>
          <div>
            <h1
              className="text-3xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {success ? 'Thanh toán thành công.' : 'Thanh toán thất bại.'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {success
                ? 'Booking của bạn đã được tạo. Gia sư sẽ xác nhận trong thời gian sớm nhất.'
                : 'Giao dịch không hoàn tất. Vui lòng thử lại hoặc dùng phương thức thanh toán khác.'}
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-5 text-left">
            <Row label="Mã giao dịch" value={bookingId} mono />
            {amount > 0 && <Row label="Số tiền" value={formatVnd(amount)} mono />}
            <Row label="Trạng thái" value={success ? 'Đã ký quỹ' : 'Thất bại'} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {success ? (
              <>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/tutors">Tìm gia sư khác</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/bookings">Xem lịch học</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/bookings">Quay lại</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/payment">Thử lại</Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className="font-semibold text-foreground"
        style={mono ? { fontFamily: 'var(--font-mono)' } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Đang tải…</div>}>
      <ResultInner />
    </Suspense>
  );
}
