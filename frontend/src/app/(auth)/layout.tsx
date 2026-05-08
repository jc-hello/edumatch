import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="px-6 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <GraduationCap className="h-6 w-6 text-indigo-600" />
          <span>EduMatch</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">{children}</main>
    </div>
  );
}
