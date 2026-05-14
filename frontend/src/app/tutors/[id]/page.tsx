import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatVnd, reviews as allReviews, tutors } from '@/data/mock-data';
import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock,
  Heart,
  Languages,
  MapPin,
  Quote,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
} from 'lucide-react';

export default async function TutorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tutor = tutors.find((item) => item.id === id);
  if (!tutor) notFound();

  const tutorReviews = allReviews.filter((r) => r.tutorId === tutor.id);
  const ratingBreakdown = [
    { stars: 5, pct: 78 },
    { stars: 4, pct: 17 },
    { stars: 3, pct: 4 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 0 },
  ];

  return (
    <>
      <Header />
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          <Link
            href="/tutors"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>

          {/* Profile header — gradient cover + identity */}
          <Card className="overflow-hidden">
            <div className="relative h-28 edm-gradient-bg">
              <div className="edm-dot-pattern absolute inset-0 opacity-30" aria-hidden />
              <div className="absolute right-4 top-4 flex gap-2">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
                  aria-label="Yêu thích"
                >
                  <Heart className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
                  aria-label="Chia sẻ"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <CardContent className="-mt-12 p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <span className="inline-flex">
                  <Avatar name={tutor.name} size="xl" className="ring-4 ring-card shadow-[var(--shadow-card-lg)]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1
                      className="text-3xl font-bold tracking-tight text-foreground"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {tutor.name}
                    </h1>
                    {tutor.verified && (
                      <Badge tone="success">
                        <CheckCircle2 className="h-3 w-3" /> Đã xác thực
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-base font-medium text-muted-foreground">{tutor.title}</p>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <b className="text-foreground">{tutor.rating}</b> ({tutor.reviews} đánh giá)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {tutor.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Video className="h-4 w-4" />
                      {tutor.format}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      Phản hồi {tutor.responseTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick stats strip */}
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 sm:grid-cols-4">
                {[
                  { label: 'Buổi đã dạy', value: tutor.sessions },
                  { label: 'Đánh giá', value: tutor.reviews },
                  { label: 'Cấp dạy', value: tutor.levels.length },
                  { label: 'Môn dạy', value: tutor.subjects.length },
                ].map((s) => (
                  <div key={s.label}>
                    <p
                      className="text-xl font-bold tabular-nums text-foreground"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>Giới thiệu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="leading-7 text-foreground">{tutor.bio}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {tutor.credentials.map((item) => (
                  <div
                    key={item}
                    className="edm-lift rounded-2xl border border-border bg-muted/30 p-4"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-tint)] text-accent">
                      <Award className="h-4 w-4" />
                    </span>
                    <p className="mt-3 text-sm font-medium text-foreground">{item}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-border pt-5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Dạy:
                </span>
                {tutor.subjects.map((s) => (
                  <Badge key={s} tone="accent">{s}</Badge>
                ))}
                {tutor.levels.map((l) => (
                  <Badge key={l} tone="neutral">{l}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Lịch rảnh tuần này</CardTitle>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="edm-animate-pulse-dot inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Cập nhật thời gian thực
              </span>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {tutor.availability.map((day) => (
                  <div key={day.day} className="rounded-2xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">{day.day}</p>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {day.slots.length} slot
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {day.slots.map((slot) => (
                        <Link
                          key={slot}
                          href={`/tutors/${tutor.id}/book?day=${encodeURIComponent(day.day)}&slot=${encodeURIComponent(slot)}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent-tint)] px-3 py-1.5 text-sm font-semibold text-accent ring-1 ring-accent/15 transition hover:bg-accent hover:text-white"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {slot}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews with breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Đánh giá từ học sinh ({tutor.reviews})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rating overview */}
              <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
                <div className="rounded-2xl bg-muted/40 p-5 text-center">
                  <p
                    className="text-5xl font-bold tracking-tight text-foreground"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {tutor.rating}
                  </p>
                  <div className="mt-2 flex justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i <= Math.round(tutor.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{tutor.reviews} đánh giá</p>
                </div>
                <div className="space-y-2">
                  {ratingBreakdown.map((row) => (
                    <div key={row.stars} className="flex items-center gap-3 text-sm">
                      <span className="inline-flex w-10 items-center gap-0.5 text-muted-foreground">
                        {row.stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </span>
                      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="absolute inset-y-0 left-0 edm-gradient-bg"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                      <span
                        className="w-10 text-right text-xs font-medium tabular-nums text-muted-foreground"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {row.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual reviews */}
              <div className="grid gap-3 border-t border-border pt-5 md:grid-cols-2">
                {(tutorReviews.length ? tutorReviews : allReviews.slice(0, 2)).map((r) => (
                  <div key={r.id} className="rounded-2xl border border-border bg-muted/20 p-5">
                    <Quote className="h-5 w-5 text-accent" />
                    <p className="mt-3 text-sm leading-6 text-foreground">{r.body}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={r.student} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">{r.student}</p>
                          <p className="text-[11px] text-muted-foreground">{r.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sticky booking card */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden border-accent/20 shadow-[var(--shadow-accent)]">
            <CardContent className="p-6">
              <Badge tone="accent">
                <Sparkles className="h-3 w-3" /> Có sẵn tối nay
              </Badge>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span
                  className="text-4xl font-bold tracking-tight text-foreground"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {formatVnd(tutor.price)}
                </span>
                <span className="text-sm text-muted-foreground">/giờ</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Phí nền tảng 10% sẽ tính khi thanh toán
              </p>
              <Button asChild className="mt-6 w-full" size="lg">
                <Link href={`/tutors/${tutor.id}/book`}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Đặt lịch học
                </Link>
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full">
                <Link href="#">Nhắn tin trước</Link>
              </Button>
              <ul className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  Thanh toán ký quỹ, giải ngân sau buổi học
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  Hủy trước 24 giờ hoàn 100%
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Languages className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {tutor.languages.join(' · ')}
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  Phản hồi trong {tutor.responseTime}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-5 text-sm">
              <p className="font-semibold text-foreground">Không thấy khung giờ phù hợp?</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Nhắn tin để đề xuất khung giờ riêng. Gia sư thường phản hồi nhanh trong vòng 30 phút.
              </p>
              <Button variant="ghost" size="sm" className="mt-3 -ml-3">
                Đề xuất khung giờ →
              </Button>
            </CardContent>
          </Card>
        </aside>
      </main>
    </>
  );
}
