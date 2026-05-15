import { PaginationMeta } from './response';

export function parsePage(query: Record<string, string>) {
  const page = Math.max(1, parseInt(query.page ?? '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? '20', 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function buildMeta(total: number, page: number, limit: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
