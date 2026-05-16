import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-svh flex-1 items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6">
      <div className="edm-grid-pattern absolute inset-0 opacity-60" aria-hidden />
      <div className="edm-glow -top-40 -left-32 opacity-60" aria-hidden />
      <div className="edm-glow bottom-0 right-0 opacity-40" aria-hidden />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl edm-gradient-bg text-white shadow-[var(--shadow-accent)]">
              <GraduationCap className="h-5 w-5" />
            </span>
            Edu<span className="edm-gradient-text -ml-2">Match</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Link>
        </div>

        <section className="rounded-2xl border border-border bg-card/95 p-6 shadow-[var(--shadow-card-lg)] backdrop-blur sm:p-8">
          {children}
        </section>
      </div>
    </main>
  );
}
