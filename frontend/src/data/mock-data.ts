export type Tutor = {
  id: string;
  name: string;
  title: string;
  subjects: string[];
  levels: string[];
  location: string;
  format: 'Trực tuyến' | 'Tại nhà' | 'Linh hoạt';
  price: number;
  rating: number;
  reviews: number;
  sessions: number;
  responseTime: string;
  verified: boolean;
  avatar: string;
  bio: string;
  languages: string[];
  availability: Array<{ day: string; slots: string[] }>;
  credentials: string[];
};

export const tutors: Tutor[] = [
  {
    id: 'mai-anh',
    name: 'Nguyễn Mai Anh',
    title: 'Gia sư Toán THPT, luyện thi tốt nghiệp',
    subjects: ['Toán', 'Vật lý'],
    levels: ['THCS', 'THPT'],
    location: 'Cầu Giấy, Hà Nội',
    format: 'Linh hoạt',
    price: 220000,
    rating: 4.9,
    reviews: 128,
    sessions: 640,
    responseTime: '12 phút',
    verified: true,
    avatar: 'MA',
    bio: 'Tập trung lấp lỗ hổng kiến thức, giải nhanh dạng bài và xây dựng lịch ôn tập ngắn hạn cho học sinh cần tăng tốc trước kỳ thi.',
    languages: ['Tiếng Việt', 'Tiếng Anh cơ bản'],
    availability: [
      { day: 'Thứ 2', slots: ['18:00', '20:00'] },
      { day: 'Thứ 4', slots: ['19:00'] },
      { day: 'Thứ 7', slots: ['08:00', '14:00'] },
    ],
    credentials: ['Đại học Sư phạm Hà Nội', '6 năm kinh nghiệm', 'Nhóm 5% gia sư được đánh giá cao'],
  },
  {
    id: 'quang-minh',
    name: 'Trần Quang Minh',
    title: 'Lập trình Python, C++ và tin học đại cương',
    subjects: ['Tin học', 'Lập trình'],
    levels: ['THPT', 'Đại học'],
    location: 'Trực tuyến',
    format: 'Trực tuyến',
    price: 260000,
    rating: 4.8,
    reviews: 92,
    sessions: 410,
    responseTime: '25 phút',
    verified: true,
    avatar: 'QM',
    bio: 'Hướng dẫn theo dự án nhỏ, giải thích tư duy giải bài và debug để sinh viên nắm được nền tảng thay vì học thuộc cú pháp.',
    languages: ['Tiếng Việt', 'Tiếng Anh'],
    availability: [
      { day: 'Thứ 3', slots: ['20:00'] },
      { day: 'Thứ 5', slots: ['18:30', '21:00'] },
      { day: 'Chủ nhật', slots: ['09:00'] },
    ],
    credentials: ['Kỹ sư phần mềm', 'Thí sinh ACM ICPC khu vực', '4 năm dạy trực tuyến'],
  },
  {
    id: 'linh-chi',
    name: 'Phạm Linh Chi',
    title: 'Tiếng Anh giao tiếp và IELTS nền tảng',
    subjects: ['Tiếng Anh', 'IELTS'],
    levels: ['THCS', 'THPT', 'Đại học'],
    location: 'Quận 3, TP.HCM',
    format: 'Linh hoạt',
    price: 300000,
    rating: 5,
    reviews: 76,
    sessions: 330,
    responseTime: '8 phút',
    verified: true,
    avatar: 'LC',
    bio: 'Thiết kế buổi học ngắn theo mục tiêu rõ ràng: sửa phát âm, tăng từ vựng học thuật, luyện nói và bài viết IELTS có phản hồi chi tiết.',
    languages: ['Tiếng Việt', 'Tiếng Anh'],
    availability: [
      { day: 'Thứ 2', slots: ['17:30'] },
      { day: 'Thứ 6', slots: ['19:30'] },
      { day: 'Thứ 7', slots: ['10:00', '15:30'] },
    ],
    credentials: ['IELTS 8.0', 'Chứng chỉ TESOL', '120+ học viên'],
  },
  {
    id: 'duc-huy',
    name: 'Lê Đức Huy',
    title: 'Hóa học mất gốc và ôn thi học kỳ',
    subjects: ['Hóa học', 'Sinh học'],
    levels: ['THCS', 'THPT'],
    location: 'Đà Nẵng',
    format: 'Tại nhà',
    price: 180000,
    rating: 4.7,
    reviews: 54,
    sessions: 220,
    responseTime: '40 phút',
    verified: false,
    avatar: 'DH',
    bio: 'Chuyên các buổi học cấp tốc trước kiểm tra, hệ thống công thức và dạng bài bằng sơ đồ để học sinh dễ áp dụng.',
    languages: ['Tiếng Việt'],
    availability: [
      { day: 'Thứ 4', slots: ['18:00'] },
      { day: 'Thứ 7', slots: ['09:00', '16:00'] },
      { day: 'Chủ nhật', slots: ['14:00'] },
    ],
    credentials: ['Đại học Bách khoa Đà Nẵng', '3 năm trợ giảng', 'Chuyên đề hóa hữu cơ'],
  },
];

