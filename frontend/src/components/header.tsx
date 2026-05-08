'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/auth.service';
import { Button } from './ui/button';
import { GraduationCap, LogOut, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export function Header() {
  const { user, clear } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {
      // ignore — logout should always succeed locally
    }
    clear();
    toast.success('Logged out');
    router.push('/login');
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <GraduationCap className="h-6 w-6 text-indigo-600" />
          <span>EduMatch</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <UserIcon className="h-4 w-4" />
                <span>{user.fullName}</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-indigo-50 text-indigo-700">
                  {user.role}
                </span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-700 hover:text-gray-900">
                Login
              </Link>
              <Button asChild size="sm">
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
