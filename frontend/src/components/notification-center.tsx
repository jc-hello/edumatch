'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell, CalendarCheck, MessageCircle, Wallet } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { notificationsService, type Notification } from '@/services/edumatch.service';
import { asArray, shortDate } from '@/lib/format';

const iconMap = {
  booking: CalendarCheck,
  message: MessageCircle,
  wallet: Wallet,
};

export function NotificationCenter() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.list({ page: 1 }),
  });
  const items = asArray<Notification>(data).slice(0, 8);
  const unread = items.filter((n) => !n.read).length;

  const markAll = useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-accent/30 hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Thông báo"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white edm-animate-pulse-dot">
              {unread}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="z-50 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card-lg)] data-[state=open]:edm-animate-fade-up"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Thông báo</p>
            <button
              type="button"
              onClick={() => markAll.mutate()}
              className="text-xs font-medium text-accent hover:underline"
            >
              Đánh dấu đã đọc
            </button>
          </div>
          <div className="max-h-96 overflow-auto py-2">
            {isLoading && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Đang tải…</p>
            )}
            {!isLoading && items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Chưa có thông báo
              </p>
            )}
            {items.map((n) => {
              const Icon = iconMap[pickIcon(n.type)];
              return (
                <DropdownMenu.Item asChild key={n.id}>
                  <Link
                    href="/bookings"
                    className={cn(
                      'flex gap-3 px-4 py-3 text-sm outline-hidden transition focus:bg-muted',
                      !n.read && 'bg-[var(--accent-tint)]/40',
                    )}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-tint)] text-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                        {shortDate(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />}
                  </Link>
                </DropdownMenu.Item>
              );
            })}
          </div>
          <div className="border-t border-border px-4 py-3 text-center">
            <Link href="/dashboard" className="text-xs font-medium text-accent hover:underline">
              Xem tất cả thông báo
            </Link>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function pickIcon(type: string): keyof typeof iconMap {
  if (type.includes('payment') || type.includes('payout')) return 'wallet';
  if (type.includes('message') || type.includes('review')) return 'message';
  return 'booking';
}
