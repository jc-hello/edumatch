'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  User,
  Wallet,
} from 'lucide-react';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { cn } from '@/lib/utils';

const personalSchema = z.object({
  headline: z.string().min(5, 'Tối thiểu 5 ký tự'),
  bio: z.string().min(30, 'Mô tả tối thiểu 30 ký tự'),
  location: z.string().min(2, 'Vui lòng nhập khu vực'),
  format: z.enum(['online', 'offline', 'flex']),
});
type PersonalValues = z.infer<typeof personalSchema>;

const educationSchema = z.object({
  school: z.string().min(2, 'Tên trường tối thiểu 2 ký tự'),
  degree: z.string().min(2, 'Bằng cấp / chuyên ngành'),
  years: z.number({ message: 'Vui lòng nhập số năm' }).min(0).max(50),
  cert: z.string().optional(),
});
type EducationValues = z.infer<typeof educationSchema>;

const subjectsSchema = z.object({
  subjects: z.string().min(2, 'Vui lòng nhập ít nhất 1 môn'),
  levels: z.string().min(2, 'Vui lòng nhập cấp học'),
  price: z.number({ message: 'Vui lòng nhập học phí' }).min(50000, 'Tối thiểu 50.000 ₫/giờ').max(5000000),
  bank: z.string().min(2, 'Vui lòng nhập tên ngân hàng'),
  account: z.string().regex(/^[0-9\- ]{6,30}$/, 'Số tài khoản không hợp lệ'),
});
type SubjectsValues = z.infer<typeof subjectsSchema>;

const steps = [
  { id: 0, label: 'Thông tin', icon: User, desc: 'Giới thiệu ngắn về bạn' },
  { id: 1, label: 'Trình độ', icon: GraduationCap, desc: 'Bằng cấp & chứng chỉ' },
  { id: 2, label: 'Môn dạy & giá', icon: BookOpen, desc: 'Môn học và học phí' },
  { id: 3, label: 'Hoàn tất', icon: CheckCircle2, desc: 'Xem lại và gửi duyệt' },
];

export default function TutorOnboardingPage() {
  return (
    <>
      <Header />
      <AuthGuard roles={['tutor', 'admin']}>
        <OnboardingInner />
      </AuthGuard>
    </>
  );
}

