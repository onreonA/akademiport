/**
 * News Moderation Hooks
 *
 * React Query hooks for news moderation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api/news/moderate';

// Types
export interface PendingNewsModeration {
  news: any[];
  spamDetections: any[];
}

export interface ModerateNewsAction {
  action: 'approve' | 'reject' | 'publish';
  newsId: string;
}

// Fetch pending news for moderation
export function usePendingNewsModeration(status: 'draft' | 'pending' | 'all' = 'draft') {
  return useQuery({
    queryKey: ['news-moderation', status],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}?status=${status}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pending news');
      }
      return response.json() as Promise<PendingNewsModeration>;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Approve or reject news
export function useModerateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ModerateNewsAction) => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to moderate news');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-moderation'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Haber moderasyonu tamamlandı');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Moderasyon başarısız');
    },
  });
}

// Detect spam for news
export function useDetectNewsSpam() {
  return useMutation({
    mutationFn: async (data: {
      newsId?: string;
      title?: string;
      content?: string;
      summary?: string;
      authorId?: string;
      authorEmail?: string;
    }) => {
      const response = await fetch('/api/ai/news/detect-spam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to detect spam');
      }

      return response.json();
    },
  });
}
