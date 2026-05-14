import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { formatVnd, tutors } from '@/data/mock-data';
import { CalendarDays, CreditCard, FileText, Lock, ShieldCheck } from 'lucide-react';

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ day?: string; slot?: string }>;
}) {
  const { id } = await params;
  const { day, slot } = await searchParams;
  const tutor = tutors.find((item) => item.id === id);
  if (!tutor) notFound();

  const selectedDay = day || tutor.availability[0]?.day || 'Thứ 2';
  const selectedSlot = slot || tutor.availability[0]?.slots[0] || '18:00';
  const duration = 1.5;
  const subtotal = tutor.price * duration;
  const platformFee = Math.round(subtotal * 0.1);
  const total = subtotal + platformFee;

  return (
    <>
      <Header />
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          <div>
            <Link
              href={`/tutors/${tutor.id}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              ← Quay lại hồ sơ gia sư
            </Link>
            <h1
              className="mt-4 text-3xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Xác nhận đặt lịch.
            </h1>
            <p className="mt-1 text-muted-foreground">
              Kiểm tra thông tin buổi học trước khi thanh toán.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin buổi học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
                  <Avatar name={tutor.name} size="md" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Gia sư
                    </p>
                    <p className="mt-0.5 truncate font-semibold text-foreground">{tutor.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{tutor.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-tint)] text-accent">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Lịch học
                    </p>
                    <p className="mt-0.5 font-semibold text-foreground">{selectedDay}</p>
                    <p
                      className="text-xs text-muted-foreground"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {selectedSlot} · {duration} giờ · {tutor.format}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground">Mục tiêu buổi học</label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Càng rõ ràng, gia sư càng chuẩn bị tốt cho buổi học.
                </p>
                <Textarea
                  className="mt-2 min-h-32"
                  placeholder="Ví dụ: Ôn lại hàm số bậc 2, luyện 10 câu vận dụng cao, cần giao bài tập về nhà…"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground">Tài liệu / chủ đề</label>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
                  <FileText className="h-5 w-5" />
                  Tải lên sẽ được kích hoạt sau khi kết nối storage. Tạm thời ghi chú ở trên.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="flex gap-3 p-5 text-sm text-emerald-900">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Thanh toán an toàn bằng ký quỹ</p>
                <p className="mt-1 leading-6 text-emerald-800">
                  Tiền được giữ tại nền tảng đến khi buổi học hoàn thành. Hủy trước 24 giờ hoàn 100%,
                  hủy trong 24 giờ áp dụng hoàn một phần.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="border-accent/20 shadow-[var(--shadow-accent)]">
            <CardHeader>
              <CardTitle>Tổng thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Học phí ({duration} giờ)</span>
                  <span
                    className="font-semibold tabular-nums text-foreground"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {formatVnd(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí nền tảng (10%)</span>
                  <span
                    className="font-semibold tabular-nums text-foreground"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {formatVnd(platformFee)}
                  </span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-foreground">Cần thanh toán</span>
                    <span
                      className="text-2xl font-bold tabular-nums text-foreground"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {formatVnd(total)}
                    </span>
                  </div>
                </div>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href={`/payment?bookingId=BK-NEW&amount=${total}`}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Thanh toán qua VNPay
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/tutors/${tutor.id}`}>Chọn khung giờ khác</Link>
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Bảo mật bằng SSL · không lưu thông tin thẻ
              </p>
            </CardContent>
          </Card>
        </aside>
      </main>
    </>
  );
}
