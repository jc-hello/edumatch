'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  remember: z.boolean().optional(),
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
    mutationFn: ({ email, password }: FormValues) => authService.login({ email, password }),
    onSuccess: (data) => {
      setSession(data);
      toast.success(`Chào mừng trở lại, ${data.user.fullName}`);
      router.push('/dashboard');
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Đăng nhập thất bại'));
    },
  });

  return (
    <div className="w-full max-w-md edm-animate-fade-up">
      <div className="space-y-1.5">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Chào mừng trở lại.
        </h1>
        <p className="text-muted-foreground">Đăng nhập để tiếp tục đặt lịch và quản lý buổi học.</p>
      </div>

      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        className="mt-8 space-y-5"
      >
        <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" autoComplete="email" placeholder="ban@email.com" {...register('email')} />
        </FormField>

        <FormField label="Mật khẩu" htmlFor="password" error={errors.password?.message} required>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
          />
        </FormField>

        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-[var(--accent)]"
              {...register('remember')}
            />
            Ghi nhớ tôi
          </label>
          <Link href="/forgot-password" className="font-medium text-accent hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
          Đăng nhập
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 font-medium uppercase tracking-wider text-muted-foreground">
              Hoặc
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.info('OAuth Google sẽ kích hoạt khi backend cấu hình xong')}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.61 0 3.06.55 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.info('OAuth Facebook sẽ kích hoạt khi backend cấu hình xong')}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#1877F2" d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z"/>
            </svg>
            Facebook
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-semibold text-accent hover:underline">
          Tạo tài khoản miễn phí
        </Link>
      </p>
    </div>
  );
}
