# EduMatch — Cloudflare Worker Backend Design

**Date:** 2026-05-15  
**Status:** Approved  
**Scope:** Serverless REST API for EduMatch, replacing deleted NestJS backend

---

## 1. Stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime | Cloudflare Workers | Serverless, global edge, zero cold start |
| Router | Hono v4 | Typed middleware, built for edge, small bundle |
| Database | Cloudflare D1 (SQLite) | Relational, free tier, Worker-native binding |
| Storage | Cloudflare R2 | S3-compatible, zero egress cost |
| Email | Resend | Best CF Workers support, simple API |
| Auth | JWT (Web Crypto API) | Native, no npm dep; PBKDF2 for passwords |
| Rate limit | Cloudflare KV | Atomic counters per IP+endpoint |

---

## 2. Project Layout

```
worker/
├── wrangler.toml
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts               # Hono app, mount all route groups
│   ├── types.ts               # Env bindings interface, AppContext
│   ├── middleware/
│   │   ├── auth.ts            # Bearer JWT verify → ctx.var.user
│   │   ├── cors.ts            # CORS headers, preflight
│   │   └── rate-limit.ts      # KV-based counter, 5 req/min on auth routes
│   ├── routes/
│   │   ├── auth.ts            # /auth/*
│   │   ├── users.ts           # /users/me*
│   │   ├── tutors.ts          # /tutors/* + /tutors/me/profile
│   │   ├── favorites.ts       # /favorites/*
│   │   ├── availability.ts    # /availability/me
│   │   ├── bookings.ts        # /bookings/*
│   │   ├── reviews.ts         # /reviews
│   │   ├── payments.ts        # /payments/vnpay/* (stub)
│   │   ├── payouts.ts         # /payouts/me*
│   │   ├── admin.ts           # /admin/*
│   │   ├── notifications.ts   # /notifications/*
│   │   ├── uploads.ts         # /uploads/sign
│   │   └── meta.ts            # /meta/subjects|levels|banks
│   ├── lib/
│   │   ├── jwt.ts             # sign(payload, secret), verify(token, secret)
│   │   ├── password.ts        # hash(plain), compare(plain, hash) — PBKDF2
│   │   ├── email.ts           # sendEmail(to, subject, html) via Resend
│   │   ├── r2.ts              # generatePresignedPut(bucket, key, ttl)
│   │   ├── response.ts        # ok(data, meta?, status), err(code, msg, status)
│   │   └── paginate.ts        # parsePage(query), buildMeta(total, page, limit)
│   └── db/
│       └── schema.ts          # typed D1 query helpers (no ORM)
└── migrations/
    └── 0001_initial.sql       # Full schema
```

---

## 3. Wrangler Bindings

```toml
# wrangler.toml
name = "edumatch-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "edumatch"
database_id = "<id>"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "edumatch-storage"

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "<id>"

[vars]
FRONTEND_URL = "http://localhost:3001"
```

**Secrets (wrangler secret put):**
- `JWT_SECRET` — access + refresh token signing
- `RESEND_API_KEY` — email sending
- `R2_PUBLIC_URL` — public base URL for R2 objects

---

## 4. D1 Schema

```sql
-- users
CREATE TABLE users (
  id TEXT PRIMARY KEY,          -- uuid v4
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',  -- 'student'|'tutor'|'admin'
  avatar_url TEXT,
  phone TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  email_verified INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT,              -- ISO timestamp, null = active
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- tutor_profiles
CREATE TABLE tutor_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  headline TEXT,
  bio TEXT,
  location TEXT,
  format TEXT,                  -- 'online'|'offline'|'flex'
  education_json TEXT,          -- JSON: {school,degree,years,cert}
  subjects_json TEXT,           -- JSON: string[]
  levels_json TEXT,             -- JSON: string[]
  price INTEGER,                -- VND/hour
  payout_json TEXT,             -- JSON: {bank,account}
  status TEXT DEFAULT 'pending_review',
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  response_time TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- availability_slots
CREATE TABLE availability_slots (
  id TEXT PRIMARY KEY,
  tutor_id TEXT NOT NULL REFERENCES users(id),
  day_idx INTEGER NOT NULL,     -- 0=Mon..6=Sun
  hour INTEGER NOT NULL,        -- 8..21
  recurring INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tutor_id, day_idx, hour)
);

-- bookings
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,          -- 'BK-XXXX'
  student_id TEXT NOT NULL REFERENCES users(id),
  tutor_id TEXT NOT NULL REFERENCES users(id),
  date TEXT NOT NULL,           -- 'YYYY-MM-DD'
  start_time TEXT NOT NULL,     -- 'HH:MM'
  duration REAL NOT NULL,       -- hours
  format TEXT NOT NULL,
  subject TEXT NOT NULL,
  goal TEXT,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  amount INTEGER NOT NULL,      -- VND
  platform_fee INTEGER NOT NULL,
  meeting_url TEXT,
  cancelled_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- reviews
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL UNIQUE REFERENCES bookings(id),
  tutor_id TEXT NOT NULL REFERENCES users(id),
  student_id TEXT NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL,      -- 1..5
  body TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- favorites
CREATE TABLE favorites (
  student_id TEXT NOT NULL REFERENCES users(id),
  tutor_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (student_id, tutor_id)
);

-- payments
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT DEFAULT 'vnpay',
  txn_ref TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- payouts
CREATE TABLE payouts (
  id TEXT PRIMARY KEY,
  tutor_id TEXT NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  method TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- notifications
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- token_blacklist (logout / refresh revocation)
CREATE TABLE token_blacklist (
  jti TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL
);

-- password_reset_tokens
CREATE TABLE password_reset_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

-- email_verify_tokens
CREATE TABLE email_verify_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

-- reports (admin moderation)
CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,           -- 'Đánh giá vi phạm' etc.
  target TEXT NOT NULL,         -- display name of reported entity
  target_id TEXT,
  description TEXT,
  severity TEXT DEFAULT 'medium', -- 'low'|'medium'|'high'
  status TEXT DEFAULT 'open',   -- 'open'|'resolved'
  resolution TEXT,
  action_taken TEXT,            -- 'lock'|'refund'|'warn'|'dismiss'
  reporter_id TEXT REFERENCES users(id),
  submitted TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## 5. Auth Design

### JWT
- **Access token**: 15-min, `{ sub: userId, role, jti: uuid }`, signed with `JWT_SECRET` via HMAC-SHA256 (Web Crypto API)
- **Refresh token**: 7-day, same shape, revoked by inserting `jti` into `token_blacklist`
- `auth` middleware: extracts Bearer token → verifies → checks blacklist → attaches `ctx.var.user`

### Password Hashing
- PBKDF2-SHA256, 100k iterations, 32-byte key, random 16-byte salt
- Stored as `hex(salt):hex(dk)` in `password_hash`

### Rate Limiting
- KV key: `rl:{endpoint_slug}:{ip}` with 60s TTL
- On exceed: return 429 with `error.code = RATE_LIMITED`
- Applied to: `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`

---

## 6. Response Envelope

All responses follow the contract from `api.md`:

```ts
// success
{ success: true, data: T, meta?: PaginationMeta }

