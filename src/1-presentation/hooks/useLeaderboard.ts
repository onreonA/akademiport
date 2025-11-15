'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LeaderboardRanking,
  Badge,
  CompanyBadge,
  LeaderboardHistory,
} from '@/3-domain/entities/Leaderboard';
import { LeaderboardFilterDto } from '@/2-application/dtos/leaderboard';

/**
 * Hook for fetching leaderboard rankings
 */
export function useLeaderboard(filter?: LeaderboardFilterDto) {
  return useQuery<{ rankings: LeaderboardRanking[] }>({
    queryKey: ['leaderboard', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter?.programId) params.append('programId', filter.programId);
      if (filter?.companyId) params.append('companyId', filter.companyId);
      if (filter?.limit) params.append('limit', filter.limit.toString());
      if (filter?.offset) params.append('offset', filter.offset.toString());

      const response = await fetch(`/api/leaderboard?${params.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Liderlik tablosu alınamadı');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Hook for fetching company ranking
 */
export function useCompanyRanking(companyId: string, programId: string) {
  return useQuery<{ ranking: LeaderboardRanking | null }>({
    queryKey: ['leaderboard', 'company', companyId, programId],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard/${companyId}?programId=${programId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Firma sıralaması alınamadı');
      }
      return response.json();
    },
    enabled: !!companyId && !!programId,
    refetchInterval: 60000,
  });
}

/**
 * Hook for fetching badges
 */
export function useBadges(category?: string, isActive?: boolean) {
  return useQuery<{ badges: Badge[] }>({
    queryKey: ['leaderboard', 'badges', category, isActive],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (isActive !== undefined) params.append('isActive', isActive.toString());

      const response = await fetch(`/api/leaderboard/badges?${params.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Rozetler alınamadı');
      }
      return response.json();
    },
  });
}

/**
 * Hook for fetching company badges
 */
export function useCompanyBadges(companyId: string) {
  return useQuery<{ badges: CompanyBadge[] }>({
    queryKey: ['leaderboard', 'badges', 'company', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard/badges/company/${companyId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Firma rozetleri alınamadı');
      }
      return response.json();
    },
    enabled: !!companyId,
  });
}

/**
 * Hook for fetching leaderboard history
 */
export function useLeaderboardHistory(
  companyId?: string,
  programId?: string,
  startDate?: Date,
  endDate?: Date
) {
  return useQuery<{ history: LeaderboardHistory[] }>({
    queryKey: ['leaderboard', 'history', companyId, programId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (companyId) params.append('companyId', companyId);
      if (programId) params.append('programId', programId);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await fetch(`/api/leaderboard/history?${params.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Geçmiş veriler alınamadı');
      }
      return response.json();
    },
    enabled: !!(companyId || programId),
  });
}

/**
 * Hook for creating badge (admin only)
 */
export function useCreateBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      icon?: string;
      category: string;
      requirementType: string;
      requirementValue: number;
      requirementActivity?: string;
      pointsBonus?: number;
      isActive?: boolean;
      orderIndex?: number;
    }) => {
      const response = await fetch('/api/leaderboard/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Rozet oluşturulamadı');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard', 'badges'] });
    },
  });
}

/**
 * Hook for updating badge (admin only)
 */
export function useUpdateBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ badgeId, data }: { badgeId: string; data: Partial<Badge> }) => {
      const response = await fetch(`/api/leaderboard/badges/${badgeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Rozet güncellenemedi');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard', 'badges'] });
    },
  });
}

/**
 * Hook for deleting badge (admin only)
 */
export function useDeleteBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (badgeId: string) => {
      const response = await fetch(`/api/leaderboard/badges/${badgeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Rozet silinemedi');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard', 'badges'] });
    },
  });
}
