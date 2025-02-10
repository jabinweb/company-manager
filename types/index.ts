export * from './auth';
export * from './employee';
export * from './company';
export * from './enums';

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
  status?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
