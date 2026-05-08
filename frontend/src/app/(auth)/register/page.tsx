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

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' },
  });
  const password = watch('password') || '';
  const role = watch('role');

  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setSession(data);
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác minh.');
      router.push('/dashboard');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message || err?.message || 'Đăng ký thất bại';
      toast.error(typeof msg === 'string' ? msg : 'Đăng ký thất bại');
    },
  });

  const strength = passwordStrength(password);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Tạo tài khoản</CardTitle>
        <CardDescription>Bắt đầu hành trình học tập của bạn ngay hôm nay.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <FormField label="Tôi muốn" htmlFor="role" required>
            <div className="grid grid-cols-2 gap-2">
              {(['student', 'tutor'] as const).map((r) => (
                <label
                  key={r}
                  className={`cursor-pointer rounded-md border-2 px-3 py-2 text-center text-sm font-medium transition ${
                    role === r
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <input type="radio" value={r} className="sr-only" {...register('role')} />
                  {r === 'student' ? 'Học' : 'Dạy'}
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Họ và tên" htmlFor="fullName" error={errors.fullName?.message} required>
            <Input id="fullName" autoComplete="name" {...register('fullName')} />
          </FormField>

          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
          </FormField>

          <FormField
            label="Mật khẩu"
            htmlFor="password"
            error={errors.password?.message}
            hint="Ít nhất 8 ký tự, gồm 1 chữ in hoa và 1 số"
            required
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
            />
            {password.length > 0 && (
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full transition ${
                      strength >= i
                        ? strength >= 3
                          ? 'bg-green-500'
                          : strength >= 2
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            )}
          </FormField>

          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Đăng ký
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">
            Đăng nhập
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
