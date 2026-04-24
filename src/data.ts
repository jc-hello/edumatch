export type Tutor = {
  id: number;
  name: string;
  title: string;
  subject: string;
  level: string;
  price: number;
  rating: number;
  reviews: number;
  city: string;
  mode: ('Online' | 'Offline')[];
  languages: string[];
  years: number;
  nextSlot: string;
  verified: boolean;
  bio: string;
};

export const tutors: Tutor[] = [
  {
    id: 1,
    name: 'Nguyen Minh Anh',
    title: 'Gia sư Toán THPT chuyên luyện thi',
    subject: 'Toan',
    level: 'THPT',
    price: 220000,
    rating: 4.9,
    reviews: 128,
    city: 'Ha Noi',
    mode: ['Online', 'Offline'],
    languages: ['Tieng Viet', 'English'],
    years: 6,
    nextSlot: 'Mai, 19:00',
    verified: true,
    bio: 'Tập trung vào tư duy giải nhanh, lộ trình luyện đề theo tuần và feedback chi tiết sau mỗi buổi.',
  },
  {
    id: 2,
    name: 'Tran Gia Huy',
    title: 'IELTS & giao tiếp học thuật',
    subject: 'Tieng Anh',
    level: 'Dai hoc',
    price: 250000,
    rating: 4.8,
    reviews: 94,
    city: 'Ho Chi Minh City',
    mode: ['Online'],
    languages: ['Tieng Viet', 'English'],
    years: 5,
    nextSlot: 'Thu 6, 20:30',
    verified: true,
    bio: 'Dạy theo mục tiêu điểm số và nhu cầu thực tế, phù hợp học sinh cần cải thiện nhanh trong 4-8 tuần.',
  },
  {
    id: 3,
    name: 'Le Thu Trang',
    title: 'Vật lý THCS - THPT nền tảng chắc',
    subject: 'Vat ly',
    level: 'THCS',
    price: 180000,
    rating: 4.7,
    reviews: 76,
    city: 'Da Nang',
    mode: ['Online', 'Offline'],
    languages: ['Tieng Viet'],
    years: 4,
    nextSlot: 'Chu Nhat, 14:00',
    verified: false,
    bio: 'Phong cách gần gũi, nhiều ví dụ trực quan, phù hợp học sinh yếu nền và cần kéo điểm kiểm tra.',
  },
  {
    id: 4,
    name: 'Pham Quang Dat',
    title: 'Lập trình Python & tư duy thuật toán',
    subject: 'Lap trinh',
    level: 'Dai hoc',
    price: 300000,
    rating: 4.95,
    reviews: 58,
    city: 'Ha Noi',
    mode: ['Online'],
    languages: ['Tieng Viet', 'English'],
    years: 7,
    nextSlot: 'T7, 09:00',
    verified: true,
    bio: 'Dạy theo dự án và bài tập nhỏ, thích hợp sinh viên muốn học ngắn hạn, rõ mục tiêu, rõ đầu ra.',
  },
];

export const bookingSlots = [
  'Today 18:00 - 19:00',
  'Today 20:00 - 21:00',
  'Tomorrow 08:30 - 09:30',
  'Tomorrow 19:00 - 20:00',
];