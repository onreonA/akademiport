/**
 * Program Filter DTO
 *
 * Data Transfer Object for filtering and searching programs
 */

import { ProgramStatus } from '@/domain/enums/ProgramStatus';

export interface ProgramFilterDto {
  status?: ProgramStatus;
  managerId?: string;
  city?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: ProgramSortField;
  sortOrder?: 'asc' | 'desc';
}

export interface ProgramFilterRequest {
  status?: ProgramStatus;
  managerId?: string;
  city?: string;
  region?: string;
  search?: string;
  page?: string; // From query params
  limit?: string; // From query params
  sortBy?: ProgramSortField;
  sortOrder?: 'asc' | 'desc';
}

export type ProgramSortField = 'name' | 'createdAt' | 'status' | 'startDate' | 'endDate';

/**
 * Default values for ProgramFilterDto
 */
export const ProgramFilterDefaults = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt' as ProgramSortField,
  sortOrder: 'desc' as const,
} as const;

/**
 * Validation rules for ProgramFilterDto
 */
export const ProgramFilterDtoValidation = {
  page: {
    min: 1,
    max: 1000,
  },
  limit: {
    min: 1,
    max: 100,
  },
  search: {
    maxLength: 100,
  },
} as const;

/**
 * Helper function to convert query params to filter DTO
 */
export function createProgramFilterFromQuery(
  query: Record<string, string | string[] | undefined>
): ProgramFilterDto {
  const filter: ProgramFilterDto = {};

  if (query.status && typeof query.status === 'string') {
    filter.status = query.status as ProgramStatus;
  }

  if (query.managerId && typeof query.managerId === 'string') {
    filter.managerId = query.managerId;
  }

  if (query.city && typeof query.city === 'string') {
    filter.city = query.city;
  }

  if (query.region && typeof query.region === 'string') {
    filter.region = query.region;
  }

  if (query.search && typeof query.search === 'string') {
    filter.search = query.search;
  }

  if (query.page && typeof query.page === 'string') {
    const page = parseInt(query.page, 10);
    if (!isNaN(page) && page > 0) {
      filter.page = page;
    }
  }

  if (query.limit && typeof query.limit === 'string') {
    const limit = parseInt(query.limit, 10);
    if (!isNaN(limit) && limit > 0 && limit <= 100) {
      filter.limit = limit;
    }
  }

  if (query.sortBy && typeof query.sortBy === 'string') {
    filter.sortBy = query.sortBy as ProgramSortField;
  }

  if (query.sortOrder && typeof query.sortOrder === 'string') {
    if (query.sortOrder === 'asc' || query.sortOrder === 'desc') {
      filter.sortOrder = query.sortOrder;
    }
  }

  return {
    ...ProgramFilterDefaults,
    ...filter,
  };
}
