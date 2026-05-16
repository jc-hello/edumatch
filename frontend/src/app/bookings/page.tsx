'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Clock, Download, Search, Star, Video, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ReviewDialog } from '@/components/marketplace/review-dialog';
import { bookingsService, type Booking, type BookingStatus } from '@/services/edumatch.service';
import { asArray, formatVnd, shortDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const tabs: Array<{ id: string; label: string; statuses?: BookingStatus[] }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'upcoming', label: 'Sắp tới', statuses: ['pending_payment', 'confirmed'] },
  { id: 'completed', label: 'Hoàn thành', statuses: ['completed'] },
  { id: 'cancelled', label: 'Đã hủy', statuses: ['cancelled', 'refunded'] },
];

export default function BookingsPage() {
  return (
    <>
      <Header />
      <AuthGuard>
        <BookingsInner />
      </AuthGuard>
    </>
  );
}

function BookingsInner() {
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  const queryClient = useQueryClient();
  const active = tabs.find((item) => item.id === tab) ?? tabs[0];
  const { data, isLoading } = useQuery({
    queryKey: ['bookings', active.statuses?.join(','), q],
    queryFn: () => bookingsService.list({ status: active.statuses?.join(','), q: q || undefined }),
  });
  const bookings = useMemo(() => asArray<Booking>(data), [data]);

  const cancelBooking = useMutation({
    mutationFn: (id: string) => bookingsService.cancel(id, 'Hủy từ giao diện người dùng'),
    onSuccess: () => {
      toast.success('Đã hủy lịch');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: () => toast.error('Không hủy được lịch'),
  });

  const exportCsv = useMutation({
    mutationFn: bookingsService.exportCsv,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bookings.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    onError: () => toast.error('Không xuất được CSV'),
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge tone="accent">Booking API</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Lịch học của bạn</h1>
          <p className="mt-1 text-muted-foreground">Danh sách này được lấy từ `/bookings` theo tài khoản đang đăng nhập.</p>
        </div>
        <Button variant="outline" onClick={() => exportCsv.mutate()} loading={exportCsv.isPending}>
            <Download className="mr-2 h-4 w-4" /> Xuất CSV
        </Button>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'flex-1 whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition',
              tab === item.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo mã booking hoặc môn học" className="border-0 shadow-none focus-visible:ring-0" />
      </div>

      {isLoading ? (
        <EmptyBookings title="Đang tải lịch học…" />
      ) : bookings.length === 0 ? (
        <EmptyBookings title="Chưa có booking phù hợp" />
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="rounded-lg">
              <CardContent className="p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                  <Avatar name={booking.tutor?.name ?? booking.tutorId ?? 'Tutor'} src={booking.tutor?.avatarUrl} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold">{booking.id}</span>
                      <StatusBadge status={booking.status} />
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-foreground">{booking.subject}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Gia sư: {booking.tutor?.name ?? booking.tutorId}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{shortDate(booking.date)}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{booking.time}</span>
                      <span className="inline-flex items-center gap-1.5"><Video className="h-4 w-4" />{booking.format}</span>
                    </div>
                  </div>
                  <div className="w-full rounded-lg border border-border bg-muted/30 p-4 lg:w-56">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Số tiền</p>
                    <p className="mt-1 text-xl font-bold text-foreground">{formatVnd(booking.amount + (booking.platformFee ?? 0))}</p>
                    <div className="mt-4 flex flex-col gap-2">
                      {booking.meetingUrl && (
                        <Button size="sm" asChild>
                          <a href={booking.meetingUrl} target="_blank" rel="noreferrer">Vào lớp</a>
                        </Button>
                      )}
                      {['pending_payment', 'confirmed'].includes(booking.status) && (
                        <Button size="sm" variant="outline" onClick={() => cancelBooking.mutate(booking.id)}>
                          <XCircle className="mr-1.5 h-4 w-4" /> Hủy lịch
                        </Button>
                      )}
                      {booking.status === 'completed' && (
                        <Button size="sm" onClick={() => setReviewTarget(booking)}>
                          <Star className="mr-1.5 h-4 w-4" /> Đánh giá
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <ReviewDialog
        open={Boolean(reviewTarget)}
        onClose={() => setReviewTarget(null)}
        tutorName={reviewTarget?.tutor?.name ?? reviewTarget?.tutorId ?? ''}
        tutorId={reviewTarget?.tutorId}
        bookingId={reviewTarget?.id}
        subject={reviewTarget?.subject ?? ''}
      />
    </main>
  );
}

function EmptyBookings({ title }: { title: string }) {
  return (
    <Card className="mt-6 rounded-lg">
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <CalendarDays className="h-8 w-8 text-muted-foreground" />
        <h3 className="font-bold text-foreground">{title}</h3>
        <Button asChild>
          <Link href="/tutors">Tìm gia sư</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
