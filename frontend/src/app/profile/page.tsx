'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShieldAlert, Trash2, Upload } from 'lucide-react';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { authService } from '@/services/auth.service';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/lib/api';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').optional(),
  phone: z
    .string()
    .regex(/^(\+84|0)[0-9]{9}$/, 'Số điện thoại Việt Nam không hợp lệ')
    .optional()
    .or(z.literal('')),
  avatarUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
});
type ProfileValues = z.infer<typeof profileSchema>;

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
type PasswordValues = z.infer<typeof passwordSchema>;

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

  const profileForm = useForm<ProfileValues>({
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
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Cập nhật thất bại')),
  });

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });
  const passwordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: PasswordValues) =>
      usersService.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      clear();
      router.push('/login');
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Đổi mật khẩu thất bại')),
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteMutation = useMutation({
    mutationFn: usersService.deleteAccount,
    onSuccess: (res) => {
      toast.success(res.message);
      clear();
      router.push('/');
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Xoá tài khoản thất bại')),
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10 sm:px-6">
      <div>
        <Badge tone="accent">Tài khoản</Badge>
        <h1
          className="mt-3 text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Thông tin cá nhân.
        </h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý hồ sơ, bảo mật và trạng thái tài khoản của bạn.
        </p>
      </div>

      {/* Avatar + identity */}
      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <Avatar name={me?.fullName} src={me?.avatarUrl} size="xl" />
          <div className="flex-1">
            <p className="text-lg font-bold text-foreground">{me?.fullName}</p>
            <p className="text-sm text-muted-foreground">{me?.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {me?.emailVerified ? (
                <Badge tone="success">Email đã xác thực</Badge>
              ) : (
                <Badge tone="warning">Email chưa xác thực</Badge>
              )}
              <Badge tone="accent">{me?.role === 'tutor' ? 'Gia sư' : me?.role === 'admin' ? 'Quản trị' : 'Học sinh'}</Badge>
            </div>
          </div>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Đổi ảnh
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ</CardTitle>
          <CardDescription>Cập nhật tên, số điện thoại và ảnh đại diện.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit((v) => {
              const payload: Parameters<typeof usersService.updateProfile>[0] = {};
              if (v.fullName) payload.fullName = v.fullName;
              if (v.phone) payload.phone = v.phone;
              if (v.avatarUrl) payload.avatarUrl = v.avatarUrl;
              updateMutation.mutate(payload);
            })}
            className="space-y-5"
          >
            <FormField label="Họ và tên" htmlFor="fullName" error={profileForm.formState.errors.fullName?.message}>
              <Input id="fullName" {...profileForm.register('fullName')} />
            </FormField>
            <FormField label="Số điện thoại" htmlFor="phone" error={profileForm.formState.errors.phone?.message}>
              <Input id="phone" placeholder="0912345678" {...profileForm.register('phone')} />
            </FormField>
            <FormField label="URL ảnh đại diện" htmlFor="avatarUrl" error={profileForm.formState.errors.avatarUrl?.message}>
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
          <CardDescription>Các phiên đăng nhập khác sẽ bị thu hồi sau khi đổi.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit((v) => passwordMutation.mutate(v))}
            className="space-y-5"
          >
            <FormField
              label="Mật khẩu hiện tại"
              htmlFor="currentPassword"
              error={passwordForm.formState.errors.currentPassword?.message}
              required
            >
              <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
            </FormField>
            <FormField
              label="Mật khẩu mới"
              htmlFor="newPassword"
              error={passwordForm.formState.errors.newPassword?.message}
              hint="Ít nhất 8 ký tự, gồm 1 chữ in hoa và 1 số"
              required
            >
              <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
            </FormField>
            <FormField
              label="Xác nhận mật khẩu mới"
              htmlFor="confirmPassword"
              error={passwordForm.formState.errors.confirmPassword?.message}
              required
            >
              <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} />
            </FormField>
            <Button type="submit" loading={passwordMutation.isPending}>
              Đổi mật khẩu
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <ShieldAlert className="h-5 w-5" />
            Vùng nguy hiểm
          </CardTitle>
          <CardDescription>
            Tài khoản sẽ được xoá mềm. Bạn có 30 ngày để khôi phục bằng cách đăng nhập lại.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showDeleteConfirm ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-red-700">Bạn chắc chắn muốn xoá tài khoản?</p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  loading={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate()}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Xác nhận xoá
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Huỷ
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="mr-1.5 h-4 w-4" />
              Xoá tài khoản
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
