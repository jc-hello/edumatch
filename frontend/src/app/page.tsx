import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { tutors, formatVnd } from '@/data/mock-data';
import {
  ArrowRight,
  BookOpenCheck,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Crosshair,
  GraduationCap,
  HandshakeIcon,
  MessageSquareText,
  Quote,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TimerReset,
  X,
  Zap,
} from 'lucide-react';

// ── Content data ──────────────────────────────────────────────────────────

const stats = [
  { value: '1.200+', label: 'gia sư đã kiểm duyệt' },
  { value: '18.000+', label: 'giờ học hoàn thành' },
  { value: '4,8/5', label: 'điểm hài lòng' },
  { value: '<5′', label: 'thời gian đặt lịch' },
];

const useCases = [
  {
    icon: TimerReset,
    badge: 'Phổ biến nhất',
    title: 'Ôn cấp tốc trước kiểm tra',
    desc: 'Chỉ còn vài ngày là kiểm tra học kỳ? Đặt 1-2 buổi tăng tốc với gia sư đúng môn — tập trung dạng bài hay ra.',
    duration: '1-2 buổi',
    examples: ['Ôn Toán giữa kỳ', 'Luyện 10 đề cuối', 'Hệ thống công thức'],
  },
  {
    icon: BookOpenCheck,
    title: 'Vá lỗ hổng kiến thức',
    desc: 'Không hiểu một chương cụ thể? Học 2-4 buổi với gia sư để củng cố nền tảng, không cần đăng ký dài hạn.',
    duration: '2-4 buổi',
    examples: ['Hàm số bậc 2', 'Mạch RLC', 'Đề Reading IELTS'],
  },
  {
    icon: Crosshair,
    title: 'Luyện 1 kỹ năng cụ thể',
    desc: 'Có mục tiêu rõ ràng — Speaking IELTS, debug Python, viết luận đại học. Đặt buổi theo tuần, học đến khi đạt.',
    duration: 'Theo nhu cầu',
    examples: ['Speaking Part 2', 'OOP Python', 'Viết SOP du học'],
  },
  {
    icon: HandshakeIcon,
    title: 'Thử trước khi học dài',
    desc: 'Tự tin chọn gia sư hợp gu trước khi cam kết. Học 1 buổi thử rồi mới quyết định gói dài hạn nếu muốn.',
    duration: '1 buổi thử',
    examples: ['Buổi định hướng', 'Kiểm tra phong cách', 'Đánh giá đầu vào'],
  },
];

const steps = [
  {
    icon: Search,
    title: 'Tìm & lọc',
    desc: 'Lọc theo môn, cấp học, học phí và khung giờ. So sánh đánh giá, số buổi đã dạy, thời gian phản hồi.',
    time: '~ 2 phút',
  },
  {
    icon: Calendar,
    title: 'Chọn khung giờ',
    desc: 'Xem lịch rảnh thời gian thực. Chọn 1 buổi hoặc nhiều buổi liên tiếp. Ghi mục tiêu cụ thể cho buổi học.',
    time: '~ 1 phút',
  },
  {
    icon: ShieldCheck,
    title: 'Thanh toán ký quỹ',
    desc: 'Tiền giữ tại EduMatch, chỉ giải ngân sau buổi học. Hủy trước 24h hoàn 100%. Không cam kết dài.',
    time: '~ 30 giây',
  },
];

const comparison = {
  rows: [
    { feature: 'Học chỉ 1 buổi', edumatch: true, center: false, social: 'partial' },
    { feature: 'Không cam kết dài hạn', edumatch: true, center: false, social: true },
    { feature: 'Lịch tối & cuối tuần', edumatch: true, center: 'partial', social: 'partial' },
    { feature: 'Gia sư đã kiểm duyệt hồ sơ', edumatch: true, center: true, social: false },
    { feature: 'Đánh giá hai chiều minh bạch', edumatch: true, center: false, social: false },
    { feature: 'Thanh toán ký quỹ + hoàn tiền', edumatch: true, center: 'partial', social: false },
    { feature: 'Đặt lịch trong < 5 phút', edumatch: true, center: false, social: false },
    { feature: 'Phí trung gian', edumatch: '10%', center: '30-50%', social: '0%' },
  ],
};

