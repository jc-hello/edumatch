'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { SimpleLine } from '@/components/charts/simple-line';
import { bookings, tutorEarningsSeries, formatVnd } from '@/data/mock-data';
import {
  CalendarPlus,
  Check,
  Clock,
  DollarSign,
  Star,
  Wallet,
  X,
} from 'lucide-react';

const slots = [
  { day: 'Thứ 2', time: '18:00 - 19:30', state: 'booked' as const },
  { day: 'Thứ 4', time: '19:00 - 20:30', state: 'open' as const },
  { day: 'Thứ 7', time: '08:00 - 09:30', state: 'open' as const },
];

export default function TutorDashboardPage() {
  return (
    <>
      <Header />
      <AuthGuard roles={['tutor', 'admin']}>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Badge tone="accent">Không gian gia sư</Badge>
              <h1
                className="mt-3 text-3xl font-bold tracking-tight text-foreground"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Quản lý lịch dạy và thu nhập.
              </h1>
              <p className="mt-1 text-muted-foreground">
                Theo dõi đặt lịch mới, lịch rảnh và yêu cầu rút tiền.
              </p>
            </div>
            <Button asChild>
              <Link href="/tutor/availability">
                <CalendarPlus className="mr-2 h-4 w-4" /> Tạo lịch rảnh
              </Link>
            </Button>
          </div>

          <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Hồ sơ', value: 'Đã duyệt', icon: Check, tint: 'bg-emerald-50 text-emerald-600' },
              { label: 'Booking chờ', value: '3', icon: Clock, tint: 'bg-amber-50 text-amber-600' },
              { label: 'Thu nhập tháng', value: '5.6M ₫', icon: DollarSign, tint: 'bg-[var(--accent-tint)] text-accent' },
              { label: 'Đánh giá TB', value: '4.9', icon: Star, tint: 'bg-amber-50 text-amber-600' },
            ].map(({ label, value, icon: Icon, tint }) => (
              <Card key={label} className="edm-lift">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p
                      className="mt-1 text-2xl font-bold tabular-nums text-foreground"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {value}
                    </p>
                  </div>
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tint}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Yêu cầu đặt lịch mới</CardTitle>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/tutor/bookings">Xem tất cả</Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bookings.slice(0, 2).map((b) => (
                    <div key={b.id} className="rounded-2xl border border-border p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar name={b.tutor} size="md" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">{b.subject}</p>
                              <StatusBadge status={b.status} />
                            </div>
                            <p
                              className="mt-1 text-xs text-muted-foreground"
                              style={{ fontFamily: 'var(--font-mono)' }}
                            >
                              {b.id} · {b.date} · {b.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">
                            <Check className="mr-1 h-4 w-4" /> Chấp nhận
                          </Button>
                          <Button size="sm" variant="outline">
                            <X className="mr-1 h-4 w-4" /> Từ chối
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Thu nhập 6 tháng qua (triệu ₫)</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleLine data={tutorEarningsSeries.map((d) => ({ label: d.month, value: d.value }))} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="overflow-hidden border-accent/20 shadow-[var(--shadow-accent)]">
                <div className="edm-gradient-bg p-5 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                    Số dư khả dụng
                  </p>
                  <p
                    className="mt-1 text-3xl font-bold tabular-nums"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {formatVnd(5600000)}
                  </p>
                </div>
                <CardContent className="p-5">
                  <Button asChild className="w-full">
                    <Link href="/tutor/earnings">
                      <Wallet className="mr-2 h-4 w-4" /> Rút tiền
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Lịch rảnh tuần này</CardTitle>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/tutor/availability">Quản lý</Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {slots.map((s) => (
                    <div
                      key={`${s.day}-${s.time}`}
                      className="flex items-center justify-between rounded-2xl border border-border p-4"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{s.day}</p>
                        <p
                          className="text-xs text-muted-foreground"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {s.time}
                        </p>
                      </div>
                      <StatusBadge status={s.state} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </AuthGuard>
    </>
  );
}
