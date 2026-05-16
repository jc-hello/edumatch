'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDownToLine, TrendingUp, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SimpleLine } from '@/components/charts/simple-line';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { payoutsService } from '@/services/edumatch.service';
import { asArray, formatVnd } from '@/lib/format';

type Summary = { balance?: number; lifetimeEarnings?: number; monthlySeries?: Array<{ month: string; value: number }> };
type Payout = { id: string; date?: string; amount: number; status: string; method?: string };

export default function TutorEarningsPage() {
  return (
    <>
      <Header />
      <AuthGuard roles={['tutor', 'admin']}>
        <EarningsInner />
      </AuthGuard>
    </>
  );
}

function EarningsInner() {
  const [amount, setAmount] = useState(0);
  const queryClient = useQueryClient();
  const { data: summaryData } = useQuery({ queryKey: ['payouts', 'summary'], queryFn: payoutsService.summary });
  const { data: payoutsData } = useQuery({ queryKey: ['payouts'], queryFn: () => payoutsService.list({ page: 1 }) });
  const summary = (summaryData ?? {}) as Summary;
  const payouts = asArray<Payout>(payoutsData);
  const balance = summary.balance ?? 0;

  const request = useMutation({
    mutationFn: () => payoutsService.request(amount),
    onSuccess: () => {
      toast.success('Đã tạo yêu cầu rút tiền');
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      setAmount(0);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Không tạo được yêu cầu'),
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div>
        <Badge tone="accent">Payout API</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Thu nhập và rút tiền</h1>
        <p className="mt-1 text-muted-foreground">Số liệu từ `/payouts/me/summary` và `/payouts/me`.</p>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="rounded-lg border-accent/20">
          <CardContent className="p-5">
            <Wallet className="h-8 w-8 text-accent" />
            <p className="mt-4 text-sm text-muted-foreground">Số dư khả dụng</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{formatVnd(balance)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardContent className="p-5">
            <TrendingUp className="h-8 w-8 text-emerald-600" />
            <p className="mt-4 text-sm text-muted-foreground">Tổng thu nhập</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{formatVnd(summary.lifetimeEarnings ?? 0)}</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-lg">
          <CardHeader><CardTitle>Thu nhập 6 tháng</CardTitle></CardHeader>
          <CardContent><SimpleLine data={(summary.monthlySeries ?? []).map((item) => ({ label: item.month, value: item.value }))} /></CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader><CardTitle>Yêu cầu rút tiền</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input type="number" min={0} max={balance} value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Số tiền" />
            <Button className="w-full" onClick={() => request.mutate()} loading={request.isPending}>
              <ArrowDownToLine className="mr-2 h-4 w-4" /> Gửi yêu cầu
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-6 rounded-lg">
        <CardHeader><CardTitle>Lịch sử rút tiền</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3">Mã</th><th className="px-4 py-3">Ngày</th><th className="px-4 py-3">Số tiền</th><th className="px-4 py-3">Trạng thái</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payouts.map((payout) => (
                  <tr key={payout.id}>
                    <td className="px-4 py-3 font-semibold">{payout.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{payout.date}</td>
                    <td className="px-4 py-3 font-semibold">{formatVnd(payout.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={payout.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
