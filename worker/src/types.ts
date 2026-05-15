export interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  RATE_LIMIT: KVNamespace;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  R2_PUBLIC_URL: string;
  FRONTEND_URL: string;
}

export interface JwtPayload {
  sub: string;
  role: 'student' | 'tutor' | 'admin';
  jti: string;
  exp: number;
  iat: number;
}

export interface UserVar {
  id: string;
  role: 'student' | 'tutor' | 'admin';
  jti: string;
}

export type AppContext = {
  Bindings: Env;
  Variables: {
    user: UserVar;
  };
};
