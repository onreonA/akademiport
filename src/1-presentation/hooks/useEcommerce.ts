import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreateEcommerceMetricsDto,
  UpdateEcommerceMetricsDto,
  EcommerceMetricsFilterDto,
  EcommercePerformanceFilterDto,
} from '@/2-application/dtos/ecommerce';

/**
 * Hook for fetching e-commerce metrics list
 */
export function useEcommerceMetrics(filter: EcommerceMetricsFilterDto) {
  return useQuery({
    queryKey: ['ecommerce-metrics', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.companyId) params.append('companyId', filter.companyId);
      if (filter.programId) params.append('programId', filter.programId);
      if (filter.periodYear) params.append('periodYear', filter.periodYear.toString());
      if (filter.periodMonth) params.append('periodMonth', filter.periodMonth.toString());
      if (filter.platformType) params.append('platformType', filter.platformType);
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.offset) params.append('offset', filter.offset.toString());

      const response = await fetch(`/api/ecommerce/metrics?${params}`);
      if (!response.ok) throw new Error('Metrikler alınamadı');
      return response.json();
    },
  });
}

/**
 * Hook for fetching e-commerce metrics by ID
 */
export function useEcommerceMetric(id: string | null) {
  return useQuery({
    queryKey: ['ecommerce-metric', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/ecommerce/metrics/${id}`);
      if (!response.ok) throw new Error('Metrik alınamadı');
      return response.json();
    },
    enabled: !!id,
  });
}

/**
 * Hook for creating e-commerce metrics
 */
export function useCreateEcommerceMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEcommerceMetricsDto) => {
      const response = await fetch('/api/ecommerce/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Metrik oluşturulamadı');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecommerce-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['ecommerce-performance'] });
    },
  });
}

/**
 * Hook for updating e-commerce metrics
 */
export function useUpdateEcommerceMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEcommerceMetricsDto }) => {
      const response = await fetch(`/api/ecommerce/metrics/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Metrik güncellenemedi');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecommerce-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['ecommerce-performance'] });
    },
  });
}

/**
 * Hook for fetching e-commerce performance data
 */
export function useEcommercePerformance(filter: EcommercePerformanceFilterDto) {
  return useQuery({
    queryKey: ['ecommerce-performance', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.programId) params.append('programId', filter.programId);
      if (filter.companyId) params.append('companyId', filter.companyId);
      if (filter.minRevenue) params.append('minRevenue', filter.minRevenue.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.offset) params.append('offset', filter.offset.toString());

      const response = await fetch(`/api/ecommerce/performance?${params}`);
      if (!response.ok) throw new Error('Performans verileri alınamadı');
      return response.json();
    },
  });
}

/**
 * Hook for fetching ministry dashboard data
 */
export function useMinistryDashboard(programId?: string) {
  return useQuery({
    queryKey: ['ministry-dashboard', programId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (programId) params.append('programId', programId);

      const response = await fetch(`/api/ecommerce/ministry-dashboard?${params}`);
      if (!response.ok) throw new Error('Dashboard verileri alınamadı');
      return response.json();
    },
  });
}
