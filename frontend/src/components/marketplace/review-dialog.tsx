'use client';

import * as React from 'react';
import { Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  tutorName: string;
  subject: string;
}

export function ReviewDialog({ open, onClose, tutorName, subject }: ReviewDialogProps) {
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [comment, setComment] = React.useState('');

  if (!open) return null;

  function submit() {
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao');
      return;
    }
    toast.success('Cảm ơn bạn đã đánh giá!');
    setRating(0);
    setComment('');
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card-lg)] edm-animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border p-6">
          <div>
            <h2
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Đánh giá buổi học
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tutorName} · {subject}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <p className="text-sm font-semibold text-foreground">Mức độ hài lòng</p>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="rounded-lg p-1 transition hover:scale-110"
                  aria-label={`${star} sao`}
                >
                  <Star
                    className={cn(
                      'h-9 w-9 transition',
                      (hover || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-border',
                    )}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {['Cần cải thiện', 'Tạm được', 'Khá tốt', 'Rất tốt', 'Tuyệt vời'][rating - 1]}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground" htmlFor="comment">
              Nhận xét
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn để giúp gia sư và cộng đồng tốt hơn…"
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={submit}>Gửi đánh giá</Button>
        </div>
      </div>
    </div>
  );
}
