'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, MessageSquare, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { adminService } from '@/services/edumatch.service';

type TutorProfile = {
  id: string;
  full_name?: string;
  email?: string;
  headline?: string;
  bio?: string;
  status?: string;
  subjects_json?: string;
  levels_json?: string;
  education_json?: string;
};

export default function AdminTutorReviewPage() {
  const params = useParams<{ id: string }>();
  return (
    <>
      <Header />
      <AuthGuard roles={['admin']}>
        <Inner id={params.id} />
      </AuthGuard>
    </>
  );
}

function Inner({ id }: { id: string }) {
  const router = useRouter();
  const { data } = useQuery({ queryKey: ['admin', 'tutor', id], queryFn: () => adminService.tutor(id) });
  const profile = data as TutorProfile | undefined;

  const action = useMutation({
    mutationFn: (kind: 'approve' | 'reject' | 'request') => {
      if (kind === 'approve') return adminService.approveTutor(id);
      if (kind === 'reject') return adminService.rejectTutor(id, 'Không đạt yêu cầu duyệt');
      return adminService.requestTutorInfo(id, 'Vui lòng bổ sung thông tin hồ sơ.');
    },
    onSuccess: () => {
      toast.success('Đã cập nhật hồ sơ gia sư');
      router.push('/admin');
    },
  });

  const name = profile?.full_name ?? profile?.email ?? 'Gia sư';

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Quay lại bảng quản trị
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="rounded-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-5">
                <Avatar name={name} size="xl" />
                <div>
                  <Badge tone="warning">{profile?.status ?? 'Đang tải'}</Badge>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{name}</h1>
                  <p className="mt-1 text-muted-foreground">{profile?.headline ?? 'Chưa có headline'}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{profile?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader><CardTitle>Thông tin hồ sơ</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Info label="Giới thiệu" value={profile?.bio} />
              <Info label="Môn dạy" value={profile?.subjects_json} />
              <Info label="Cấp học" value={profile?.levels_json} />
              <Info label="Học vấn" value={profile?.education_json} />
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader><CardTitle>Ghi chú nội bộ</CardTitle></CardHeader>
            <CardContent><Textarea placeholder="Ghi chú cho hồ sơ này..." rows={4} /></CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-lg border-emerald-200 bg-emerald-50/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <ShieldCheck className="h-5 w-5" /> Hành động API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => action.mutate('approve')} loading={action.isPending}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Duyệt hồ sơ
              </Button>
              <Button variant="outline" className="w-full" onClick={() => action.mutate('request')} disabled={action.isPending}>
                <MessageSquare className="mr-2 h-4 w-4" /> Yêu cầu bổ sung
              </Button>
              <Button variant="destructive" className="w-full" onClick={() => action.mutate('reject')} disabled={action.isPending}>
                <XCircle className="mr-2 h-4 w-4" /> Từ chối
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{value || 'Chưa có dữ liệu'}</p>
    </div>
  );
}
