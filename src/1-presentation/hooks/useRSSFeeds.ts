/**
 * RSS Feeds Hook
 *
 * React Query hook'ları RSS feed yönetimi için
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RSSFeed, RSSFeedItem } from '@/3-domain/entities/RSSFeed';

const API_BASE = '/api/rss-feeds';

// Types
export interface CreateRSSFeedDto {
  programId: string;
  name: string;
  feedUrl: string;
  description?: string;
  category?: string;
  isActive?: boolean;
  autoPublish?: boolean;
  checkIntervalMinutes?: number;
}

export interface UpdateRSSFeedDto {
  name?: string;
  feedUrl?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
  autoPublish?: boolean;
  checkIntervalMinutes?: number;
}

// Fetch RSS feeds
export function useRSSFeeds(programId?: string, isActive?: boolean) {
  return useQuery({
    queryKey: ['rss-feeds', programId, isActive],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (programId) params.append('programId', programId);
      if (isActive !== undefined) params.append('isActive', String(isActive));

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch RSS feeds');
      }
      return response.json() as Promise<{ data: RSSFeed[]; total: number }>;
    },
  });
}

// Fetch single RSS feed
export function useRSSFeed(id: string) {
  return useQuery({
    queryKey: ['rss-feed', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch RSS feed');
      }
      return response.json() as Promise<RSSFeed>;
    },
    enabled: !!id,
  });
}

// Fetch RSS feed items
export function useRSSFeedItems(feedId: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['rss-feed-items', feedId, limit, offset],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/${feedId}/items?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch RSS feed items');
      }
      return response.json() as Promise<{ data: RSSFeedItem[]; total: number }>;
    },
    enabled: !!feedId,
  });
}

// Create RSS feed
export function useCreateRSSFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateRSSFeedDto) => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create RSS feed');
      }

      return response.json() as Promise<RSSFeed>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
    },
  });
}

// Update RSS feed
export function useUpdateRSSFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dto }: { id: string } & UpdateRSSFeedDto) => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update RSS feed');
      }

      return response.json() as Promise<RSSFeed>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
      queryClient.invalidateQueries({ queryKey: ['rss-feed', variables.id] });
    },
  });
}

// Delete RSS feed
export function useDeleteRSSFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete RSS feed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
    },
  });
}

// Rewrite news with AI
export function useRewriteNewsWithAI() {
  return useMutation({
    mutationFn: async (data: {
      feedItemId: string;
      targetCategory?: string;
      targetProgramId?: string;
      language?: 'tr' | 'en';
    }) => {
      const response = await fetch('/api/ai/news/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to rewrite news');
      }

      return response.json() as Promise<{ success: boolean; data: any }>;
    },
  });
}
