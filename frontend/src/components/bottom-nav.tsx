'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Heart, LayoutDashboard, Search, User } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

const items = [
  { href: '/tutors', label: 'Khám phá', icon: Search },
  { href: '/bookings', label: 'Lịch học', icon: CalendarDays },
  { href: '/dashboard', label: 'Trang chủ', icon: LayoutDashboard },
  { href: '/favorites', label: 'Yêu thích', icon: Heart },
  { href: '/profile', label: 'Tôi', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <>
      {/* Spacer so mobile content doesn't hide behind the fixed nav */}
      <div className="h-16 md:hidden" aria-hidden />
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-md md:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + '/');
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex min-w-[60px] flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition',
                  active
                    ? 'text-accent'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'fill-[var(--accent-tint)]')} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
    </>
  );
}
