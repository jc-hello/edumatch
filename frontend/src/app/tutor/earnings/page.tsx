'use client';

import { useState } from 'react';
import { ArrowDownToLine, Banknote, TrendingUp, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { SimpleLine } from '@/components/charts/simple-line';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { formatVnd, payouts, tutorEarningsSeries } from '@/data/mock-data';

const AVAILABLE = 5_600_000;
const PENDING = 1_200_000;
const TOTAL = 23_400_000;

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
  const [withdrawing, setWithdrawing] = useState(false);
  const [amount, setAmount] = useState(AVAILABLE);

  function submit() {
    if (amount <= 0 || amount > AVAILABLE) {
      toast.error('Số tiền không hợp lệ');
      return;
    }
    toast.success(`Yêu cầu rút ${formatVnd(amount)} đã được tạo. Xử lý trong 1-2 ngày.`);
    setWithdrawing(false);
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <div>
        <Badge tone="accent">Thu nhập</Badge>
        <h1
          className="mt-3 text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Quản lý thu nhập và rút tiền.
        </h1>
        <p className="mt-1 text-muted-foreground">
          Số dư sẽ giải ngân sau khi buổi học hoàn tất và qua thời gian kháng nghị.
        </p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="overflow-hidden border-accent/20 shadow-[var(--shadow-accent)]">
          <div className="edm-gradient-bg p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">Khả dụng</p>
            <p
              className="mt-1 text-3xl font-bold tabular-nums"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {formatVnd(AVAILABLE)}
            </p>
          </div>
          <CardContent className="p-5">
            <Button className="w-full" onClick={() => setWithdrawing(true)}>
              <ArrowDownToLine className="mr-2 h-4 w-4" /> Rút tiền
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Wallet className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm text-muted-foreground">Đang giữ ký quỹ</p>
            <p
              className="mt-1 text-2xl font-bold tabular-nums text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {formatVnd(PENDING)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">3 buổi học chờ hoàn tất</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm text-muted-foreground">Tổng đã nhận</p>
            <p
              className="mt-1 text-2xl font-bold tabular-nums text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {formatVnd(TOTAL)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Tích lũy từ khi tham gia</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Thu nhập 6 tháng qua (triệu ₫)</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLine data={tutorEarningsSeries.map((d) => ({ label: d.month, value: d.value }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tài khoản rút tiền</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ngân hàng chính
              </p>
              <p className="mt-2 font-semibold text-foreground">Vietcombank</p>
              <p className="mt-0.5 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                0011 **** 4567
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Đã xác minh</p>
            </div>
            <Button variant="outline" className="w-full">
              <Banknote className="mr-2 h-4 w-4" /> Thêm phương thức
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lịch sử rút tiền</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Mã</th>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Số tiền</th>
                  <th className="px-4 py-3">Phương thức</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {payouts.map((p) => (
                  <tr key={p.id} className="transition hover:bg-muted/30">
                    <td
                      className="px-4 py-3 font-semibold text-foreground"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {p.id}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
                    <td
                      className="px-4 py-3 font-semibold tabular-nums text-foreground"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {formatVnd(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.method}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Withdraw modal */}
      {withdrawing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setWithdrawing(false)}
        >
          <Card
            className="w-full max-w-md edm-animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>Yêu cầu rút tiền</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Số dư khả dụng:{' '}
                <span className="font-semibold text-foreground">{formatVnd(AVAILABLE)}</span>
              </p>
              <FormField label="Số tiền (₫)" htmlFor="amount">
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  min={100000}
                  max={AVAILABLE}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </FormField>
              <p className="rounded-2xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                Tiền sẽ chuyển vào Vietcombank 0011****4567 trong 1-2 ngày làm việc. Phí 0 ₫.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setWithdrawing(false)}>
                  Hủy
                </Button>
                <Button onClick={submit}>Xác nhận rút</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
