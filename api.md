# EduMatch — API Contract (rút từ frontend)

Tài liệu này liệt kê toàn bộ endpoint mà **frontend** đang gọi hoặc cần để thay thế mock data (`src/data/mock-data.ts`) và các page hiện có. Mỗi endpoint mô tả: method, path, header, request body/query, response, role yêu cầu, và ghi chú đặc thù.

---

## 0. Quy ước chung

### Base URL
- `process.env.NEXT_PUBLIC_API_URL` (mặc định `http://localhost:3000`).
- `axios` instance khai báo tại `frontend/src/lib/api.ts`.

### Headers chung cho mọi request
| Header | Value | Bắt buộc |
|---|---|---|
| `Content-Type` | `application/json` | ✅ (mặc định axios) |
| `Accept` | `application/json` | optional |
| `Authorization` | `Bearer <accessToken>` | ✅ cho route protected |

`Authorization` được attach tự động bởi interceptor (`api.ts` line 14-20) khi token tồn tại trong Zustand store `edumatch-auth`.

### Response envelope (BẮT BUỘC)
Frontend dùng `unwrap<T>()` để bóc:
```jsonc
// success
{
  "success": true,
  "data": { /* T */ },
  "meta"?: { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}

// error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR" | "UNAUTHORIZED" | "NOT_FOUND" | ...,
    "message": "Mô tả lỗi hiển thị cho user",
    "details"?: { /* field-level errors */ }
  }
}
```
- HTTP status code thường: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`, `500`.
- **401 → auto refresh**: interceptor (`api.ts` line 31-81) sẽ thử `POST /auth/refresh` 1 lần, retry request gốc. Nếu fail → clear store + redirect `/login`.

### Phân quyền (role)
`User.role`: `'student' | 'tutor' | 'admin'`. Component `<AuthGuard roles={[...]}>` chặn theo role.

### Pagination & filter (chuẩn)
Query params dùng chung khi danh sách hỗ trợ phân trang:
- `page` (int, default 1)
- `limit` (int, default 20, max 50)
- `sort` (string, vd `rating:desc`)
- `q` (string, full-text search)

---

## 1. AUTH — `/auth/*`

Triển khai trong `frontend/src/services/auth.service.ts` + các trang `(auth)/*`.

### 1.1 POST `/auth/register`
- **Auth**: public.
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Abc12345",
    "fullName": "Nguyễn Văn A",
    "role": "student"  // "student" | "tutor"
  }
  ```
- **Validate**: password ≥ 8 ký tự + 1 chữ hoa + 1 số (schema xem `register/page.tsx`).
- **Response 201**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "jwt...",
      "refreshToken": "jwt...",
      "user": { /* User object */ }
    }
  }
  ```
- **Lỗi**: 409 nếu email đã tồn tại.

### 1.2 POST `/auth/login`
- **Auth**: public.
- **Body**: `{ "email": string, "password": string }`.
- **Response 200**: giống `/auth/register`.
- **Lỗi**: 401 nếu sai mật khẩu; 403 nếu tài khoản bị khoá (`isActive=false`).

### 1.3 POST `/auth/logout`
- **Auth**: Bearer (access token).
- **Body**: `{}` (có thể optional `{ "refreshToken": "..." }` để revoke server-side).
- **Response 200**: `{ success: true, data: { message: "Đã đăng xuất" } }`.

### 1.4 POST `/auth/refresh`
- **Auth**: KHÔNG attach access token (xem `api.ts` line 60 — gọi qua axios trần).
- **Body**: `{ "refreshToken": "..." }`.
- **Response 200**:
  ```json
  { "success": true, "data": { "accessToken": "...", "refreshToken": "..." } }
  ```
- **Lỗi**: 401 nếu refresh token hết hạn / bị revoke.

### 1.5 POST `/auth/forgot-password`
- **Auth**: public.
- **Body**: `{ "email": string }`.
- **Response 200**: `{ success: true, data: { message: "Email khôi phục đã gửi" } }`.
- **Ghi chú**: trả 200 cả khi email không tồn tại (tránh user enumeration).

### 1.6 POST `/auth/reset-password`
- **Auth**: public.
- **Body**: `{ "token": "<reset-token>", "newPassword": "Abc12345" }`.
- **Response 200**: `{ success: true, data: { message: "..." } }`.
- **Lỗi**: 400 nếu token expired/invalid.

### 1.7 GET `/auth/verify-email?token=<token>`
- **Auth**: public.
- **Query**: `token` (string, URL-encoded).
- **Response 200**: `{ success: true, data: { message: "..." } }`.

---

## 2. USERS — `/users/*`

Triển khai trong `frontend/src/services/users.service.ts` + trang `profile/page.tsx`.

### 2.1 GET `/users/me`
- **Auth**: Bearer.
- **Response 200**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "student",
      "avatarUrl": "https://...",
      "phone": "0912345678",
      "isActive": true,
      "emailVerified": true
    }
  }
  ```

### 2.2 PATCH `/users/me`
- **Auth**: Bearer.
- **Body** (mọi field optional):
  ```json
  { "fullName": "...", "phone": "0912345678", "avatarUrl": "https://..." }
  ```
- **Response 200**: `User` object đã cập nhật.

### 2.3 PATCH `/users/me/password`
- **Auth**: Bearer.
- **Body**: `{ "currentPassword": "...", "newPassword": "..." }`.
- **Response 200**: `{ message: "Đổi mật khẩu thành công" }`.
- **Ghi chú**: Sau khi đổi, **server nên revoke** tất cả refresh token khác. Frontend sẽ tự logout & redirect `/login` (xem `profile/page.tsx:92-97`).

### 2.4 DELETE `/users/me`
- **Auth**: Bearer.
- **Response 200**: `{ message: "Tài khoản đã được xoá. Bạn có 30 ngày để khôi phục." }`.
- **Ghi chú**: Soft-delete, 30 ngày grace.

### 2.5 POST `/users/me/avatar` *(tuỳ chọn — chưa có service nhưng UI có nút "Đổi ảnh")*
- **Auth**: Bearer.
- **Content-Type**: `multipart/form-data`.
- **Body**: field `file` (jpg/png ≤ 2 MB).
- **Response 200**: `{ avatarUrl: "https://cdn..." }`.

---

## 3. TUTORS (marketplace) — `/tutors/*`

Dùng trong `tutors/page.tsx`, `tutors/[id]/page.tsx`, `dashboard/page.tsx` (gia sư đề xuất).

### 3.1 GET `/tutors`
- **Auth**: public (hoặc Bearer optional để personalize).
- **Query**:
  | Param | Type | Mô tả |
  |---|---|---|
  | `q` | string | Tìm theo tên / từ khóa |
  | `subject` | string | Có thể lặp: `?subject=Toán&subject=Lý` |
  | `level` | string | THCS / THPT / Đại học |
  | `format` | `online`\|`offline`\|`flex` | |
  | `minPrice` | number | VND/giờ |
  | `maxPrice` | number | mặc định 500000 trong UI |
  | `minRating` | number | 4.0, 4.5 |
  | `availabilitySlot` | string | "today" / "tonight" / "weekend" |
  | `sort` | `relevance`\|`rating:desc`\|`price:asc`\|`responseTime:asc` | |
  | `page`, `limit` | int | |
- **Response 200**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "mai-anh",
        "name": "Nguyễn Mai Anh",
        "title": "Gia sư Toán THPT...",
        "subjects": ["Toán", "Vật lý"],
        "levels": ["THCS", "THPT"],
        "location": "Cầu Giấy, Hà Nội",
        "format": "Linh hoạt",
        "price": 220000,
        "rating": 4.9,
        "reviews": 128,
        "sessions": 640,
        "responseTime": "12 phút",
        "verified": true,
        "avatar": "MA",
        "bio": "...",
        "languages": ["Tiếng Việt", "Tiếng Anh cơ bản"]
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 1247, "totalPages": 63 }
  }
  ```

### 3.2 GET `/tutors/:id`
- **Auth**: public.
- **Param**: `id` (slug hoặc UUID).
- **Response 200**: object như 3.1 + thêm:
  ```json
  {
    "availability": [
      { "day": "Thứ 2", "slots": ["18:00", "20:00"] }
    ],
    "credentials": ["Đại học Sư phạm Hà Nội", "6 năm KN"],
    "ratingBreakdown": [
      { "stars": 5, "pct": 78 },
      { "stars": 4, "pct": 17 }
    ]
  }
  ```
- **Lỗi**: 404 → frontend gọi `notFound()`.

### 3.3 GET `/tutors/:id/availability?week=YYYY-MM-DD`
- **Auth**: public.
- **Query**: `week` (ngày bắt đầu tuần, ISO date, default = tuần hiện tại).
- **Response 200**:
  ```json
  {
    "data": [
      { "date": "2026-05-18", "day": "Thứ 2", "slots": [
        { "start": "18:00", "end": "19:00", "status": "open" },
        { "start": "19:00", "end": "20:00", "status": "booked" }
      ]}
    ]
  }
  ```

### 3.4 GET `/tutors/:id/reviews?page=1&limit=10`
- **Auth**: public.
- **Response 200**:
  ```json
  {
    "data": [
      { "id": "r1", "student": "Phụ huynh em Linh", "rating": 5,
        "body": "...", "date": "2026-04-30T..." }
    ],
    "meta": { "total": 128 }
  }
  ```

### 3.5 POST `/tutors/me/profile` *(onboarding)*
- **Auth**: Bearer, role=`tutor`.
- **Body** (từ `tutor/onboarding/page.tsx`):
  ```json
  {
    "headline": "Gia sư Toán THPT",
    "bio": "...",
    "location": "Hà Nội · Cầu Giấy",
    "format": "online" | "offline" | "flex",
    "education": { "school": "...", "degree": "...", "years": 6, "cert": "TESOL" },
    "subjects": ["Toán", "Vật lý"],
    "levels": ["THCS", "THPT"],
    "price": 220000,
    "payout": { "bank": "Vietcombank", "account": "0011001234567" }
  }
  ```
- **Response 201**: profile object, `status="pending_review"`.

### 3.6 PATCH `/tutors/me/profile`
- **Auth**: Bearer, role=`tutor`.
- **Body**: partial của 3.5.

---

## 4. FAVORITES — `/favorites/*`

Trang `favorites/page.tsx` (đang dùng `favoriteTutorIds` mock).

### 4.1 GET `/favorites`
- **Auth**: Bearer.
- **Response 200**: mảng tutor (cùng schema 3.1).

### 4.2 POST `/favorites/:tutorId`
- **Auth**: Bearer.
- **Response 201**: `{ tutorId, favoritedAt }`.

### 4.3 DELETE `/favorites/:tutorId`
- **Auth**: Bearer.
- **Response 204**.

---

## 5. AVAILABILITY (cho tutor) — `/availability/*`

Trang `tutor/availability/page.tsx`.

### 5.1 GET `/availability/me?week=YYYY-MM-DD`
- **Auth**: Bearer, role=`tutor`.
- **Response 200**: dạng `[ { dayIdx: 0..6, hour: 8..21, status: "open"|"booked" } ]`.

### 5.2 PUT `/availability/me`
- **Auth**: Bearer, role=`tutor`.
- **Body**:
  ```json
  {
    "recurring": true,
    "slots": [
      { "dayIdx": 0, "hour": 18 },
      { "dayIdx": 2, "hour": 19 }
    ]
  }
  ```
- **Response 200**: trạng thái mới.
- **Ghi chú**: slot có `booked=true` không được xoá — server trả 409 nếu cố ghi đè.

---

## 6. BOOKINGS — `/bookings/*`

Trang `bookings/page.tsx`, `tutor/bookings/page.tsx`, `tutors/[id]/book/page.tsx`.

### 6.1 POST `/bookings`
- **Auth**: Bearer, role=`student`.
- **Body**:
  ```json
  {
    "tutorId": "mai-anh",
    "date": "2026-05-14",
    "startTime": "19:00",
    "duration": 1.5,
    "format": "online",
    "subject": "Toán 12 - Hàm số",
    "goal": "Ôn lại hàm số bậc 2, luyện 10 câu vận dụng cao..."
  }
  ```
- **Response 201**:
  ```json
  {
    "data": {
      "id": "BK-1042",
      "status": "pending_payment",
      "subtotal": 330000,
      "platformFee": 33000,
      "total": 363000
    }
  }
  ```

### 6.2 GET `/bookings`
- **Auth**: Bearer.
- **Query**:
  - `role` = `student` | `tutor` (server tự suy từ token nếu thiếu).
  - `status` = csv: `pending,confirmed,completed,cancelled,refunded,pending_payment`.
  - `q` (search theo mã / gia sư / môn).
  - `page`, `limit`.
- **Response 200**: list booking.

### 6.3 GET `/bookings/:id`
- **Auth**: Bearer (chỉ owner student / tutor / admin).
- **Response 200**:
  ```json
  {
    "id": "BK-1042",
    "tutorId": "mai-anh",
    "tutor": { "id": "...", "name": "...", "avatarUrl": "..." },
    "student": { "id": "...", "name": "..." },
    "subject": "...",
    "date": "Thứ 4, 14/05/2026",
    "time": "19:00 - 20:30",
    "duration": 1.5,
    "status": "confirmed",
    "amount": 330000,
    "format": "Trực tuyến",
    "goal": "...",
    "meetingUrl": "https://meet..."  // khi confirmed
  }
  ```

### 6.4 PATCH `/bookings/:id/accept`
- **Auth**: Bearer, role=`tutor`.
- **Response 200**: status → `confirmed`.

### 6.5 PATCH `/bookings/:id/reject`
- **Auth**: Bearer, role=`tutor`.
- **Body**: `{ "reason": "..." }` (optional).

### 6.6 PATCH `/bookings/:id/cancel`
- **Auth**: Bearer.
- **Body**: `{ "reason": "..." }`.
- **Response 200**: status → `cancelled`, kèm `{ refundAmount, refundPolicy: "full"|"partial"|"none" }`.
- **Rule** (UI dialog): hủy > 24h trước → 100%; trong 24h → một phần.

### 6.7 PATCH `/bookings/:id/complete`
- **Auth**: Bearer (system/cron hoặc tutor). UI không có nút trực tiếp — chuyển trạng thái sau slot kết thúc.

### 6.8 GET `/bookings/export.csv`
- **Auth**: Bearer.
- **Response**: `text/csv`. Có nút "Xuất CSV" tại `bookings/page.tsx`.

---

## 7. REVIEWS — `/reviews/*`

Trigger trong `ReviewDialog` từ `bookings/page.tsx` (khi booking `completed`).

### 7.1 POST `/reviews`
- **Auth**: Bearer, role=`student`.
- **Body**:
  ```json
  {
    "bookingId": "BK-1039",
    "tutorId": "quang-minh",
    "rating": 5,
    "body": "Cô chữa từng câu Speaking rất kỹ..."
  }
  ```
- **Response 201**: review object.
- **Rule**: chỉ review được khi booking ở trạng thái `completed`, chưa từng review.

---

## 8. PAYMENTS — `/payments/*`

Trang `payment/page.tsx` + `payment/result/page.tsx` (VNPay).

### 8.1 POST `/payments/vnpay/create`
- **Auth**: Bearer.
- **Body**: `{ "bookingId": "BK-NEW", "amount": 363000, "returnUrl": "https://app/payment/result" }`.
- **Response 200**:
  ```json
  { "data": { "paymentUrl": "https://sandbox.vnpayment.vn/...", "txnRef": "BK-NEW-...." } }
  ```
- Frontend `window.location` sang `paymentUrl`.

### 8.2 GET `/payments/vnpay/return`
- **Auth**: public (callback từ VNPay với signature trong query).
- **Query**: tất cả params VNPay trả về (`vnp_ResponseCode`, `vnp_TxnRef`, `vnp_SecureHash`, ...).
- **Response**: server verify chữ ký rồi redirect frontend `/payment/result?status=success|failed&bookingId=...&amount=...`.

### 8.3 POST `/payments/vnpay/ipn`
- **Auth**: public (server-to-server từ VNPay).
- Server verify + cập nhật booking → `confirmed`/`pending_payment`.

### 8.4 POST `/payments/:bookingId/refund` *(admin)*
- **Auth**: Bearer, role=`admin`.
- **Body**: `{ "amount": 363000, "reason": "..." }`.

---

## 9. TUTOR EARNINGS / PAYOUTS — `/payouts/*`

Trang `tutor/earnings/page.tsx`, `tutor/dashboard/page.tsx`.

### 9.1 GET `/payouts/me/summary`
- **Auth**: Bearer, role=`tutor`.
- **Response 200**:
  ```json
  {
    "balance": 5600000,
    "lifetimeEarnings": 22000000,
    "monthlySeries": [ { "month": "T12", "value": 2.4 }, ... ]
  }
  ```

### 9.2 GET `/payouts/me?page=1`
- **Auth**: Bearer, role=`tutor`.
- **Response 200**:
  ```json
  { "data": [ { "id": "po-201", "date": "01/05/2026", "amount": 4200000,
                 "status": "completed", "method": "Vietcombank · 0011****" } ] }
  ```

### 9.3 POST `/payouts/me/request`
- **Auth**: Bearer, role=`tutor`.
- **Body**: `{ "amount": 4200000 }`.

---

## 10. ADMIN — `/admin/*`

Tất cả route yêu cầu role=`admin`.

### 10.1 GET `/admin/stats/overview`
- **Response 200**:
  ```json
  {
    "totalUsers": 12480,
    "pendingTutors": 18,
    "openReports": 5,
    "monthlyRevenue": 128000000,
    "bookingsByDay": [{ "label": "T2", "value": 124 }, ...],
    "revenueSeries": [{ "month": "T12", "value": 62 }, ...]
  }
  ```

### 10.2 GET `/admin/tutors/queue?status=pending&page=1`
- **Response 200**: danh sách hồ sơ chờ duyệt (xem `adminQueue` mock).

### 10.3 GET `/admin/tutors/:id` — chi tiết hồ sơ duyệt (gồm documents).
- **Response 200**: profile + `documents: [ { name, url, mimeType } ]`.

### 10.4 PATCH `/admin/tutors/:id/approve`
- **Body**: `{ "note"?: string }`.

### 10.5 PATCH `/admin/tutors/:id/reject`
- **Body**: `{ "reason": string }`.

### 10.6 PATCH `/admin/tutors/:id/request-info`
- **Body**: `{ "message": string }`.

### 10.7 GET `/admin/users?q=&role=&status=&page=`
- **Response 200**:
  ```json
  { "data": [ { "id": "u1", "name": "...", "email": "...", "role": "student",
                "status": "active", "joined": "2026-02-12", "bookings": 18 } ] }
  ```

### 10.8 PATCH `/admin/users/:id/lock` / `PATCH /admin/users/:id/unlock`
- **Body**: `{ "reason"?: string }`.

### 10.9 POST `/admin/users/:id/refund`
- **Body**: `{ "bookingId": "BK-...", "amount": 270000, "reason": "..." }`.

### 10.10 GET `/admin/reports?status=open&page=`
- **Response 200**:
  ```json
  { "data": [ { "id": "rp1", "type": "Đánh giá vi phạm", "target": "...",
                 "description": "...", "severity": "medium", "submitted": "..." } ] }
  ```

### 10.11 PATCH `/admin/reports/:id/resolve`
- **Body**: `{ "resolution": string, "actionTaken"?: "lock"|"refund"|"warn"|"dismiss" }`.

### 10.12 GET `/admin/reports/export.csv`
- **Response**: `text/csv` (nút "Xuất báo cáo" ở `admin/page.tsx`).

---

## 11. NOTIFICATIONS — `/notifications/*`

Component `NotificationCenter` ở header.

### 11.1 GET `/notifications?unreadOnly=true&page=`
- **Auth**: Bearer.
- **Response 200**:
  ```json
  { "data": [ { "id": "n1", "type": "booking_confirmed",
                 "title": "...", "body": "...", "read": false, "createdAt": "..." } ],
    "meta": { "unreadCount": 3 } }
  ```

### 11.2 PATCH `/notifications/:id/read`
- **Auth**: Bearer.

### 11.3 PATCH `/notifications/read-all`

---

## 12. MESSAGES / CHAT *(stub — UI có nút "Nhắn tin")*

Hiện UI có nút "Nhắn tin trước" / "Nhắn gia sư" — chưa có service. Đề xuất tối thiểu:

### 12.1 GET `/conversations` · `/conversations/:id/messages` · POST `/conversations/:id/messages`
- **Auth**: Bearer.
- Realtime nên dùng WebSocket `wss://.../ws/chat` với header `Authorization: Bearer ...` qua subprotocol hoặc query `?token=`.

---

## 13. UPLOAD — `/uploads/*`

Trang booking có TODO upload tài liệu; tutor profile cần document.

### 13.1 POST `/uploads/sign`
- **Auth**: Bearer.
- **Body**: `{ "fileName": "diploma.pdf", "mimeType": "application/pdf", "size": 123456, "purpose": "tutor_doc"|"booking_attachment"|"avatar" }`.
- **Response 200**: `{ "url": "<presigned-PUT>", "publicUrl": "<final-GET>" }`.

---

## 14. METADATA / LOOKUPS

UI có các select / filter cứng — nên expose để admin chỉnh:

### 14.1 GET `/meta/subjects` → `["Toán", "Tiếng Anh", ...]`
### 14.2 GET `/meta/levels` → `["THCS", "THPT", "Đại học"]`
### 14.3 GET `/meta/banks` → `[ { "code": "VCB", "name": "Vietcombank" } ]`

---

## 15. Bảng tổng hợp Authorization

| Path prefix | student | tutor | admin | public |
|---|---|---|---|---|
| `/auth/*` (login/register/forgot/verify/refresh/reset) | — | — | — | ✅ |
| `/auth/logout` | ✅ | ✅ | ✅ | — |
| `/users/me*` | ✅ | ✅ | ✅ | — |
| `/tutors` (GET list/detail/reviews/availability) | ✅ | ✅ | ✅ | ✅ |
| `/tutors/me/profile` | — | ✅ | ✅ | — |
| `/favorites/*` | ✅ | — | — | — |
| `/availability/me` | — | ✅ | — | — |
| `/bookings` POST | ✅ | — | — | — |
| `/bookings/:id/accept`,`/reject` | — | ✅ | ✅ | — |
| `/bookings/:id/cancel` | ✅ (owner) | ✅ (owner) | ✅ | — |
| `/reviews` POST | ✅ | — | — | — |
| `/payments/vnpay/create` | ✅ | — | — | — |
| `/payments/vnpay/return`, `/ipn` | — | — | — | ✅ (signed) |
| `/payouts/me*` | — | ✅ | — | — |
| `/admin/*` | — | — | ✅ | — |
| `/notifications/*` | ✅ | ✅ | ✅ | — |

---

## 16. Error code catalog (đề xuất, dùng cho `error.code`)

| Code | HTTP | Khi nào |
|---|---|---|
| `VALIDATION_ERROR` | 400/422 | Body/query không hợp lệ |
| `UNAUTHORIZED` | 401 | Thiếu/sai access token |
| `TOKEN_EXPIRED` | 401 | Access token hết hạn (FE refresh) |
| `FORBIDDEN` | 403 | Role không đủ / không phải owner |
| `NOT_FOUND` | 404 | Resource không tồn tại |
| `CONFLICT` | 409 | Email trùng, slot bị book trùng, đã review |
| `PAYMENT_FAILED` | 402 | VNPay từ chối |
| `RATE_LIMITED` | 429 | Login/forgot-password spam |
| `INTERNAL_ERROR` | 500 | Lỗi không xác định |

---

## 17. CORS / Security

- Server cần cho phép origin của Next dev (`http://localhost:3001` hoặc port FE) + production domain.
- Cho phép methods: `GET, POST, PATCH, PUT, DELETE, OPTIONS`.
- Cho phép headers: `Authorization, Content-Type, Accept`.
- `withCredentials: false` (xem `api.ts:9`) — JWT đặt qua header, KHÔNG dùng cookie.
- HTTPS bắt buộc ở production.
- Rate limit: `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` (vd 5 req/phút/IP).
