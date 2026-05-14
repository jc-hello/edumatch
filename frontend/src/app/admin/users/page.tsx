'use client';

import { useMemo, useState } from 'react';
import { Lock, RotateCw, Search, ShieldAlert, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { adminReports, adminUsers, type AdminUser } from '@/data/mock-data';
import { cn } from '@/lib/utils';

const roleLabels: Record<AdminUser['role'], string> = {
  student: 'Học sinh',
  tutor: 'Gia sư',
  admin: 'Admin',
};

const statusTone: Record<AdminUser['status'], 'success' | 'danger' | 'warning'> = {
  active: 'success',
  locked: 'danger',
  pending: 'warning',
};

const statusLabel: Record<AdminUser['status'], string> = {
  active: 'Hoạt động',
  locked: 'Đã khóa',
  pending: 'Chờ duyệt',
};

const severityTone: Record<string, 'danger' | 'warning' | 'info'> = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
};

export default function AdminUsersPage() {
  return (
    <>
      <Header />
      <AuthGuard roles={['admin']}>
        <Inner />
      </AuthGuard>
    </>
  );
}

function Inner() {
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AdminUser['role']>('all');

  const users = useMemo(
    () =>
      adminUsers.filter((u) => {
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        if (!q) return true;
        const s = q.toLowerCase();
        return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
      }),
    [q, roleFilter],
  );

  function lock(u: AdminUser) {
    if (u.status === 'locked') {
      toast.success(`Đã mở khóa ${u.name}`);
    } else {
      toast.info(`Đã khóa ${u.name}`);
    }
  }
  function refund(u: AdminUser) {
    toast.success(`Đã tạo yêu cầu hoàn tiền cho ${u.name}`);
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <div>
        <Badge tone="accent">Quản lý người dùng</Badge>
        <h1
          className="mt-3 text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          User & báo cáo vi phạm.
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tìm, khóa, mở khóa tài khoản và xử lý báo cáo tranh chấp.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách người dùng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-hidden focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
                {(
                  [
                    { id: 'all' as const, label: 'Tất cả' },
                    { id: 'student' as const, label: 'Học sinh' },
                    { id: 'tutor' as const, label: 'Gia sư' },
                  ]
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setRoleFilter(f.id)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                      roleFilter === f.id
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Người dùng</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-4 py-3">Tham gia</th>
                    <th className="px-4 py-3 text-right">Booking</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {users.map((u) => (
                    <tr key={u.id} className="transition hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size="sm" />
                          <div>
                            <p className="font-semibold text-foreground">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{roleLabels[u.role]}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.joined}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                        {u.bookings}
                      </td>
                      <td className="px-4 py-3"><Badge tone={statusTone[u.status]}>{statusLabel[u.status]}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => lock(u)}>
                            {u.status === 'locked' ? (
                              <>
                                <Unlock className="mr-1 h-3.5 w-3.5" /> Mở
                              </>
                            ) : (
                              <>
                                <Lock className="mr-1 h-3.5 w-3.5" /> Khóa
                              </>
                            )}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => refund(u)}>
                            <RotateCw className="mr-1 h-3.5 w-3.5" /> Refund
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                        Không có user nào khớp bộ lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" /> Báo cáo vi phạm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {adminReports.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-foreground">{r.type}</p>
                  <Badge tone={severityTone[r.severity]}>{r.severity}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.target}</p>
                <p className="mt-2 text-sm leading-6 text-foreground">{r.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{r.submitted}</p>
                  <Button size="sm" variant="outline" onClick={() => toast.success('Đã xử lý')}>
                    Xử lý
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
