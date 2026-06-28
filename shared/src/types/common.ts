export type UUID = string;
export type ISODateString = string;
export type CurrencyCode = 'INR';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
  requestId?: string;
}
