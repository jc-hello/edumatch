'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { ReviewDialog } from '@/components/marketplace/review-dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { bookings, formatVnd, type Booking } from '@/data/mock-data';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  MessageSquare,
  Search,
  Star,
  Video,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'upcoming', label: 'Sắp tới', statuses: ['pending', 'pending_payment', 'confirmed'] as Booking['status'][] },
  { id: 'completed', label: 'Đã hoàn thành', statuses: ['completed'] as Booking['status'][] },
  { id: 'cancelled', label: 'Đã hủy', statuses: ['cancelled', 'refunded'] as Booking['status'][] },
];

export default function BookingsPage() {
  const [tab, setTab] = useState('upcoming');
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);

  const activeTab = tabs.find((t) => t.id === tab)!;
  const filtered = bookings.filter((b) => activeTab.statuses.includes(b.status));

  const counts = {
    upcoming: bookings.filter((b) => tabs[0].statuses.includes(b.status)).length,
    completed: bookings.filter((b) => tabs[1].statuses.includes(b.status)).length,
    cancelled: bookings.filter((b) => tabs[2].statuses.includes(b.status)).length,
  };

  return (
    <>
      <Header />
      <AuthGuard>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
          {/* Welcome hero */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
            <div className="edm-glow -top-32 -left-32 opacity-50" aria-hidden />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <Badge tone="accent">Lịch học của bạn</Badge>
                <h1
                  className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Quản lý <span className="edm-gradient-text">buổi học</span>.
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Theo dõi trạng thái đặt lịch, thanh toán và hoàn tiền.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Xuất CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-[var(--shadow-card)]">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition whitespace-nowrap',
                  tab === t.id
                    ? 'bg-foreground text-background shadow-[var(--shadow-card)]'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-bold',
                    tab === t.id ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {counts[t.id as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-[var(--shadow-card)]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm theo mã đặt lịch, gia sư, môn học…"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-hidden"
            />
          </div>

          {/* Bookings list */}
          {filtered.length === 0 ? (
            <Card className="mt-6">
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Chưa có buổi học nào</h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  Khám phá danh sách gia sư và đặt buổi học đầu tiên của bạn.
                </p>
                <Button asChild className="mt-2">
                  <Link href="/tutors">Tìm gia sư</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-6 space-y-4">
              {filtered.map((b) => (
                <Card key={b.id} className="edm-lift">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                      <Avatar name={b.tutor} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold tracking-wider text-muted-foreground"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {b.id}
                          </span>
                          <StatusBadge status={b.status} />
                        </div>
                        <h3 className="mt-2 text-lg font-bold text-foreground">{b.subject}</h3>
                        <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                          Gia sư: {b.tutor}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />
                            {b.date}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {b.time}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Video className="h-4 w-4" />
                            {b.format}
                          </span>
                        </div>
                      </div>
                      <div className="w-full rounded-2xl border border-border bg-muted/30 p-4 lg:w-56">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Số tiền
                        </p>
                        <p
                          className="mt-1 text-xl font-bold tabular-nums text-foreground"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {formatVnd(b.amount)}
                        </p>
                        <div className="mt-4 flex flex-col gap-2">
                          {b.status === 'confirmed' && (
                            <>
                              <Button size="sm">
                                <Video className="mr-1.5 h-4 w-4" />
                                Vào lớp
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toast.info('Yêu cầu hủy đã được gửi tới gia sư')}
                              >
                                <XCircle className="mr-1.5 h-4 w-4" />
                                Hủy lịch
                              </Button>
                            </>
                          )}
                          {b.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="mr-1.5 h-4 w-4" />
                                Nhắn gia sư
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toast.info('Đã hủy yêu cầu chờ xác nhận')}
                              >
                                Hủy
                              </Button>
                            </>
                          )}
                          {b.status === 'completed' && (
                            <Button size="sm" onClick={() => setReviewTarget(b)}>
                              <Star className="mr-1.5 h-4 w-4" />
                              Đánh giá
                            </Button>
                          )}
                          {b.status === 'cancelled' && (
                            <Button size="sm" variant="outline" disabled>
                              <CheckCircle2 className="mr-1.5 h-4 w-4" />
                              Đã hoàn tiền
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
        </main>
      </AuthGuard>

      <ReviewDialog
        open={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        tutorName={reviewTarget?.tutor ?? ''}
        subject={reviewTarget?.subject ?? ''}
      />
    </>
  );
}
