'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, Search, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { favoritesService, type Tutor } from '@/services/edumatch.service';
import { asArray, formatVnd } from '@/lib/format';

export default function FavoritesPage() {
  return (
    <>
      <Header />
      <AuthGuard>
        <FavoritesInner />
      </AuthGuard>
    </>
  );
}

function FavoritesInner() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['favorites'], queryFn: favoritesService.list });
  const tutors = asArray<Tutor>(data);
  const remove = useMutation({
    mutationFn: (tutorId: string) => favoritesService.remove(tutorId),
    onSuccess: () => {
      toast.success('Đã bỏ khỏi yêu thích');
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge tone="accent">Favorites API</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Gia sư đã lưu</h1>
          <p className="mt-1 text-muted-foreground">{isLoading ? 'Đang tải...' : `${tutors.length} gia sư từ /favorites`}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/tutors">
            <Search className="mr-2 h-4 w-4" /> Tìm thêm gia sư
          </Link>
        </Button>
      </div>

      {isLoading || tutors.length === 0 ? (
        <Card className="mt-8 rounded-lg">
          <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
            <Heart className="h-8 w-8 text-muted-foreground" />
            <h3 className="font-bold text-foreground">{isLoading ? 'Đang tải danh sách...' : 'Chưa có gia sư yêu thích'}</h3>
            <Button asChild className="mt-2">
              <Link href="/tutors">Khám phá gia sư</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tutors.map((tutor) => (
            <Card key={tutor.id} className="rounded-lg">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <Avatar name={tutor.name} src={tutor.avatarUrl} size="lg" />
                  <button
                    type="button"
                    onClick={() => remove.mutate(tutor.userId ?? tutor.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                    aria-label="Bỏ yêu thích"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
                <Link href={`/tutors/${tutor.id}`} className="mt-4 block font-semibold text-foreground hover:text-accent">
                  {tutor.name}
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tutor.title}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tutor.subjects?.map((subject) => <Badge key={subject} tone="neutral">{subject}</Badge>)}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <p className="font-bold text-foreground">{formatVnd(tutor.price)}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {tutor.rating ?? 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
