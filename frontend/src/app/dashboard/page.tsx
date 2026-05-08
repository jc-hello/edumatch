'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect } from 'react';

export default function DashboardPage() {
  return (
    <>
      <Header />
      <AuthGuard>
        <DashboardInner />
      </AuthGuard>
    </>
  );
}

function DashboardInner() {
  const setUser = useAuthStore((s) => s.setUser);
  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
  });

  useEffect(() => {
    if (me) setUser(me);
  }, [me, setUser]);

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold">Xin chào, {me?.fullName ?? '…'}</h1>
      <p className="text-gray-600 mt-1">
        Bạn đang đăng nhập với vai trò{' '}
        <span className="font-medium text-indigo-700">{me?.role}</span>
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold">Tài khoản</h3>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd>{me?.email ?? (isLoading ? '…' : '—')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Email đã xác minh</dt>
                <dd>{me?.emailVerified ? '✓' : '✗'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Trạng thái</dt>
                <dd>{me?.isActive ? 'Active' : 'Inactive'}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/profile">Chỉnh sửa thông tin</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold">Bước tiếp theo</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-700 list-disc list-inside">
              {me?.role === 'tutor' ? (
                <>
                  <li>Hoàn thiện hồ sơ gia sư</li>
                  <li>Thêm môn học và giá theo cấp</li>
                  <li>Đăng lịch rảnh để học sinh đặt</li>
                </>
              ) : me?.role === 'student' ? (
                <>
                  <li>Tìm gia sư phù hợp</li>
                  <li>Đặt lịch học đầu tiên</li>
                  <li>Xác minh email để nhận thông báo</li>
                </>
              ) : (
                <li>Truy cập bảng quản trị</li>
              )}
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              Các trang chi tiết sẽ được bổ sung trong phiên làm việc tiếp theo.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
