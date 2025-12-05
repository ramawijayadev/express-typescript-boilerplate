export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  [key: string]: unknown;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatedMeta;
}
