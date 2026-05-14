'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell, CalendarCheck, MessageCircle, Wallet } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

type Notification = {
  id: string;
  icon: 'booking' | 'message' | 'wallet';
  title: string;
  body: string;
  time: string;
  href: string;
  unread?: boolean;
};

// Stub data — replace with real /notifications endpoint when backend is ready.
const initial: Notification[] = [
  {
    id: 'n1',
    icon: 'booking',
    title: 'Yêu cầu đặt lịch mới',
    body: 'Nguyễn Mai Anh đã chấp nhận buổi học Toán 12 Thứ 4, 19:00.',
    time: '5 phút trước',
    href: '/bookings',
    unread: true,
  },
  {
    id: 'n2',
    icon: 'wallet',
    title: 'Thanh toán thành công',
    body: 'Buổi học IELTS Speaking đã được ký quỹ 450.000 VND.',
    time: '1 giờ trước',
    href: '/bookings',
    unread: true,
  },
  {
    id: 'n3',
    icon: 'message',
    title: 'Có đánh giá mới',
    body: 'Học sinh đã để lại đánh giá 5 sao cho buổi học hôm qua.',
    time: 'Hôm qua',
    href: '/dashboard',
  },
];

const iconMap = {
  booking: CalendarCheck,
  message: MessageCircle,
  wallet: Wallet,
};

export function NotificationCenter() {
  const [items, setItems] = React.useState(initial);
  const unread = items.filter((n) => n.unread).length;

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

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
              onClick={markAllRead}
              className="text-xs font-medium text-accent hover:underline"
            >
              Đánh dấu đã đọc
            </button>
          </div>
          <div className="max-h-96 overflow-auto py-2">
            {items.map((n) => {
              const Icon = iconMap[n.icon];
              return (
                <DropdownMenu.Item asChild key={n.id}>
                  <Link
                    href={n.href}
                    className={cn(
                      'flex gap-3 px-4 py-3 text-sm outline-hidden transition focus:bg-muted',
                      n.unread && 'bg-[var(--accent-tint)]/40',
                    )}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-tint)] text-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[11px] font-medium text-muted-foreground">{n.time}</p>
                    </div>
                    {n.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />}
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
