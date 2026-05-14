'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Search, Star } from 'lucide-react';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { favoriteTutorIds, formatVnd, tutors } from '@/data/mock-data';
import { toast } from 'sonner';

export default function FavoritesPage() {
  const [ids, setIds] = useState(favoriteTutorIds);
  const list = tutors.filter((t) => ids.includes(t.id));

  function remove(id: string) {
    setIds((prev) => prev.filter((x) => x !== id));
    toast.success('Đã bỏ khỏi danh sách yêu thích');
  }

  return (
    <>
      <Header />
      <AuthGuard>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge tone="accent">Yêu thích</Badge>
              <h1
                className="mt-3 text-3xl font-bold tracking-tight text-foreground"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Gia sư bạn đã lưu.
              </h1>
              <p className="mt-1 text-muted-foreground">
                {list.length} gia sư · Đặt lại nhanh từ danh sách đã lưu.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/tutors">
                <Search className="mr-2 h-4 w-4" /> Tìm thêm gia sư
              </Link>
            </Button>
          </div>

          {list.length === 0 ? (
            <Card className="mt-8">
              <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Chưa có gia sư yêu thích</h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  Nhấn vào biểu tượng trái tim trên thẻ gia sư để thêm vào danh sách này.
                </p>
                <Button asChild className="mt-2">
                  <Link href="/tutors">Khám phá gia sư</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {list.map((tutor) => (
                <Card key={tutor.id} className="edm-lift overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <Avatar name={tutor.name} size="lg" />
                      <button
                        type="button"
                        onClick={() => remove(tutor.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100"
                        aria-label="Bỏ yêu thích"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                    <Link
                      href={`/tutors/${tutor.id}`}
                      className="mt-4 block font-semibold text-foreground transition hover:text-accent"
                    >
                      {tutor.name}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tutor.title}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tutor.subjects.map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Từ
                        </p>
                        <p
                          className="text-lg font-bold tabular-nums text-foreground"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {formatVnd(tutor.price)}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {tutor.rating}
                      </span>
                    </div>
                    <Button asChild className="mt-4 w-full">
                      <Link href={`/tutors/${tutor.id}`}>Xem hồ sơ</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </AuthGuard>
    </>
  );
}