// error
{ success: false, error: { code: string, message: string, details?: unknown } }
```

Helper functions in `lib/response.ts`:
- `ok(data, meta?, status = 200)`
- `err(code, message, status, details?)`

---

## 7. Key Route Behaviors

### Tutors Search (`GET /tutors`)
- Filter by `subject` using `json_each(subjects_json)` in D1
- Filter by `level`, `format`, `minPrice`, `maxPrice`, `minRating`
- Sort by `rating DESC` | `price ASC` | default
- Full-text search `q` matches `headline || bio || full_name` via `LIKE '%q%'`
- Paginated with `page`/`limit`

### Tutors Detail (`GET /tutors/:id`)
- `:id` may be a UUID or a slug (lowercased full_name); query by `id` first, fall back to `slug` column on tutor_profiles (add `slug TEXT UNIQUE` to schema)
- Returns tutor fields + `availability` (grouped slots), `credentials` (from education_json), `ratingBreakdown` (aggregated from reviews)

### Bookings (`POST /bookings`)
- Auto-calculate: `amount = tutor.price * duration`, `platformFee = amount * 0.1`
- Generate ID: `BK-` + 4-digit zero-padded auto-increment (query `SELECT COUNT(*)+1 FROM bookings`)
- Initial status: `pending_payment`
- Router order: `GET /bookings/export.csv` MUST be registered BEFORE `GET /bookings/:id` to avoid route shadowing

### Cancel Booking (`PATCH /bookings/:id/cancel`)
- If `date+startTime` > now + 24h → `refundPolicy = "full"`, `refundAmount = amount`
- Else → `refundPolicy = "partial"`, `refundAmount = amount * 0.5`

### VNPay (`POST /payments/vnpay/create`)
- **Stub**: return `{ paymentUrl: "https://sandbox.vnpayment.vn/stub?ref={txnRef}", txnRef }`
- Real integration: replace stub with VNPay SDK in a later phase

### R2 Upload (`POST /uploads/sign`)
- Generates presigned PUT URL for R2 object at `{purpose}/{userId}/{fileName}`
- Returns `{ url: presignedPut, publicUrl: R2_PUBLIC_URL + key }`
- TTL: 15 minutes

### CSV Export (`GET /bookings/export.csv`)
- Query all bookings for user, serialize to CSV, return `Content-Type: text/csv`

---

## 8. CORS Configuration

```
Allow-Origin: process.env.FRONTEND_URL (+ production domain)
Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS
Allow-Headers: Authorization, Content-Type, Accept
Max-Age: 86400
```

Preflight (`OPTIONS`) returns 204 with no body.

---

## 9. Environment Variables / Secrets

| Name | Type | Purpose |
|---|---|---|
| `JWT_SECRET` | Secret | JWT signing |
| `RESEND_API_KEY` | Secret | Email |
| `R2_PUBLIC_URL` | Secret | Public CDN base URL for R2 |
| `FRONTEND_URL` | Var | CORS allowed origin |

---

## 10. Out of Scope (this phase)

- WebSocket chat (`/conversations/*`) — CF Workers Durable Objects needed; separate phase
- Real VNPay integration — stub delivered; replace when credentials available
- Admin document review UI uploads — `/uploads/sign` covers it client-side
- Soft-delete restore — 30-day grace noted, restore endpoint not in api.md
