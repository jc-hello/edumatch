import { Badge, type BadgeProps } from '@/components/ui/badge';

const tones: Record<string, BadgeProps['tone']> = {
  pending: 'warning',
  pending_payment: 'warning',
  confirmed: 'accent',
  in_progress: 'accent',
  completed: 'success',
  cancelled: 'danger',
  refunded: 'neutral',
  approved: 'success',
  verified: 'success',
  rejected: 'danger',
  needs_info: 'info',
  pending_review: 'warning',
  info_requested: 'info',
  open: 'success',
  booked: 'accent',
  paid: 'success',
  failed: 'danger',
};

const labels: Record<string, string> = {
  pending: 'Chờ xác nhận',
  pending_payment: 'Chờ thanh toán',
  confirmed: 'Đã xác nhận',
  in_progress: 'Đang diễn ra',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền',
  approved: 'Đã duyệt',
  verified: 'Đã xác thực',
  rejected: 'Từ chối',
  needs_info: 'Cần bổ sung',
  pending_review: 'Chờ duyệt',
  info_requested: 'Cần bổ sung',
  open: 'Còn trống',
  booked: 'Đã đặt',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge tone={tones[status] ?? 'neutral'} className={className}>
      {labels[status] ?? status}
    </Badge>
  );
}
