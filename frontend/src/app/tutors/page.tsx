import { Header } from '@/components/header';
import { TutorCard } from '@/components/marketplace/tutor-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tutors } from '@/data/mock-data';
import {
  ArrowDownUp,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Video,
  X,
} from 'lucide-react';

const subjects = ['Toán', 'Tiếng Anh', 'Lập trình', 'Hóa học', 'Vật lý', 'Ngữ văn', 'IELTS'];
const levels = ['THCS', 'THPT', 'Đại học'];
const times = ['Hôm nay', 'Tối nay', 'Cuối tuần', 'Online'];
const activeFilters = ['Toán', 'THPT', 'Online'];

export default function TutorsPage() {
  return (
    <>
      <Header />

      {/* Hero strip */}
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="edm-glow -top-20 -left-20 opacity-50" aria-hidden />
        <div className="edm-glow -top-20 -right-20 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <Badge tone="accent">
            <Sparkles className="h-3 w-3" /> Marketplace
          </Badge>
          <h1
            className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Tìm <span className="edm-gradient-text">gia sư phù hợp</span> trong vài phút.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            {tutors.length} gia sư đã kiểm duyệt · cập nhật lịch rảnh thời gian thực · hủy bất cứ lúc nào.
          </p>

          {/* Search bar */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-card-lg)]">
            <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm theo môn học, tên gia sư, từ khóa…"
                  className="h-12 w-full rounded-xl bg-transparent pl-11 pr-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-hidden"
                />
              </div>
              <button
                type="button"
                className="hidden h-12 items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 text-sm font-semibold text-foreground transition hover:bg-muted md:inline-flex"
              >
                <Video className="h-4 w-4 text-accent" /> Online
              </button>
              <Button size="lg" className="h-12">
                <Search className="mr-2 h-4 w-4" />
                Tìm ngay
              </Button>
            </div>
          </div>

          {/* Quick chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Phổ biến:
            </span>
            {['Toán 12', 'IELTS Speaking', 'Lập trình Python', 'Hóa hữu cơ'].map((s) => (
              <button
                key={s}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition hover:border-accent/40 hover:bg-[var(--accent-tint)] hover:text-accent"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <SlidersHorizontal className="h-4 w-4 text-accent" />
                Bộ lọc
              </CardTitle>
              <button className="text-xs font-medium text-accent hover:underline">
                Đặt lại
              </button>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeFilters.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Đang lọc
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeFilters.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-tint)] px-2.5 py-1 text-xs font-semibold text-accent ring-1 ring-accent/20"
                      >
                        {f}
                        <button aria-label={`Bỏ ${f}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Môn học
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <button
                      key={s}
                      className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-accent/40 hover:bg-[var(--accent-tint)] hover:text-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Cấp học
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {levels.map((l) => (
                    <button
                      key={l}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition hover:border-accent/40 hover:bg-[var(--accent-tint)] hover:text-accent"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Khung giờ
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {times.map((t) => (
                    <button
                      key={t}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition hover:border-accent/40 hover:bg-[var(--accent-tint)] hover:text-accent"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Học phí tối đa
                </label>
                <input
                  type="range"
                  min="150000"
                  max="500000"
                  defaultValue="300000"
                  className="mt-3 w-full accent-[var(--accent)]"
                />
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">150k</span>
                  <span
                    className="font-bold text-foreground"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    300k
                  </span>
                  <span className="text-muted-foreground">500k</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Rating tối thiểu
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {['4.0+', '4.5+'].map((r) => (
                    <button
                      key={r}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition hover:border-accent/40"
                    >
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full">Áp dụng bộ lọc</Button>

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Tất cả gia sư hiển thị đều đã xác thực
              </p>
            </CardContent>
          </Card>
        </aside>

        <section>
          {/* Sort/count bar */}
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Hiển thị{' '}
              <span
                className="font-bold text-foreground"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {tutors.length}
              </span>{' '}
              gia sư phù hợp với bộ lọc
            </p>
            <div className="flex items-center gap-2">
              <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Sắp xếp:</span>
              <select className="h-9 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground focus:border-accent focus:outline-hidden focus:ring-2 focus:ring-accent/20">
                <option>Phù hợp nhất</option>
                <option>Đánh giá cao nhất</option>
                <option>Giá tăng dần</option>
                <option>Phản hồi nhanh nhất</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {tutors.map((tutor) => (
              <TutorCard tutor={tutor} key={tutor.id} />
            ))}
          </div>

          {/* Load more */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button variant="outline">Xem thêm gia sư</Button>
            <p className="text-xs text-muted-foreground">Hiển thị 4 trong số 1.247 gia sư</p>
          </div>
        </section>
      </main>
    </>
  );
}
