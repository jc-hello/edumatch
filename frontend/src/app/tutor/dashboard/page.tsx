'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarPlus, Clock, DollarSign, Star, Wallet } from 'lucide-react';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { bookingsService, payoutsService, type Booking } from '@/services/edumatch.service';
import { asArray, formatVnd, shortDate } from '@/lib/format';

type Summary = { balance?: number; lifetimeEarnings?: number };

export default function TutorDashboardPage() {
  return (
    <>
      <Header />
      <AuthGuard roles={['tutor', 'admin']}>
        <TutorDashboardInner />
      </AuthGuard>
    </>
  );
}

function TutorDashboardInner() {
  const { data: bookingsData } = useQuery({ queryKey: ['bookings', 'tutor'], queryFn: () => bookingsService.list({ role: 'tutor', limit: 5 }) });
  const { data: summaryData } = useQuery({ queryKey: ['payouts', 'summary'], queryFn: payoutsService.summary });
  const bookings = asArray<Booking>(bookingsData);
  const summary = (summaryData ?? {}) as Summary;
  const pending = bookings.filter((booking) => ['pending_payment', 'confirmed'].includes(booking.status)).length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge tone="accent">Tutor API</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Không gian gia sư</h1>
          <p className="mt-1 text-muted-foreground">Booking và thu nhập lấy từ backend thật.</p>
        </div>
        <Button asChild><Link href="/tutor/availability"><CalendarPlus className="mr-2 h-4 w-4" /> Tạo lịch rảnh</Link></Button>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Stat title="Booking cần xử lý" value={String(pending)} icon={<Clock className="h-5 w-5" />} />
        <Stat title="Số dư khả dụng" value={formatVnd(summary.balance ?? 0)} icon={<DollarSign className="h-5 w-5" />} />
        <Stat title="Tổng thu nhập" value={formatVnd(summary.lifetimeEarnings ?? 0)} icon={<Star className="h-5 w-5" />} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="rounded-lg">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Booking mới nhất</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link href="/tutor/bookings">Xem tất cả</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">Chưa có booking.</p> : bookings.map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 rounded-lg border border-border p-4">
                <Avatar name={booking.student?.name ?? booking.studentId ?? 'Student'} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{booking.subject}</p>
                  <p className="text-sm text-muted-foreground">{booking.id} · {shortDate(booking.date)} · {booking.time}</p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-lg border-accent/20">
          <CardContent className="p-5">
            <Wallet className="h-8 w-8 text-accent" />
            <p className="mt-4 text-sm text-muted-foreground">Số dư khả dụng</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{formatVnd(summary.balance ?? 0)}</p>
            <Button asChild className="mt-5 w-full"><Link href="/tutor/earnings">Rút tiền</Link></Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function Stat({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return <Card className="rounded-lg"><CardContent className="p-5"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-tint)] text-accent">{icon}</div><p className="mt-4 text-sm text-muted-foreground">{title}</p><p className="mt-1 text-2xl font-bold text-foreground">{value}</p></CardContent></Card>;
}
