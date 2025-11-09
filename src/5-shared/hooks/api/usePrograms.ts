/**
 * React Query hooks for Programs API
 */

import { useQuery } from '@tanstack/react-query';

interface ProgramsFilters {
  search?: string;
  status?: string;
  city?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface ProgramsResponse {
  success: boolean;
  data: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const fetchPrograms = async (filters: ProgramsFilters = {}): Promise<ProgramsResponse> => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.city) params.append('city', filters.city);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const response = await fetch(`/api/programs?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch programs');
  }
  return response.json();
};

/**
 * Hook to fetch programs with React Query
 */
export function usePrograms(filters: ProgramsFilters = {}) {
  return useQuery({
    queryKey: ['programs', filters],
    queryFn: () => fetchPrograms(filters),
    enabled: true,
  });
}
