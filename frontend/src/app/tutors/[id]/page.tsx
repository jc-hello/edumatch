'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, MapPin, Star, Video } from 'lucide-react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { tutorsService } from '@/services/edumatch.service';
import { asArray, formatVnd, shortDate } from '@/lib/format';

type AvailabilityDay = {
  date?: string;
  day: string;
  slots: Array<string | { start: string; end?: string; status?: string }>;
};

type TutorReview = {
  id: string;
  student?: string;
  rating: number;
  body?: string;
  date?: string;
};

export default function TutorDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: tutor, isLoading } = useQuery({
    queryKey: ['tutor', id],
    queryFn: () => tutorsService.get(id),
    enabled: Boolean(id),
  });
  const { data: availabilityData } = useQuery({
    queryKey: ['tutor', id, 'availability'],
    queryFn: () => tutorsService.availability(id),
    enabled: Boolean(id),
  });
  const { data: reviewsData } = useQuery({
    queryKey: ['tutor', id, 'reviews'],
    queryFn: () => tutorsService.reviews(id, { limit: 6 }),
    enabled: Boolean(id),
  });

  const days = asArray<AvailabilityDay>(availabilityData);
  const reviews = asArray<TutorReview>(reviewsData);

  return (
    <>
      <Header />
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <Link href="/tutors" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>

          <Card className="overflow-hidden rounded-lg">
            <div className="h-24 bg-foreground" />
            <CardContent className="-mt-10 p-6">
              {isLoading || !tutor ? (
                <p className="py-12 text-muted-foreground">Đang tải hồ sơ gia sư…</p>
              ) : (
                <>
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                    <Avatar name={tutor.name} src={tutor.avatarUrl} size="xl" className="ring-4 ring-card" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{tutor.name}</h1>
                        {tutor.verified && (
                          <Badge tone="success">
                            <CheckCircle2 className="h-3 w-3" /> Đã xác thực
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-base font-medium text-muted-foreground">{tutor.title}</p>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <b className="text-foreground">{tutor.rating ?? 0}</b> ({tutor.reviews ?? 0})
                        </span>
                        <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{tutor.location}</span>
                        <span className="inline-flex items-center gap-1.5"><Video className="h-4 w-4" />{formatMode(tutor.format)}</span>
                        <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{tutor.responseTime}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-6 border-t border-border pt-5 leading-7 text-foreground">{tutor.bio}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {tutor.subjects?.map((item) => <Badge key={item} tone="accent">{item}</Badge>)}
                    {tutor.levels?.map((item) => <Badge key={item} tone="neutral">{item}</Badge>)}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Lịch rảnh từ API</CardTitle>
            </CardHeader>
            <CardContent>
              {days.length === 0 ? (
                <p className="text-sm text-muted-foreground">Gia sư chưa cập nhật lịch rảnh.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {days.map((day) => (
                    <div key={`${day.date}-${day.day}`} className="rounded-lg border border-border p-4">
                      <p className="font-semibold text-foreground">{day.day} {day.date ? `· ${shortDate(day.date)}` : ''}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {day.slots.map((slot) => {
                          const start = typeof slot === 'string' ? slot : slot.start;
                          const status = typeof slot === 'string' ? 'open' : slot.status;
                          return (
                            <Link
                              key={`${day.date}-${start}`}
                              href={`/tutors/${id}/book?date=${day.date ?? ''}&slot=${start}`}
                              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                                status === 'booked'
                                  ? 'pointer-events-none bg-muted text-muted-foreground'
                                  : 'bg-[var(--accent-tint)] text-accent hover:bg-accent hover:text-white'
                              }`}
                            >
                              {start}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Đánh giá</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có đánh giá.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">{review.student ?? 'Học viên'}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {review.rating}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.body || 'Không có nhận xét.'}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-lg border-accent/20">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Học phí</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{formatVnd(tutor?.price)}</p>
              <p className="mt-1 text-sm text-muted-foreground">mỗi giờ, thanh toán qua VNPay</p>
              <Button asChild className="mt-5 w-full" size="lg" disabled={!tutor}>
                <Link href={`/tutors/${id}/book`}>
                  <CalendarDays className="mr-2 h-4 w-4" /> Đặt lịch
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </main>
    </>
  );
}

function formatMode(mode?: string) {
  if (mode === 'online') return 'Online';
  if (mode === 'offline') return 'Trực tiếp';
  return 'Linh hoạt';
}
