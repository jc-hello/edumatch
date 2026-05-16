'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Lock, RotateCcw, Search, ShieldAlert, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { adminService } from '@/services/edumatch.service';
import { asArray, formatVnd } from '@/lib/format';
import { cn } from '@/lib/utils';

type AdminUserRow = {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
  status?: 'active' | 'locked';
  isActive?: boolean;
  joined?: string;
};

type ReportRow = {
  id: string;
  type?: string;
  target?: string;
  severity?: string;
  description?: string;
};

const roleLabels = { student: 'Học sinh', tutor: 'Gia sư', admin: 'Admin' } as const;

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
  const [role, setRole] = useState<'all' | AdminUserRow['role']>('all');
  const [refundUser, setRefundUser] = useState<AdminUserRow | null>(null);
  const [refundBookingId, setRefundBookingId] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('');
  const [resolutionDraft, setResolutionDraft] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['admin', 'users', q, role],
    queryFn: () => adminService.users({ q: q || undefined, role: role === 'all' ? undefined : role }),
  });
  const { data: reportsData } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => adminService.reports({ status: 'open' }),
  });
  const users = useMemo(() => asArray<AdminUserRow>(data), [data]);
  const reports = asArray<ReportRow>(reportsData);

  const toggleLock = useMutation({
    mutationFn: (user: AdminUserRow) => {
      const locked = user.status === 'locked' || user.isActive === false;
      return locked ? adminService.unlockUser(user.id) : adminService.lockUser(user.id);
    },
    onSuccess: () => {
      toast.success('Đã cập nhật tài khoản');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
  const refundMutation = useMutation({
    mutationFn: () => {
      if (!refundUser || !refundBookingId || refundAmount <= 0) {
        throw new Error('Vui lòng nhập đủ booking và số tiền');
      }
      return adminService.refundUser(refundUser.id, {
        bookingId: refundBookingId,
        amount: refundAmount,
        reason: refundReason || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Đã xử lý hoàn tiền');
      setRefundUser(null);
      setRefundBookingId('');
      setRefundAmount(0);
      setRefundReason('');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Không hoàn tiền được'),
  });
  const resolveReport = useMutation({
    mutationFn: ({ id, actionTaken }: { id: string; actionTaken: 'lock' | 'refund' | 'warn' | 'dismiss' }) =>
      adminService.resolveReport(id, {
        resolution: resolutionDraft[id] || 'Đã xử lý từ dashboard admin',
        actionTaken,
      }),
    onSuccess: () => {
      toast.success('Đã xử lý báo cáo');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
    },
    onError: () => toast.error('Không xử lý được báo cáo'),
  });
  const exportReports = useMutation({
    mutationFn: adminService.exportReportsCsv,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'reports.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    onError: () => toast.error('Không xuất được báo cáo'),
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div>
        <Badge tone="accent">Admin Users API</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Người dùng và báo cáo</h1>
        <p className="mt-1 text-muted-foreground">Kết nối `/admin/users`, `/admin/reports`, lock/unlock thật.</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="rounded-lg">
          <CardHeader><CardTitle>Danh sách người dùng</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm theo tên, email..."
                  className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-accent"
                />
              </div>
              <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
                {[
                  { id: 'all' as const, label: 'Tất cả' },
                  { id: 'student' as const, label: 'Học sinh' },
                  { id: 'tutor' as const, label: 'Gia sư' },
                  { id: 'admin' as const, label: 'Admin' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRole(item.id)}
                    className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold', role === item.id ? 'bg-foreground text-background' : 'text-muted-foreground')}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Người dùng</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => {
                    const locked = user.status === 'locked' || user.isActive === false;
                    const name = user.name ?? user.fullName ?? user.email;
                    return (
                      <tr key={user.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={name} size="sm" />
                            <div><p className="font-semibold text-foreground">{name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{roleLabels[user.role]}</td>
                        <td className="px-4 py-3"><Badge tone={locked ? 'danger' : 'success'}>{locked ? 'Đã khóa' : 'Hoạt động'}</Badge></td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => toggleLock.mutate(user)}>
                              {locked ? <Unlock className="mr-1 h-3.5 w-3.5" /> : <Lock className="mr-1 h-3.5 w-3.5" />}
                              {locked ? 'Mở khóa' : 'Khóa'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setRefundUser(user)}>
                              <RotateCcw className="mr-1 h-3.5 w-3.5" />
                              Refund
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-amber-500" /> Báo cáo mở</CardTitle>
            <Button size="sm" variant="outline" onClick={() => exportReports.mutate()} loading={exportReports.isPending}>
              <Download className="mr-1 h-3.5 w-3.5" />
              CSV
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {reports.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Không có báo cáo mở.</p> : reports.map((report) => (
              <div key={report.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-foreground">{report.type ?? report.id}</p>
                  <Badge tone="warning">{report.severity ?? 'open'}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{report.target}</p>
                <p className="mt-2 text-sm text-foreground">{report.description}</p>
                <Textarea
                  value={resolutionDraft[report.id] ?? ''}
                  onChange={(event) => setResolutionDraft((draft) => ({ ...draft, [report.id]: event.target.value }))}
                  placeholder="Ghi chú xử lý..."
                  className="mt-3 min-h-20"
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => resolveReport.mutate({ id: report.id, actionTaken: 'warn' })}>
                    Cảnh báo
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => resolveReport.mutate({ id: report.id, actionTaken: 'lock' })}>
                    Khóa liên quan
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => resolveReport.mutate({ id: report.id, actionTaken: 'refund' })}>
                    Đánh dấu refund
                  </Button>
                  <Button size="sm" onClick={() => resolveReport.mutate({ id: report.id, actionTaken: 'dismiss' })}>
                    Đóng báo cáo
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {refundUser && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setRefundUser(null)}
        >
          <Card className="w-full max-w-lg rounded-lg" onClick={(event) => event.stopPropagation()}>
            <CardHeader>
              <CardTitle>Hoàn tiền cho {refundUser.name ?? refundUser.fullName ?? refundUser.email}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="space-y-2 text-sm font-semibold text-foreground">
                Booking ID
                <Input value={refundBookingId} onChange={(event) => setRefundBookingId(event.target.value)} placeholder="BK-0001" />
              </label>
              <label className="space-y-2 text-sm font-semibold text-foreground">
                Số tiền
                <Input type="number" min={0} value={refundAmount || ''} onChange={(event) => setRefundAmount(Number(event.target.value))} placeholder="330000" />
              </label>
              <label className="space-y-2 text-sm font-semibold text-foreground">
                Lý do
                <Textarea value={refundReason} onChange={(event) => setRefundReason(event.target.value)} placeholder="Lý do hoàn tiền..." />
              </label>
              {refundAmount > 0 && <p className="text-sm text-muted-foreground">Sẽ hoàn: <b className="text-foreground">{formatVnd(refundAmount)}</b></p>}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setRefundUser(null)}>Hủy</Button>
                <Button onClick={() => refundMutation.mutate()} loading={refundMutation.isPending}>Xác nhận refund</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