const popularSubjects = [
  { name: 'Toán THPT', tutors: 248, fromPrice: 180000, rating: 4.9, tone: 'accent' as const },
  { name: 'IELTS Speaking', tutors: 132, fromPrice: 280000, rating: 4.8, tone: 'accent' as const },
  { name: 'Lập trình Python', tutors: 84, fromPrice: 250000, rating: 4.9, tone: 'accent' as const },
  { name: 'Hóa học', tutors: 156, fromPrice: 170000, rating: 4.7, tone: 'accent' as const },
  { name: 'Vật lý', tutors: 142, fromPrice: 180000, rating: 4.8, tone: 'accent' as const },
  { name: 'Ngữ văn', tutors: 98, fromPrice: 160000, rating: 4.7, tone: 'accent' as const },
];

const testimonials = [
  {
    name: 'Hoàng Mai Linh',
    role: 'Học sinh lớp 12',
    rating: 5,
    body: 'Em đặt 2 buổi luyện Speaking trước kỳ IELTS, được cô chữa kỹ từng câu. Cuối cùng em đạt 7.0 Speaking.',
    highlight: '2 buổi · IELTS Speaking',
  },
  {
    name: 'Phụ huynh em Quân',
    role: 'Mẹ học sinh lớp 11',
    rating: 5,
    body: 'Con đuối phần hàm số. Chỉ học 3 buổi với thầy, bài kiểm tra trên lớp con làm được 8 điểm — không cần gói dài.',
    highlight: '3 buổi · Toán THPT',
  },
  {
    name: 'Nguyễn Tuấn Anh',
    role: 'Sinh viên CNTT',
    rating: 5,
    body: 'Deadline đồ án Python sát, mình đặt buổi cấp tốc tối hôm đó với anh gia sư. Debug xong code trong 90 phút.',
    highlight: '1 buổi · Lập trình cấp tốc',
  },
];

