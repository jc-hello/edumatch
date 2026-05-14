import Link from 'next/link';
import { ArrowLeft, GraduationCap, ShieldCheck, Sparkles, Users } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Thanh toán ký quỹ',
    body: 'Tiền chỉ giải ngân khi buổi học hoàn thành — học sinh yên tâm, gia sư có bảo đảm.',
  },
  {
    icon: Sparkles,
    title: 'Khớp theo lịch rảnh',
    body: 'Bộ lọc môn, cấp học, ngân sách và khung giờ giúp tìm gia sư phù hợp trong vài phút.',
  },
  {
    icon: Users,
    title: 'Đánh giá hai chiều',
    body: 'Cả học sinh và gia sư đều được phản hồi minh bạch sau từng buổi học.',
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh flex-1">
      <div className="edm-glow -top-32 -left-32" aria-hidden />
      <div className="edm-glow top-1/2 right-0" aria-hidden />

      <div className="relative grid min-h-svh lg:grid-cols-[1fr_minmax(0,520px)]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-foreground p-12 text-background lg:flex">
          <div className="edm-dot-pattern absolute inset-0 opacity-50" aria-hidden />
          <div className="relative">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight text-background"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background/10 ring-1 ring-background/20">
                <GraduationCap className="h-5 w-5" />
              </span>
              EduMatch
            </Link>
            <p
              className="mt-16 max-w-md text-4xl font-bold leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Gia sư phù hợp.
              <br />
              <span className="edm-gradient-text">Lịch học vừa khít.</span>
            </p>
            <p className="mt-4 max-w-md text-sm leading-7 text-background/70">
              Hệ sinh thái dành cho học sinh, gia sư và quản trị viên — minh bạch, an toàn và tập trung
              vào những buổi học ngắn hạn có kết quả thật.
            </p>
          </div>

          <div className="relative space-y-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex gap-3 rounded-2xl border border-background/10 bg-background/5 p-4 backdrop-blur"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/10 text-background">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-background/70">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="relative flex flex-col px-6 py-8 sm:px-12">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight lg:hidden"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl edm-gradient-bg text-white shadow-[var(--shadow-accent)]">
                <GraduationCap className="h-5 w-5" />
              </span>
              EduMatch
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
