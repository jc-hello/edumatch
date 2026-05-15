export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'EduMatch API',
    version: '1.0.0',
    description: 'Serverless REST API for EduMatch — Hono + Cloudflare Workers + D1 + R2',
  },
  servers: [
    { url: 'http://localhost:8787', description: 'Local dev (wrangler dev)' },
    { url: 'https://edumatch-worker.workers.dev', description: 'Production' },
  ],
  tags: [
    { name: 'Auth', description: 'Registration, login, token refresh, password reset' },
    { name: 'Users', description: 'Current user profile management' },
    { name: 'Tutors', description: 'Tutor marketplace — list, search, profiles' },
    { name: 'Favorites', description: 'Student saved tutors' },
    { name: 'Availability', description: 'Tutor schedule slots' },
    { name: 'Bookings', description: 'Session booking lifecycle' },
    { name: 'Reviews', description: 'Post-session ratings' },
    { name: 'Payments', description: 'VNPay payment flow' },
    { name: 'Payouts', description: 'Tutor earnings & payout requests' },
    { name: 'Admin', description: 'Admin-only management endpoints' },
    { name: 'Notifications', description: 'In-app notification center' },
    { name: 'Uploads', description: 'File uploads via R2' },
    { name: 'Meta', description: 'Reference data — subjects, levels, banks' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token obtained from /auth/login or /auth/register',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          fullName: { type: 'string' },
          role: { type: 'string', enum: ['student', 'tutor', 'admin'] },
          avatarUrl: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
          emailVerified: { type: 'boolean' },
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      Tutor: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          title: { type: 'string' },
          subjects: { type: 'array', items: { type: 'string' } },
          levels: { type: 'array', items: { type: 'string' } },
          location: { type: 'string' },
          format: { type: 'string', enum: ['online', 'offline', 'flex'] },
          price: { type: 'integer', description: 'VND per hour' },
          rating: { type: 'number' },
          reviews: { type: 'integer' },
          sessions: { type: 'integer' },
          responseTime: { type: 'string' },
          verified: { type: 'boolean' },
          bio: { type: 'string' },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'BK-0001' },
          tutorId: { type: 'string' },
          studentId: { type: 'string' },
          subject: { type: 'string' },
          date: { type: 'string', format: 'date' },
          time: { type: 'string', example: '19:00 - 20:30' },
          duration: { type: 'number' },
          status: { type: 'string', enum: ['pending_payment', 'confirmed', 'completed', 'cancelled', 'refunded'] },
          amount: { type: 'integer' },
          platformFee: { type: 'integer' },
          format: { type: 'string' },
          goal: { type: 'string', nullable: true },
          meetingUrl: { type: 'string', nullable: true },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', example: 'booking_confirmed' },
          title: { type: 'string' },
          body: { type: 'string' },
          read: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      SuccessEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      ErrorEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string' },
              details: { type: 'object', nullable: true },
            },
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: '401 — Missing or invalid access token',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } },
      },
      Forbidden: {
        description: '403 — Insufficient role',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } },
      },
      NotFound: {
        description: '404 — Resource not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } },
      },
      Conflict: {
        description: '409 — Conflict (duplicate, slot taken, etc.)',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } },
      },
      ValidationError: {
        description: '400 — Validation error',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } },
      },
      RateLimited: {
        description: '429 — Too many requests',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } },
      },
    },
  },
  paths: {
    // ─── AUTH ───────────────────────────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'fullName', 'role'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8, example: 'Abc12345' },
                  fullName: { type: 'string' },
                  role: { type: 'string', enum: ['student', 'tutor'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Created — returns tokens + user', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessEnvelope' }, { properties: { data: { $ref: '#/components/schemas/AuthTokens' } } }] } } } },
          400: { $ref: '#/components/responses/ValidationError' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email + password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'OK — returns tokens + user', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessEnvelope' }, { properties: { data: { $ref: '#/components/schemas/AuthTokens' } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          429: { $ref: '#/components/responses/RateLimited' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout — revoke current access token',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Exchange refresh token for new token pair',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } },
            },
          },
        },
        responses: {
          200: { description: 'New token pair', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset email',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } } } },
        },
        responses: {
          200: { description: 'Always 200 (prevents user enumeration)' },
          429: { $ref: '#/components/responses/RateLimited' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password using email token',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['token', 'newPassword'], properties: { token: { type: 'string' }, newPassword: { type: 'string', minLength: 8 } } } } },
        },
        responses: {
          200: { description: 'Password reset' },
          400: { $ref: '#/components/responses/ValidationError' },
          429: { $ref: '#/components/responses/RateLimited' },
        },
      },
    },
    '/auth/verify-email': {
      get: {
        tags: ['Auth'],
        summary: 'Verify email address',
        parameters: [{ name: 'token', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Email verified' },
          400: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    // ─── USERS ──────────────────────────────────────────────────────────────
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User object', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessEnvelope' }, { properties: { data: { $ref: '#/components/schemas/User' } } }] } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update profile (fullName, phone, avatarUrl)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { fullName: { type: 'string' }, phone: { type: 'string' }, avatarUrl: { type: 'string' } } },
            },
          },
        },
        responses: {
          200: { description: 'Updated user' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Soft-delete account (30-day grace)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/users/me/password': {
      patch: {
        tags: ['Users'],
        summary: 'Change password',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['currentPassword', 'newPassword'], properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } } } } },
        },
        responses: {
          200: { description: 'Password changed' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/users/me/avatar': {
      post: {
        tags: ['Users'],
        summary: 'Upload avatar (multipart, max 2 MB)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'multipart/form-data': { schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' } } } } },
        },
        responses: {
          200: { description: 'avatarUrl returned' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ─── TUTORS ─────────────────────────────────────────────────────────────
    '/tutors': {
      get: {
        tags: ['Tutors'],
        summary: 'Search / list tutors (marketplace)',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'subject', in: 'query', schema: { type: 'string' } },
          { name: 'level', in: 'query', schema: { type: 'string', enum: ['THCS', 'THPT', 'Đại học', 'Người đi làm'] } },
          { name: 'format', in: 'query', schema: { type: 'string', enum: ['online', 'offline', 'flex'] } },
          { name: 'minPrice', in: 'query', schema: { type: 'integer' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'integer' } },
          { name: 'minRating', in: 'query', schema: { type: 'number' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['relevance', 'rating:desc', 'price:asc', 'responseTime:asc'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 50 } },
        ],
        responses: {
          200: { description: 'Paginated tutor list', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
        },
      },
    },
    '/tutors/{id}': {
      get: {
        tags: ['Tutors'],
        summary: 'Get tutor detail (by UUID or slug)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Tutor detail + availability + ratingBreakdown' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/tutors/{id}/availability': {
      get: {
        tags: ['Tutors'],
        summary: 'Get weekly availability slots',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'week', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Start of week (YYYY-MM-DD)' },
        ],
        responses: { 200: { description: '7-day slot array' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },
    '/tutors/{id}/reviews': {
      get: {
        tags: ['Tutors'],
        summary: 'Get paginated reviews for a tutor',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Review list' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },
    '/tutors/me/profile': {
      post: {
        tags: ['Tutors'],
        summary: 'Create tutor profile (onboarding)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  headline: { type: 'string' },
                  bio: { type: 'string' },
                  location: { type: 'string' },
                  format: { type: 'string', enum: ['online', 'offline', 'flex'] },
                  education: { type: 'object', properties: { school: { type: 'string' }, degree: { type: 'string' }, years: { type: 'integer' }, cert: { type: 'string' } } },
                  subjects: { type: 'array', items: { type: 'string' } },
                  levels: { type: 'array', items: { type: 'string' } },
                  price: { type: 'integer' },
                  payout: { type: 'object', properties: { bank: { type: 'string' }, account: { type: 'string' } } },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Profile created (status: pending_review)' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
      patch: {
        tags: ['Tutors'],
        summary: 'Update tutor profile (partial)',
        security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
        responses: {
          200: { description: 'Updated profile' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    // ─── FAVORITES ──────────────────────────────────────────────────────────
    '/favorites': {
      get: {
        tags: ['Favorites'],
        summary: 'Get saved tutors list',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Tutor array' }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
    },
    '/favorites/{tutorId}': {
      post: {
        tags: ['Favorites'],
        summary: 'Add tutor to favorites',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'tutorId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          201: { description: 'Favorited' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
      delete: {
        tags: ['Favorites'],
        summary: 'Remove tutor from favorites',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'tutorId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'Removed' }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
    },

    // ─── AVAILABILITY ───────────────────────────────────────────────────────
    '/availability/me': {
      get: {
        tags: ['Availability'],
        summary: 'Get my availability slots (tutor)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'week', in: 'query', schema: { type: 'string', format: 'date' } }],
        responses: { 200: { description: 'Slot array' }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
      put: {
        tags: ['Availability'],
        summary: 'Replace all availability slots (tutor)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['slots'],
                properties: {
                  recurring: { type: 'boolean', default: true },
                  slots: { type: 'array', items: { type: 'object', properties: { dayIdx: { type: 'integer', minimum: 0, maximum: 6, description: '0=Mon…6=Sun' }, hour: { type: 'integer', minimum: 8, maximum: 21 } } } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated slots' },
          401: { $ref: '#/components/responses/Unauthorized' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },

    // ─── BOOKINGS ───────────────────────────────────────────────────────────
    '/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'List bookings (student or tutor view)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['student', 'tutor'] } },
          { name: 'status', in: 'query', schema: { type: 'string', description: 'Comma-separated: pending,confirmed,completed,cancelled' } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Paginated bookings' }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
      post: {
        tags: ['Bookings'],
        summary: 'Create a booking (student only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tutorId', 'date', 'startTime', 'duration', 'format', 'subject'],
                properties: {
                  tutorId: { type: 'string' },
                  date: { type: 'string', format: 'date' },
                  startTime: { type: 'string', example: '19:00' },
                  duration: { type: 'number', example: 1.5 },
                  format: { type: 'string', enum: ['online', 'offline'] },
                  subject: { type: 'string' },
                  goal: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Booking created with payment info', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/bookings/export.csv': {
      get: {
        tags: ['Bookings'],
        summary: 'Export bookings as CSV',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'CSV file', content: { 'text/csv': { schema: { type: 'string' } } } }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
    },
    '/bookings/{id}': {
      get: {
        tags: ['Bookings'],
        summary: 'Get booking detail',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Booking detail' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },
    '/bookings/{id}/accept': {
      patch: {
        tags: ['Bookings'],
        summary: 'Accept booking (tutor/admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Status → confirmed + meetingUrl' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/bookings/{id}/reject': {
      patch: {
        tags: ['Bookings'],
        summary: 'Reject booking (tutor/admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { reason: { type: 'string' } } } } } },
        responses: { 200: { description: 'Status → cancelled' }, 401: { $ref: '#/components/responses/Unauthorized' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/bookings/{id}/cancel': {
      patch: {
        tags: ['Bookings'],
        summary: 'Cancel booking (owner or admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { reason: { type: 'string' } } } } } },
        responses: { 200: { description: 'Cancelled + refundPolicy (full|partial|none)' }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
    },
    '/bookings/{id}/complete': {
      patch: {
        tags: ['Bookings'],
        summary: 'Mark booking as completed (tutor/admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Status → completed' }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
    },

    // ─── REVIEWS ────────────────────────────────────────────────────────────
    '/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Post a review (student, after completed booking)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bookingId', 'tutorId', 'rating'],
                properties: {
                  bookingId: { type: 'string' },
                  tutorId: { type: 'string' },
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  body: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Review created, tutor rating updated' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },

    // ─── PAYMENTS ───────────────────────────────────────────────────────────
    '/payments/vnpay/create': {
      post: {
        tags: ['Payments'],
        summary: 'Create VNPay payment URL for a booking',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bookingId', 'amount'],
                properties: { bookingId: { type: 'string' }, amount: { type: 'integer' }, returnUrl: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'paymentUrl + txnRef' }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
    },
    '/payments/vnpay/return': {
      get: {
        tags: ['Payments'],
        summary: 'VNPay redirect callback (public)',
        parameters: [
          { name: 'vnp_ResponseCode', in: 'query', schema: { type: 'string' } },
          { name: 'vnp_TxnRef', in: 'query', schema: { type: 'string' } },
          { name: 'vnp_Amount', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 302: { description: 'Redirect to /payment/result' } },
      },
    },
    '/payments/vnpay/ipn': {
      post: {
        tags: ['Payments'],
        summary: 'VNPay IPN server-to-server callback (public)',
        responses: { 200: { description: 'RspCode: 00' } },
      },
    },
    '/payments/{bookingId}/refund': {
      post: {
        tags: ['Payments'],
        summary: 'Issue refund (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bookingId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['amount'], properties: { amount: { type: 'integer' }, reason: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Refund processed' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },

    // ─── PAYOUTS ────────────────────────────────────────────────────────────
    '/payouts/me/summary': {
      get: {
        tags: ['Payouts'],
        summary: 'Earnings summary + monthly series (tutor)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'balance, lifetimeEarnings, monthlySeries' }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
    },
    '/payouts/me': {
      get: {
        tags: ['Payouts'],
        summary: 'List payout history (tutor)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'page', in: 'query', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Payout list' }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
    },
    '/payouts/me/request': {
      post: {
        tags: ['Payouts'],
        summary: 'Request a payout withdrawal (tutor)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['amount'], properties: { amount: { type: 'integer' } } } } } },
        responses: {
          201: { description: 'Payout request created' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ─── ADMIN ──────────────────────────────────────────────────────────────
    '/admin/stats/overview': {
      get: {
        tags: ['Admin'],
        summary: 'Dashboard stats overview',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'totalUsers, pendingTutors, revenue, charts' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/admin/tutors/queue': {
      get: {
        tags: ['Admin'],
        summary: 'Tutor approval queue',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', default: 'pending_review' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Paginated tutor profiles' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/admin/tutors/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'Get tutor profile for review',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Profile + documents' }, 403: { $ref: '#/components/responses/Forbidden' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },
    '/admin/tutors/{id}/approve': {
      patch: {
        tags: ['Admin'],
        summary: 'Approve tutor profile',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { note: { type: 'string' } } } } } },
        responses: { 200: { description: 'Status → approved' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/admin/tutors/{id}/reject': {
      patch: {
        tags: ['Admin'],
        summary: 'Reject tutor profile',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['reason'], properties: { reason: { type: 'string' } } } } } },
        responses: { 200: { description: 'Status → rejected' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/admin/tutors/{id}/request-info': {
      patch: {
        tags: ['Admin'],
        summary: 'Request additional info from tutor',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['message'], properties: { message: { type: 'string' } } } } } },
        responses: { 200: { description: 'Info requested' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List all users',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['student', 'tutor', 'admin'] } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'locked'] } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Paginated user list' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/admin/users/{id}/lock': {
      patch: {
        tags: ['Admin'],
        summary: 'Lock user account',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Locked' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/admin/users/{id}/unlock': {
      patch: {
        tags: ['Admin'],
        summary: 'Unlock user account',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Unlocked' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/admin/users/{id}/refund': {
      post: {
        tags: ['Admin'],
        summary: 'Issue refund for a user booking',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['bookingId', 'amount'], properties: { bookingId: { type: 'string' }, amount: { type: 'integer' }, reason: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Refund processed' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/admin/reports': {
      get: {
        tags: ['Admin'],
        summary: 'List moderation reports',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', default: 'open' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Paginated reports' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/admin/reports/export.csv': {
      get: {
        tags: ['Admin'],
        summary: 'Export all reports as CSV',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'CSV file', content: { 'text/csv': { schema: { type: 'string' } } } }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/admin/reports/{id}/resolve': {
      patch: {
        tags: ['Admin'],
        summary: 'Resolve a report',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['resolution'], properties: { resolution: { type: 'string' }, actionTaken: { type: 'string', enum: ['lock', 'refund', 'warn', 'dismiss'] } } } } },
        },
        responses: { 200: { description: 'Resolved' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },

    // ─── NOTIFICATIONS ──────────────────────────────────────────────────────
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get notifications (optional unread filter)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'unreadOnly', in: 'query', schema: { type: 'boolean' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Notification list + unreadCount in meta' }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
    },
    '/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark a notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Marked read' }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
    },
    '/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'All read' }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
    },

    // ─── UPLOADS ────────────────────────────────────────────────────────────
    '/uploads/sign': {
      post: {
        tags: ['Uploads'],
        summary: 'Get presigned upload URL for R2',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fileName', 'mimeType', 'size', 'purpose'],
                properties: {
                  fileName: { type: 'string' },
                  mimeType: { type: 'string' },
                  size: { type: 'integer', description: 'bytes, max 10 MB' },
                  purpose: { type: 'string', enum: ['tutor_doc', 'booking_attachment', 'avatar'] },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'url (PUT endpoint) + publicUrl' }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
    },
    '/uploads/direct/{key}': {
      put: {
        tags: ['Uploads'],
        summary: 'PUT file bytes directly to R2 (use url from /uploads/sign)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'key', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } } },
        responses: { 200: { description: 'Stored, returns key + publicUrl' }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
    },

    // ─── META ───────────────────────────────────────────────────────────────
    '/meta/subjects': {
      get: {
        tags: ['Meta'],
        summary: 'List available subjects',
        responses: { 200: { description: 'String array', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } } },
      },
    },
    '/meta/levels': {
      get: {
        tags: ['Meta'],
        summary: 'List education levels',
        responses: { 200: { description: 'String array' } },
      },
    },
    '/meta/banks': {
      get: {
        tags: ['Meta'],
        summary: 'List supported banks for payout',
        responses: { 200: { description: 'Array of {code, name}' } },
      },
    },

    // ─── HEALTH ─────────────────────────────────────────────────────────────
    '/health': {
      get: {
        tags: [],
        summary: 'Health check',
        responses: { 200: { description: 'OK' } },
      },
    },
  },
} as const;
