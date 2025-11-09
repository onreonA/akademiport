/**
 * React Query hooks for Users API
 */

import { useQuery } from '@tanstack/react-query';

interface UsersFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface UsersResponse {
  success: boolean;
  data: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const fetchUsers = async (filters: UsersFilters = {}): Promise<UsersResponse> => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.role) params.append('role', filters.role);
  if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const response = await fetch(`/api/users?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch users');
  }
  return response.json();
};

/**
 * Hook to fetch users with React Query
 */
export function useUsers(filters: UsersFilters = {}) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
    enabled: true,
  });
}
