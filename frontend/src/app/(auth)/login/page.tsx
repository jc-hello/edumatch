'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setSession(data);
      toast.success(`Welcome back, ${data.user.fullName}`);
      router.push('/dashboard');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message || err?.message || 'Login failed';
      toast.error(msg);
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>Chào mừng bạn quay trở lại EduMatch.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
          </FormField>

          <FormField label="Mật khẩu" htmlFor="password" error={errors.password?.message} required>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
          </FormField>

          <div className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Đăng nhập
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">hoặc</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => toast.info('OAuth Google chưa được cấu hình trong môi trường dev')}
          >
            Đăng nhập với Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => toast.info('OAuth Facebook chưa được cấu hình trong môi trường dev')}
          >
            Đăng nhập với Facebook
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-indigo-600 hover:underline font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
