'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/lib/api';

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ in hoa')
      .regex(/\d/, 'Mật khẩu phải có ít nhất 1 chữ số'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });
type FormValues = z.infer<typeof schema>;

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (v: FormValues) => authService.resetPassword(token, v.newPassword),
    onSuccess: () => setDone(true),
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Token không hợp lệ hoặc đã hết hạn'));
    },
  });

  useEffect(() => {
    if (!done) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [done]);

  useEffect(() => {
    if (done && countdown <= 0) router.push('/login');
  }, [done, countdown, router]);

  if (!token) {
    return (
      <div className="w-full max-w-md text-center edm-animate-fade-up">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          Token không hợp lệ.
        </h1>
        <p className="mt-3 text-muted-foreground">Vui lòng dùng link trong email để đặt lại mật khẩu.</p>
        <Button className="mt-8" asChild variant="outline">
          <Link href="/forgot-password">Yêu cầu link mới</Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full max-w-md text-center edm-animate-fade-up">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          Đặt lại mật khẩu thành công.
        </h1>
        <p className="mt-3 text-muted-foreground">Chuyển đến trang đăng nhập trong {countdown}s…</p>
        <Button className="mt-8" asChild>
          <Link href="/login">Đăng nhập ngay</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md edm-animate-fade-up">
      <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
        Đặt lại mật khẩu.
      </h1>
      <p className="mt-2 text-muted-foreground">Chọn mật khẩu mới đủ mạnh để bảo vệ tài khoản.</p>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="mt-8 space-y-5">
        <FormField
          label="Mật khẩu mới"
          htmlFor="newPassword"
          error={errors.newPassword?.message}
          hint="Ít nhất 8 ký tự, gồm 1 chữ in hoa và 1 số"
          required
        >
          <Input id="newPassword" type="password" autoComplete="new-password" {...register('newPassword')} />
        </FormField>
        <FormField
          label="Xác nhận mật khẩu mới"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          required
        >
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} />
        </FormField>
        <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
          Đặt lại mật khẩu
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Đang tải…</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
