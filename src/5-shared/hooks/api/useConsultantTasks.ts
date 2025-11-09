/**
 * React Query hooks for Consultant Tasks API
 */

import { useQuery } from '@tanstack/react-query';

interface ConsultantTasksFilters {
  status?: string;
  page?: number;
  limit?: number;
}

interface ConsultantTasksResponse {
  success: boolean;
  tasks: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const fetchConsultantTasks = async (
  filters: ConsultantTasksFilters = {}
): Promise<ConsultantTasksResponse> => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const response = await fetch(`/api/consultant/tasks?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch consultant tasks');
  }
  return response.json();
};

/**
 * Hook to fetch consultant tasks with React Query
 */
export function useConsultantTasks(filters: ConsultantTasksFilters = {}) {
  return useQuery({
    queryKey: ['consultant-tasks', filters],
    queryFn: () => fetchConsultantTasks(filters),
    enabled: true,
  });
}

/**
 * Hook to fetch all consultant tasks (for stats)
 */
export function useConsultantTasksAll() {
  return useQuery({
    queryKey: ['consultant-tasks', 'all'],
    queryFn: () => fetchConsultantTasks({}),
    enabled: true,
  });
}
