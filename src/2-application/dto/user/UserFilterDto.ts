/**
 * User Filter DTO
 *
 * Data Transfer Object for filtering and searching users
 */

import { UserRole } from '@/domain/enums/UserRole';

export interface UserFilterDto {
  role?: UserRole;
  companyId?: string;
  programId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: UserSortField;
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilterRequest {
  role?: UserRole;
  companyId?: string;
  programId?: string;
  isActive?: string; // From query params
  search?: string;
  page?: string; // From query params
  limit?: string; // From query params
  sortBy?: UserSortField;
  sortOrder?: 'asc' | 'desc';
}

export type UserSortField = 'fullName' | 'email' | 'createdAt' | 'role' | 'lastLoginAt';

export const UserFilterDefaults = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt' as UserSortField,
  sortOrder: 'desc' as const,
  isActive: true,
} as const;

export const UserFilterValidation = {
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
 * Helper function to create UserFilterDto from query parameters
 */
export function createUserFilterFromQuery(
  query: Record<string, string | string[] | undefined>
): UserFilterDto {
  const filter: UserFilterDto = {};

  if (query.role && typeof query.role === 'string') {
    filter.role = query.role as UserRole;
  }

  if (query.companyId && typeof query.companyId === 'string') {
    filter.companyId = query.companyId;
  }

  if (query.programId && typeof query.programId === 'string') {
    filter.programId = query.programId;
  }

  if (query.isActive && typeof query.isActive === 'string') {
    filter.isActive = query.isActive === 'true';
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
    filter.sortBy = query.sortBy as UserSortField;
  }

  if (query.sortOrder && typeof query.sortOrder === 'string') {
    if (query.sortOrder === 'asc' || query.sortOrder === 'desc') {
      filter.sortOrder = query.sortOrder;
    }
  }

  return {
    ...UserFilterDefaults,
    ...filter,
  };
}

