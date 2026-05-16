'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus, Plus, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { availabilityService, type AvailabilitySlot } from '@/services/edumatch.service';
import { cn } from '@/lib/utils';

const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const hours = Array.from({ length: 14 }, (_, i) => 8 + i);

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
  const queryClient = useQueryClient();
  const [recurring, setRecurring] = useState(true);
  const { data, isLoading } = useQuery({ queryKey: ['availability', 'me'], queryFn: () => availabilityService.getMine() });
  const apiSlots = useMemo(() => normalizeSlots(data), [data]);
  const [draft, setDraft] = useState<Set<string> | null>(null);
  const active = draft ?? new Set(apiSlots.map((slot) => `${slot.dayIdx}-${slot.hour}`));

  const save = useMutation({
    mutationFn: () => availabilityService.replaceMine({
      recurring,
      slots: Array.from(active).map((key) => {
        const [dayIdx, hour] = key.split('-').map(Number);
        return { dayIdx, hour };
      }),
    }),
    onSuccess: () => {
      toast.success('Đã lưu lịch rảnh');
      setDraft(null);
      queryClient.invalidateQueries({ queryKey: ['availability', 'me'] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Không lưu được lịch'),
  });

  function toggle(dayIdx: number, hour: number) {
    const key = `${dayIdx}-${hour}`;
    const next = new Set(active);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setDraft(next);
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge tone="accent">Availability API</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Quản lý lịch rảnh</h1>
          <p className="mt-1 text-muted-foreground">Đọc và lưu trực tiếp bằng `/availability/me`.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={recurring ? 'default' : 'outline'} onClick={() => setRecurring((v) => !v)} size="sm">
            <Repeat className="mr-1.5 h-4 w-4" /> {recurring ? 'Lặp lại' : 'Một lần'}
          </Button>
          <Button onClick={() => save.mutate()} loading={save.isPending} size="sm">Lưu thay đổi</Button>
        </div>
      </div>

      <Card className="mt-6 rounded-lg">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><CalendarPlus className="h-5 w-5 text-accent" /> Tuần</CardTitle>
          <Badge tone="neutral">{isLoading ? 'Đang tải' : `${active.size} slot`}</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1.5 pb-2">
                <div />
                {days.map((day) => <div key={day} className="text-center text-xs font-bold uppercase text-muted-foreground">{day}</div>)}
              </div>
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] gap-1.5 pb-1.5">
                  <div className="pr-2 pt-1 text-right text-xs text-muted-foreground">{String(hour).padStart(2, '0')}:00</div>
                  {days.map((_, dayIdx) => {
                    const selected = active.has(`${dayIdx}-${hour}`);
                    return (
                      <button
                        key={`${dayIdx}-${hour}`}
                        type="button"
                        onClick={() => toggle(dayIdx, hour)}
                        className={cn(
                          'group h-9 rounded-md border transition',
                          selected ? 'border-accent bg-accent text-white' : 'border-border bg-card hover:border-accent/40 hover:bg-[var(--accent-tint)]',
                        )}
                      >
                        {selected ? <span className="text-xs font-bold">Mở</span> : <Plus className="mx-auto h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function normalizeSlots(payload: unknown): AvailabilitySlot[] {
  if (!Array.isArray(payload)) return [];
  return payload.map((slot) => ({
    dayIdx: Number(slot.dayIdx ?? slot.day_idx ?? 0),
    hour: Number(slot.hour ?? 0),
  }));
}
