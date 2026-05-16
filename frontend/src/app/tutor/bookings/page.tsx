'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Clock, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { bookingsService, type Booking } from '@/services/edumatch.service';
import { asArray, formatVnd, shortDate } from '@/lib/format';

export default function TutorBookingsPage() {
  return (
    <>
      <Header />
      <AuthGuard roles={['tutor', 'admin']}>
        <TutorBookingsInner />
      </AuthGuard>
    </>
  );
}

function TutorBookingsInner() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'tutor'],
    queryFn: () => bookingsService.list({ role: 'tutor' }),
  });
  const bookings = asArray<Booking>(data);
  const accept = useMutation({
    mutationFn: (id: string) => bookingsService.accept(id),
    onSuccess: () => {
      toast.success('Đã chấp nhận booking');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
  const reject = useMutation({
    mutationFn: (id: string) => bookingsService.reject(id, 'Gia sư từ chối lịch'),
    onSuccess: () => {
      toast.success('Đã từ chối booking');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
  const complete = useMutation({
    mutationFn: (id: string) => bookingsService.complete(id),
    onSuccess: () => {
      toast.success('Đã hoàn thành booking');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div>
        <Badge tone="accent">Tutor Bookings API</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Yêu cầu đặt lịch</h1>
        <p className="mt-1 text-muted-foreground">Phản hồi booking qua `/bookings/:id/accept`, `reject`, `complete`.</p>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading && <Empty text="Đang tải booking..." />}
        {!isLoading && bookings.length === 0 && <Empty text="Chưa có booking." />}
        {bookings.map((booking) => (
          <Card key={booking.id} className="rounded-lg">
            <CardContent className="p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                <Avatar name={booking.student?.name ?? booking.studentId ?? 'Student'} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold">{booking.id}</span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-foreground">{booking.subject}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{booking.student?.name ?? booking.studentId} · {booking.format}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{shortDate(booking.date)} · {booking.time}</span>
                    <span className="font-semibold text-foreground">{formatVnd(booking.amount)}</span>
                  </div>
                  {booking.goal && <p className="mt-3 rounded-lg border border-border bg-muted/30 p-4 text-sm text-foreground">{booking.goal}</p>}
                </div>
                <div className="flex flex-col gap-2 lg:w-48">
                  {['pending_payment', 'confirmed'].includes(booking.status) && (
                    <>
                      <Button size="sm" onClick={() => accept.mutate(booking.id)}><Check className="mr-1 h-4 w-4" /> Chấp nhận</Button>
                      <Button size="sm" variant="outline" onClick={() => reject.mutate(booking.id)}><X className="mr-1 h-4 w-4" /> Từ chối</Button>
                    </>
                  )}
                  {booking.meetingUrl && <Button asChild size="sm"><a href={booking.meetingUrl}><Video className="mr-1 h-4 w-4" /> Vào lớp</a></Button>}
                  {booking.status === 'confirmed' && (
                    <Button size="sm" variant="outline" onClick={() => complete.mutate(booking.id)}>Hoàn thành</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

function Empty({ text }: { text: string }) {
  return <Card className="rounded-lg"><CardContent className="py-16 text-center text-muted-foreground">{text}</CardContent></Card>;
}
