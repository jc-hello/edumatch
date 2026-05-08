import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Search, Calendar, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Tìm gia sư phù hợp,<br />
            <span className="text-indigo-600">học trực tuyến hoặc tại nhà</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Hơn 1,000+ gia sư đã được kiểm duyệt, đa dạng môn học và cấp độ. Đặt lịch chỉ trong vài phút.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">Đăng ký ngay</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-20 grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: Search,
              title: 'Tìm kiếm dễ dàng',
              desc: 'Lọc theo môn học, cấp độ, giá, đánh giá. Kết quả phù hợp ngay.',
            },
            {
              icon: Calendar,
              title: 'Đặt lịch linh hoạt',
              desc: 'Xem lịch trống của gia sư theo tuần, đặt slot trong 1 click.',
            },
            {
              icon: ShieldCheck,
              title: 'An toàn & minh bạch',
              desc: 'Hồ sơ gia sư được duyệt, hoàn tiền 100% nếu hủy đúng hạn.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-gray-200 bg-white p-6">
              <Icon className="h-8 w-8 text-indigo-600" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