function OnboardingInner() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<{
    personal?: PersonalValues;
    education?: EducationValues;
    subjects?: SubjectsValues;
  }>({});

  const personalForm = useForm<PersonalValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: data.personal ?? { format: 'flex' },
  });
  const personalFormat = useWatch({ control: personalForm.control, name: 'format' });
  const educationForm = useForm<EducationValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: data.education,
  });
  const subjectsForm = useForm<SubjectsValues>({
    resolver: zodResolver(subjectsSchema),
    defaultValues: data.subjects,
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <Badge tone="accent">Hồ sơ gia sư</Badge>
      <h1
        className="mt-3 text-3xl font-bold tracking-tight text-foreground"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Tạo hồ sơ chuyên nghiệp.
      </h1>
      <p className="mt-1 text-muted-foreground">
        Hồ sơ rõ ràng giúp bạn được Admin duyệt nhanh và tăng tỷ lệ booking.
      </p>

      {/* Stepper */}
      <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-card)]">
        <ol className="flex min-w-max items-center gap-1">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <li key={s.id} className="flex flex-1 items-center gap-3">
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => setStep(i)}
                  className={cn(
                    'flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                    active && 'bg-[var(--accent-tint)]',
                    !active && done && 'text-emerald-600',
                    !active && !done && 'text-muted-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                      active && 'edm-gradient-bg text-white',
                      !active && done && 'bg-emerald-50 text-emerald-600',
                      !active && !done && 'bg-muted text-muted-foreground',
                    )}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        active ? 'text-foreground' : done ? 'text-foreground' : '',
                      )}
                    >
                      {s.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          {step === 0 && (
            <form
              key="personal"
              onSubmit={personalForm.handleSubmit((v) => {
                setData((d) => ({ ...d, personal: v }));
                setStep(1);
              })}
              className="space-y-5"
            >
              <FormField
                label="Tiêu đề hồ sơ"
                htmlFor="headline"
                error={personalForm.formState.errors.headline?.message}
                hint="Ví dụ: Gia sư Toán THPT, luyện thi tốt nghiệp"
                required
              >
                <Input id="headline" {...personalForm.register('headline')} />
              </FormField>
              <FormField
                label="Giới thiệu bản thân"
                htmlFor="bio"
                error={personalForm.formState.errors.bio?.message}
                hint="Phương pháp dạy, đối tượng phù hợp, kỳ vọng cho học sinh"
                required
              >
                <Textarea id="bio" rows={5} {...personalForm.register('bio')} />
              </FormField>
              <FormField
                label="Khu vực"
                htmlFor="location"
                error={personalForm.formState.errors.location?.message}
                required
              >
                <Input id="location" placeholder="Hà Nội · Cầu Giấy" {...personalForm.register('location')} />
              </FormField>
              <FormField label="Hình thức dạy" required>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { v: 'online', l: 'Trực tuyến' },
                      { v: 'offline', l: 'Tại nhà' },
                      { v: 'flex', l: 'Linh hoạt' },
                    ] as const
                  ).map((opt) => (
                    <label
                      key={opt.v}
                      className={cn(
                        'cursor-pointer rounded-xl border-2 px-3 py-2.5 text-center text-sm font-semibold transition',
                        personalFormat === opt.v
                          ? 'border-accent bg-[var(--accent-tint)] text-accent'
                          : 'border-border text-foreground hover:border-accent/30',
                      )}
                    >
                      <input
                        type="radio"
                        value={opt.v}
                        className="sr-only"
                        {...personalForm.register('format')}
                      />
                      {opt.l}
                    </label>
                  ))}
                </div>
              </FormField>
              <Footer onBack={() => router.back()} backLabel="Quay lại" nextLabel="Tiếp tục" />
            </form>
          )}

          {step === 1 && (
            <form
              key="education"
              onSubmit={educationForm.handleSubmit((v) => {
                setData((d) => ({ ...d, education: v }));
                setStep(2);
              })}
              className="space-y-5"
            >
              <FormField
                label="Trường / Đại học"
                htmlFor="school"
                error={educationForm.formState.errors.school?.message}
                required
              >
                <Input id="school" placeholder="Đại học Sư phạm Hà Nội" {...educationForm.register('school')} />
              </FormField>
              <FormField
                label="Bằng cấp / chuyên ngành"
                htmlFor="degree"
                error={educationForm.formState.errors.degree?.message}
                required
              >
                <Input id="degree" placeholder="Cử nhân Sư phạm Toán" {...educationForm.register('degree')} />
              </FormField>
              <FormField
                label="Số năm kinh nghiệm"
                htmlFor="years"
                error={educationForm.formState.errors.years?.message}
                required
              >
                <Input
                  id="years"
                  type="number"
                  min={0}
                  max={50}
                  {...educationForm.register('years', { valueAsNumber: true })}
                />
              </FormField>
              <FormField
                label="Chứng chỉ liên quan"
                htmlFor="cert"
                hint="Liệt kê các chứng chỉ ngăn cách bằng dấu phẩy (không bắt buộc)"
              >
                <Input id="cert" placeholder="TESOL, IELTS 8.0, …" {...educationForm.register('cert')} />
              </FormField>
              <Footer onBack={() => setStep(0)} backLabel="Quay lại" nextLabel="Tiếp tục" />
            </form>
          )}

          {step === 2 && (
            <form
              key="subjects"
              onSubmit={subjectsForm.handleSubmit((v) => {
                setData((d) => ({ ...d, subjects: v }));
                setStep(3);
              })}
              className="space-y-5"
            >
              <FormField
                label="Môn dạy"
                htmlFor="subjects"
                error={subjectsForm.formState.errors.subjects?.message}
                hint="Ngăn cách bằng dấu phẩy"
                required
              >
                <Input id="subjects" placeholder="Toán, Vật lý" {...subjectsForm.register('subjects')} />
              </FormField>
              <FormField
                label="Cấp học"
                htmlFor="levels"
                error={subjectsForm.formState.errors.levels?.message}
                hint="THCS, THPT, Đại học, …"
                required
              >
                <Input id="levels" placeholder="THCS, THPT" {...subjectsForm.register('levels')} />
              </FormField>
              <FormField
                label="Học phí (₫/giờ)"
                htmlFor="price"
                error={subjectsForm.formState.errors.price?.message}
                required
              >
                <Input
                  id="price"
                  type="number"
                  min={50000}
                  step={10000}
                  placeholder="220000"
                  {...subjectsForm.register('price', { valueAsNumber: true })}
                />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Ngân hàng (rút tiền)"
                  htmlFor="bank"
                  error={subjectsForm.formState.errors.bank?.message}
                  required
                >
                  <Input id="bank" placeholder="Vietcombank" {...subjectsForm.register('bank')} />
                </FormField>
                <FormField
                  label="Số tài khoản"
                  htmlFor="account"
                  error={subjectsForm.formState.errors.account?.message}
                  required
                >
                  <Input id="account" placeholder="0011001234567" {...subjectsForm.register('account')} />
                </FormField>
              </div>
              <Footer onBack={() => setStep(1)} backLabel="Quay lại" nextLabel="Xem lại" />
            </form>
          )}

          {step === 3 && <Summary data={data} onBack={() => setStep(2)} onSubmit={() => {
            toast.success('Hồ sơ đã gửi! Admin sẽ duyệt trong 24 giờ.');
            router.push('/tutor/dashboard');
          }} />}
        </CardContent>
      </Card>
    </main>
  );
}

