'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { adminQueue } from '@/data/mock-data';

export default function AdminTutorReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <>
      <Header />
      <AuthGuard roles={['admin']}>
        <Inner id={id} />
      </AuthGuard>
    </>
  );
}

function Inner({ id }: { id: string }) {
  const router = useRouter();
  const candidate = adminQueue.find((q) => q.id === id) ?? adminQueue[0];

  function decide(action: 'approve' | 'reject' | 'request') {
    if (action === 'approve') toast.success(`Đã duyệt hồ sơ ${candidate.name}`);
    if (action === 'reject') toast.info(`Đã từ chối hồ sơ ${candidate.name}`);
    if (action === 'request') toast.info('Đã gửi yêu cầu bổ sung thông tin');
    router.push('/admin');
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại bảng quản trị
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <Avatar name={candidate.name} size="xl" />
                <div className="flex-1">
                  <Badge tone="warning">Hồ sơ chờ duyệt</Badge>
                  <h1
                    className="mt-2 text-3xl font-bold tracking-tight text-foreground"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {candidate.name}
                  </h1>
                  <p className="mt-1 text-muted-foreground">
                    {candidate.subject} · {candidate.education}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-4 w-4" /> {id}@edumatch.vn
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-4 w-4" /> 09xx xxx xxx
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin học vấn</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Trường', value: candidate.education },
                { label: 'Bằng cấp', value: 'Cử nhân' },
                { label: 'Năm kinh nghiệm', value: '4 năm' },
                { label: 'Cấp dạy', value: 'THCS, THPT' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tài liệu đính kèm</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {['Bằng tốt nghiệp.pdf', 'CMND mặt trước.jpg', 'Chứng chỉ TESOL.pdf'].map((f) => (
                <button
                  type="button"
                  key={f}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-accent/30"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-tint)] text-accent">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{f}</p>
                    <p className="text-xs text-muted-foreground">Click để xem</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ghi chú nội bộ</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Ghi chú cho team duyệt sau này…" rows={4} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="border-emerald-200 bg-emerald-50/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <ShieldCheck className="h-5 w-5" /> Hành động
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => decide('approve')}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Duyệt hồ sơ
              </Button>
              <Button variant="outline" className="w-full" onClick={() => decide('request')}>
                <MessageSquare className="mr-2 h-4 w-4" /> Yêu cầu bổ sung
              </Button>
              <Button variant="destructive" className="w-full" onClick={() => decide('reject')}>
                <XCircle className="mr-2 h-4 w-4" /> Từ chối
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Checklist duyệt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              {[
                'Bằng cấp khớp với chuyên môn',
                'Giấy tờ tùy thân rõ nét, hợp lệ',
                'Mô tả hồ sơ không có lỗi chính tả nghiêm trọng',
                'Mức giá đề xuất hợp lý',
                'Không trùng với hồ sơ đã từ chối trước đó',
              ].map((item) => (
                <label key={item} className="flex cursor-pointer items-start gap-2">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-border accent-[var(--accent)]" />
                  <span className="text-foreground">{item}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-accent" /> Hồ sơ tương tự đã duyệt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>· Nguyễn Mai Anh — Toán THPT, đã duyệt 4 tháng trước</p>
              <p>· Phạm Linh Chi — Tiếng Anh, đã duyệt 5 tháng trước</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
