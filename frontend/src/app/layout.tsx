import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { BottomNav } from '@/components/bottom-nav';

export const metadata: Metadata = {
  title: 'EduMatch — Tìm gia sư ngắn hạn, đặt lịch trong vài phút',
  description:
    'Nền tảng kết nối học sinh với gia sư đã được xác thực. Đặt lịch theo từng buổi, thanh toán ký quỹ an toàn, đánh giá minh bạch.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>
          {children}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
