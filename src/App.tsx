import { useMemo, useState } from 'react';
import { bookingSlots, tutors, type Tutor } from './data';

type SortKey = 'relevance' | 'rating' | 'price-asc' | 'price-desc' | 'sessions';

const subjectOptions = ['Tat ca', 'Toan', 'Tieng Anh', 'Vat ly', 'Lap trinh'] as const;
const cityOptions = ['Tat ca', 'Ha Noi', 'Ho Chi Minh City', 'Da Nang'] as const;
const modeOptions = ['Tat ca', 'Online', 'Offline'] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ/giờ';
}

function scoreTutor(tutor: Tutor, filters: { subject: string; city: string; mode: string; minRating: string }) {
  let score = tutor.rating * 20 + tutor.reviews / 10 + tutor.years * 1.5;

  if (filters.subject !== 'Tat ca' && tutor.subject !== filters.subject) {
    score -= 40;
  }

  if (filters.city !== 'Tat ca' && tutor.city !== filters.city) {
    score -= 18;
  }

  if (filters.mode !== 'Tat ca' && !tutor.mode.includes(filters.mode as 'Online' | 'Offline')) {
    score -= 24;
  }

  if (filters.minRating && tutor.rating < Number(filters.minRating)) {
    score -= 30;
  }

  return score;
}