const faqs = [
  {
    q: 'Có thể chỉ học 1 buổi không?',
    a: 'Hoàn toàn được. EduMatch không có yêu cầu số buổi tối thiểu. Bạn có thể đặt 1 buổi để thử gia sư, hoặc 1-2 buổi cấp tốc trước kỳ thi.',
  },
  {
    q: 'Có cam kết số buổi tối thiểu hay phí đăng ký không?',
    a: 'Không. Bạn chỉ thanh toán cho từng buổi học đã đặt. Không phí đăng ký, không cam kết dài hạn, không phí ẩn.',
  },
  {
    q: 'Đặt lịch học cấp tốc trong ngày được không?',
    a: 'Có. Nhiều gia sư có slot trong vòng vài giờ tới. Lọc theo "Tối nay" hoặc "Trong tuần" để tìm gia sư khả dụng ngay.',
  },
  {
    q: 'Thanh toán ký quỹ hoạt động ra sao?',
    a: 'Học sinh thanh toán trước, EduMatch giữ tiền và chỉ giải ngân cho gia sư sau khi buổi học hoàn tất. Hủy trước 24h hoàn 100%, hủy trong 24h hoàn một phần.',
  },
  {
    q: 'EduMatch lấy phí bao nhiêu?',
    a: 'Phí nền tảng 10% trên giá trị mỗi giao dịch, tính rõ ràng trước khi học sinh thanh toán. Không có phí ẩn. Trung tâm gia sư truyền thống thường lấy 30-50%.',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

function CompareCell({ value }: { value: boolean | 'partial' | string }) {
  if (value === true) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-4 w-4" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500">
        <X className="h-4 w-4" />
      </span>
    );
  }
  if (value === 'partial') {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
        Một phần
      </span>
    );
  }
  return (
    <span
      className="font-semibold text-foreground"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {value}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  const featured = tutors.slice(0, 3);

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-background">
          <div className="edm-grid-pattern absolute inset-0" aria-hidden />
          <div className="edm-glow -top-20 -left-40" aria-hidden />
          <div className="edm-glow top-1/3 -right-40" aria-hidden />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
            <div className="flex flex-col justify-center edm-animate-fade-up">
              <Badge tone="accent" className="w-fit">
                <Zap className="h-3 w-3" />
                Học cấp tốc · Theo từng buổi · Không cam kết
              </Badge>

              <h1
                className="mt-6 text-[2.75rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Cần học gấp 1-2 buổi?{' '}
                <span className="edm-gradient-text">Tìm gia sư trong vài phút.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                EduMatch giúp bạn đặt lịch học cấp tốc với gia sư đã kiểm duyệt —
                ôn thi, vá lỗ hổng kiến thức hoặc luyện 1 kỹ năng cụ thể.
                Học chỉ 1 buổi nếu muốn, hủy bất cứ lúc nào.
              </p>

              {/* Quick search */}
              <div className="mt-10 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card-lg)]">
                <div className="grid gap-2 md:grid-cols-[1fr_0.85fr_0.75fr_auto]">
                  <div className="rounded-xl border border-border bg-muted/30 px-4 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Môn cần học
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                      Toán · IELTS · Lập trình
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 px-4 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Cần học khi nào
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                      Tối nay · Cuối tuần
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 px-4 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Số buổi
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                      1-2 buổi
                    </p>
                  </div>
                  <Button asChild size="lg" className="h-full">
                    <Link href="/tutors">
                      <Search className="mr-2 h-4 w-4" />
                      Tìm ngay
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {['Không cần thẻ tín dụng', 'Hủy trước 24h hoàn 100%', 'Thanh toán ký quỹ'].map(
                  (item) => (
                    <span key={item} className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* Hero illustration */}
            <div className="relative hidden lg:block">
              <div
                className="edm-animate-spin-slow absolute -top-16 -right-12 h-72 w-72 rounded-full border border-dashed border-accent/20"
                aria-hidden
              />
              <div className="edm-animate-float relative rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card-lg)]">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="font-semibold text-foreground">Gia sư khả dụng tối nay</p>
                    <p className="text-xs text-muted-foreground">Sắp xếp theo phản hồi nhanh nhất</p>
                  </div>
                  <Badge tone="success">
                    <span className="edm-animate-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    24 online
                  </Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {featured.map((tutor) => (
                    <Link
                      key={tutor.id}
                      href={`/tutors/${tutor.id}`}
                      className="edm-lift flex items-center gap-3 rounded-2xl border border-border p-3"
                    >
                      <Avatar name={tutor.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{tutor.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {tutor.subjects.join(' · ')} · {formatVnd(tutor.price)}/giờ
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {tutor.rating}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{tutor.responseTime}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="edm-animate-float-slow absolute -bottom-6 -left-8 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card-lg)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">Ký quỹ thành công</p>
                  <p className="text-[11px] text-muted-foreground">363.000 ₫ đang được giữ</p>
                </div>
              </div>

              <div className="edm-animate-float absolute -top-4 -left-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card-lg)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-tint)] text-accent">
                  <CalendarCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">Đặt 1 buổi · Tối nay</p>
                  <p className="text-[11px] text-muted-foreground">19:00 - 20:30 với Mai Anh</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS strip ──────────────────────────────────────────────────── */}
        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-7xl gap-px bg-border sm:px-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card px-5 py-6 sm:py-8">
                <p
                  className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {stat.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── USE CASES ────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="max-w-2xl">
            <Badge tone="accent">
              <Sparkles className="h-3 w-3" /> Kịch bản sử dụng
            </Badge>
            <h2
              className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Bạn cần học <span className="edm-gradient-text">ngắn hạn</span> kiểu nào?
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              EduMatch tối ưu cho 4 nhu cầu phổ biến — không cần cam kết dài, không phí đăng ký,
              học 1 buổi cũng được.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {useCases.map(({ icon: Icon, badge, title, desc, duration, examples }) => (
              <div
                key={title}
                className="edm-lift group relative overflow-hidden rounded-3xl border border-border bg-card p-7"
              >
                {badge && (
                  <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-[var(--accent-tint)] px-2.5 py-1 text-[11px] font-bold text-accent ring-1 ring-accent/20">
                    <Sparkles className="h-3 w-3" /> {badge}
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-tint)] text-accent transition group-hover:edm-gradient-bg group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-xl font-bold text-foreground">{title}</h3>
                    </div>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
                      <Clock className="h-3 w-3" />
                      {duration}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-muted-foreground">{desc}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {examples.map((ex) => (
                    <span
                      key={ex}
                      className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section className="bg-muted/30 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge tone="accent">
                <Zap className="h-3 w-3" /> Quy trình đặt lịch
              </Badge>
              <h2
                className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Từ tìm kiếm đến buổi học trong <span className="edm-gradient-text">3 bước</span>.
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Trung bình 5 phút từ khi mở web đến khi có lịch học cụ thể.
              </p>
            </div>

            <div className="relative mt-12 grid gap-6 lg:grid-cols-3">
              {/* Connector line */}
              <div
                className="absolute left-[8%] right-[8%] top-12 hidden h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent lg:block"
                aria-hidden
              />
              {steps.map(({ icon: Icon, title, desc, time }, index) => (
                <div
                  key={title}
                  className="edm-lift relative rounded-3xl border border-border bg-card p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl edm-gradient-bg text-white shadow-[var(--shadow-accent)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span
                      className="text-5xl font-bold leading-none text-muted-foreground/15"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{desc}</p>
                  <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <Clock className="h-3 w-3" /> {time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── POPULAR SUBJECTS ─────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <Badge tone="accent">
                <Sparkles className="h-3 w-3" /> Môn học phổ biến
              </Badge>
              <h2
                className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Được đặt nhiều nhất tuần này.
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Các môn có nhu cầu cao nhất — chọn nhanh và đặt lịch trong vài phút.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/tutors">
                Xem tất cả môn
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularSubjects.map((s) => (
              <Link
                key={s.name}
                href="/tutors"
                className="edm-lift group flex items-center justify-between rounded-2xl border border-border bg-card p-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-foreground transition group-hover:text-accent">
                    {s.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span
                      className="font-bold text-foreground"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {s.tutors}
                    </span>{' '}
                    gia sư · từ{' '}
                    <span
                      className="font-bold text-foreground"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {formatVnd(s.fromPrice)}
                    </span>
                  </p>
                  <div className="mt-2 inline-flex items-center gap-0.5 text-xs">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i <= Math.round(s.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-border'
                        }`}
                      />
                    ))}
                    <span className="ml-1 font-medium text-muted-foreground">{s.rating}</span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-accent" />
              </Link>
            ))}
          </div>
        </section>

        {/* ── COMPARISON ───────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="max-w-2xl">
            <Badge tone="accent">So sánh nhanh</Badge>
            <h2
              className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Tại sao chọn <span className="edm-gradient-text">EduMatch</span>?
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Khác biệt giữa EduMatch và các hình thức tìm gia sư truyền thống ở Việt Nam.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-card)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-5 font-semibold text-muted-foreground">Tiêu chí</th>
                    <th className="relative px-6 py-5">
                      <div className="absolute inset-0 edm-gradient-bg opacity-[0.08]" aria-hidden />
                      <div className="relative flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl edm-gradient-bg text-white">
                          <GraduationCap className="h-4 w-4" />
                        </span>
                        <span className="font-bold text-foreground">EduMatch</span>
                      </div>
                    </th>
                    <th className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                          <BookOpenCheck className="h-4 w-4" />
                        </span>
                        <span className="font-semibold text-foreground">Trung tâm gia sư</span>
                      </div>
                    </th>
                    <th className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                          <MessageSquareText className="h-4 w-4" />
                        </span>
                        <span className="font-semibold text-foreground">Tự tìm (Facebook…)</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {comparison.rows.map((row) => (
                    <tr key={row.feature} className="transition hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium text-foreground">{row.feature}</td>
                      <td className="relative px-6 py-4">
                        <div className="absolute inset-0 edm-gradient-bg opacity-[0.04]" aria-hidden />
                        <div className="relative">
                          <CompareCell value={row.edumatch} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <CompareCell value={row.center} />
                      </td>
                      <td className="px-6 py-4">
                        <CompareCell value={row.social} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── ESCROW (light, on-brand) ────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-muted/30 py-24">
          <div className="edm-glow -top-32 -left-32 opacity-60" aria-hidden />
          <div className="edm-glow -bottom-32 right-0 opacity-50" aria-hidden />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <Badge tone="accent">
                <ShieldCheck className="h-3 w-3" /> An toàn giao dịch
              </Badge>
              <h2
                className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Học linh hoạt — không đánh đổi <span className="edm-gradient-text">an toàn</span>.
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Đặt lịch ngắn hạn không có nghĩa là chấp nhận rủi ro. Mọi giao dịch trên EduMatch
                đều được bảo vệ bằng ký quỹ.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  {
                    icon: ShieldCheck,
                    label: 'Hồ sơ kiểm duyệt thủ công',
                    value: 'Giấy tờ, kinh nghiệm và chứng chỉ được Admin xác minh trước khi gia sư xuất hiện.',
                  },
                  {
                    icon: ReceiptText,
                    label: 'Thanh toán ký quỹ',
                    value: 'Tiền được giữ an toàn tại nền tảng đến khi buổi học hoàn tất hoặc tranh chấp được giải quyết.',
                  },
                  {
                    icon: MessageSquareText,
                    label: 'Đánh giá hai chiều',
                    value: 'Cả học sinh và gia sư đều có quyền phản hồi sau buổi học, giúp cộng đồng giữ chất lượng cao.',
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="edm-lift flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-tint)] text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{label}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Escrow receipt mock */}
            <div className="relative">
              <div className="absolute -inset-10 rounded-[3rem] edm-gradient-bg opacity-25 blur-3xl" aria-hidden />
              <div
                className="edm-animate-spin-slow absolute -top-12 -right-12 hidden h-64 w-64 rounded-full border border-dashed border-accent/20 lg:block"
                aria-hidden
              />

              <div className="relative">
                <div className="rounded-[1.75rem] p-[1.5px] edm-gradient-bg shadow-[var(--shadow-accent-lg)]">
                  <div className="rounded-[1.65rem] bg-card p-7 text-foreground">
                    <div className="flex items-center justify-between border-b border-border pb-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Hoá đơn ký quỹ
                        </p>
                        <p className="mt-1 font-semibold text-foreground">Buổi học 90 phút</p>
                      </div>
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-tint)] text-accent">
                        <ReceiptText className="h-5 w-5" />
                      </span>
                    </div>
                    <div className="mt-6 space-y-4 text-sm">
                      {[
                        ['Học phí gia sư', '300.000 ₫'],
                        ['Phí nền tảng (10%)', '30.000 ₫'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-muted-foreground">{label}</span>
                          <span
                            className="font-semibold tabular-nums text-foreground"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-dashed border-border pt-5">
                        <div className="flex items-baseline justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Đang giữ
                            </p>
                            <p
                              className="mt-1 text-4xl font-bold tabular-nums text-foreground"
                              style={{ fontFamily: 'var(--font-display)' }}
                            >
                              330.000 ₫
                            </p>
                          </div>
                          <Badge tone="success">
                            <span className="edm-animate-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Ký quỹ
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="edm-animate-float-slow absolute -top-6 -left-8 hidden items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-card-lg)] sm:flex">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Bảo vệ
                    </p>
                    <p className="text-xs font-semibold text-foreground">Giải ngân khi hoàn tất</p>
                  </div>
                </div>

                <div className="edm-animate-float absolute -bottom-6 -right-6 hidden items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-card-lg)] sm:flex">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-tint)] text-accent">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Chính sách
                    </p>
                    <p className="text-xs font-semibold text-foreground">Hủy 24h hoàn 100%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="max-w-2xl">
            <Badge tone="accent">Cộng đồng EduMatch</Badge>
            <h2
              className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Những buổi học <span className="edm-gradient-text">cấp tốc</span> có kết quả thật.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t, index) => (
              <div
                key={t.name}
                className={`edm-lift rounded-3xl border border-border bg-card p-6 ${
                  index === 1 ? 'lg:-translate-y-4' : ''
                }`}
              >
                <Quote className="h-7 w-7 text-accent" />
                <div className="mt-4 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-3 text-base leading-7 text-foreground">&ldquo;{t.body}&rdquo;</p>
                <span className="mt-4 inline-flex rounded-full bg-[var(--accent-tint)] px-2.5 py-1 text-[11px] font-bold text-accent ring-1 ring-accent/20">
                  {t.highlight}
                </span>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <Avatar name={t.name} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="bg-muted/30 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <Badge tone="accent">Câu hỏi thường gặp</Badge>
                <h2
                  className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Cần biết trước khi đặt lịch.
                </h2>
                <p className="mt-4 text-lg leading-7 text-muted-foreground">
                  Câu trả lời ngắn cho những thắc mắc phổ biến nhất khi học theo từng buổi.
                </p>
                <Button asChild variant="outline" className="mt-6">
                  <Link href="#">
                    Xem trung tâm trợ giúp
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <details
                    key={faq.q}
                    className="group rounded-2xl border border-border bg-card p-6 transition open:bg-card open:shadow-[var(--shadow-card-lg)]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                      {faq.q}
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-tint)] text-accent transition group-open:rotate-45">
                        <span className="text-lg leading-none">+</span>
                      </span>
                    </summary>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA — full-bleed brand splash ──────────────────────────── */}
        <section className="relative overflow-hidden edm-gradient-bg py-16 text-white md:py-20">
          <div className="edm-dot-pattern absolute inset-0 opacity-25" aria-hidden />
          <div
            className="absolute left-1/2 top-0 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-white/12 blur-3xl"
            aria-hidden
          />
          <div
            className="edm-animate-spin-slow absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/12"
            aria-hidden
          />
          <div
            className="absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/12"
            aria-hidden
          />

          <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur">
              <Sparkles className="h-3 w-3" /> Bắt đầu trong vài phút
            </span>

            <h2
              className="mt-4 text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Cần học gấp? <span className="text-white/85">Đặt buổi đầu tiên ngay.</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
              Hơn 1.200 gia sư đã kiểm duyệt đang chờ bạn. Đặt 1 buổi để thử, hoặc đặt cả combo —
              không cam kết, không phí ẩn.
            </p>

            <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/tutors"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-foreground shadow-[0_10px_28px_-8px_rgba(255,255,255,0.5)] transition hover:-translate-y-0.5 hover:bg-white/95 active:scale-[0.98]"
              >
                Tìm gia sư miễn phí
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/35 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/15 active:scale-[0.98]"
              >
                Trở thành gia sư
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/70 sm:text-sm">
              {['Hủy bất cứ lúc nào', 'Không cần thẻ tín dụng', 'Hỗ trợ 24/7'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <div className="flex -space-x-2.5">
                {featured.map((t) => {
                  const initials = t.name
                    .trim()
                    .split(/\s+/)
                    .slice(-2)
                    .map((p) => p[0])
                    .join('')
                    .toUpperCase();
                  return (
                    <span
                      key={t.id}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[11px] font-bold text-accent shadow-[0_4px_12px_-2px_rgba(0,0,0,0.2)] ring-2 ring-white/60"
                    >
                      {initials}
                    </span>
                  );
                })}
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/90 text-[10px] font-bold text-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.2)] ring-2 ring-white/60 backdrop-blur">
                  +1k
                </span>
              </div>
              <div className="text-xs sm:text-left sm:text-sm">
                <div className="flex items-center justify-center gap-0.5 sm:justify-start">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                  ))}
                  <span className="ml-1.5 font-bold text-white">4.8</span>
                  <span className="text-white/60">/5</span>
                </div>
                <p className="mt-0.5 text-[11px] text-white/70 sm:text-xs">
                  Đánh giá từ hơn 18.000 buổi học hoàn thành
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[1.4fr_3fr]">
              <div>
                <Link href="/" className="inline-flex items-center gap-2.5 text-xl font-semibold tracking-tight">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl edm-gradient-bg text-white shadow-[var(--shadow-accent)]">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <span>Edu<span className="edm-gradient-text">Match</span></span>
                </Link>
                <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                  Nền tảng tìm gia sư ngắn hạn cho học sinh Việt Nam — minh bạch, an toàn,
                  học theo từng buổi.
                </p>
                <div className="mt-5 flex items-center gap-2">
                  {['F', 'in', 'X', '@'].map((s) => (
                    <a
                      key={s}
                      href="#"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-sm font-bold text-muted-foreground transition hover:border-accent/30 hover:bg-[var(--accent-tint)] hover:text-accent"
                      aria-label={s}
                    >
                      {s}
                    </a>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {[
                  {
                    title: 'Sản phẩm',
                    items: [
                      { label: 'Tìm gia sư', href: '/tutors' },
                      { label: 'Trở thành gia sư', href: '/register' },
                      { label: 'Giá & phí', href: '#' },
                    ],
                  },
                  {
                    title: 'Hỗ trợ',
                    items: [
                      { label: 'Trung tâm trợ giúp', href: '#' },
                      { label: 'Quy trình thanh toán', href: '#' },
                      { label: 'Liên hệ', href: '#' },
                    ],
                  },
                  {
                    title: 'Công ty',
                    items: [
                      { label: 'Về EduMatch', href: '#' },
                      { label: 'Tuyển dụng', href: '#' },
                      { label: 'Báo chí', href: '#' },
                    ],
                  },
                  {
                    title: 'Pháp lý',
                    items: [
                      { label: 'Điều khoản', href: '#' },
                      { label: 'Bảo mật', href: '#' },
                      { label: 'Chính sách hoàn tiền', href: '#' },
                    ],
                  },
                ].map((col) => (
                  <div key={col.title}>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {col.title}
                    </p>
                    <ul className="mt-4 space-y-2.5 text-sm">
                      {col.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            className="text-foreground transition hover:text-accent"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} EduMatch · Made in Vietnam.
              </p>
              <p className="text-xs text-muted-foreground">
                Phiên bản 1.0 · Thanh toán bảo mật bởi cổng VNPay
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