export type BookingStatus =
  | 'pending'
  | 'pending_payment'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type Booking = {
  id: string;
  tutorId: string;
  tutor: string;
  subject: string;
  time: string;
  date: string;
  duration: number;
  status: BookingStatus;
  amount: number;
  format: 'Trực tuyến' | 'Tại nhà';
};

export const bookings: Booking[] = [
  {
    id: 'BK-1042',
    tutorId: 'mai-anh',
    tutor: 'Nguyễn Mai Anh',
    subject: 'Toán 12 - Hàm số',
    time: '19:00 - 20:30',
    date: 'Thứ 4, 14/05/2026',
    duration: 1.5,
    status: 'confirmed',
    amount: 330000,
    format: 'Trực tuyến',
  },
  {
    id: 'BK-1041',
    tutorId: 'linh-chi',
    tutor: 'Phạm Linh Chi',
    subject: 'IELTS Speaking - Part 2',
    time: '19:30 - 21:00',
    date: 'Thứ 6, 16/05/2026',
    duration: 1.5,
    status: 'pending',
    amount: 450000,
    format: 'Trực tuyến',
  },
  {
    id: 'BK-1039',
    tutorId: 'quang-minh',
    tutor: 'Trần Quang Minh',
    subject: 'Python - OOP và Closures',
    time: '09:00 - 10:30',
    date: 'Chủ nhật, 11/05/2026',
    duration: 1.5,
    status: 'completed',
    amount: 390000,
    format: 'Trực tuyến',
  },
  {
    id: 'BK-1037',
    tutorId: 'duc-huy',
    tutor: 'Lê Đức Huy',
    subject: 'Hóa hữu cơ - Andehit',
    time: '14:00 - 15:30',
    date: 'Thứ 7, 03/05/2026',
    duration: 1.5,
    status: 'cancelled',
    amount: 270000,
    format: 'Tại nhà',
  },
];

export const favoriteTutorIds = ['mai-anh', 'linh-chi'];

export type Review = {
  id: string;
  tutorId: string;
  student: string;
  rating: number;
  body: string;
  date: string;
};

export const reviews: Review[] = [
  {
    id: 'r1',
    tutorId: 'mai-anh',
    student: 'Phụ huynh em Linh',
    rating: 5,
    body: 'Cô giảng rất dễ hiểu, đúng trọng tâm trước kỳ thi. Con đã tự tin hơn nhiều.',
    date: '2 tuần trước',
  },
  {
    id: 'r2',
    tutorId: 'mai-anh',
    student: 'Học sinh K12',
    rating: 5,
    body: 'Phản hồi nhanh, cho bài tập về nhà rõ ràng và có theo dõi tiến độ.',
    date: '1 tháng trước',
  },
  {
    id: 'r3',
    tutorId: 'linh-chi',
    student: 'Học sinh ôn IELTS',
    rating: 5,
    body: 'Cô chữa từng câu Speaking rất kỹ, gợi ý cấu trúc thay vì học thuộc.',
    date: '3 tuần trước',
  },
];

