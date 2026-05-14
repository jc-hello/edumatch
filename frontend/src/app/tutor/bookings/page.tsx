'use client';

import { useState } from 'react';
import { Check, Clock, Filter, MessageSquare, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { bookings, formatVnd, type Booking } from '@/data/mock-data';
import { cn } from '@/lib/utils';

const filters = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'confirmed', label: 'Đã chấp nhận' },
  { id: 'completed', label: 'Hoàn thành' },
] as const;

type Filter = (typeof filters)[number]['id'];

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
  const [filter, setFilter] = useState<Filter>('all');

  const list = bookings.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return b.status === 'pending';
    if (filter === 'confirmed') return b.status === 'confirmed';
    if (filter === 'completed') return b.status === 'completed';
    return true;
  });

  function act(b: Booking, type: 'accept' | 'reject') {
    if (type === 'accept') toast.success(`Đã chấp nhận booking ${b.id}`);
    else toast.info(`Đã từ chối booking ${b.id}`);
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge tone="accent">Booking</Badge>
          <h1
            className="mt-3 text-3xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Yêu cầu đặt lịch.
          </h1>
          <p className="mt-1 text-muted-foreground">
            Phản hồi nhanh giúp tăng tỉ lệ chốt và xếp hạng hiển thị.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-card)]">
        <Filter className="ml-1 h-4 w-4 text-muted-foreground" />
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-semibold transition',
              filter === f.id
                ? 'bg-foreground text-background shadow-[var(--shadow-card)]'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {list.map((b) => (
          <Card key={b.id} className="edm-lift">
            <CardContent className="p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                <Avatar name={'Học sinh ' + b.id.slice(-2)} size="lg" />
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
                    Học sinh ẩn danh · {b.format}
                  </p>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <p className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {b.date} · {b.time}
                    </p>
                    <p
                      className="text-foreground"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {formatVnd(b.amount)}
                    </p>
                  </div>
                  <p className="mt-3 rounded-2xl border border-border bg-muted/30 p-4 text-sm leading-6 text-foreground">
                    <span className="font-semibold">Mục tiêu:</span> ôn lại trọng tâm trước kiểm tra,
                    luyện 10 câu vận dụng cao, có bài tập về nhà sau buổi học.
                  </p>
                </div>
                <div className="flex flex-col gap-2 lg:w-48">
                  {b.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => act(b, 'accept')}>
                        <Check className="mr-1 h-4 w-4" /> Chấp nhận
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => act(b, 'reject')}>
                        <X className="mr-1 h-4 w-4" /> Từ chối
                      </Button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <>
                      <Button size="sm">
                        <Video className="mr-1 h-4 w-4" /> Vào lớp
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="mr-1 h-4 w-4" /> Nhắn học sinh
                      </Button>
                    </>
                  )}
                  {b.status === 'completed' && (
                    <Button size="sm" variant="outline" disabled>
                      <Check className="mr-1 h-4 w-4" /> Đã hoàn thành
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {list.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              Không có booking trong bộ lọc này.
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
