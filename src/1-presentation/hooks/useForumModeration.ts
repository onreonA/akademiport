/**
 * Forum Moderation Hooks
 *
 * React Query hooks for forum moderation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api/forum/moderate';

// Types
export interface PendingModeration {
  topics: any[];
  replies: any[];
  spamDetections: any[];
}

export interface ModerateAction {
  action: 'approve' | 'reject';
  topicId?: string;
  replyId?: string;
}

// Fetch pending items for moderation
export function usePendingModeration(type: 'all' | 'topics' | 'replies' = 'all') {
  return useQuery({
    queryKey: ['forum-moderation', type],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}?type=${type}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pending moderation items');
      }
      return response.json() as Promise<PendingModeration>;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Approve or reject topic/reply
export function useModerateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ModerateAction) => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to moderate content');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-moderation'] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      queryClient.invalidateQueries({ queryKey: ['forum-replies'] });
      toast.success('İçerik moderasyonu tamamlandı');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Moderasyon başarısız');
    },
  });
}

// Detect spam for a topic or reply
export function useDetectSpam() {
  return useMutation({
    mutationFn: async (data: {
      topicId?: string;
      replyId?: string;
      content?: string;
      authorId?: string;
      authorEmail?: string;
    }) => {
      const response = await fetch('/api/ai/forum/detect-spam', {
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

// Analyze forum content
export function useAnalyzeContent() {
  return useMutation({
    mutationFn: async (data: {
      topicId?: string;
      replyId?: string;
      content?: string;
      categoryId?: string;
    }) => {
      const response = await fetch('/api/ai/forum/analyze-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze content');
      }

      return response.json();
    },
  });
}