function Footer({
  onBack,
  backLabel,
  nextLabel,
}: {
  onBack: () => void;
  backLabel: string;
  nextLabel: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-5">
      <Button type="button" variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-1 h-4 w-4" /> {backLabel}
      </Button>
      <Button type="submit">
        {nextLabel} <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

function Summary({
  data,
  onBack,
  onSubmit,
}: {
  data: {
    personal?: PersonalValues;
    education?: EducationValues;
    subjects?: SubjectsValues;
  };
  onBack: () => void;
  onSubmit: () => void;
}) {
  const sections = [
    { icon: User, label: 'Thông tin', body: data.personal && (
      <>
        <p className="font-semibold">{data.personal.headline}</p>
        <p className="mt-1 text-sm text-muted-foreground">{data.personal.bio}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {data.personal.location} · {{ online: 'Trực tuyến', offline: 'Tại nhà', flex: 'Linh hoạt' }[data.personal.format]}
        </p>
      </>
    ) },
    { icon: Award, label: 'Trình độ', body: data.education && (
      <>
        <p className="font-semibold">{data.education.degree}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.education.school} · {data.education.years} năm kinh nghiệm
        </p>
        {data.education.cert && <p className="mt-1 text-xs text-muted-foreground">{data.education.cert}</p>}
      </>
    ) },
    { icon: BookOpen, label: 'Môn dạy & giá', body: data.subjects && (
      <>
        <p className="font-semibold">{data.subjects.subjects}</p>
        <p className="mt-1 text-sm text-muted-foreground">Cấp: {data.subjects.levels}</p>
        <p className="mt-1 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
          {new Intl.NumberFormat('vi-VN').format(data.subjects.price)} ₫/giờ
        </p>
      </>
    ) },
    { icon: Wallet, label: 'Thông tin rút tiền', body: data.subjects && (
      <>
        <p className="font-semibold">{data.subjects.bank}</p>
        <p className="mt-1 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
          {data.subjects.account}
        </p>
      </>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          Xem lại trước khi gửi
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin sẽ duyệt trong 24 giờ. Bạn vẫn có thể chỉnh sửa sau khi được duyệt.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map(({ icon: Icon, label, body }) => (
          <div key={label} className="rounded-2xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-tint)] text-accent">
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
            </div>
            <div className="mt-3 text-sm text-foreground">{body}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Sửa lại
        </Button>
        <Button onClick={onSubmit}>
          <CheckCircle2 className="mr-1 h-4 w-4" /> Gửi duyệt
        </Button>
      </div>
    </div>
  );
}