export default function App() {
  const [subject, setSubject] = useState<(typeof subjectOptions)[number]>('Tat ca');
  const [city, setCity] = useState<(typeof cityOptions)[number]>('Tat ca');
  const [mode, setMode] = useState<(typeof modeOptions)[number]>('Tat ca');
  const [minRating, setMinRating] = useState('4.5');
  const [sortBy, setSortBy] = useState<SortKey>('relevance');
  const [selectedTutorId, setSelectedTutorId] = useState<number>(tutors[0].id);
  const [selectedSlot, setSelectedSlot] = useState(bookingSlots[0]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([1, 4]);

  const visibleTutors = useMemo(() => {
    const filtered = tutors.filter((tutor) => {
      const subjectMatch = subject === 'Tat ca' || tutor.subject === subject;
      const cityMatch = city === 'Tat ca' || tutor.city === city;
      const modeMatch = mode === 'Tat ca' || tutor.mode.includes(mode as 'Online' | 'Offline');
      const ratingMatch = !minRating || tutor.rating >= Number(minRating);

      return subjectMatch && cityMatch && modeMatch && ratingMatch;
    });

    return [...filtered].sort((left, right) => {
      switch (sortBy) {
        case 'rating':
          return right.rating - left.rating;
        case 'price-asc':
          return left.price - right.price;
        case 'price-desc':
          return right.price - left.price;
        case 'sessions':
          return right.reviews - left.reviews;
        case 'relevance':
        default:
          return scoreTutor(right, { subject, city, mode, minRating }) - scoreTutor(left, { subject, city, mode, minRating });
      }
    });
  }, [subject, city, mode, minRating, sortBy]);

  const selectedTutor = visibleTutors.find((tutor) => tutor.id === selectedTutorId) ?? visibleTutors[0] ?? tutors[0];

  const toggleFavorite = (id: number) => {
    setFavoriteIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  return (
    <div className="app-shell">
      <div className="background-glow background-glow-left" />
      <div className="background-glow background-glow-right" />

      <header className="topbar">
        <div>
          <p className="eyebrow">EduMatch Demo</p>
          <h1>Hệ thống tìm gia sư ngắn hạn, booking nhanh trong vài phút.</h1>
        </div>
        <div className="topbar-actions">
          <span className="status-pill">Escrow sẵn sàng</span>
          <button className="secondary-button">Đăng nhập</button>
          <button className="primary-button">Đăng ký ngay</button>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="hero-card panel">
          <div className="hero-copy">
            <p className="eyebrow">Tìm gia sư ngắn hạn cho học sinh phổ thông và đại học</p>
            <h2>Khám phá, lọc, đặt lịch và thanh toán trong một luồng duy nhất.</h2>
            <p className="hero-description">
              Demo frontend này mô phỏng trải nghiệm chính của EduMatch: tìm tutor theo môn học,
              khu vực và mức giá; chọn khung giờ rảnh; xem tóm tắt booking và lưu gia sư yêu thích.
            </p>

            <div className="hero-metrics">
              <article>
                <strong>500ms</strong>
                <span>search target</span>
              </article>
              <article>
                <strong>4.9/5</strong>
                <span>rating trung bình</span>
              </article>
              <article>
                <strong>24h</strong>
                <span>policy hủy linh hoạt</span>
              </article>
            </div>
          </div>

          <div className="hero-preview panel-inner">
            <div className="preview-header">
              <span>Luồng booking demo</span>
              <span className="status-pill status-pill-soft">Live preview</span>
            </div>
            <ol className="timeline">
              <li>
                <strong>1</strong>
                <p>Học sinh lọc tutor theo môn học và thời gian rảnh.</p>
              </li>
              <li>
                <strong>2</strong>
                <p>Chọn slot phù hợp và gửi yêu cầu đặt lịch kèm ghi chú.</p>
              </li>
              <li>
                <strong>3</strong>
                <p>Thanh toán escrow, tutor xác nhận, hệ thống giữ tiền an toàn.</p>
              </li>
            </ol>
          </div>
        </section>

        <aside className="panel filter-panel">
          <div className="panel-heading">
            <h3>Tìm gia sư</h3>
            <p>Chọn bộ lọc để thay đổi danh sách hiển thị.</p>
          </div>

          <div className="field-grid">
            <label>
              Môn học
              <select value={subject} onChange={(event) => setSubject(event.target.value as typeof subject)}>
                {subjectOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              Khu vực
              <select value={city} onChange={(event) => setCity(event.target.value as typeof city)}>
                {cityOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              Hình thức
              <select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
                {modeOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              Rating tối thiểu
              <input
                value={minRating}
                onChange={(event) => setMinRating(event.target.value)}
                inputMode="decimal"
                placeholder="4.5"
              />
            </label>
            <label>
              Sắp xếp
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortKey)}>
                <option value="relevance">Độ phù hợp</option>
                <option value="rating">Rating cao nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="sessions">Số buổi đã dạy</option>
              </select>
            </label>
          </div>

          <div className="filter-note">
            <span>{visibleTutors.length} gia sư phù hợp</span>
            <span className="tiny-muted">Cập nhật theo thời gian thực</span>
          </div>
        </aside>

        <section className="panel tutor-list-panel">
          <div className="panel-heading row-heading">
            <div>
              <h3>Danh sách gia sư</h3>
              <p>Chọn một hồ sơ để xem khung booking bên phải.</p>
            </div>
            <span className="status-pill status-pill-soft">Verified badges</span>
          </div>

          <div className="tutor-grid">
            {visibleTutors.map((tutor) => {
              const active = tutor.id === selectedTutor.id;
              const favorite = favoriteIds.includes(tutor.id);

              return (
                <article
                  key={tutor.id}
                  className={`tutor-card ${active ? 'is-active' : ''}`}
                  onClick={() => setSelectedTutorId(tutor.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedTutorId(tutor.id);
                    }
                  }}
                >
                  <div className="tutor-card-head">
                    <div>
                      <h4>{tutor.name}</h4>
                      <p>{tutor.title}</p>
                    </div>
                    <button
                      type="button"
                      className={`favorite-button ${favorite ? 'is-favorite' : ''}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFavorite(tutor.id);
                      }}
                    >
                      {favorite ? '♥' : '♡'}
                    </button>
                  </div>

                  <div className="tutor-meta">
                    <span>{tutor.subject}</span>
                    <span>{tutor.level}</span>
                    <span>{tutor.city}</span>
                  </div>

                  <p className="tutor-bio">{tutor.bio}</p>

                  <div className="tutor-footer">
                    <strong>{formatCurrency(tutor.price)}</strong>
                    <span>{tutor.rating.toFixed(1)} • {tutor.reviews} đánh giá</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel booking-panel">
          <div className="panel-heading">
            <h3>Booking summary</h3>
            <p>Khung mô phỏng để demo luồng đặt lịch.</p>
          </div>

          <article className="booking-summary">
            <div className="booking-topline">
              <div>
                <p className="eyebrow">Tutor đã chọn</p>
                <h4>{selectedTutor.name}</h4>
              </div>
              <span className="status-pill">{selectedTutor.verified ? 'Đã duyệt' : 'Chờ duyệt'}</span>
            </div>

            <div className="booking-facts">
              <div>
                <span>Môn học</span>
                <strong>{selectedTutor.subject}</strong>
              </div>
              <div>
                <span>Khung giờ gần nhất</span>
                <strong>{selectedTutor.nextSlot}</strong>
              </div>
              <div>
                <span>Giá mỗi giờ</span>
                <strong>{formatCurrency(selectedTutor.price)}</strong>
              </div>
              <div>
                <span>Hình thức</span>
                <strong>{selectedTutor.mode.join(' • ')}</strong>
              </div>
            </div>

            <div className="slot-stack">
              <p>Chọn slot rảnh</p>
              <div className="slot-grid">
                {bookingSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-pill ${selectedSlot === slot ? 'is-selected' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <label className="note-field">
              Ghi chú buổi học
              <textarea defaultValue="Mục tiêu: ôn lại chương 4 và làm 2 đề luyện. Mang theo file bài tập đã gửi trước." />
            </label>

            <div className="checkout-box">
              <div>
                <span>Tạm tính</span>
                <strong>{formatCurrency(selectedTutor.price)}</strong>
              </div>
              <div>
                <span>Escrow fee</span>
                <strong>0 đ</strong>
              </div>
              <div>
                <span>Slot đã chọn</span>
                <strong>{selectedSlot}</strong>
              </div>
            </div>

            <button className="primary-button checkout-button">Thanh toán và gửi booking</button>

            <p className="tiny-muted">
              Demo giao diện. Booking sẽ chuyển sang Pending, sau đó Confirmed hoặc Cancelled tuỳ phản hồi của tutor.
            </p>
          </article>
        </section>

        <section className="panel feature-strip">
          <div>
            <p className="eyebrow">Điểm nhấn sản phẩm</p>
            <h3>Hiển thị đủ câu chuyện cho demo: tìm kiếm, đặt lịch, escrow, đánh giá.</h3>
          </div>

          <div className="feature-grid">
            <article>
              <strong>Search</strong>
              <p>Lọc theo môn, khu vực, hình thức và rating.</p>
            </article>
            <article>
              <strong>Trust</strong>
              <p>Badge xác minh, review và thông tin hồ sơ rõ ràng.</p>
            </article>
            <article>
              <strong>Booking</strong>
              <p>Chọn slot, thêm ghi chú, mô phỏng thanh toán trước.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>EduMatch Demo Frontend</span>
        <span>Designed for short-term tutoring marketplace pitch</span>
      </footer>
    </div>
  );
}