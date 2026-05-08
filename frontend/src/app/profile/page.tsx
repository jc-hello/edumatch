'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { authService } from '@/services/auth.service';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/stores/auth-store';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').optional(),
  phone: z
    .string()
    .regex(/^(\+84|0)[0-9]{9}$/, 'Số điện thoại Việt Nam không hợp lệ')
    .optional()
    .or(z.literal('')),
  avatarUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
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

export default function ProfilePage() {
  return (
    <>
      <Header />
      <AuthGuard>
        <ProfileInner />
      </AuthGuard>
    </>
  );
}

function ProfileInner() {
  const router = useRouter();
  const qc = useQueryClient();
  const { clear, setUser } = useAuthStore();

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: authService.getMe });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: me?.fullName || '',
      phone: me?.phone || '',
      avatarUrl: me?.avatarUrl || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: usersService.updateProfile,
    onSuccess: (user) => {
      setUser(user);
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Cập nhật thành công');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || 'Cập nhật thất bại');
    },
  });

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });
  const passwordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: any) =>
      usersService.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      clear();
      router.push('/login');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || 'Đổi mật khẩu thất bại');
    },
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteMutation = useMutation({
    mutationFn: usersService.deleteAccount,
    onSuccess: (res) => {
      toast.success(res.message);
      clear();
      router.push('/');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || 'Xoá tài khoản thất bại');
    },
  });

  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>

      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ</CardTitle>
          <CardDescription>Cập nhật tên, số điện thoại và ảnh đại diện.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit((v) => {
              const payload: any = {};
              if (v.fullName) payload.fullName = v.fullName;
              if (v.phone) payload.phone = v.phone;
              if (v.avatarUrl) payload.avatarUrl = v.avatarUrl;
              updateMutation.mutate(payload);
            })}
            className="space-y-4"
          >
            <FormField
              label="Họ và tên"
              htmlFor="fullName"
              error={profileForm.formState.errors.fullName?.message}
            >
              <Input id="fullName" {...profileForm.register('fullName')} />
            </FormField>
            <FormField
              label="Số điện thoại"
              htmlFor="phone"
              error={profileForm.formState.errors.phone?.message as any}
            >
              <Input id="phone" placeholder="0912345678" {...profileForm.register('phone')} />
            </FormField>
            <FormField
              label="Avatar URL"
              htmlFor="avatarUrl"
              error={profileForm.formState.errors.avatarUrl?.message as any}
            >
              <Input
                id="avatarUrl"
                placeholder="https://example.com/avatar.jpg"
                {...profileForm.register('avatarUrl')}
              />
            </FormField>
            <Button type="submit" loading={updateMutation.isPending}>
              Lưu thay đổi
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Sau khi đổi, các phiên đăng nhập khác sẽ bị thu hồi.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit((v: any) => passwordMutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              label="Mật khẩu hiện tại"
              htmlFor="currentPassword"
              error={passwordForm.formState.errors.currentPassword?.message as any}
              required
            >
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register('currentPassword')}
              />
            </FormField>
            <FormField
              label="Mật khẩu mới"
              htmlFor="newPassword"
              error={passwordForm.formState.errors.newPassword?.message as any}
              hint="Ít nhất 8 ký tự, gồm 1 chữ in hoa và 1 số"
              required
            >
              <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
            </FormField>
            <FormField
              label="Xác nhận mật khẩu mới"
              htmlFor="confirmPassword"
              error={passwordForm.formState.errors.confirmPassword?.message as any}
              required
            >
              <Input
                id="confirmPassword"
                type="password"
                {...passwordForm.register('confirmPassword')}
              />
            </FormField>
            <Button type="submit" loading={passwordMutation.isPending}>
              Đổi mật khẩu
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Xoá tài khoản</CardTitle>
          <CardDescription>
            Tài khoản sẽ được xoá mềm. Bạn có 30 ngày để khôi phục bằng cách đăng nhập lại.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showDeleteConfirm ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Bạn chắc chắn muốn xoá tài khoản?</p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  loading={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate()}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Xác nhận xoá
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Huỷ
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Xoá tài khoản
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
