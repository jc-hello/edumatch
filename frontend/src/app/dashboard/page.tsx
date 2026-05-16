'use client';

import Link from 'next/link';
import { ReactNode, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Search, Star, WalletCards } from 'lucide-react';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/services/auth.service';
import { bookingsService, favoritesService, type Booking, type Tutor } from '@/services/edumatch.service';
import { useAuthStore } from '@/stores/auth-store';
import { asArray, formatVnd, shortDate } from '@/lib/format';

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
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: authService.getMe });
  const { data: bookingsData, isLoading } = useQuery({ queryKey: ['bookings', 'dashboard'], queryFn: () => bookingsService.list({ limit: 5 }) });
  const { data: favoritesData } = useQuery({ queryKey: ['favorites'], queryFn: favoritesService.list });

  useEffect(() => {
    if (me) setUser(me);
  }, [me, setUser]);

  const bookings = useMemo(() => asArray<Booking>(bookingsData), [bookingsData]);
  const favorites = asArray<Tutor>(favoritesData);
  const totalSpend = bookings.reduce((sum, item) => sum + (item.amount ?? 0) + (item.platformFee ?? 0), 0);
  const upcoming = bookings.filter((item) => ['pending_payment', 'confirmed'].includes(item.status)).length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <Badge tone="accent">Dashboard API</Badge>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Xin chào, {me?.fullName?.split(' ').slice(-1)[0] ?? 'bạn'}
            </h1>
            <p className="mt-1 text-muted-foreground">Tổng quan từ `/users/me`, `/bookings` và `/favorites`.</p>
          </div>
          <Button asChild>
            <Link href="/tutors">
              <Search className="mr-2 h-4 w-4" /> Tìm gia sư
            </Link>
          </Button>
        </div>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Stat title="Buổi sắp tới" value={String(upcoming)} icon={<CalendarDays className="h-5 w-5" />} />
        <Stat title="Gia sư yêu thích" value={String(favorites.length)} icon={<Star className="h-5 w-5" />} />
        <Stat title="Tổng đã đặt" value={formatVnd(totalSpend)} icon={<WalletCards className="h-5 w-5" />} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Booking gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || bookings.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">{isLoading ? 'Đang tải...' : 'Chưa có booking'}</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Mã</th>
                      <th className="px-4 py-3">Môn</th>
                      <th className="px-4 py-3">Ngày</th>
                      <th className="px-4 py-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-4 py-3 font-semibold text-foreground">{booking.id}</td>
                        <td className="px-4 py-3 text-muted-foreground">{booking.subject}</td>
                        <td className="px-4 py-3 text-muted-foreground">{shortDate(booking.date)}</td>
                        <td className="px-4 py-3"><StatusBadge status={booking.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Gia sư đã lưu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {favorites.slice(0, 4).map((tutor) => (
              <Link key={tutor.id} href={`/tutors/${tutor.id}`} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
                <Avatar name={tutor.name} src={tutor.avatarUrl} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{tutor.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{tutor.title}</p>
                </div>
              </Link>
            ))}
            {favorites.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Chưa lưu gia sư.</p>}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function Stat({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-tint)] text-accent">{icon}</div>
        <p className="mt-4 text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
