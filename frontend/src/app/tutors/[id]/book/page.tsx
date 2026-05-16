'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { bookingsService, paymentsService, tutorsService } from '@/services/edumatch.service';
import { formatVnd } from '@/lib/format';

type CreatedBooking = {
  id: string;
  subtotal?: number;
  platformFee?: number;
  total?: number;
};

export default function BookingPage() {
  return (
    <>
      <Header />
      <AuthGuard roles={['student', 'admin']}>
        <BookingInner />
      </AuthGuard>
    </>
  );
}

function BookingInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const tutorId = params.id;
  const [date, setDate] = useState(search.get('date') || new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState(search.get('slot') || '19:00');
  const [duration, setDuration] = useState(1);
  const [subject, setSubject] = useState('');
  const [goal, setGoal] = useState('');
  const [format, setFormat] = useState<'online' | 'offline'>('online');

  const { data: tutor } = useQuery({
    queryKey: ['tutor', tutorId],
    queryFn: () => tutorsService.get(tutorId),
  });

  const subtotal = useMemo(() => Math.round((tutor?.price ?? 0) * duration), [tutor?.price, duration]);
  const platformFee = Math.round(subtotal * 0.1);
  const total = subtotal + platformFee;

  const createBooking = useMutation({
    mutationFn: async () => {
      const booking = await bookingsService.create({
        tutorId: tutor?.userId ?? tutorId,
        date,
        startTime,
        duration,
        format,
        subject,
        goal,
      }) as CreatedBooking;
      const amount = booking.total ?? total;
      const payment = await paymentsService.createVnpay({
        bookingId: booking.id,
        amount,
        returnUrl: `${window.location.origin}/payment/result`,
      }) as { paymentUrl?: string };
      return { booking, payment };
    },
    onSuccess: ({ booking, payment }) => {
      toast.success('Đã tạo booking');
      if (payment.paymentUrl) {
        window.location.href = payment.paymentUrl;
        return;
      }
      router.push(`/payment/result?status=success&bookingId=${booking.id}&amount=${booking.total ?? total}`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Không tạo được booking'),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!subject.trim()) {
      toast.error('Vui lòng nhập môn học');
      return;
    }
    createBooking.mutate();
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
      <form onSubmit={submit} className="space-y-6">
        <div>
          <Link href={`/tutors/${tutorId}`} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
            ← Quay lại hồ sơ gia sư
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">Xác nhận đặt lịch</h1>
          <p className="mt-1 text-muted-foreground">Booking và thanh toán được gửi trực tiếp tới backend.</p>
        </div>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Thông tin buổi học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3 rounded-lg border border-border p-4">
              <Avatar name={tutor?.name ?? 'Tutor'} src={tutor?.avatarUrl} size="md" />
              <div>
                <p className="font-semibold text-foreground">{tutor?.name ?? 'Đang tải gia sư...'}</p>
                <p className="text-sm text-muted-foreground">{tutor?.title}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-foreground">
                Ngày học
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </label>
              <label className="space-y-2 text-sm font-semibold text-foreground">
                Giờ bắt đầu
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </label>
              <label className="space-y-2 text-sm font-semibold text-foreground">
                Thời lượng
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-accent"
                >
                  <option value={1}>1 giờ</option>
                  <option value={1.5}>1.5 giờ</option>
                  <option value={2}>2 giờ</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-semibold text-foreground">
                Hình thức
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'online' | 'offline')}
                  className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-accent"
                >
                  <option value="online">Online</option>
                  <option value="offline">Trực tiếp</option>
                </select>
              </label>
            </div>
            <label className="space-y-2 text-sm font-semibold text-foreground">
              Môn học
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ví dụ: Toán 12" required />
            </label>
            <label className="space-y-2 text-sm font-semibold text-foreground">
              Mục tiêu buổi học
              <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Nội dung cần học, mục tiêu, tài liệu..." />
            </label>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-emerald-200 bg-emerald-50">
          <CardContent className="flex gap-3 p-5 text-sm text-emerald-900">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <p>Thanh toán qua VNPay. Backend sẽ tạo booking, tạo giao dịch và trả URL thanh toán.</p>
          </CardContent>
        </Card>
      </form>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card className="rounded-lg border-accent/20">
          <CardHeader>
            <CardTitle>Tổng thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Row label={`Học phí (${duration} giờ)`} value={formatVnd(subtotal)} />
            <Row label="Phí nền tảng" value={formatVnd(platformFee)} />
            <div className="border-t border-border pt-4">
              <Row label="Cần thanh toán" value={formatVnd(total)} strong />
            </div>
            <Button onClick={submit} className="w-full" size="lg" loading={createBooking.isPending} disabled={!tutor}>
              <CreditCard className="mr-2 h-4 w-4" /> Thanh toán qua VNPay
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Không lưu thông tin thẻ
            </p>
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? 'text-xl font-bold text-foreground' : 'font-semibold text-foreground'}>{value}</span>
    </div>
  );
}
