/**
 * Dashboard Hooks
 * Sprint 27: Dashboard & Analytics
 */

import { useQuery } from '@tanstack/react-query';
import {
  DashboardStats,
  ConsultantDashboardStats,
  CompanyDashboardStats,
} from '@/3-domain/entities/DashboardStats';

/**
 * Hook for fetching dashboard statistics (Master Admin)
 */
export function useDashboardStats() {
  return useQuery<{ success: boolean; data: DashboardStats }>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Dashboard istatistikleri alınamadı');
      }
      return response.json();
    },
  });
}

/**
 * Hook for fetching consultant dashboard statistics
 */
export function useConsultantDashboardStats() {
  return useQuery<{ success: boolean; data: ConsultantDashboardStats }>({
    queryKey: ['consultant-dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/consultant-dashboard/stats');
      if (!response.ok) {
        throw new Error('Consultant dashboard istatistikleri alınamadı');
      }
      return response.json();
    },
  });
}

/**
 * Hook for fetching company dashboard statistics
 */
export function useCompanyDashboardStats(companyId?: string) {
  return useQuery<{ success: boolean; data: CompanyDashboardStats }>({
    queryKey: ['company-dashboard-stats', companyId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (companyId) params.append('companyId', companyId);

      const response = await fetch(`/api/company-dashboard/stats?${params}`);
      if (!response.ok) {
        throw new Error('Company dashboard istatistikleri alınamadı');
      }
      return response.json();
    },
    enabled: !!companyId,
  });
}