export const adminQueue = [
  {
    id: 'tq-1',
    name: 'Hoàng Gia Bảo',
    subject: 'Vật lý',
    education: 'Sư phạm Vật lý - ĐHSP Hà Nội',
    submitted: '2 giờ trước',
    status: 'pending',
  },
  {
    id: 'tq-2',
    name: 'Nguyễn Thanh Hà',
    subject: 'Ngữ văn',
    education: 'Cử nhân Ngữ văn - ĐH KHXH&NV',
    submitted: '5 giờ trước',
    status: 'pending',
  },
  {
    id: 'tq-3',
    name: 'Đỗ Minh Quân',
    subject: 'Toán cao cấp',
    education: 'Thạc sĩ Toán - ĐH Bách khoa',
    submitted: '1 ngày trước',
    status: 'needs_info',
  },
];

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
  status: 'active' | 'locked' | 'pending';
  joined: string;
  bookings: number;
};

export const adminUsers: AdminUser[] = [
  {
    id: 'u1',
    name: 'Nguyễn Văn An',
    email: 'an.nv@gmail.com',
    role: 'student',
    status: 'active',
    joined: '12/02/2026',
    bookings: 18,
  },
  {
    id: 'u2',
    name: 'Phạm Linh Chi',
    email: 'linhchi@edumatch.vn',
    role: 'tutor',
    status: 'active',
    joined: '04/01/2026',
    bookings: 76,
  },
  {
    id: 'u3',
    name: 'Tài khoản test',
    email: 'spam@test.com',
    role: 'student',
    status: 'locked',
    joined: '20/03/2026',
    bookings: 0,
  },
  {
    id: 'u4',
    name: 'Lê Đức Huy',
    email: 'duchuy@edumatch.vn',
    role: 'tutor',
    status: 'pending',
    joined: '01/05/2026',
    bookings: 0,
  },
];

export const adminReports = [
  {
    id: 'rp1',
    type: 'Đánh giá vi phạm',
    target: 'Phạm Linh Chi',
    description: 'Học sinh báo cáo nội dung đánh giá có lời lẽ không phù hợp.',
    severity: 'medium',
    submitted: '1 ngày trước',
  },
  {
    id: 'rp2',
    type: 'Hủy lịch sát giờ',
    target: 'Học sinh #4521',
    description: 'Học sinh hủy lịch trong 12 giờ và yêu cầu hoàn tiền 100%.',
    severity: 'high',
    submitted: '3 giờ trước',
  },
  {
    id: 'rp3',
    type: 'Gia sư không vào buổi học',
    target: 'Hoàng Gia Bảo',
    description: 'Gia sư mới được duyệt không xuất hiện trong buổi học đầu tiên.',
    severity: 'high',
    submitted: '5 giờ trước',
  },
];

export type Payout = {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: string;
};

export const payouts: Payout[] = [
  { id: 'po-201', date: '01/05/2026', amount: 4200000, status: 'completed', method: 'Vietcombank · 0011****' },
  { id: 'po-198', date: '01/04/2026', amount: 3800000, status: 'completed', method: 'Vietcombank · 0011****' },
  { id: 'po-195', date: '01/03/2026', amount: 3100000, status: 'completed', method: 'Vietcombank · 0011****' },
];

export const tutorEarningsSeries = [
  { month: 'T12', value: 2.4 },
  { month: 'T1', value: 3.1 },
  { month: 'T2', value: 3.8 },
  { month: 'T3', value: 4.0 },
  { month: 'T4', value: 4.2 },
  { month: 'T5', value: 5.6 },
];

export const platformBookingsSeries = [
  { label: 'T2', value: 124 },
  { label: 'T3', value: 156 },
  { label: 'T4', value: 142 },
  { label: 'T5', value: 168 },
  { label: 'T6', value: 198 },
  { label: 'T7', value: 215 },
  { label: 'CN', value: 188 },
];

export const platformRevenueSeries = [
  { month: 'T12', value: 62 },
  { month: 'T1', value: 78 },
  { month: 'T2', value: 84 },
  { month: 'T3', value: 102 },
  { month: 'T4', value: 116 },
  { month: 'T5', value: 128 },
];

export function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
}

export function formatVndMillion(value: number) {
  return `${(value / 1_000_000).toFixed(1)}M ₫`;
}
