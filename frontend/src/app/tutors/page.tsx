'use client';

import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownUp, Search, SlidersHorizontal, Sparkles, Video } from 'lucide-react';
import { Header } from '@/components/header';
import { TutorCard } from '@/components/marketplace/tutor-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { tutorsService, metaService, type Tutor, type TutorSearchParams } from '@/services/edumatch.service';
import { asArray } from '@/lib/format';

const formats = [
  { value: '', label: 'Tất cả' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Trực tiếp' },
  { value: 'flex', label: 'Linh hoạt' },
] as const;

export default function TutorsPage() {
  const [draft, setDraft] = useState('');
  const [params, setParams] = useState<TutorSearchParams>({ page: 1, limit: 12 });

  const { data: subjects = [] } = useQuery({ queryKey: ['meta', 'subjects'], queryFn: metaService.subjects });
  const { data: levels = [] } = useQuery({ queryKey: ['meta', 'levels'], queryFn: metaService.levels });
  const { data, isLoading } = useQuery({
    queryKey: ['tutors', params],
    queryFn: () => tutorsService.list(params),
  });
  const tutors = useMemo(() => asArray<Tutor>(data), [data]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setParams((current) => ({ ...current, q: draft || undefined, page: 1 }));
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <Badge tone="accent">
              <Sparkles className="h-3 w-3" /> Marketplace
            </Badge>
            <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Tìm gia sư theo dữ liệu thật.
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                  Danh sách, bộ lọc, hồ sơ và lịch rảnh được lấy trực tiếp từ API backend.
                </p>
              </div>
              <form onSubmit={submit} className="rounded-2xl border border-border bg-background p-2 shadow-[var(--shadow-card)]">
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Tên, môn học, mục tiêu..."
                      className="pl-9"
                    />
                  </div>
                  <Button type="submit">
                    <Search className="mr-2 h-4 w-4" />
                    Tìm
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="rounded-lg">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <SlidersHorizontal className="h-4 w-4 text-accent" />
                  Bộ lọc
                </CardTitle>
                <button
                  type="button"
                  onClick={() => {
                    setDraft('');
                    setParams({ page: 1, limit: 12 });
                  }}
                  className="text-xs font-semibold text-accent"
                >
                  Xóa
                </button>
              </CardHeader>
              <CardContent className="space-y-5">
                <FilterGroup
                  title="Môn học"
                  items={subjects}
                  active={params.subject}
                  onPick={(subject) => setParams((p) => ({ ...p, subject: subject || undefined }))}
                />
                <FilterGroup
                  title="Cấp học"
                  items={levels}
                  active={params.level}
                  onPick={(level) => setParams((p) => ({ ...p, level: level as TutorSearchParams['level'] || undefined }))}
                />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Hình thức</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {formats.map((format) => (
                      <button
                        key={format.value}
                        type="button"
                        onClick={() => setParams((p) => ({ ...p, format: format.value as TutorSearchParams['format'] || undefined }))}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                          (params.format ?? '') === format.value
                            ? 'border-accent bg-[var(--accent-tint)] text-accent'
                            : 'border-border bg-card text-foreground hover:border-accent/40'
                        }`}
                      >
                        {format.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <section>
            <div className="mb-5 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Đang tải gia sư...' : `${tutors.length} gia sư phù hợp`}
              </p>
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowDownUp className="h-4 w-4" />
                <select
                  value={params.sort ?? 'rating:desc'}
                  onChange={(e) => setParams((p) => ({ ...p, sort: e.target.value as TutorSearchParams['sort'] }))}
                  className="h-9 rounded-lg border border-border bg-card px-3 font-semibold text-foreground outline-none focus:border-accent"
                >
                  <option value="rating:desc">Đánh giá cao</option>
                  <option value="price:asc">Giá tăng dần</option>
                  <option value="responseTime:asc">Phản hồi nhanh</option>
                </select>
              </label>
            </div>

            {isLoading ? (
              <EmptyState icon={<Video className="h-6 w-6" />} title="Đang tải dữ liệu API" />
            ) : tutors.length === 0 ? (
              <EmptyState icon={<Search className="h-6 w-6" />} title="Không tìm thấy gia sư phù hợp" />
            ) : (
              <div className="space-y-4">
                {tutors.map((tutor) => (
                  <TutorCard tutor={tutor} key={tutor.id} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function FilterGroup({
  title,
  items,
  active,
  onPick,
}: {
  title: string;
  items: string[];
  active?: string;
  onPick: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.slice(0, 10).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPick(active === item ? '' : item)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              active === item
                ? 'border-accent bg-[var(--accent-tint)] text-accent'
                : 'border-border bg-card text-foreground hover:border-accent/40'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">{icon}</div>
        <p className="font-semibold text-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}
