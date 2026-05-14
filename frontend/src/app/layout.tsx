import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Lora, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { BottomNav } from '@/components/bottom-nav';

// Body sans — Be Vietnam Pro is designed for Vietnamese, perfect diacritics
const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// Display serif — Lora has proper 'vietnamese' subset on Google Fonts
const lora = Lora({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-jb',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'EduMatch — Tìm gia sư ngắn hạn, đặt lịch trong vài phút',
  description:
    'Nền tảng kết nối học sinh với gia sư đã được xác thực. Đặt lịch theo từng buổi, thanh toán ký quỹ an toàn, đánh giá minh bạch.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${lora.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>
          {children}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
