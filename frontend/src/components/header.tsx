'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  BookOpenCheck,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/auth.service';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { NotificationCenter } from './notification-center';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/tutors', label: 'Tìm gia sư', icon: Search, roles: ['student', 'tutor', 'admin'] },
  { href: '/bookings', label: 'Lịch học', icon: CalendarDays, roles: ['student', 'tutor', 'admin'] },
  { href: '/tutor/dashboard', label: 'Gia sư', icon: BookOpenCheck, roles: ['tutor', 'admin'] },
  { href: '/admin', label: 'Quản trị', icon: ShieldCheck, roles: ['admin'] },
] as const;

const roleLabels = {
  student: 'Học sinh',
  tutor: 'Gia sư',
  admin: 'Quản trị',
} as const;

export function Header() {
  const { user, clear } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {
      // logout always succeeds locally
    }
    clear();
    toast.success('Đã đăng xuất');
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-lg font-semibold tracking-tight"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl edm-gradient-bg text-white shadow-[var(--shadow-accent)] transition group-hover:shadow-[var(--shadow-accent-lg)]">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-foreground">
            Edu<span className="edm-gradient-text">Match</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/dashboard"
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground',
              pathname === '/dashboard' && 'bg-[var(--accent-tint)] text-accent',
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Bảng điều khiển
          </Link>
          {navItems
            .filter((item) => !user || item.roles.includes(user.role as never))
            .map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground',
                  pathname?.startsWith(href) && 'bg-[var(--accent-tint)] text-accent',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
        </nav>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationCenter />
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card pl-1 pr-2.5 py-1 transition hover:border-accent/30 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
                    <span className="hidden text-sm font-medium text-foreground sm:inline">
                      {user.fullName.split(' ').slice(-1)[0]}
                    </span>
                    <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:inline" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={10}
                    className="z-50 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card-lg)] data-[state=open]:edm-animate-fade-up"
                  >
                    <div className="border-b border-border p-4">
                      <p className="font-semibold text-foreground">{user.fullName}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
                      <span className="mt-2 inline-flex rounded-full bg-[var(--accent-tint)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                        {roleLabels[user.role]}
                      </span>
                    </div>
                    <div className="p-1.5">
                      <DropdownMenu.Item asChild>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-hidden transition focus:bg-muted"
                        >
                          <UserIcon className="h-4 w-4" /> Hồ sơ
                        </Link>
                      </DropdownMenu.Item>
                      {user.role === 'tutor' && (
                        <DropdownMenu.Item asChild>
                          <Link
                            href="/tutor/onboarding"
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-hidden transition focus:bg-muted"
                          >
                            <Sparkles className="h-4 w-4" /> Hồ sơ gia sư
                          </Link>
                        </DropdownMenu.Item>
                      )}
                      <DropdownMenu.Item asChild>
                        <Link
                          href="/favorites"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-hidden transition focus:bg-muted"
                        >
                          <Settings className="h-4 w-4" /> Yêu thích
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="my-1 h-px bg-border" />
                      <DropdownMenu.Item
                        onSelect={handleLogout}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 outline-hidden transition focus:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Đăng xuất
                      </DropdownMenu.Item>
                    </div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-muted-foreground transition hover:text-foreground sm:inline"
              >
                Đăng nhập
              </Link>
              <Button asChild size="sm">
                <Link href="/register">Bắt đầu</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
