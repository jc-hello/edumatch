'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BookOpenCheck, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ in hoa')
    .regex(/\d/, 'Mật khẩu phải có ít nhất 1 chữ số'),
  role: z.enum(['student', 'tutor']),
});
type FormValues = z.infer<typeof schema>;

function passwordStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const roleOptions = [
  {
    value: 'student' as const,
    icon: GraduationCap,
    title: 'Tôi muốn học',
    desc: 'Đặt lịch với gia sư phù hợp, theo dõi tiến độ.',
  },
  {
    value: 'tutor' as const,
    icon: BookOpenCheck,
    title: 'Tôi muốn dạy',
    desc: 'Tạo hồ sơ, quản lý lịch rảnh, nhận booking.',
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' },
  });
  const password = useWatch({ control, name: 'password' }) || '';
  const role = useWatch({ control, name: 'role' });

  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setSession(data);
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác minh.');
      router.push(data.user.role === 'tutor' ? '/tutor/onboarding' : '/dashboard');
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Đăng ký thất bại'));
    },
  });

  const strength = passwordStrength(password);
  const strengthLabels = ['Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  const strengthColors = ['bg-red-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500'];

  return (
    <div className="w-full max-w-md edm-animate-fade-up">
      <div className="space-y-1.5">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Tạo tài khoản EduMatch.
        </h1>
        <p className="text-muted-foreground">
          Mất chưa đến 1 phút. Không cam kết, không phí ẩn.
        </p>
      </div>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="mt-8 space-y-5">
        <FormField label="Bạn tham gia với vai trò" required>
          <div className="grid grid-cols-2 gap-3">
            {roleOptions.map(({ value, icon: Icon, title, desc }) => (
              <label
                key={value}
                className={cn(
                  'group relative cursor-pointer rounded-2xl border-2 p-4 transition',
                  role === value
                    ? 'border-accent bg-[var(--accent-tint)]'
                    : 'border-border bg-card hover:border-accent/30',
                )}
              >
                <input type="radio" value={value} className="sr-only" {...register('role')} />
                <Icon
                  className={cn(
                    'h-5 w-5 transition',
                    role === value ? 'text-accent' : 'text-muted-foreground',
                  )}
                />
                <p className="mt-2 text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{desc}</p>
              </label>
            ))}
          </div>
        </FormField>

        <FormField label="Họ và tên" htmlFor="fullName" error={errors.fullName?.message} required>
          <Input id="fullName" autoComplete="name" placeholder="Nguyễn Văn A" {...register('fullName')} />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" autoComplete="email" placeholder="ban@email.com" {...register('email')} />
        </FormField>

        <FormField
          label="Mật khẩu"
          htmlFor="password"
          error={errors.password?.message}
          hint="Ít nhất 8 ký tự, có 1 chữ in hoa và 1 số"
          required
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('password')}
          />
          {password.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-1 flex-1 rounded-full transition',
                      strength >= i ? strengthColors[strength - 1] : 'bg-muted',
                    )}
                  />
                ))}
              </div>
              <p className="text-[11px] font-medium text-muted-foreground">
                Độ mạnh: <span className="text-foreground">{strengthLabels[Math.max(0, strength - 1)] || 'Yếu'}</span>
              </p>
            </div>
          )}
        </FormField>

        <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
          Tạo tài khoản
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Bằng việc đăng ký, bạn đồng ý với{' '}
          <Link href="#" className="text-accent hover:underline">Điều khoản dịch vụ</Link> và{' '}
          <Link href="#" className="text-accent hover:underline">Chính sách bảo mật</Link>.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
