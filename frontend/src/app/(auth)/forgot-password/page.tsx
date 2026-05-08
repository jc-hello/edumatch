'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { authService } from '@/services/auth.service';

const schema = z.object({ email: z.string().email('Email không hợp lệ') });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (v: FormValues) => authService.forgotPassword(v.email),
    onSuccess: () => setSubmitted(true),
    onError: () => {
      // Backend always returns 200 — show success even on error to prevent enumeration
      setSubmitted(true);
    },
  });

  if (submitted) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-lg font-semibold">Kiểm tra hộp thư</h2>
          <p className="mt-2 text-sm text-gray-600">
            Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu cho bạn. Link sẽ hết hạn sau 1 giờ.
          </p>
          <Button className="mt-6" variant="outline" asChild>
            <Link href="/login">Quay lại đăng nhập</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Quên mật khẩu</CardTitle>
        <CardDescription>Nhập email để nhận link đặt lại mật khẩu.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
          </FormField>

          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Gửi link đặt lại
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">
            Quay lại đăng nhập
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
