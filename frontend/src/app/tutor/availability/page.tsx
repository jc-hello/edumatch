'use client';

import { useState } from 'react';
import { CalendarPlus, Plus, Repeat, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const hours = Array.from({ length: 14 }, (_, i) => 8 + i); // 8h - 21h

type SlotState = 'open' | 'booked';
type SlotKey = string; // `${dayIdx}-${hour}`

const initialSlots: Record<SlotKey, SlotState> = {
  '0-18': 'booked',
  '0-19': 'booked',
  '2-19': 'open',
  '2-20': 'open',
  '5-8': 'open',
  '5-9': 'open',
};

export default function AvailabilityPage() {
  return (
    <>
      <Header />
      <AuthGuard roles={['tutor', 'admin']}>
        <AvailabilityInner />
      </AuthGuard>
    </>
  );
}

function AvailabilityInner() {
  const [slots, setSlots] = useState<Record<SlotKey, SlotState>>(initialSlots);
  const [recurring, setRecurring] = useState(true);

  function toggle(day: number, hour: number) {
    const key = `${day}-${hour}`;
    if (slots[key] === 'booked') {
      toast.info('Slot này đã có học sinh đặt, không thể chỉnh.');
      return;
    }
    setSlots((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = 'open';
      return next;
    });
  }

  function clear() {
    const onlyBooked = Object.fromEntries(
      Object.entries(slots).filter(([, v]) => v === 'booked'),
    ) as Record<SlotKey, SlotState>;
    setSlots(onlyBooked);
    toast.success('Đã xoá các slot trống');
  }

  const stats = {
    open: Object.values(slots).filter((s) => s === 'open').length,
    booked: Object.values(slots).filter((s) => s === 'booked').length,
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge tone="accent">Lịch rảnh</Badge>
          <h1
            className="mt-3 text-3xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Quản lý lịch rảnh tuần.
          </h1>
          <p className="mt-1 text-muted-foreground">
            Click vào ô để bật/tắt khung giờ. Học sinh chỉ đặt được các slot bạn đã mở.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={recurring ? 'default' : 'outline'}
            onClick={() => setRecurring((r) => !r)}
            size="sm"
          >
            <Repeat className="mr-1.5 h-4 w-4" />
            {recurring ? 'Lặp lại hàng tuần' : 'Chỉ tuần này'}
          </Button>
          <Button variant="outline" onClick={clear} size="sm">
            <Trash2 className="mr-1.5 h-4 w-4" /> Xóa slot trống
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Slot mở', value: stats.open, tone: 'success' as const },
          { label: 'Slot đã đặt', value: stats.booked, tone: 'accent' as const },
          { label: 'Tổng giờ rảnh / tuần', value: stats.open + stats.booked, tone: 'neutral' as const },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p
                  className="mt-1 text-2xl font-bold tabular-nums text-foreground"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {kpi.value}
                </p>
              </div>
              <Badge tone={kpi.tone}>{kpi.tone === 'success' ? 'Mở' : kpi.tone === 'accent' ? 'Đã đặt' : 'Tổng'}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-accent" /> Tuần này
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-card border border-border" /> Trống
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded edm-gradient-bg" /> Đã mở
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-muted border border-border" /> Đã đặt
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              {/* Day header */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1.5 pb-2">
                <div />
                {days.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {d}
                  </div>
                ))}
              </div>
              {/* Body */}
              {hours.map((h) => (
                <div key={h} className="grid grid-cols-[60px_repeat(7,1fr)] gap-1.5 pb-1.5">
                  <div
                    className="pr-2 pt-1 text-right text-[11px] font-medium text-muted-foreground"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {String(h).padStart(2, '0')}:00
                  </div>
                  {days.map((_, dayIdx) => {
                    const key = `${dayIdx}-${h}`;
                    const state = slots[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggle(dayIdx, h)}
                        className={cn(
                          'group h-9 rounded-md border border-border transition',
                          state === 'open' && 'edm-gradient-bg border-transparent text-white shadow-[var(--shadow-accent)]',
                          state === 'booked' && 'bg-muted border-border text-muted-foreground cursor-not-allowed',
                          !state && 'bg-card hover:border-accent/30 hover:bg-[var(--accent-tint)]/40',
                        )}
                      >
                        {state === 'booked' && <span className="text-[10px] font-bold">Đã đặt</span>}
                        {!state && (
                          <Plus className="mx-auto h-3.5 w-3.5 text-border opacity-0 transition group-hover:opacity-100" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button onClick={() => toast.success('Đã lưu lịch rảnh')}>Lưu thay đổi</Button>
      </div>
    </main>
  );
}
