'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { SimpleBars } from '@/components/charts/simple-bars';
import { SimpleLine } from '@/components/charts/simple-line';
import {
  adminQueue,
  adminReports,
  platformBookingsSeries,
  platformRevenueSeries,
} from '@/data/mock-data';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Download,
  Users,
} from 'lucide-react';

const severityTone: Record<string, 'danger' | 'warning' | 'info'> = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
};

export default function AdminPage() {
  return (
    <>
      <Header />
      <AuthGuard roles={['admin']}>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Badge tone="accent">Bảng quản trị</Badge>
              <h1
                className="mt-3 text-3xl font-bold tracking-tight text-foreground"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Tổng quan vận hành EduMatch.
              </h1>
              <p className="mt-1 text-muted-foreground">
                Duyệt hồ sơ gia sư, xử lý báo cáo và theo dõi chỉ số nền tảng.
              </p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Xuất báo cáo
            </Button>
          </div>

          {/* KPIs */}
          <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Tổng người dùng', value: '12.480', delta: '+248 / tuần', icon: Users, tint: 'bg-[var(--accent-tint)] text-accent' },
              { label: 'Hồ sơ chờ duyệt', value: '18', delta: '+5 hôm nay', icon: CheckCircle2, tint: 'bg-emerald-50 text-emerald-600' },
              { label: 'Khiếu nại mở', value: '5', delta: '2 ưu tiên cao', icon: AlertTriangle, tint: 'bg-amber-50 text-amber-600' },
              { label: 'Doanh thu tháng', value: '128M ₫', delta: '+10% so với tháng trước', icon: BarChart3, tint: 'bg-sky-50 text-sky-600' },
            ].map(({ label, value, delta, icon: Icon, tint }) => (
              <Card key={label} className="edm-lift">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-foreground">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tint}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{label}</p>
                  <p
                    className="mt-1 text-2xl font-bold tabular-nums text-foreground"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{delta}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Charts */}
          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking theo ngày</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBars data={platformBookingsSeries} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu nền tảng (triệu ₫)</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleLine data={platformRevenueSeries.map((d) => ({ label: d.month, value: d.value }))} />
              </CardContent>
            </Card>
          </section>

          {/* Approval queue + reports */}
          <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Hồ sơ gia sư chờ duyệt</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/tutors/tq-1">
                    Mở queue <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {adminQueue.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-border p-4">
                    <Avatar name={item.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.subject} · {item.education}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.submitted}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={item.status} />
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/tutors/${item.id}`}>Mở hồ sơ</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-amber-200/60 bg-amber-50/40">
              <CardHeader>
                <CardTitle className="text-amber-900">Báo cáo cần xử lý</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {adminReports.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-amber-200 bg-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-foreground">{r.type}</p>
                      <Badge tone={severityTone[r.severity]}>{r.severity}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.target}</p>
                    <p className="mt-2 text-sm leading-6 text-foreground">{r.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{r.submitted}</p>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/users">Xem tất cả báo cáo</Link>
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2">
            <Button asChild variant="outline" className="h-auto justify-start py-5">
              <Link href="/admin/users">
                <div className="text-left">
                  <p className="font-semibold text-foreground">Quản lý người dùng</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Tìm, khóa, mở khóa, hoàn tiền</p>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto justify-start py-5">
              <Link href="/admin/tutors/tq-1">
                <div className="text-left">
                  <p className="font-semibold text-foreground">Duyệt gia sư</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Hồ sơ, chứng chỉ, môn dạy</p>
                </div>
              </Link>
            </Button>
          </section>
        </main>
      </AuthGuard>
    </>
  );
}
