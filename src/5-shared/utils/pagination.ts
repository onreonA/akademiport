/**
 * Pagination Utilities
 *
 * Standardized pagination handling for API responses
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationDefaults {
  page: number;
  limit: number;
  maxLimit: number;
}

export const DEFAULT_PAGINATION: Required<PaginationDefaults> = {
  page: 1,
  limit: 20,
  maxLimit: 100,
};

/**
 * Parse and validate pagination parameters from request
 */
export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaults: PaginationDefaults = DEFAULT_PAGINATION
): { page: number; limit: number; offset: number } {
  const page = Math.max(
    1,
    parseInt(searchParams.get('page') || String(defaults.page), 10) || defaults.page
  );
  const limit = Math.min(
    defaults.maxLimit,
    Math.max(1, parseInt(searchParams.get('limit') || String(defaults.limit), 10) || defaults.limit)
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    meta: calculatePaginationMeta(total, page, limit),
  };
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(params: PaginationParams): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (params.page !== undefined && (params.page < 1 || !Number.isInteger(params.page))) {
    errors.push('Page must be a positive integer');
  }

  if (params.limit !== undefined && (params.limit < 1 || !Number.isInteger(params.limit))) {
    errors.push('Limit must be a positive integer');
  }

  if (params.offset !== undefined && (params.offset < 0 || !Number.isInteger(params.offset))) {
    errors.push('Offset must be a non-negative integer');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
