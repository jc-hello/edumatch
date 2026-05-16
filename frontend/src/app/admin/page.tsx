'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, BarChart3, CheckCircle2, Download, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { SimpleBars } from '@/components/charts/simple-bars';
import { SimpleLine } from '@/components/charts/simple-line';
import { adminService } from '@/services/edumatch.service';
import { asArray, formatVnd } from '@/lib/format';

type Overview = {
  totalUsers?: number;
  pendingTutors?: number;
  openReports?: number;
  monthlyRevenue?: number;
  bookingsByDay?: Array<{ label: string; value: number }>;
  revenueSeries?: Array<{ month: string; value: number }>;
};

type QueueItem = {
  id: string;
  full_name?: string;
  email?: string;
  headline?: string;
  status?: string;
  created_at?: string;
};

type ReportItem = {
  id: string;
  type?: string;
  target?: string;
  severity?: string;
  description?: string;
  status?: string;
};

export default function AdminPage() {
  return (
    <>
      <Header />
      <AuthGuard roles={['admin']}>
        <AdminInner />
      </AuthGuard>
    </>
  );
}

function AdminInner() {
  const queryClient = useQueryClient();
  const [resolutionDraft, setResolutionDraft] = useState<Record<string, string>>({});
  const { data: overviewData } = useQuery({ queryKey: ['admin', 'overview'], queryFn: adminService.overview });
  const { data: queueData } = useQuery({ queryKey: ['admin', 'tutors', 'queue'], queryFn: () => adminService.tutorQueue({ status: 'pending_review' }) });
  const { data: reportsData } = useQuery({ queryKey: ['admin', 'reports', 'open'], queryFn: () => adminService.reports({ status: 'open' }) });
  const overview = (overviewData ?? {}) as Overview;
  const queue = asArray<QueueItem>(queueData);
  const reports = asArray<ReportItem>(reportsData);
  const resolveReport = useMutation({
    mutationFn: ({ id, actionTaken }: { id: string; actionTaken: 'lock' | 'refund' | 'warn' | 'dismiss' }) =>
      adminService.resolveReport(id, {
        resolution: resolutionDraft[id] || 'Đã xử lý từ dashboard',
        actionTaken,
      }),
    onSuccess: () => {
      toast.success('Đã xử lý báo cáo');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
    },
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
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge tone="accent">Admin API</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Tổng quan vận hành</h1>
          <p className="mt-1 text-muted-foreground">Dữ liệu từ `/admin/stats/overview` và `/admin/tutors/queue`.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/users">Quản lý người dùng</Link>
        </Button>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat label="Tổng người dùng" value={String(overview.totalUsers ?? 0)} icon={<Users className="h-5 w-5" />} />
        <Stat label="Gia sư chờ duyệt" value={String(overview.pendingTutors ?? 0)} icon={<CheckCircle2 className="h-5 w-5" />} />
        <Stat label="Báo cáo mở" value={String(overview.openReports ?? 0)} icon={<AlertTriangle className="h-5 w-5" />} />
        <Stat label="Doanh thu tháng" value={formatVnd(overview.monthlyRevenue ?? 0)} icon={<BarChart3 className="h-5 w-5" />} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader><CardTitle>Booking 7 ngày</CardTitle></CardHeader>
          <CardContent><SimpleBars data={overview.bookingsByDay ?? []} /></CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader><CardTitle>Doanh thu 6 tháng</CardTitle></CardHeader>
          <CardContent><SimpleLine data={(overview.revenueSeries ?? []).map((item) => ({ label: item.month, value: item.value }))} /></CardContent>
        </Card>
      </section>

      <Card className="mt-6 rounded-lg">
        <CardHeader><CardTitle>Hồ sơ gia sư chờ duyệt</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {queue.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Không có hồ sơ chờ duyệt.</p>
          ) : (
            queue.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-lg border border-border p-4">
                <Avatar name={item.full_name ?? item.email ?? 'Tutor'} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{item.full_name ?? item.email}</p>
                  <p className="truncate text-sm text-muted-foreground">{item.headline ?? 'Chưa có headline'}</p>
                </div>
                <StatusBadge status={item.status ?? 'pending_payment'} />
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/tutors/${item.id}`}>Mở</Link>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-lg">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Báo cáo cần xử lý</CardTitle>
          <Button size="sm" variant="outline" onClick={() => exportReports.mutate()} loading={exportReports.isPending}>
            <Download className="mr-1.5 h-4 w-4" />
            Xuất CSV
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {reports.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground lg:col-span-2">Không có báo cáo mở.</p>
          ) : (
            reports.slice(0, 4).map((report) => (
              <div key={report.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{report.type ?? report.id}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{report.target}</p>
                  </div>
                  <Badge tone="warning">{report.severity ?? report.status ?? 'open'}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground">{report.description ?? 'Không có mô tả.'}</p>
                <Textarea
                  value={resolutionDraft[report.id] ?? ''}
                  onChange={(event) => setResolutionDraft((draft) => ({ ...draft, [report.id]: event.target.value }))}
                  placeholder="Ghi chú xử lý..."
                  className="mt-3 min-h-20"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => resolveReport.mutate({ id: report.id, actionTaken: 'warn' })}>
                    Cảnh báo
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => resolveReport.mutate({ id: report.id, actionTaken: 'refund' })}>
                    Refund
                  </Button>
                  <Button size="sm" onClick={() => resolveReport.mutate({ id: report.id, actionTaken: 'dismiss' })}>
                    Đóng
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-tint)] text-accent">{icon}</div>
        <p className="mt-4 text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
