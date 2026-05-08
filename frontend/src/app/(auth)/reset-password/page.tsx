'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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

const schema = z.object({
  newPassword: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ in hoa')
    .regex(/\d/, 'Mật khẩu phải có ít nhất 1 chữ số'),
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
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || 'Token không hợp lệ hoặc đã hết hạn');
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
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <h2 className="text-lg font-semibold text-red-600">Token không hợp lệ</h2>
          <p className="mt-2 text-sm text-gray-600">
            Vui lòng dùng link trong email để đặt lại mật khẩu.
          </p>
          <Button className="mt-6" variant="outline" asChild>
            <Link href="/forgot-password">Yêu cầu link mới</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (done) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-lg font-semibold">Đặt lại mật khẩu thành công</h2>
          <p className="mt-2 text-sm text-gray-600">
            Tự động chuyển đến trang đăng nhập trong {countdown}s…
          </p>
          <Button className="mt-6" asChild>
            <Link href="/login">Đăng nhập ngay</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Đặt lại mật khẩu</CardTitle>
        <CardDescription>Nhập mật khẩu mới của bạn.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <FormField
            label="Mật khẩu mới"
            htmlFor="newPassword"
            error={errors.newPassword?.message}
            hint="Ít nhất 8 ký tự, gồm 1 chữ in hoa và 1 số"
            required
          >
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              {...register('newPassword')}
            />
          </FormField>

          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Đặt lại mật khẩu
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-gray-500">Loading…</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
