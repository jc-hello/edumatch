'use client';

import Link from 'next/link';
import { CalendarDays, CheckCircle2, Heart, MapPin, Star, Video } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Tutor } from '@/services/edumatch.service';
import { favoritesService } from '@/services/edumatch.service';
import { formatVnd } from '@/lib/format';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

export function TutorCard({ tutor, favorite = false }: { tutor: Tutor; favorite?: boolean }) {
  const [liked, setLiked] = useState(favorite);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (liked) {
        await favoritesService.remove(tutor.userId ?? tutor.id);
        return false;
      }
      await favoritesService.add(tutor.userId ?? tutor.id);
      return true;
    },
    onSuccess: (nextLiked) => {
      setLiked(nextLiked);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(nextLiked ? 'Đã lưu gia sư' : 'Đã bỏ lưu gia sư');
    },
    onError: () => toast.error('Không cập nhật được yêu thích'),
  });

  return (
    <Card className="edm-lift overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 gap-4">
            <Avatar name={tutor.name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/tutors/${tutor.id}`}
                      className="font-semibold text-foreground transition hover:text-accent"
                    >
                      {tutor.name}
                    </Link>
                    {tutor.verified && (
                      <Badge tone="success">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã xác thực
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">{tutor.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      toast.info('Bạn cần đăng nhập để lưu gia sư');
                      return;
                    }
                    favoriteMutation.mutate();
                  }}
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border transition',
                    liked
                      ? 'border-red-200 bg-red-50 text-red-500'
                      : 'text-muted-foreground hover:border-accent/30 hover:text-foreground',
                  )}
                  disabled={favoriteMutation.isPending}
                  aria-label="Yêu thích"
                >
                  <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
                </button>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {tutor.bio}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tutor.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {subject}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <b className="font-semibold text-foreground">{tutor.rating}</b> ({tutor.reviews})
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {tutor.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Video className="h-4 w-4" />
                  {formatLabel(tutor.format)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {tutor.sessions} buổi
                </span>
              </div>
            </div>
          </div>

          <div className="w-full rounded-xl border border-border bg-muted/40 p-4 lg:w-56">
            <p className="text-xs font-medium text-muted-foreground">Học phí từ</p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              {formatVnd(tutor.price)}
            </p>
            <p className="text-xs text-muted-foreground">mỗi giờ · phản hồi {tutor.responseTime}</p>
            <Button asChild className="mt-4 w-full">
              <Link href={`/tutors/${tutor.id}`}>Xem lịch</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatLabel(value?: string) {
  if (value === 'online') return 'Online';
  if (value === 'offline') return 'Trực tiếp';
  if (value === 'flex') return 'Linh hoạt';
  return value ?? 'Linh hoạt';
}
