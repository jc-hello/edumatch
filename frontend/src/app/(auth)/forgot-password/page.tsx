'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { authService } from '@/services/auth.service';

const schema = z.object({ email: z.string().email('Email không hợp lệ') });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (v: FormValues) => authService.forgotPassword(v.email),
    onSuccess: () => setSubmitted(true),
    onError: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <div className="w-full max-w-md text-center edm-animate-fade-up">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <MailCheck className="h-7 w-7" />
        </span>
        <h1
          className="mt-6 text-2xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Kiểm tra hộp thư của bạn.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Nếu <span className="font-medium text-foreground">{email || 'email'}</span> tồn tại trong hệ thống,
          chúng tôi đã gửi link đặt lại mật khẩu. Link hết hạn sau 1 giờ.
        </p>
        <div className="mt-8 space-y-3">
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại đăng nhập
            </Link>
          </Button>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            Không nhận được email? <span className="font-medium text-accent">Gửi lại</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md edm-animate-fade-up">
      <div className="space-y-1.5">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Quên mật khẩu?
        </h1>
        <p className="text-muted-foreground">
          Nhập email tài khoản, chúng tôi sẽ gửi link đặt lại trong vòng vài phút.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((v) => {
          setEmail(v.email);
          mutation.mutate(v);
        })}
        className="mt-8 space-y-5"
      >
        <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" autoComplete="email" placeholder="ban@email.com" {...register('email')} />
        </FormField>
        <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
          <CheckCircle2 className="mr-2 h-4 w-4" /> Gửi link đặt lại
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-semibold text-accent hover:underline">
          ← Quay lại đăng nhập
        </Link>
      </p>
    </div>
  );
}
