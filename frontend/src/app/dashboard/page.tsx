'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import { bookings, formatVnd, tutors } from '@/data/mock-data';
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Video,
  WalletCards,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <>
      <Header />
      <AuthGuard>
        <DashboardInner />
      </AuthGuard>
    </>
  );
}

function DashboardInner() {
  const setUser = useAuthStore((s) => s.setUser);
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
  });

  useEffect(() => {
    if (me) setUser(me);
  }, [me, setUser]);

  const nextBooking = bookings.find((b) => b.status === 'confirmed') || bookings[0];

  const stats = [
    {
      label: 'Buổi học sắp tới',
      value: '2',
      delta: 'Tuần này',
      icon: CalendarDays,
      tint: 'bg-[var(--accent-tint)] text-accent',
    },
    {
      label: 'Giờ đã học',
      value: '18.5',
      delta: '+4.5 tháng này',
      icon: Clock,
      tint: 'bg-sky-50 text-sky-600',
    },
    {
      label: 'Gia sư yêu thích',
      value: '6',
      delta: '2 đang online',
      icon: Star,
      tint: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Đã chi tiêu',
      value: '4.2M ₫',
      delta: 'Năm 2026',
      icon: WalletCards,
      tint: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      {/* Welcome hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
        <div className="edm-glow -top-32 -right-32 opacity-50" aria-hidden />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge tone="accent">
              <Sparkles className="h-3 w-3" /> Không gian học tập
            </Badge>
            <h1
              className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Xin chào,{' '}
              <span className="edm-gradient-text">
                {me?.fullName?.split(' ').slice(-1)[0] ?? 'bạn'}
              </span>
              !
            </h1>
            <p className="mt-2 text-muted-foreground">
              Đây là tổng quan về lịch học và các gia sư bạn quan tâm.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/tutors">
              <Search className="mr-2 h-4 w-4" />
              Tìm gia sư mới
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, delta, icon: Icon, tint }) => (
          <Card key={label} className="edm-lift">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tint}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  {delta}
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{label}</p>
              <p
                className="mt-1 text-3xl font-bold tabular-nums text-foreground"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Đặt lịch gần đây</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bookings">
                Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Mã</th>
                    <th className="px-4 py-3">Gia sư</th>
                    <th className="px-4 py-3">Môn</th>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {bookings.map((b) => (
                    <tr key={b.id} className="transition hover:bg-muted/40">
                      <td
                        className="px-4 py-3 font-semibold text-foreground"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {b.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={b.tutor} size="sm" />
                          <span className="text-foreground">{b.tutor}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{b.subject}</td>
                      <td className="px-4 py-3 text-muted-foreground">{b.time}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Next booking — gradient card */}
          <Card className="overflow-hidden border-accent/20 shadow-[var(--shadow-accent)]">
            <div className="relative edm-gradient-bg px-6 py-6 text-white">
              <div className="edm-dot-pattern absolute inset-0 opacity-25" aria-hidden />
              <div className="relative">
                <Badge tone="accent" className="bg-white/15 text-white ring-white/20">
                  <Sparkles className="h-3 w-3" /> Buổi học tiếp theo
                </Badge>
                <h3
                  className="mt-3 text-xl font-bold"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {nextBooking.subject}
                </h3>
                <p className="mt-1 text-sm text-white/85">{nextBooking.tutor}</p>
              </div>
            </div>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-accent" />
                  {nextBooking.date}
                </span>
                <span
                  className="font-semibold text-foreground"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {nextBooking.time}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Video className="h-4 w-4 text-accent" />
                  {nextBooking.format}
                </span>
                <span
                  className="font-semibold text-foreground"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {formatVnd(nextBooking.amount)}
                </span>
              </div>
              <Button className="w-full">
                <Video className="mr-2 h-4 w-4" /> Vào lớp học
              </Button>
            </CardContent>
          </Card>

          {/* Recommended */}
          <Card>
            <CardHeader>
              <CardTitle>Gia sư đề xuất</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {tutors.slice(0, 3).map((tutor) => (
                <Link
                  key={tutor.id}
                  href={`/tutors/${tutor.id}`}
                  className="edm-lift flex items-center gap-3 rounded-2xl border border-border p-3"
                >
                  <Avatar name={tutor.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{tutor.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {tutor.subjects.join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {tutor.rating}
                    </span>
                    <p
                      className="text-[11px] text-muted-foreground"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {formatVnd(tutor.price)}
                    </p>
                  </div>
                </Link>
              ))}
              <Button asChild variant="outline" className="mt-2 w-full">
                <Link href="/tutors">Khám phá thêm</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
